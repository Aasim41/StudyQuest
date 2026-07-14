import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, Modal } from 'react-native';
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

  const [dayPickerVisible, setDayPickerVisible] = useState(false);
  const [activeRowId, setActiveRowId] = useState(null);
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const openDayPicker = (id) => {
    setActiveRowId(id);
    setDayPickerVisible(true);
  };

  const handleDaySelect = (day) => {
    if (activeRowId) handleUpdate(activeRowId, 'day', day);
    setDayPickerVisible(false);
    setActiveRowId(null);
  };

  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [tempStartTime, setTempStartTime] = useState('');
  const [tempEndTime, setTempEndTime] = useState('');

  const openTimePicker = (id, currentTime) => {
    setActiveRowId(id);
    const parts = (currentTime || '09:00 - 10:00').split('-');
    setTempStartTime(parts[0]?.trim() || '');
    setTempEndTime(parts[1]?.trim() || '');
    setTimePickerVisible(true);
  };

  const handleTimeSave = () => {
    if (activeRowId) {
      handleUpdate(activeRowId, 'time', `${tempStartTime} - ${tempEndTime}`);
    }
    setTimePickerVisible(false);
    setActiveRowId(null);
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
              <TouchableOpacity style={styles.pickerCell} onPress={() => openDayPicker(item.id)}>
                <Text style={styles.inputCell}>{item.day || 'Day'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerCell} onPress={() => openTimePicker(item.id, item.time)}>
                <Text style={styles.inputCell}>{item.time || 'Time'}</Text>
              </TouchableOpacity>
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

      {/* Day Picker Modal */}
      <Modal visible={dayPickerVisible} transparent animationType="fade" onRequestClose={() => setDayPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Day</Text>
            <View style={styles.daysContainer}>
              {DAYS.map(d => (
                <TouchableOpacity key={d} style={styles.dayBtn} onPress={() => handleDaySelect(d)}>
                  <Text style={styles.dayBtnText}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setDayPickerVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={timePickerVisible} transparent animationType="fade" onRequestClose={() => setTimePickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Time</Text>
            <View style={styles.timeInputsRow}>
              <View style={styles.timeInputBox}>
                <Text style={styles.timeLabel}>Start</Text>
                <TextInput style={styles.timeInput} value={tempStartTime} onChangeText={setTempStartTime} placeholder="09:00" placeholderTextColor={COLORS.textMuted} />
              </View>
              <Text style={styles.timeSeparator}>-</Text>
              <View style={styles.timeInputBox}>
                <Text style={styles.timeLabel}>End</Text>
                <TextInput style={styles.timeInput} value={tempEndTime} onChangeText={setTempEndTime} placeholder="10:00" placeholderTextColor={COLORS.textMuted} />
              </View>
            </View>
            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleTimeSave}>
              <Text style={styles.modalSaveText}>Save Time</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setTimePickerVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.xl, paddingBottom: SPACING.xxl, backgroundColor: COLORS.background },
  saveBtn: { width: '100%' },
  pickerCell: { flex: 1, paddingVertical: SPACING.sm, justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  modalContent: { width: '100%', backgroundColor: '#1E1E2D', borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, ...SHADOWS.glow },
  modalTitle: { fontSize: FONT_SIZES.title, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.lg, textAlign: 'center' },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.md },
  dayBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, borderColor: COLORS.glassBorder },
  dayBtnText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, fontWeight: '600' },
  timeInputsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  timeInputBox: { alignItems: 'center' },
  timeLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.caption, marginBottom: SPACING.xs },
  timeInput: { backgroundColor: 'rgba(255,255,255,0.05)', color: COLORS.textPrimary, fontSize: FONT_SIZES.title, fontWeight: 'bold', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, textAlign: 'center', width: 100 },
  timeSeparator: { color: COLORS.textMuted, fontSize: FONT_SIZES.title, fontWeight: 'bold', marginHorizontal: SPACING.md, marginTop: 20 },
  modalSaveBtn: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center', marginBottom: SPACING.sm },
  modalSaveText: { color: '#FFF', fontSize: FONT_SIZES.bodyLarge, fontWeight: '700' },
  modalCloseBtn: { alignItems: 'center', padding: SPACING.sm },
  modalCloseText: { color: COLORS.textMuted, fontSize: FONT_SIZES.body, fontWeight: '600' },
});
