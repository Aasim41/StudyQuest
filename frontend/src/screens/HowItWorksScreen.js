import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { gsapEntrance } from '../utils/gsapAnim';

const { height } = Dimensions.get('window');

const WORKFLOW_STEPS = [
  {
    icon: 'school-outline',
    title: '1. Exam & Stream Blueprint',
    desc: 'Select from 21 competitive, national board, and state board exams with exact streams, subject codes, and chapter weights.',
  },
  {
    icon: 'shield-search',
    title: '2. Blindspot & Rubric Audit',
    desc: 'Spot the boundary conditions, SI units, and derivations standard notes skip, backed by step-marking evaluation keys.',
  },
  {
    icon: 'play-circle-outline',
    title: '3. Flow Distraction-Free Video',
    desc: 'Stream curated lectures and search study topics ad-free without Shorts or recommendation algorithms.',
  },
  {
    icon: 'shield-lock-outline',
    title: '4. Regain Deep Focus Shield',
    desc: 'Lock in with structured sprint timers, Reels blockers, and a 5-second mindful breathing brake before distraction.',
  },
];

export default function HowItWorksScreen({ navigation }) {
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return gsapEntrance(listAnim, { duration: 0.4, ease: 'power2.out' });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How It Works</Text>
        <View style={{ width: 36 }} />
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{
          opacity: listAnim,
          transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        }}
      >
        <View style={styles.stepsContainer}>
          {WORKFLOW_STEPS.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={step.icon} size={20} color="#00E5FF" />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Signup')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Create Free Account →</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C12' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: height * 0.06,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#222436',
    backgroundColor: '#0E1018',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  scrollContent: { padding: 18, paddingBottom: 40, gap: 18 },
  stepsContainer: { gap: 10 },
  stepCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTextContainer: { flex: 1, gap: 4 },
  stepTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  stepDesc: { color: '#8E8EA8', fontSize: 12, lineHeight: 17 },
  primaryBtn: {
    backgroundColor: '#00E5FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#0B0C12', fontSize: 14, fontWeight: '900' },
});
