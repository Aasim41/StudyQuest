import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../theme';
import { GradientButton, FloatingParticle, GlassCard } from '../components/ui';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function SyllabusCorrectionScreen({ navigation, route }) {
  // Extract initial syllabus from route params
  const initialSyllabus = route.params?.parsedSyllabus || [];
  
  // State for syllabus data
  const [syllabus, setSyllabus] = useState(
    initialSyllabus.map((item, i) => ({
      ...item,
      id: item.id || `sub-${i}-${Date.now()}`,
      confidence: item.confidence ?? 1.0,
      credits: Number(item.credits) || 3,
    }))
  );
  
  const [saving, setSaving] = useState(false);

  // Auto-recalculate weightages whenever credits change
  const processedSyllabus = useMemo(() => {
    const totalCredits = syllabus.reduce((sum, item) => sum + (Number(item.credits) || 0), 0);
    return syllabus.map(item => ({
      ...item,
      weightage: totalCredits > 0 ? ((Number(item.credits) || 0) / totalCredits * 100).toFixed(1) : '0.0'
    }));
  }, [syllabus]);

  const updateField = (id, field, value) => {
    setSyllabus(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addRow = () => {
    setSyllabus(prev => [
      ...prev,
      { id: `new-${Date.now()}`, subject: '', credits: 3, confidence: 1.0 }
    ]);
  };

  const removeRow = (id) => {
    setSyllabus(prev => prev.filter(item => item.id !== id));
  };

  const [newChapters, setNewChapters] = useState({});

  const handleAddChapter = (subjectId) => {
    const chapterName = newChapters[subjectId]?.trim();
    if (!chapterName) return;
    setSyllabus(prev => prev.map(item => {
      if (item.id === subjectId) {
        return { ...item, chapters: [...(item.chapters || []), chapterName] };
      }
      return item;
    }));
    setNewChapters(prev => ({ ...prev, [subjectId]: '' }));
  };

  const handleRemoveChapter = (subjectId, chapterIndex) => {
    setSyllabus(prev => prev.map(item => {
      if (item.id === subjectId) {
        const newChaps = [...(item.chapters || [])];
        newChaps.splice(chapterIndex, 1);
        return { ...item, chapters: newChaps };
      }
      return item;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem('@onboarding_syllabus', JSON.stringify(processedSyllabus));
      navigation.navigate('TimetableUpload');
    } catch (err) {
      console.error('Failed to save syllabus:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <FloatingParticle size={150} color={COLORS.primary} x={width * 0.7} y={-40} delay={100} />
      
      <Animated.View style={styles.header} entering={FadeInDown.delay(100).springify()}>
        <Text style={styles.title}>Verify Syllabus</Text>
        <Text style={styles.subtitle}>Review the extracted subjects. Edit credits to auto-calculate priority weightage.</Text>
      </Animated.View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.gridHeader}>
            <Text style={[styles.gridHeaderText, { flex: 1.5 }]}>Subject</Text>
            <Text style={[styles.gridHeaderText, { flex: 0.8, textAlign: 'center' }]}>Credits</Text>
            <Text style={[styles.gridHeaderText, { flex: 1, textAlign: 'center' }]}>Weightage</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Rows */}
          {processedSyllabus.map((item, index) => {
            const isLowConfidence = item.confidence < 0.7;
            
            return (
              <Animated.View key={item.id} entering={FadeInDown.delay(index * 50).springify()}>
                <GlassCard style={[
                  styles.rowCardContainer,
                  isLowConfidence && { borderColor: COLORS.warning, borderWidth: 1 }
                ]}>
                  <View style={styles.rowCard}>
                    {/* Subject */}
                    <View style={[styles.inputContainer, { flex: 1.5 }]}>
                      <TextInput
                        style={styles.input}
                        value={item.subject}
                        onChangeText={(val) => updateField(item.id, 'subject', val)}
                        placeholder="Subject Name"
                        placeholderTextColor={COLORS.textMuted}
                      />
                      {isLowConfidence && <Text style={styles.warningIcon}>⚠️</Text>}
                    </View>

                    {/* Credits */}
                    <View style={[styles.inputContainer, { flex: 0.8 }]}>
                      <TextInput
                        style={[styles.input, { textAlign: 'center' }]}
                        value={String(item.credits)}
                        onChangeText={(val) => updateField(item.id, 'credits', val)}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>

                    {/* Weightage (Read-only) */}
                    <View style={[styles.inputContainer, { flex: 1, backgroundColor: 'transparent', borderWidth: 0 }]}>
                      <Text style={styles.weightageText}>{item.weightage}%</Text>
                    </View>

                    {/* Delete */}
                    <TouchableOpacity onPress={() => removeRow(item.id)} style={styles.deleteBtn}>
                      <Text style={{ fontSize: 16 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Chapters and Exam (School/Coaching specific) */}
                  <View style={styles.chaptersContainer}>
                    <Text style={styles.chaptersLabel}>Chapters {item.exam ? `(${item.exam})` : ''}:</Text>
                    <View style={styles.chapterPillsContainer}>
                      {(item.chapters || []).map((chap, idx) => (
                        <View key={idx} style={styles.chapterPill}>
                          <Text style={styles.chapterPillText}>{chap}</Text>
                          <TouchableOpacity onPress={() => handleRemoveChapter(item.id, idx)} style={{ marginLeft: 6 }}>
                            <Text style={styles.chapterDeleteIcon}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                    <View style={styles.addChapterRow}>
                      <TextInput 
                        style={styles.addChapterInput}
                        value={newChapters[item.id] || ''}
                        onChangeText={(text) => setNewChapters(prev => ({ ...prev, [item.id]: text }))}
                        placeholder="Add chapter..."
                        placeholderTextColor={COLORS.textMuted}
                        onSubmitEditing={() => handleAddChapter(item.id)}
                      />
                      <TouchableOpacity style={styles.addChapterBtn} onPress={() => handleAddChapter(item.id)}>
                        <Text style={styles.addChapterBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </GlassCard>
              </Animated.View>
            );
          })}

          <TouchableOpacity style={styles.addBtn} onPress={addRow}>
            <Text style={styles.addBtnText}>+ Add Subject</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <LinearGradient colors={['transparent', COLORS.background]} style={styles.footerGradient}>
          <GradientButton
            title="Save & Continue"
            onPress={handleSave}
            loading={saving}
            style={{ width: '100%' }}
          />
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xl, paddingTop: height * 0.08, marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZES.hero, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, lineHeight: 22 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },
  gridHeader: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder, marginBottom: SPACING.md },
  gridHeaderText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.caption, fontWeight: '700', textTransform: 'uppercase' },
  rowCardContainer: { padding: SPACING.sm, marginBottom: SPACING.sm, flexDirection: 'column' },
  rowCard: { flexDirection: 'row', alignItems: 'center' },
  inputContainer: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: BORDER_RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', marginHorizontal: 2 },
  input: { flex: 1, color: COLORS.textPrimary, padding: SPACING.sm, fontSize: FONT_SIZES.body, fontWeight: '600' },
  warningIcon: { position: 'absolute', right: 8, fontSize: 12 },
  weightageText: { color: COLORS.accent, fontSize: FONT_SIZES.body, fontWeight: '800', textAlign: 'center', width: '100%' },
  deleteBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  addBtn: { alignSelf: 'center', marginTop: SPACING.md, padding: SPACING.md },
  addBtnText: { color: COLORS.primary, fontSize: FONT_SIZES.body, fontWeight: '700' },
  chaptersContainer: { marginTop: SPACING.md, paddingHorizontal: SPACING.xs, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  chaptersLabel: { fontSize: FONT_SIZES.caption, color: COLORS.textSecondary, fontWeight: '600', marginBottom: SPACING.xs },
  chapterPillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  chapterPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.pill, borderWidth: 1, borderColor: COLORS.glassBorder },
  chapterPillText: { fontSize: FONT_SIZES.caption, color: COLORS.textPrimary },
  chapterDeleteIcon: { fontSize: 12, color: COLORS.error || '#FF4C4C', fontWeight: 'bold', paddingHorizontal: 2 },
  addChapterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  addChapterInput: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', color: COLORS.textPrimary, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.sm, fontSize: FONT_SIZES.caption, borderWidth: 1, borderColor: COLORS.border },
  addChapterBtn: { width: 32, height: 32, backgroundColor: COLORS.glass, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: SPACING.sm, borderWidth: 1, borderColor: COLORS.primary },
  addChapterBtnText: { color: COLORS.primary, fontSize: 18, fontWeight: '600', marginTop: -2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  footerGradient: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxl, paddingTop: SPACING.xl },
});
