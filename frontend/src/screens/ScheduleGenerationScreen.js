import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, interpolate } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../theme';
import { FloatingParticle } from '../components/ui';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import API_BASE from '../config/apiConfig';

const { width, height } = Dimensions.get('window');

export default function ScheduleGenerationScreen({ navigation }) {
  const [status, setStatus] = useState('Gathering your data...');
  const [error, setError] = useState(null);

  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    generateSchedule();
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.2]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.6, 1]),
  }));

  const generateSchedule = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Not authenticated");
      }

      setStatus('Reading uploaded documents...');
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const calendarStr = await AsyncStorage.getItem('@onboarding_calendar');
      const syllabusStr = await AsyncStorage.getItem('@onboarding_syllabus');
      const timetableStr = await AsyncStorage.getItem('@onboarding_timetable');
      
      const timetableData = timetableStr ? JSON.parse(timetableStr) : [];
      const calendarData = calendarStr ? JSON.parse(calendarStr) : [];
      const syllabusData = syllabusStr ? JSON.parse(syllabusStr) : [];

      setStatus('AI is crafting your perfect study plan...');
      
      const payload = {
        timetable: timetableData,
        calendar: calendarData,
        syllabus: syllabusData
      };

      const res = await fetch(`${API_BASE}/api/schedule/merge/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      
      if (result.success) {
        setStatus('Finalizing setup...');
        // Save to local device explicitly as a backup
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem(`@studyquest_backup_${user.uid}`, JSON.stringify({
            studyPlan: result.studyPlan || [],
            timetable: timetableData,
            calendar: calendarData,
            syllabus: syllabusData,
            timestamp: new Date().toISOString()
          }));
        } catch (e) {
          console.warn('Backup save failed', e);
        }

        // Save study plan and mark onboarding complete without awaiting to prevent hang
        setDoc(doc(db, 'users', user.uid), {
          studyPlan: result.studyPlan || [],
          onboardingComplete: true
        }, { merge: true }).catch(err => console.warn('Finalizing setup setDoc error:', err));
        
        // AppNavigator's onSnapshot listener will catch the onboardingComplete=true and switch stacks!
      } else {
        throw new Error(result.error || 'Failed to generate schedule');
      }

    } catch (err) {
      console.warn('Generation error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      // Failsafe: just mark complete anyway so they aren't stuck
      const user = auth.currentUser;
      if (user) {
        setDoc(doc(db, 'users', user.uid), {
          onboardingComplete: true
        }, { merge: true }).catch(e => console.warn(e));
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <FloatingParticle size={250} color={COLORS.accent} x={width * 0.5 - 125} y={height * 0.3} delay={0} />

      <View style={styles.content}>
        <Animated.View style={[styles.pulseCircle, pulseStyle]}>
          <Text style={styles.emoji}>✨</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ alignItems: 'center' }}>
          <Text style={styles.title}>Generating Schedule</Text>
          <Text style={styles.subtitle}>{error ? "Completing setup (AI failed)" : status}</Text>
          {!error && (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl },
  pulseCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(108, 92, 231, 0.2)', borderWidth: 2, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xxl, ...SHADOWS.glow },
  emoji: { fontSize: 50 },
  title: { fontSize: FONT_SIZES.hero, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.sm, textAlign: 'center' },
  subtitle: { fontSize: FONT_SIZES.bodyLarge, color: COLORS.textSecondary, textAlign: 'center' },
});
