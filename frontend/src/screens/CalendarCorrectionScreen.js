import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../theme';
import { GradientButton, FloatingParticle } from '../components/ui';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

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

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          calendarData: calendar,
        }, { merge: true });
      }
      navigation.navigate('ScheduleGeneration');
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
                <EditableCell 
                  style={{ flex: 1 }} 
                  value={item.date} 
                  onChangeText={(text) => handleUpdate(item.id, 'date', text)} 
                  placeholder="YYYY-MM-DD"
                />
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
});
