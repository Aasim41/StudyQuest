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
import { Calendar } from 'react-native-calendars';

const { width, height } = Dimensions.get('window');

const EditableCell = ({ value, onChangeText, placeholder, style }) => (
  <TextInput
    style={[styles.inputCell, style]}
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor={COLORS.textMuted}
  />
);

export default function CalendarCorrectionScreen({ navigation, route }) {
  // If user skipped uploading a calendar, it might be empty
  const initialCalendar = route.params?.parsedCalendar || [];
  const finalTimetable = route.params?.finalTimetable || [];

  const [calendar, setCalendar] = useState(
    initialCalendar.map((item, i) => ({
      ...item,
      id: item.id || `cal-${i}-${Date.now()}`,
      confidence: item.confidence ?? 1.0,
    }))
  );

  const handleUpdate = (id, field, value) => {
    setCalendar(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      title: 'New Event',
      type: 'Academic Event'
    };
    setCalendar(prev => [...prev, newRow]);
  };

  const handleDeleteRow = (id) => {
    setCalendar(prev => prev.filter(item => item.id !== id));
  };

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [activeDateId, setActiveDateId] = useState(null);

  const openDatePicker = (id) => {
    setActiveDateId(id);
    setDatePickerVisible(true);
  };

  const handleDateSelect = (day) => {
    if (activeDateId) {
      handleUpdate(activeDateId, 'date', day.dateString);
    }
    setDatePickerVisible(false);
    setActiveDateId(null);
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem('@onboarding_calendar', JSON.stringify(calendar));
      const user = auth.currentUser;
      if (user) {
        setDoc(doc(db, 'users', user.uid), {
          calendarData: calendar,
        }, { merge: true }).catch(err => console.warn('Error saving calendar:', err));
      }
      navigation.navigate('SyllabusUpload');
    } catch (err) {
      console.warn('Error saving calendar:', err);
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
        <Text style={styles.title}>Verify Calendar</Text>
        <Text style={styles.subtitle}>Review the parsed academic events and correct dates or titles.</Text>
      </Animated.View>

      <View style={styles.gridHeader}>
        <Text style={[styles.gridHeaderText, { flex: 1 }]}>Date</Text>
        <Text style={[styles.gridHeaderText, { flex: 1.5 }]}>Event</Text>
        <Text style={[styles.gridHeaderText, { flex: 1 }]}>Type</Text>
        <Text style={[styles.gridHeaderText, { flex: 0.5 }]}></Text>
      </View>

      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {calendar.length === 0 ? (
          <Text style={styles.emptyText}>No calendar uploaded.</Text>
        ) : (
          calendar.map((item, index) => (
            <Animated.View 
              key={item.id} 
              entering={FadeInDown.delay(300 + index * 50).springify()}
              layout={Layout.springify()}
              style={styles.rowCard}
            >
              <LinearGradient colors={COLORS.gradientGlass} style={styles.rowGradient}>
                <TouchableOpacity style={styles.dateCell} onPress={() => openDatePicker(item.id)}>
                  <Text style={[styles.inputCell, { color: item.date ? COLORS.textPrimary : COLORS.textMuted }]}>
                    {item.date || 'YYYY-MM-DD'}
                  </Text>
                </TouchableOpacity>
                <EditableCell 
                  style={{ flex: 1.5 }} 
                  value={item.title} 
                  onChangeText={(text) => handleUpdate(item.id, 'title', text)} 
                  placeholder="Event Name"
                />
                <EditableCell 
                  style={{ flex: 1 }} 
                  value={item.type} 
                  onChangeText={(text) => handleUpdate(item.id, 'type', text)} 
                  placeholder="Exam/Holiday/etc."
                />
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteRow(item.id)}>
                  <Text style={styles.deleteIcon}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          ))
        )}

        <Animated.View entering={FadeInUp.delay(800).springify()}>
          <TouchableOpacity style={styles.addRowBtn} onPress={handleAddRow}>
            <Text style={styles.addRowText}>+ Add Event</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(1000).springify()} style={styles.footer}>
        <GradientButton
          title="Save & Go to Generation"
          onPress={handleSave}
          loading={saving}
          style={styles.saveBtn}
        />
      </Animated.View>

      <Modal
        visible={datePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Calendar
              onDayPress={handleDateSelect}
              theme={{
                backgroundColor: '#1E1E2D',
                calendarBackground: '#1E1E2D',
                textSectionTitleColor: COLORS.textMuted,
                selectedDayBackgroundColor: COLORS.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: COLORS.accent,
                dayTextColor: COLORS.textPrimary,
                textDisabledColor: COLORS.border,
                monthTextColor: COLORS.textPrimary,
                arrowColor: COLORS.primary,
              }}
            />
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setDatePickerVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xl, paddingTop: height * 0.08, marginBottom: SPACING.md },
  title: { fontSize: FONT_SIZES.heading, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, lineHeight: 22 },
  gridHeader: { flexDirection: 'row', paddingHorizontal: SPACING.xl, paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: SPACING.sm },
  gridHeaderText: { fontSize: FONT_SIZES.caption, color: COLORS.textMuted, fontWeight: '700' },
  listContainer: { flex: 1 },
  listContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  rowCard: { marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.md, overflow: 'hidden', ...SHADOWS.card },
  rowGradient: { flexDirection: 'row', alignItems: 'center', padding: SPACING.xs, borderWidth: 1, borderColor: COLORS.glassBorder, borderRadius: BORDER_RADIUS.md },
  inputCell: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, paddingVertical: SPACING.sm, paddingHorizontal: 4, fontFamily: 'System' },
  deleteBtn: { flex: 0.5, alignItems: 'center', justifyContent: 'center', padding: SPACING.sm },
  deleteIcon: { color: COLORS.error || '#FF4C4C', fontSize: FONT_SIZES.bodyLarge, fontWeight: '700' },
  addRowBtn: { alignItems: 'center', justifyContent: 'center', padding: SPACING.md, marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.glassBorder, borderStyle: 'dashed', borderRadius: BORDER_RADIUS.md },
  addRowText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, fontWeight: '600' },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xxl, fontSize: FONT_SIZES.body },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.xl, paddingBottom: SPACING.xxl, backgroundColor: COLORS.background },
  saveBtn: { width: '100%' },
  dateCell: { flex: 1, paddingVertical: SPACING.sm, justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  modalContent: { width: '100%', backgroundColor: '#1E1E2D', borderRadius: BORDER_RADIUS.xl, overflow: 'hidden', paddingBottom: SPACING.md, ...SHADOWS.glow },
  modalCloseBtn: { alignSelf: 'center', marginTop: SPACING.md, padding: SPACING.md },
  modalCloseText: { color: COLORS.textMuted, fontSize: FONT_SIZES.body, fontWeight: '600' },
});
