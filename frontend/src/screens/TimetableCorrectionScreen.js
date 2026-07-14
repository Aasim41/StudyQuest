import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../theme';
import { GradientButton, FloatingParticle } from '../components/ui';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Mock initial data for the editable grid
const INITIAL_TIMETABLE = [
  { id: '1', day: 'Mon', time: '09:00 - 10:00', subject: 'Mathematics', type: 'Lecture' },
  { id: '2', day: 'Mon', time: '10:15 - 11:15', subject: 'Physics', type: 'Lab' },
  { id: '3', day: 'Tue', time: '09:00 - 10:00', subject: 'Computer Science', type: 'Lecture' },
  { id: '4', day: 'Wed', time: '11:30 - 12:30', subject: 'Chemistry', type: 'Tutorial' },
];

const EditableCell = ({ value, onChangeText, placeholder, style }) => (
  <TextInput
    style={[styles.inputCell, style]}
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor={COLORS.textMuted}
  />
);

export default function TimetableCorrectionScreen({ navigation, route }) {
  const initialData = route.params?.parsedTimetable || INITIAL_TIMETABLE;
  const parsedCalendar = route.params?.parsedCalendar || [];
  
  // Ensure we add unique IDs and confidence defaults if not present
  const [timetable, setTimetable] = useState(
    initialData.map((item, i) => ({
      ...item,
      id: item.id || `tt-${i}-${Date.now()}`,
      confidence: item.confidence ?? 1.0,
    }))
  );

  const handleUpdate = (id, field, value) => {
    setTimetable(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now().toString(),
      day: 'Mon',
      time: '00:00 - 00:00',
      subject: 'New Subject',
      type: 'Lecture'
    };
    setTimetable(prev => [...prev, newRow]);
  };

  const handleDeleteRow = (id) => {
    setTimetable(prev => prev.filter(item => item.id !== id));
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem('@onboarding_timetable', JSON.stringify(timetable));
      const user = auth.currentUser;
      if (user) {
        setDoc(doc(db, 'users', user.uid), {
          timetableData: timetable,
        }, { merge: true }).catch(err => console.warn('Error saving timetable:', err));
      }
      navigation.navigate('ScheduleGeneration');
    } catch (err) {
      console.warn('Error saving timetable:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <FloatingParticle size={150} color={COLORS.secondary} x={width * 0.8} y={height * 0.1} delay={200} />
      <FloatingParticle size={100} color={COLORS.accent} x={-20} y={height * 0.6} delay={500} />

      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.header}>
        <Text style={styles.stepLabel}>STEP 3 OF 3</Text>
        <Text style={styles.title}>Verify Timetable</Text>
        <Text style={styles.subtitle}>Review the parsed data and make corrections if needed.</Text>
      </Animated.View>

      <View style={styles.gridHeader}>
        <Text style={[styles.gridHeaderText, { flex: 0.8 }]}>Day</Text>
        <Text style={[styles.gridHeaderText, { flex: 1.2 }]}>Time</Text>
        <Text style={[styles.gridHeaderText, { flex: 1.5 }]}>Subject</Text>
        <Text style={[styles.gridHeaderText, { flex: 1 }]}>Type</Text>
        <Text style={[styles.gridHeaderText, { flex: 0.5 }]}></Text>
      </View>

      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {timetable.map((item, index) => (
          <Animated.View 
            key={item.id} 
            entering={FadeInDown.delay(300 + index * 50).springify()}
            layout={Layout.springify()}
            style={styles.rowCard}
          >
            <LinearGradient colors={COLORS.gradientGlass} style={styles.rowGradient}>
              <EditableCell 
                style={{ flex: 0.8 }} 
                value={item.day} 
                onChangeText={(text) => handleUpdate(item.id, 'day', text)} 
              />
              <EditableCell 
                style={{ flex: 1.2 }} 
                value={item.time} 
                onChangeText={(text) => handleUpdate(item.id, 'time', text)} 
              />
              <EditableCell 
                style={{ flex: 1.5 }} 
                value={item.subject} 
                onChangeText={(text) => handleUpdate(item.id, 'subject', text)} 
              />
              <EditableCell 
                style={{ flex: 1 }} 
                value={item.type} 
                onChangeText={(text) => handleUpdate(item.id, 'type', text)} 
              />
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteRow(item.id)}>
                <Text style={styles.deleteIcon}>✕</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInUp.delay(800).springify()}>
          <TouchableOpacity style={styles.addRowBtn} onPress={handleAddRow}>
            <Text style={styles.addRowText}>+ Add Row</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(1000).springify()} style={styles.footer}>
        <GradientButton
          title="Save & Continue"
          onPress={handleSave}
          loading={saving}
          style={styles.saveBtn}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: height * 0.08,
    marginBottom: SPACING.md,
  },
  stepLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  gridHeader: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  gridHeaderText: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 100,
  },
  rowCard: {
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  rowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.md,
  },
  inputCell: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 4,
    fontFamily: 'System', // Using system font for inputs
  },
  deleteBtn: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  deleteIcon: {
    color: COLORS.error || '#FF4C4C',
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
  },
  addRowBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
  },
  addRowText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
    backgroundColor: COLORS.background, // Or a gradient for fade effect
  },
  saveBtn: {
    width: '100%',
  },
});
