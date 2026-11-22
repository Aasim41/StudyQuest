import React, { useState, useMemo, useEffect } from 'react';
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS } from '../theme';
import { ModernButton, ModernCard, MinimalProgress, GSAPStagger, SleekPill, PulseIndicator } from '../components/ui';
import { useUser } from '../context/UserContext';
import CampusLynxSyncModal from '../components/CampusLynxSyncModal';
import { auth } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

const BATCH_GROUP_INFO = {
  BX: {
    title: 'GROUP BX (Batches B1, B2, B3)',
    desc: 'Core CSE Track • Includes Theory of Computation (ToC)',
    badgeColor: '#6C5CE7',
    tag: 'ToC Track',
    batches: ['B1', 'B2', 'B3']
  },
  BY: {
    title: 'GROUP BY (Batches B4, B5, B6)',
    desc: 'Core CSE Track • Includes Theory of Computation (ToC)',
    badgeColor: '#6C5CE7',
    tag: 'ToC Track',
    batches: ['B4', 'B5', 'B6']
  },
  BZ: {
    title: 'GROUP BZ (Batches B7, B8, B9)',
    desc: 'Core CSE Track • Includes Theory of Computation (ToC)',
    badgeColor: '#6C5CE7',
    tag: 'ToC Track',
    batches: ['B7', 'B8', 'B9']
  },
  BX1_AI: {
    title: 'GROUP BX1 — AI & ML Specialization',
    desc: 'Specialization Track • Foundation of AI (FOAI) + AI Lab',
    badgeColor: '#8B5CF6',
    tag: 'AI & ML',
    batches: ['B21', 'B22', 'B23']
  },
  BX1_B31: {
    title: 'GROUP BX1 — Batch B31 (Data Science / Stats)',
    desc: 'Stats Track • Statistical Methods (SM) + SM Lab (No ToC)',
    badgeColor: '#00D2FF',
    tag: 'SM & Stats',
    batches: ['B31']
  }
};

