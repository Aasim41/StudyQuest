import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONTS, BORDER_RADIUS, SHADOWS } from '../theme';
import { FloatingParticle, ProgressBar, GradientButton } from '../components/ui';
import { useUser } from '../context/UserContext';
import { ACADEMIC_CALENDAR } from '../config/academicCalendar';

const { width } = Dimensions.get('window');

export default function PlannerScreen() {
  const { timetable, attendanceRecords, updateManualAttendance } = useUser();

  // Extract all distinct subjects from timetable and attendanceRecords
  const subjectsList = useMemo(() => {
    const set = new Set();
    if (timetable && Array.isArray(timetable)) {
      timetable.forEach(item => {
        if (item.subject && item.subject.trim()) {
          set.add(item.subject.trim());
        }
      });
    }
    if (attendanceRecords) {
      Object.keys(attendanceRecords).forEach(sub => set.add(sub));
    }
    return Array.from(set);
  }, [timetable, attendanceRecords]);

  // Overall attendance calculations
  const overallStats = useMemo(() => {
    let totalAttended = 0;
    let totalConducted = 0;
    let totalMissed = 0;

    subjectsList.forEach(sub => {
      const rec = attendanceRecords?.[sub] || { attended: 0, total: 0, missed: 0 };
      totalAttended += rec.attended || 0;
      totalConducted += rec.total || 0;
      totalMissed += rec.missed || (rec.total - rec.attended) || 0;
    });

    const percent = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0;
    return { totalAttended, totalConducted, totalMissed, percent };
  }, [subjectsList, attendanceRecords]);

  // Modal states for Calculator & Webkiosk sync
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [calculatorVisible, setCalculatorVisible] = useState(false);
  const [targetCriteria, setTargetCriteria] = useState(70); // JUET 70% criteria
  const [simulatedSkips, setSimulatedSkips] = useState(1);

  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [syncAttended, setSyncAttended] = useState('');
  const [syncTotal, setSyncTotal] = useState('');

  // Open Calculator for a specific subject
  const openCalculator = (subject) => {
    setSelectedSubject(subject);
    setTargetCriteria(70);
    setSimulatedSkips(1);
    setCalculatorVisible(true);
  };

  // Open Webkiosk manual sync for a subject
  const openWebkioskSync = (subject) => {
    setSelectedSubject(subject);
    const rec = attendanceRecords?.[subject] || { attended: 0, total: 0 };
    setSyncAttended(String(rec.attended || 0));
    setSyncTotal(String(rec.total || 0));
    setSyncModalVisible(true);
  };

  const handleSaveWebkioskSync = async () => {
    if (!selectedSubject) return;
    const att = parseInt(syncAttended, 10) || 0;
    const tot = parseInt(syncTotal, 10) || 0;
    if (tot < att) {
      alert("Total classes conducted cannot be less than attended classes.");
      return;
    }
    await updateManualAttendance(selectedSubject, att, tot);
    setSyncModalVisible(false);
  };

  // Calculations for the selected subject in modal
  const calcData = useMemo(() => {
    if (!selectedSubject) return null;
    const rec = attendanceRecords?.[selectedSubject] || { attended: 0, total: 0, missed: 0 };
    const attended = rec.attended || 0;
    const total = rec.total || 0;
    const currentPercent = total > 0 ? (attended / total) * 100 : 0;
    const target = targetCriteria;

    // 1. Safe bunks or classes needed
    let safeBunks = 0;
    let classesNeeded = 0;

    if (total === 0) {
      safeBunks = 0;
      classesNeeded = 0;
    } else if (currentPercent >= target) {
      // Formula: floor( (100 * attended - target * total) / target )
      safeBunks = Math.floor((100 * attended - target * total) / target);
      if (safeBunks < 0) safeBunks = 0;
    } else {
      // Formula: ceil( (target * total - 100 * attended) / (100 - target) )
      classesNeeded = Math.ceil((target * total - 100 * attended) / (100 - target));
      if (classesNeeded < 0) classesNeeded = 0;
    }

    // 2. What-If I Skip simulation
    const simulatedTotal = total + simulatedSkips;
    const simulatedPercent = simulatedTotal > 0 ? (attended / simulatedTotal) * 100 : 0;

    // 3. Approximate remaining classes in semester for this subject (up to Dec 05, 2026)
    // We check how many times this subject appears in the weekly timetable
    const weeklyCount = (timetable || []).filter(item => item.subject === selectedSubject).length;
    // Estimated ~8 weeks active remaining
    const estimatedRemainingClasses = weeklyCount * 8;
    const maxPossibleTotal = total + estimatedRemainingClasses;
    const maxPossibleAttended = attended + estimatedRemainingClasses;
    const maxPossiblePercent = maxPossibleTotal > 0 ? (maxPossibleAttended / maxPossibleTotal) * 100 : 100;

    return {
      attended,
      total,
      currentPercent,
      safeBunks,
      classesNeeded,
      simulatedPercent,
      estimatedRemainingClasses,
      maxPossiblePercent,
    };
  }, [selectedSubject, attendanceRecords, targetCriteria, simulatedSkips, timetable]);

  // Color helper based on percentage
  const getStatusColor = (percent) => {
    if (percent >= 75) return '#2ECC71'; // Safe
    if (percent >= 70) return '#F1C40F'; // Warning (JUET 70 threshold)
    return '#E74C3C'; // Danger (<70%)
  };

  const getStatusText = (percent) => {
    if (percent >= 75) return 'Safe (Criteria Met)';
    if (percent >= 70) return 'Borderline (70% Target)';
    return 'Critical (Detention Risk)';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <FloatingParticle size={180} color={COLORS.primary} x={-40} y={-30} delay={100} />
      <FloatingParticle size={140} color={COLORS.accent} x={width * 0.75} y={200} delay={500} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* College Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={styles.clgBadge}>
            <MaterialCommunityIcons name="shield-check" size={14} color="#00D2FF" style={{ marginRight: 6 }} />
            <Text style={styles.clgBadgeText}>JUET GUNA • ODD SEM 2026</Text>
          </View>
          <Text style={styles.title}>Attendance Hub</Text>
          <Text style={styles.subtitle}>Official 70% threshold tracker & bunk calculator</Text>
        </Animated.View>

        {/* Total Overall Attendance Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.overallCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
            style={styles.overallGradient}
          >
            <View style={styles.overallTopRow}>
              <View>
                <Text style={styles.overallLabel}>TOTAL ATTENDANCE</Text>
                <Text style={[styles.overallPercent, { color: getStatusColor(overallStats.percent) }]}>
                  {overallStats.percent.toFixed(1)}%
                </Text>
                <Text style={[styles.overallStatus, { color: getStatusColor(overallStats.percent) }]}>
                  ● {getStatusText(overallStats.percent)}
                </Text>
              </View>

              <View style={styles.overallBadgeBox}>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatNum}>{overallStats.totalAttended}</Text>
                  <Text style={styles.miniStatLabel}>Attended</Text>
                </View>
                <View style={[styles.miniStat, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)' }]}>
                  <Text style={styles.miniStatNum}>{overallStats.totalConducted}</Text>
                  <Text style={styles.miniStatLabel}>Conducted</Text>
                </View>
              </View>
            </View>

            <View style={{ marginTop: SPACING.md }}>
              <ProgressBar
                progress={overallStats.percent / 100}
                height={8}
                gradient={[getStatusColor(overallStats.percent), getStatusColor(overallStats.percent)]}
              />
            </View>

            <View style={styles.overallFooterRow}>
              <Text style={styles.footerNote}>
                JUET criteria: Minimum <Text style={{ color: '#00D2FF', fontWeight: '800' }}>70%</Text> required to write T-3
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Section Title */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Subject Attendance & Bunk Predictors</Text>
          <Text style={styles.subjectCount}>{subjectsList.length} Subjects</Text>
        </View>

        {/* Subject Cards List */}
        {subjectsList.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="calendar-clock" size={48} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No Timetable Uploaded Yet</Text>
            <Text style={styles.emptySub}>
              Upload your JUET timetable during onboarding or tap below to add classes.
            </Text>
          </View>
        ) : (
          subjectsList.map((subject, index) => {
            const rec = attendanceRecords?.[subject] || { attended: 0, total: 0, missed: 0 };
            const percent = rec.total > 0 ? (rec.attended / rec.total) * 100 : 0;
            const color = getStatusColor(percent);

            // Calculate quick bunk insight at 70%
            let quickBunkText = '';
            if (rec.total === 0) {
              quickBunkText = 'No classes recorded';
            } else if (percent >= 70) {
              const safe = Math.floor((100 * rec.attended - 70 * rec.total) / 70);
              quickBunkText = safe > 0 ? `Can safely bunk ${safe} ${safe === 1 ? 'class' : 'classes'}` : 'On the 70% margin';
            } else {
              const need = Math.ceil((70 * rec.total - 100 * rec.attended) / (100 - 70));
              quickBunkText = `Need ${need} more ${need === 1 ? 'class' : 'classes'} for 70%`;
            }

            return (
              <Animated.View
                key={subject}
                entering={FadeInDown.delay(250 + index * 60).springify()}
                layout={Layout.springify()}
                style={styles.subjectCard}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']}
                  style={styles.subjectGradient}
                >
                  <View style={styles.subjectTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subjectName} numberOfLines={1}>{subject}</Text>
                      <Text style={[styles.bunkInsight, { color }]}>
                        {quickBunkText}
                      </Text>
                    </View>
                    <View style={[styles.percentBadge, { borderColor: color }]}>
                      <Text style={[styles.percentBadgeText, { color }]}>
                        {rec.total > 0 ? `${percent.toFixed(0)}%` : '--'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginVertical: SPACING.sm }}>
                    <ProgressBar
                      progress={percent / 100}
                      height={6}
                      gradient={[color, color]}
                    />
                  </View>

                  <View style={styles.subjectStatsRow}>
                    <Text style={styles.classCountText}>
                      Attended: <Text style={{ color: '#FFF', fontWeight: '700' }}>{rec.attended}</Text> / {rec.total}
                    </Text>
                    <Text style={styles.classCountText}>
                      Missed: <Text style={{ color: '#E74C3C', fontWeight: '700' }}>{rec.missed || (rec.total - rec.attended) || 0}</Text>
                    </Text>
                  </View>

                  <View style={styles.subjectActionRow}>
                    <TouchableOpacity
                      style={styles.syncBtn}
                      activeOpacity={0.8}
                      onPress={() => openWebkioskSync(subject)}
                    >
                      <MaterialCommunityIcons name="sync" size={16} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={styles.syncBtnText}>Webkiosk Sync</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.calcBtn, { borderColor: color }]}
                      activeOpacity={0.8}
                      onPress={() => openCalculator(subject)}
                    >
                      <MaterialCommunityIcons name="calculator" size={16} color={color} style={{ marginRight: 6 }} />
                      <Text style={[styles.calcBtnText, { color }]}>Open Calculator</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </Animated.View>
            );
          })
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── DEDICATED SUBJECT CALCULATOR MODAL ───────────────────────────────────── */}
      <Modal visible={calculatorVisible} transparent animationType="slide" onRequestClose={() => setCalculatorVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>{selectedSubject}</Text>
                <Text style={styles.modalSub}>Dedicated Bunk & Target Calculator</Text>
              </View>
              <TouchableOpacity onPress={() => setCalculatorVisible(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {calcData && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Current Subject Standing */}
                <View style={styles.currentStandingBox}>
                  <View style={styles.standingItem}>
                    <Text style={styles.standingNum}>{calcData.currentPercent.toFixed(1)}%</Text>
                    <Text style={styles.standingLabel}>Current</Text>
                  </View>
                  <View style={styles.standingItem}>
                    <Text style={styles.standingNum}>{calcData.attended} / {calcData.total}</Text>
                    <Text style={styles.standingLabel}>Attended</Text>
                  </View>
                  <View style={styles.standingItem}>
                    <Text style={styles.standingNum}>{calcData.total - calcData.attended}</Text>
                    <Text style={styles.standingLabel}>Bunked</Text>
                  </View>
                </View>

                {/* 1. Target Criteria Selector */}
                <Text style={styles.calcSectionTitle}>1. Target Attendance Requirement</Text>
                <View style={styles.criteriaRow}>
                  {[65, 70, 75, 80, 85].map(val => (
                    <TouchableOpacity
                      key={val}
                      style={[styles.criteriaPill, targetCriteria === val && styles.criteriaPillActive]}
                      onPress={() => setTargetCriteria(val)}
                    >
                      <Text style={[styles.criteriaText, targetCriteria === val && styles.criteriaTextActive]}>
                        {val}% {val === 70 ? '★' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Dynamic Answer Box */}
                <LinearGradient
                  colors={calcData.currentPercent >= targetCriteria ? ['rgba(46,204,113,0.15)', 'rgba(46,204,113,0.05)'] : ['rgba(231,76,60,0.15)', 'rgba(231,76,60,0.05)']}
                  style={styles.verdictBox}
                >
                  <MaterialCommunityIcons
                    name={calcData.currentPercent >= targetCriteria ? "emoticon-happy-outline" : "alert-circle-outline"}
                    size={32}
                    color={calcData.currentPercent >= targetCriteria ? '#2ECC71' : '#E74C3C'}
                    style={{ marginBottom: 6 }}
                  />
                  {calcData.currentPercent >= targetCriteria ? (
                    <>
                      <Text style={styles.verdictTitle}>You are Safe!</Text>
                      <Text style={styles.verdictBody}>
                        You can safely bunk the next <Text style={{ color: '#2ECC71', fontWeight: '900', fontSize: 18 }}>{calcData.safeBunks}</Text> classes and your attendance will still stay above <Text style={{ fontWeight: '800' }}>{targetCriteria}%</Text>.
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.verdictTitle, { color: '#E74C3C' }]}>Below Criteria!</Text>
                      <Text style={styles.verdictBody}>
                        You must attend the next <Text style={{ color: '#E74C3C', fontWeight: '900', fontSize: 18 }}>{calcData.classesNeeded}</Text> consecutive classes without skipping to hit <Text style={{ fontWeight: '800' }}>{targetCriteria}%</Text>.
                      </Text>
                    </>
                  )}
                </LinearGradient>

                {/* 2. What-If I Skip Simulator */}
                <Text style={[styles.calcSectionTitle, { marginTop: SPACING.lg }]}>2. "What If I Skip?" Simulator</Text>
                <View style={styles.simulatorBox}>
                  <Text style={styles.simulatorLabel}>If I skip upcoming classes:</Text>
                  <View style={styles.stepperRow}>
                    {[1, 2, 3, 4, 5].map(num => (
                      <TouchableOpacity
                        key={num}
                        style={[styles.stepBtn, simulatedSkips === num && styles.stepBtnActive]}
                        onPress={() => setSimulatedSkips(num)}
                      >
                        <Text style={[styles.stepBtnText, simulatedSkips === num && styles.stepBtnTextActive]}>
                          +{num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.simResultRow}>
                    <Text style={styles.simResultLabel}>New Attendance would become:</Text>
                    <Text style={[styles.simResultValue, { color: getStatusColor(calcData.simulatedPercent) }]}>
                      {calcData.simulatedPercent.toFixed(1)}%
                    </Text>
                  </View>
                  {calcData.simulatedPercent < 70 && (
                    <Text style={styles.dangerWarning}>
                      ⚠️ Caution: Skipping {simulatedSkips} classes will drop you below the JUET 70% detention line!
                    </Text>
                  )}
                </View>

                {/* 3. Semester End Projection */}
                <View style={styles.semesterBox}>
                  <MaterialCommunityIcons name="calendar-month-outline" size={20} color="#00D2FF" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.semesterTitle}>JUET Semester Projection</Text>
                    <Text style={styles.semesterBody}>
                      Approx. <Text style={{ color: '#00D2FF', fontWeight: '800' }}>{calcData.estimatedRemainingClasses}</Text> classes remaining before 05 Dec 2026.
                      Max possible final attendance: <Text style={{ color: '#FFF', fontWeight: '800' }}>{calcData.maxPossiblePercent.toFixed(0)}%</Text>.
                    </Text>
                  </View>
                </View>

                <View style={{ height: 30 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── WEBKIOSK FAST-SYNC MODAL ────────────────────────────────────────────── */}
      <Modal visible={syncModalVisible} transparent animationType="fade" onRequestClose={() => setSyncModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: 380 }]}>
            <Text style={styles.modalTitle}>Sync with Webkiosk</Text>
            <Text style={styles.modalSub}>Enter current attendance figures for {selectedSubject}</Text>

            <View style={{ marginVertical: SPACING.md }}>
              <Text style={styles.inputLabel}>Classes Attended</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={syncAttended}
                onChangeText={setSyncAttended}
                placeholder="e.g. 15"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={[styles.inputLabel, { marginTop: SPACING.sm }]}>Total Classes Conducted</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={syncTotal}
                onChangeText={setSyncTotal}
                placeholder="e.g. 18"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <GradientButton
              title="Save Attendance"
              onPress={handleSaveWebkioskSync}
              style={{ marginTop: SPACING.xs }}
            />
            <TouchableOpacity onPress={() => setSyncModalVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: SPACING.lg },
  clgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,210,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(0,210,255,0.3)',
    marginBottom: SPACING.xs,
  },
  clgBadgeText: { color: '#00D2FF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  title: { fontSize: FONT_SIZES.hero, fontWeight: '900', color: COLORS.textPrimary },
  subtitle: { fontSize: FONT_SIZES.body, color: COLORS.textMuted, marginTop: 2 },

  // Overall Card
  overallCard: { borderRadius: BORDER_RADIUS.xl, overflow: 'hidden', ...SHADOWS.glow, marginBottom: SPACING.xl },
  overallGradient: { padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  overallTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  overallLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.5 },
  overallPercent: { fontSize: 44, fontWeight: '900', marginVertical: 2 },
  overallStatus: { fontSize: 13, fontWeight: '700' },
  overallBadgeBox: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: BORDER_RADIUS.md },
  miniStat: { paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
  miniStatNum: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  miniStatLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  overallFooterRow: { marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: SPACING.sm },
  footerNote: { fontSize: 12, color: COLORS.textSecondary },

  // Section Header
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.title, fontWeight: '800', color: COLORS.textPrimary },
  subjectCount: { fontSize: 12, fontWeight: '700', color: COLORS.accent },

  // Subject Card
  subjectCard: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md },
  subjectGradient: { padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: BORDER_RADIUS.lg },
  subjectTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectName: { fontSize: FONT_SIZES.bodyLarge, fontWeight: '800', color: COLORS.textPrimary },
  bunkInsight: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  percentBadge: { borderWidth: 1.5, borderRadius: BORDER_RADIUS.md, paddingHorizontal: 8, paddingVertical: 4 },
  percentBadgeText: { fontSize: 14, fontWeight: '800' },
  subjectStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: SPACING.sm },
  classCountText: { fontSize: 12, color: COLORS.textMuted },
  subjectActionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: SPACING.sm },
  syncBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: BORDER_RADIUS.sm, backgroundColor: 'rgba(255,255,255,0.05)' },
  syncBtnText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  calcBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  calcBtnText: { fontSize: 12, fontWeight: '800' },

  // Empty state
  emptyCard: { padding: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  emptySub: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },

  // Modal Common
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#14142B', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: SPACING.xl, maxHeight: '85%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.lg },
  modalTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
  modalSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  closeBtn: { padding: 4 },

  currentStandingBox: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.md },
  standingItem: { flex: 1, alignItems: 'center' },
  standingNum: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  standingLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },

  calcSectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.accent, letterSpacing: 0.5, marginBottom: SPACING.sm },
  criteriaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  criteriaPill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: BORDER_RADIUS.pill, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  criteriaPillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  criteriaText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  criteriaTextActive: { color: '#000', fontWeight: '900' },

  verdictBox: { padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  verdictTitle: { fontSize: 16, fontWeight: '900', color: '#2ECC71', marginBottom: 4 },
  verdictBody: { fontSize: 13, color: COLORS.textPrimary, textAlign: 'center', lineHeight: 20 },

  simulatorBox: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: BORDER_RADIUS.md, padding: SPACING.md },
  simulatorLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  stepperRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.md },
  stepBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BORDER_RADIUS.sm, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  stepBtnActive: { backgroundColor: 'rgba(108,92,231,0.3)', borderColor: COLORS.accent },
  stepBtnText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '800' },
  stepBtnTextActive: { color: '#FFF' },
  simResultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  simResultLabel: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600' },
  simResultValue: { fontSize: 20, fontWeight: '900' },
  dangerWarning: { fontSize: 11, color: '#E74C3C', fontWeight: '700', marginTop: 6 },

  semesterBox: { flexDirection: 'row', backgroundColor: 'rgba(0,210,255,0.06)', borderRadius: BORDER_RADIUS.md, padding: SPACING.md, marginTop: SPACING.md, borderWidth: 1, borderColor: 'rgba(0,210,255,0.2)' },
  semesterTitle: { fontSize: 12, fontWeight: '800', color: '#00D2FF', marginBottom: 2 },
  semesterBody: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },

  inputLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 4 },
  textInput: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: BORDER_RADIUS.md, padding: 12, color: '#FFF', fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  cancelText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
});