export default function PlannerScreen() {
  const {
    timetable,
    attendanceRecords,
    updateManualAttendance,
    userBatch,
    switchBatch,
    syncCampusLynxData,
  } = useUser();
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'THEORY' | 'LABS'
  const [campusLynxModalVisible, setCampusLynxModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [simulatedSkipType, setSimulatedSkipType] = useState('LECTURE');

  // Distinct subjects from timetable + records
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

  // Categorize into Theory (L+T) and Labs (2 hrs)
  const categorizedSubjects = useMemo(() => {
    const list = subjectsList.map(name => {
      const isLab = name.toLowerCase().includes('lab') || (timetable || []).some(t => t.subject === name && (t.isLab || t.sessionType === 'P'));
      const weeklyItems = (timetable || []).filter(t => t.subject === name);
      const lectures = weeklyItems.filter(t => t.sessionType === 'L').length;
      const tutorials = weeklyItems.filter(t => t.sessionType === 'T').length;
      const labs = weeklyItems.filter(t => t.sessionType === 'P').length;

      return {
        name,
        isLab,
        lectures,
        tutorials,
        labs,
        weeklyTotal: weeklyItems.length,
      };
    });

    return {
      all: list,
      theory: list.filter(s => !s.isLab),
      labs: list.filter(s => s.isLab),
    };
  }, [subjectsList, timetable]);

  const displayedSubjects = useMemo(() => {
    if (activeTab === 'THEORY') return categorizedSubjects.theory;
    if (activeTab === 'LABS') return categorizedSubjects.labs;
    return categorizedSubjects.all;
  }, [activeTab, categorizedSubjects]);

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
  const [targetCriteria, setTargetCriteria] = useState(70); // JUET 70% threshold
  const [simulatedSkips, setSimulatedSkips] = useState(1);

  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [syncAttended, setSyncAttended] = useState('');
  const [syncTotal, setSyncTotal] = useState('');

  // GSAP-like entrance animation
  const headerScale = useSharedValue(0.95);
  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 400 });
    headerScale.value = withSpring(1, { damping: 14, stiffness: 120 });
  }, []);

  const headerAnimStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  const openCalculator = (subject) => {
    setSelectedSubject(subject);
    setTargetCriteria(70);
    setSimulatedSkips(1);
    setCalculatorVisible(true);
  };

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
      alert('Total conducted classes cannot be less than attended classes.');
      return;
    }
    await updateManualAttendance(selectedSubject, att, tot);
    setSyncModalVisible(false);
  };

  // Calculator physics & calculations
  const calcData = useMemo(() => {
    if (!selectedSubject) return null;
    const rec = attendanceRecords?.[selectedSubject] || { attended: 0, total: 0, missed: 0 };
    const attended = rec.attended || 0;
    const total = rec.total || 0;
    const currentPercent = total > 0 ? (attended / total) * 100 : 0;
    const target = targetCriteria;

    const isLab = selectedSubject.toLowerCase().includes('lab') ||
      (timetable || []).some(t => t.subject === selectedSubject && (t.isLab || t.sessionType === 'P'));

    const attendedL = rec.attendedL || 0;
    const totalL = rec.totalL || 0;
    const percentL = totalL > 0 ? (attendedL / totalL) * 100 : (rec.percentL || null);

    const attendedT = rec.attendedT || 0;
    const totalT = rec.totalT || 0;
    const percentT = totalT > 0 ? (attendedT / totalT) * 100 : (rec.percentT || null);

    const attendedP = rec.attendedP || 0;
    const totalP = rec.totalP || 0;
    const percentP = totalP > 0 ? (attendedP / totalP) * 100 : (rec.percentP || null);

    const hasTutorial = (timetable || []).some(t => t.subject === selectedSubject && t.sessionType === 'T') || totalT > 0;

    let safeBunks = 0;
    let classesNeeded = 0;

    if (total === 0) {
      safeBunks = 0;
      classesNeeded = 0;
    } else if (currentPercent >= target) {
      safeBunks = Math.floor((100 * attended - target * total) / target);
      if (safeBunks < 0) safeBunks = 0;
    } else {
      classesNeeded = Math.ceil((target * total - 100 * attended) / (100 - target));
      if (classesNeeded < 0) classesNeeded = 0;
    }

    let simTotal = total + simulatedSkips;
    let simAttended = attended;
    let simLTotal = totalL;
    let simTTotal = totalT;
    let simPTotal = totalP;

    if (isLab) {
      simPTotal = totalP + simulatedSkips;
    } else if (simulatedSkipType === 'TUTORIAL' && hasTutorial) {
      simTTotal = totalT + simulatedSkips;
    } else {
      simLTotal = totalL + simulatedSkips;
    }

    const simulatedPercent = simTotal > 0 ? (simAttended / simTotal) * 100 : 0;
    const simulatedLPercent = simLTotal > 0 ? (attendedL / simLTotal) * 100 : null;
    const simulatedTPercent = simTTotal > 0 ? (attendedT / simTTotal) * 100 : null;
    const simulatedPPercent = simPTotal > 0 ? (attendedP / simPTotal) * 100 : null;

    const weeklyCount = (timetable || []).filter(item => item.subject === selectedSubject).length;
    // For lab: 1 turn per week (about 8 remaining weeks in semester). For theory: weeklyCount * 8
    const estimatedRemainingClasses = isLab ? 8 : (weeklyCount * 8);
    const maxPossibleTotal = total + estimatedRemainingClasses;
    const maxPossibleAttended = attended + estimatedRemainingClasses;
    const maxPossiblePercent = maxPossibleTotal > 0 ? (maxPossibleAttended / maxPossibleTotal) * 100 : 100;

    return {
      isLab,
      hasTutorial,
      attended,
      total,
      currentPercent,
      attendedL,
      totalL,
      percentL,
      attendedT,
      totalT,
      percentT,
      attendedP,
      totalP,
      percentP,
      safeBunks,
      classesNeeded,
      simulatedPercent,
      simulatedLPercent,
      simulatedTPercent,
      simulatedPPercent,
      estimatedRemainingClasses,
      maxPossiblePercent,
    };
  }, [selectedSubject, attendanceRecords, targetCriteria, simulatedSkips, simulatedSkipType, timetable]);

  const getStatusColor = (percent) => {
    if (percent >= 75) return '#2ECC71';
    if (percent >= 70) return '#F1C40F';
    return '#E74C3C';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── HEADER ────────────────────────────────────────────────────────────── */}
        <Animated.View style={[styles.header, headerAnimStyle]}>
          <View style={styles.collegeBadge}>
            <Text style={styles.collegeBadgeText}>JUET GUNA • 70% CRITERIA</Text>
          </View>
          <Text style={styles.titleText}>Attendance Hub</Text>
          <Text style={styles.subText}>Dedicated per-subject bunk calculators & Webkiosk sync</Text>
        </Animated.View>

        {/* ─── ACTION BAR: BATCH SWITCHER & LIVE CAMPUSLYNX SYNC ──────────────────── */}
        <View style={styles.topControlRow}>
          <SleekPill
            label={`Batch: ${userBatch || 'B31'}`}
            icon={<MaterialCommunityIcons name="account-group" size={13} color="#00D2FF" />}
            active={true}
            activeColor="#00D2FF"
            onPress={() => setBatchModalVisible(true)}
            style={styles.batchPill}
          />

          <TouchableOpacity
            style={styles.syncCampusLynxMainBtn}
            activeOpacity={0.85}
            onPress={() => setCampusLynxModalVisible(true)}
          >
            <PulseIndicator size={7} color="#2ECC71" />
            <MaterialCommunityIcons name="cloud-sync-outline" size={15} color="#2ECC71" style={{ marginHorizontal: 5 }} />
            <Text style={styles.syncCampusLynxMainText}>Sync CampusLynx Live</Text>
          </TouchableOpacity>
        </View>

        {/* ─── OVERALL METRIC CARD ───────────────────────────────────────────────── */}
        <View style={styles.overallCard}>
          <View style={styles.overallTop}>
            <View>
              <Text style={styles.overallOverline}>COMBINED ATTENDANCE</Text>
              <Text style={[styles.overallValue, { color: getStatusColor(overallStats.percent) }]}>
                {overallStats.percent.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.statPillsRow}>
              <View style={styles.statPill}>
                <Text style={styles.statPillNum}>{overallStats.totalAttended}</Text>
                <Text style={styles.statPillLabel}>Attended</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statPillNum}>{overallStats.totalConducted}</Text>
                <Text style={styles.statPillLabel}>Total</Text>
              </View>
            </View>
          </View>

          <View style={{ marginVertical: 12 }}>
            <MinimalProgress
              progress={overallStats.percent / 100}
              color={getStatusColor(overallStats.percent)}
              height={5}
            />
          </View>

          <Text style={styles.overallRuleNote}>
            JUET Detention Warning: Maintain <Text style={{ color: '#00D2FF', fontWeight: '800' }}>70% minimum</Text> in every course.
          </Text>
        </View>

        {/* ─── SUBJECT CARDS SECTION ─────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Course Breakdown</Text>
          <Text style={styles.sectionCount}>{displayedSubjects.length} Courses</Text>
        </View>

        {/* ─── CATEGORY FILTER PILLS ──────────────────────────────────────────────── */}
        <View style={styles.tabFilterRow}>
          <SleekPill
            label="All"
            count={categorizedSubjects.all.length}
            active={activeTab === 'ALL'}
            onPress={() => setActiveTab('ALL')}
            style={{ marginRight: 8 }}
          />
          <SleekPill
            label="Theory [L+T]"
            count={categorizedSubjects.theory.length}
            active={activeTab === 'THEORY'}
            onPress={() => setActiveTab('THEORY')}
            style={{ marginRight: 8 }}
          />
          <SleekPill
            label="Labs [2 hrs]"
            count={categorizedSubjects.labs.length}
            active={activeTab === 'LABS'}
            onPress={() => setActiveTab('LABS')}
          />
        </View>

        {displayedSubjects.length === 0 ? (
          <ModernCard style={styles.emptyCard}>
            <MaterialCommunityIcons name="clipboard-text-clock" size={36} color={COLORS.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>No Courses Found</Text>
            <Text style={styles.emptySub}>No subjects found under the selected category.</Text>
          </ModernCard>
        ) : (
          <GSAPStagger delay={100} stagger={60}>
            {displayedSubjects.map((item, index) => {
              const subject = item.name;
              const isLab = item.isLab;
              const rec = attendanceRecords?.[subject] || { attended: 0, total: 0, missed: 0 };
              const percent = rec.total > 0 ? (rec.attended / rec.total) * 100 : 0;
              const color = getStatusColor(percent);

              let quickBunkText = '';
              if (rec.total === 0) {
                quickBunkText = 'No attendance recorded';
              } else if (percent >= 70) {
                const safe = Math.floor((100 * rec.attended - 70 * rec.total) / 70);
                const safeWord = isLab ? (safe === 1 ? 'lab turn' : 'lab turns') : (safe === 1 ? 'class' : 'classes');
                quickBunkText = safe > 0 ? `Can bunk ${safe} ${safeWord}` : 'Right at 70% threshold';
              } else {
                const need = Math.ceil((70 * rec.total - 100 * rec.attended) / (100 - 70));
                const needWord = isLab ? (need === 1 ? 'lab turn' : 'lab turns') : (need === 1 ? 'class' : 'classes');
                quickBunkText = `Need next ${need} ${needWord} for 70%`;
              }

              return (
                <ModernCard
                  key={subject}
                  style={[styles.courseCard, isLab && styles.courseCardLab]}
                  onPress={() => openCalculator(subject)}
                >
                  <View style={styles.courseTop}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={styles.cardHeaderBadgeRow}>
                        {isLab ? (
                          <View style={styles.badgeLab}>
                            <MaterialCommunityIcons name="flask-outline" size={11} color="#00D2FF" style={{ marginRight: 3 }} />
                            <Text style={styles.badgeLabText}>PRACTICAL • 2 HRS</Text>
                          </View>
                        ) : (
                          <View style={styles.badgeTheory}>
                            <MaterialCommunityIcons name="book-open-page-variant" size={11} color="#A29BFE" style={{ marginRight: 3 }} />
                            <Text style={styles.badgeTheoryText}>THEORY (L+T COMBINED)</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.courseName} numberOfLines={1}>{subject}</Text>
                      <Text style={styles.courseScheduleDetail}>
                        {isLab
                          ? '1 Lab Turn / Week (2 Contact Hours)'
                          : `${item.lectures} Lectures + ${item.tutorials} Tutorials / Week`}
                      </Text>
                      <Text style={[styles.bunkLabel, { color }]}>{quickBunkText}</Text>
                    </View>
                    <View style={[styles.percentBadge, { borderColor: color }]}>
                      <Text style={[styles.percentBadgeText, { color }]}>
                        {rec.total > 0 ? `${percent.toFixed(0)}%` : '--'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginVertical: 10 }}>
                    <MinimalProgress progress={percent / 100} color={color} height={4} />
                  </View>

                  <View style={styles.courseStatsRow}>
                    <Text style={styles.classDetailText}>
                      Attended: <Text style={{ color: '#FFF', fontWeight: '800' }}>{rec.attended}</Text> / {rec.total}
                    </Text>
                    <Text style={styles.classDetailText}>
                      Missed: <Text style={{ color: '#E74C3C', fontWeight: '800' }}>{rec.missed || (rec.total - rec.attended) || 0}</Text>
                    </Text>
                  </View>

                  {/* CampusLynx LTP Breakdown Chips */}
                  <View style={styles.ltpChipsRow}>
                    {isLab ? (
                      <View style={styles.ltpChip}>
                        <Text style={styles.ltpChipLabel}>Current P:</Text>
                        <Text style={styles.ltpChipVal}>
                          {rec.totalP ? `${(rec.attendedP / rec.totalP * 100).toFixed(1)}%` : `${percent.toFixed(1)}%`}
                        </Text>
                        <Text style={styles.ltpChipFraction}>
                          ({rec.totalP ? rec.attendedP : rec.attended}/{rec.totalP ? rec.totalP : rec.total} turns)
                        </Text>
                      </View>
                    ) : item.tutorials > 0 ? (
                      <>
                        <View style={styles.ltpChip}>
                          <Text style={styles.ltpChipLabel}>Current L:</Text>
                          <Text style={styles.ltpChipVal}>
                            {rec.totalL ? `${(rec.attendedL / rec.totalL * 100).toFixed(1)}%` : '--'}
                          </Text>
                          <Text style={styles.ltpChipFraction}>
                            {rec.totalL ? `(${rec.attendedL}/${rec.totalL})` : ''}
                          </Text>
                        </View>
                        <View style={[styles.ltpChip, { marginLeft: 6 }]}>
                          <Text style={styles.ltpChipLabel}>Current T:</Text>
                          <Text style={styles.ltpChipVal}>
                            {rec.totalT ? `${(rec.attendedT / rec.totalT * 100).toFixed(1)}%` : '--'}
                          </Text>
                          <Text style={styles.ltpChipFraction}>
                            {rec.totalT ? `(${rec.attendedT}/${rec.totalT})` : ''}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <View style={styles.ltpChip}>
                        <Text style={styles.ltpChipLabel}>Current L:</Text>
                        <Text style={styles.ltpChipVal}>
                          {rec.totalL ? `${(rec.attendedL / rec.totalL * 100).toFixed(1)}%` : `${percent.toFixed(1)}%`}
                        </Text>
                        <Text style={styles.ltpChipFraction}>
                          ({rec.totalL ? rec.attendedL : rec.attended}/{rec.totalL ? rec.totalL : rec.total})
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Actions */}
                  <View style={styles.courseActionsRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.syncBtn, { borderColor: 'rgba(46, 204, 113, 0.4)' }]}
                      onPress={() => setCampusLynxModalVisible(true)}
                    >
                      <MaterialCommunityIcons name="cloud-sync" size={14} color="#2ECC71" style={{ marginRight: 4 }} />
                      <Text style={[styles.syncBtnText, { color: '#2ECC71' }]}>Sync Portal</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.calcTriggerBtn, { borderColor: color }]}
                      onPress={() => openCalculator(subject)}
                    >
                      <MaterialCommunityIcons name="calculator" size={14} color={color} style={{ marginRight: 5 }} />
                      <Text style={[styles.calcTriggerText, { color }]}>Calculator</Text>
                    </TouchableOpacity>
                  </View>
                </ModernCard>
              );
            })}
          </GSAPStagger>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ─── SLEEK CALCULATOR MODAL (GSAP bottom-sheet feel) ───────────────────── */}
      <Modal visible={calculatorVisible} transparent animationType="slide" onRequestClose={() => setCalculatorVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalCourseName} numberOfLines={1}>{selectedSubject}</Text>
                <Text style={styles.modalOverline}>Dedicated Bunk & Criteria Calculator</Text>
              </View>
              <TouchableOpacity onPress={() => setCalculatorVisible(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {calcData && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Lab vs Theory Specific Banner */}
                {calcData.isLab ? (
                  <View style={styles.modalTypeBannerLab}>
                    <MaterialCommunityIcons name="flask-outline" size={15} color="#00D2FF" style={{ marginRight: 6 }} />
                    <Text style={styles.modalTypeBannerLabText}>
                      <Text style={{ fontWeight: '800', color: '#00D2FF' }}>PRACTICAL (2 CONTACT HOURS): </Text>
                      Labs meet once weekly (~12–14 turns/sem). Missing 1 lab turn causes a ~7–8% attendance drop.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.modalTypeBannerTheory}>
                    <MaterialCommunityIcons name="book-open-page-variant" size={15} color="#A29BFE" style={{ marginRight: 6 }} />
                    <Text style={styles.modalTypeBannerTheoryText}>
                      <Text style={{ fontWeight: '800', color: '#A29BFE' }}>THEORY (L+T COMBINED): </Text>
                      Lectures and Tutorials combine together towards your JUET 70% detention criteria.
                    </Text>
                  </View>
                )}

                {/* Standing Summary */}
                {calcData.hasTutorial ? (
                  <View style={styles.summaryBarLTP}>
                    <View style={styles.summaryColLTP}>
                      <Text style={styles.summaryNumLTP}>
                        {calcData.percentL != null ? `${calcData.percentL.toFixed(1)}%` : '--'}
                      </Text>
                      <Text style={styles.summaryTxtLTP}>Current L ({calcData.attendedL}/{calcData.totalL})</Text>
                    </View>
                    <View style={styles.summaryColLTP}>
                      <Text style={styles.summaryNumLTP}>
                        {calcData.percentT != null ? `${calcData.percentT.toFixed(1)}%` : '--'}
                      </Text>
                      <Text style={styles.summaryTxtLTP}>Current T ({calcData.attendedT}/{calcData.totalT})</Text>
                    </View>
                    <View style={styles.summaryColLTP}>
                      <Text style={[styles.summaryNumLTP, { color: getStatusColor(calcData.currentPercent) }]}>
                        {calcData.currentPercent.toFixed(1)}%
                      </Text>
                      <Text style={styles.summaryTxtLTP}>Overall LTP ({calcData.attended}/{calcData.total})</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.summaryBar}>
                    <View style={styles.summaryCol}>
                      <Text style={styles.summaryNum}>{calcData.currentPercent.toFixed(1)}%</Text>
                      <Text style={styles.summaryTxt}>Current</Text>
                    </View>
                    <View style={styles.summaryCol}>
                      <Text style={styles.summaryNum}>{calcData.attended} / {calcData.total}</Text>
                      <Text style={styles.summaryTxt}>Attended</Text>
                    </View>
                    <View style={styles.summaryCol}>
                      <Text style={styles.summaryNum}>{calcData.total - calcData.attended}</Text>
                      <Text style={styles.summaryTxt}>Bunked</Text>
                    </View>
                  </View>
                )}

                {/* Target Criteria Selector */}
                <Text style={styles.calcHeading}>1. Target Percentage</Text>
                <View style={styles.targetRow}>
                  {[65, 70, 75, 80, 85].map(val => (
                    <SleekPill
                      key={val}
                      label={`${val}% ${val === 70 ? '★' : ''}`}
                      active={targetCriteria === val}
                      activeColor={val === 70 ? '#00D2FF' : COLORS.primary}
                      onPress={() => setTargetCriteria(val)}
                      style={{ marginRight: 6, paddingHorizontal: 12 }}
                    />
                  ))}
                </View>

                {/* Dynamic Outcome Card */}
                <View
                  style={[
                    styles.outcomeCard,
                    calcData.currentPercent >= targetCriteria ? styles.outcomeSafe : styles.outcomeCritical,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={calcData.currentPercent >= targetCriteria ? 'check-circle-outline' : 'alert-circle-outline'}
                    size={26}
                    color={calcData.currentPercent >= targetCriteria ? '#2ECC71' : '#E74C3C'}
                    style={{ marginBottom: 4 }}
                  />
                  {calcData.currentPercent >= targetCriteria ? (
                    <>
                      <Text style={styles.outcomeTitle}>Safe to Skip</Text>
                      <Text style={styles.outcomeBody}>
                        You can safely bunk the next{' '}
                        <Text style={{ color: '#2ECC71', fontWeight: '900', fontSize: 16 }}>
                          {calcData.safeBunks}
                        </Text>{' '}
                        {calcData.isLab
                          ? (calcData.safeBunks === 1 ? 'lab turn (2 hrs)' : 'lab turns (2 hrs each)')
                          : (calcData.safeBunks === 1 ? 'class' : 'classes')}{' '}
                        and still stay above <Text style={{ fontWeight: '800' }}>{targetCriteria}%</Text>.
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.outcomeTitle, { color: '#E74C3C' }]}>Detention Risk</Text>
                      <Text style={styles.outcomeBody}>
                        You must attend the next{' '}
                        <Text style={{ color: '#E74C3C', fontWeight: '900', fontSize: 16 }}>
                          {calcData.classesNeeded}
                        </Text>{' '}
                        {calcData.isLab
                          ? (calcData.classesNeeded === 1 ? 'lab turn (2 hrs)' : 'lab turns (2 hrs each)')
                          : (calcData.classesNeeded === 1 ? 'class' : 'classes')}{' '}
                        consecutively to reach <Text style={{ fontWeight: '800' }}>{targetCriteria}%</Text>.
                      </Text>
                    </>
                  )}
                </View>

                {/* What-If Simulator */}
                <Text style={[styles.calcHeading, { marginTop: SPACING.lg }]}>2. "What If I Skip?" Live Simulator</Text>
                <View style={styles.simCard}>
                  {calcData.hasTutorial && (
                    <View style={styles.simTypeToggleRow}>
                      <SleekPill
                        label="Skip Lecture (L)"
                        active={simulatedSkipType === 'LECTURE'}
                        onPress={() => setSimulatedSkipType('LECTURE')}
                        style={{ flex: 1, justifyContent: 'center', marginRight: 8 }}
                      />
                      <SleekPill
                        label="Skip Tutorial (T)"
                        active={simulatedSkipType === 'TUTORIAL'}
                        onPress={() => setSimulatedSkipType('TUTORIAL')}
                        style={{ flex: 1, justifyContent: 'center' }}
                      />
                    </View>
                  )}

                  <Text style={styles.simNote}>
                    {calcData.isLab
                      ? 'Simulate missing upcoming 2-hr lab turns:'
                      : calcData.hasTutorial
                      ? `Simulate missing upcoming ${simulatedSkipType === 'TUTORIAL' ? 'Tutorials' : 'Lectures'}:`
                      : 'Simulate skipping upcoming classes:'}
                  </Text>
                  <View style={styles.simButtonsRow}>
                    {[1, 2, 3, 4, 5].map(num => (
                      <SleekPill
                        key={num}
                        label={`+${num}`}
                        active={simulatedSkips === num}
                        onPress={() => setSimulatedSkips(num)}
                        style={{ flex: 1, justifyContent: 'center', marginHorizontal: 3, paddingVertical: 8 }}
                      />
                    ))}
                  </View>

                  <View style={{ marginVertical: 10 }}>
                    <MinimalProgress
                      progress={calcData.simulatedPercent / 100}
                      color={getStatusColor(calcData.simulatedPercent)}
                      height={5}
                    />
                  </View>

                  <View style={styles.simResultLine}>
                    <Text style={styles.simResultTitle}>New Overall Attendance:</Text>
                    <Text style={[styles.simResultNum, { color: getStatusColor(calcData.simulatedPercent) }]}>
                      {calcData.simulatedPercent.toFixed(1)}%
                    </Text>
                  </View>
                  {calcData.hasTutorial && (
                    <View style={[styles.simResultLine, { marginTop: 4 }]}>
                      <Text style={styles.simResultSubTitle}>
                        {simulatedSkipType === 'TUTORIAL' ? 'New Tutorial T(%):' : 'New Lecture L(%):'}
                      </Text>
                      <Text style={styles.simResultSubNum}>
                        {simulatedSkipType === 'TUTORIAL'
                          ? (calcData.simulatedTPercent != null ? `${calcData.simulatedTPercent.toFixed(1)}%` : '--')
                          : (calcData.simulatedLPercent != null ? `${calcData.simulatedLPercent.toFixed(1)}%` : '--')}
                      </Text>
                    </View>
                  )}
                  {calcData.simulatedPercent < 70 && (
                    <Text style={styles.simWarning}>
                      ⚠️ Drops below the mandatory JUET 70% threshold!
                    </Text>
                  )}
                </View>

                {/* Semester Projection */}
                <View style={styles.projCard}>
                  <MaterialCommunityIcons name="calendar-clock" size={18} color="#00D2FF" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.projTitle}>JUET Semester Projection</Text>
                    <Text style={styles.projBody}>
                      Approx. <Text style={{ color: '#00D2FF', fontWeight: '800' }}>{calcData.estimatedRemainingClasses}</Text> {calcData.isLab ? 'lab turns' : 'classes'} remaining before 05 Dec 2026.
                      Max possible final attendance: <Text style={{ color: '#FFF', fontWeight: '800' }}>{calcData.maxPossiblePercent.toFixed(0)}%</Text>.
                    </Text>
                  </View>
                </View>

                <View style={{ height: 25 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── WEBKIOSK FAST-SYNC MODAL ────────────────────────────────────────── */}
      <Modal visible={syncModalVisible} transparent animationType="fade" onRequestClose={() => setSyncModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: 440, borderRadius: BORDER_RADIUS.xl }]}>
            <Text style={styles.modalCourseName}>Portal Sync Options</Text>
            <Text style={styles.modalOverline}>Update current counts for {selectedSubject}</Text>

            <TouchableOpacity
              style={styles.btnLaunchLynx}
              onPress={() => {
                setSyncModalVisible(false);
                setCampusLynxModalVisible(true);
              }}
            >
              <MaterialCommunityIcons name="cloud-sync" size={18} color="#000" style={{ marginRight: 6 }} />
              <Text style={styles.btnLaunchLynxText}>⚡ Auto-Sync from CampusLynx Live</Text>
            </TouchableOpacity>

            <Text style={styles.orDividerText}>— OR ENTER MANUALLY —</Text>

            <View style={{ marginVertical: SPACING.xs }}>
              <Text style={styles.inputFieldLabel}>Classes Attended</Text>
              <TextInput
                style={styles.fieldInput}
                keyboardType="numeric"
                value={syncAttended}
                onChangeText={setSyncAttended}
                placeholder="e.g. 14"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={[styles.inputFieldLabel, { marginTop: 8 }]}>Total Classes Conducted</Text>
              <TextInput
                style={styles.fieldInput}
                keyboardType="numeric"
                value={syncTotal}
                onChangeText={setSyncTotal}
                placeholder="e.g. 18"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <ModernButton
              title="Save Attendance"
              onPress={handleSaveWebkioskSync}
              style={{ marginTop: 6 }}
            />
            <TouchableOpacity onPress={() => setSyncModalVisible(false)} style={styles.cancelLink}>
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── CAMPUSLYNX LIVE AUTO-SYNC MODAL ────────────────────────────────────── */}
      <CampusLynxSyncModal
        visible={campusLynxModalVisible}
        onClose={() => setCampusLynxModalVisible(false)}
        userUid={auth.currentUser?.uid}
        onSyncComplete={async (records) => {
          await syncCampusLynxData(records);
        }}
      />

      {/* ─── BATCH SELECTION MODAL ──────────────────────────────────────────────── */}
      <Modal
        visible={batchModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBatchModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: 520, borderRadius: BORDER_RADIUS.xl }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalCourseName}>Select Your College Batch</Text>
                <Text style={styles.modalOverline}>Filters your exact timetable, theory & 2-hr lab courses</Text>
              </View>
              <TouchableOpacity onPress={() => setBatchModalVisible(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {BATCH_GROUP_INFO && Object.entries(BATCH_GROUP_INFO).map(([groupKey, info]) => (
                <View key={groupKey} style={styles.batchGroupSection}>
                  <View style={styles.batchGroupTitleRow}>
                    <Text style={styles.batchGroupTitle}>{info.title}</Text>
                    <View style={[styles.batchGroupBadge, { borderColor: info.badgeColor }]}>
                      <Text style={[styles.batchGroupBadgeText, { color: info.badgeColor }]}>{info.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.batchGroupDesc}>{info.desc}</Text>

                  <View style={styles.batchGrid}>
                    {info.batches.map(batchCode => {
                      const isSelected = (userBatch === batchCode);
                      return (
                        <TouchableOpacity
                          key={batchCode}
                          activeOpacity={0.8}
                          style={[styles.batchCard, isSelected && styles.batchCardActive]}
                          onPress={async () => {
                            await switchBatch(batchCode);
                            setBatchModalVisible(false);
                          }}
                        >
                          <Text style={[styles.batchCardText, isSelected && styles.batchCardTextActive]}>
                            {batchCode}
                          </Text>
                          {isSelected && (
                            <MaterialCommunityIcons name="check-circle" size={14} color="#00D2FF" style={{ marginLeft: 4 }} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07070F',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 65,
    paddingBottom: 40,
  },

  // Header
  header: {
    marginBottom: SPACING.lg,
  },
  collegeBadge: {
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.2)',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  collegeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D2FF',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },

  // Overall Card
  overallCard: {
    backgroundColor: '#0F0F1E',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  overallTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overallOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
  },
  overallValue: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  statPillsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statPillNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
  },
  statPillLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  overallRuleNote: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  // Empty Card
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: '#0F0F1E',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },

  // Course Card
  courseCard: {
    backgroundColor: '#0F0F1E',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  courseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  courseName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  bunkLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  percentBadge: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  percentBadgeText: {
    fontSize: 13,
    fontWeight: '900',
  },
  courseStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  classDetailText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  courseActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  syncBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  calcTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  calcTriggerText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // Modal Sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0F0F1E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.xl,
    maxHeight: '86%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  modalCourseName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  modalOverline: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },

  modalTypeBannerLab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
    borderRadius: BORDER_RADIUS.sm,
    padding: 10,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
  },
  modalTypeBannerLabText: {
    flex: 1,
    fontSize: 11,
    color: '#D1F2FE',
    lineHeight: 16,
  },
  modalTypeBannerTheory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    borderRadius: BORDER_RADIUS.sm,
    padding: 10,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.25)',
  },
  modalTypeBannerTheoryText: {
    flex: 1,
    fontSize: 11,
    color: '#E0DEFF',
    lineHeight: 16,
  },

  summaryBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNum: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFF',
  },
  summaryTxt: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  calcHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  targetPill: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  targetPillActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  targetPillText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  targetPillTextActive: {
    color: '#000',
    fontWeight: '900',
  },

  outcomeCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  outcomeSafe: {
    backgroundColor: 'rgba(46, 204, 113, 0.08)',
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  outcomeCritical: {
    backgroundColor: 'rgba(231, 76, 60, 0.08)',
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  outcomeTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2ECC71',
    marginBottom: 3,
  },
  outcomeBody: {
    fontSize: 12,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },

  simCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  simNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  simButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  simStepBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  simStepBtnActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderColor: COLORS.primary,
  },
  simStepText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  simStepTextActive: {
    color: '#FFF',
  },
  simResultLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simResultTitle: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  simResultNum: {
    fontSize: 18,
    fontWeight: '900',
  },
  simWarning: {
    fontSize: 10,
    color: '#E74C3C',
    fontWeight: '700',
    marginTop: 6,
  },

  projCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 210, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.15)',
  },
  projTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00D2FF',
    marginBottom: 2,
  },
  projBody: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },

  inputFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  fieldInput: {
    backgroundColor: '#080814',
    borderRadius: BORDER_RADIUS.sm,
    padding: 11,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelLink: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelLinkText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },

  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  batchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  batchPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  syncCampusLynxMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    borderWidth: 1,
    borderColor: '#2ECC71',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  syncCampusLynxMainText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2ECC71',
  },

  // LTP Breakdown Chips
  ltpChipsRow: {
    flexDirection: 'row',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  ltpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ltpChipLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginRight: 3,
  },
  ltpChipVal: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00D2FF',
  },
  ltpChipFraction: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 2,
  },

  // Summary Bar LTP
  summaryBarLTP: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  summaryColLTP: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumLTP: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
  },
  summaryTxtLTP: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },

  // Simulator Toggle
  simTypeToggleRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  simTypeBtn: {
    flex: 1,
    paddingVertical: 5,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  simTypeBtnActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.25)',
    borderColor: COLORS.primary,
  },
  simTypeBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  simTypeBtnTextActive: {
    color: '#FFF',
    fontWeight: '800',
  },
  simResultSubTitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  simResultSubNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },

  // Launch Lynx in Fast-sync modal
  btnLaunchLynx: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ECC71',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 10,
    marginTop: 10,
  },
  btnLaunchLynxText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
  },
  orDividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: 10,
    letterSpacing: 0.8,
  },

  // Batch Selection in Planner
  batchGroupSection: {
    marginBottom: SPACING.md,
  },
  batchGroupTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  batchGroupTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  batchGroupBadge: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.pill,
    paddingVertical: 1,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  batchGroupBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  batchGroupDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  batchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  batchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131322',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  batchCardActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    borderColor: '#00D2FF',
  },
  batchCardText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  batchCardTextActive: {
    color: '#00D2FF',
  },
});
