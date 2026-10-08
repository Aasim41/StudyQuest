import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';

const { height } = Dimensions.get('window');

export default function SubjectDetailModal({
  visible,
  onClose,
  subjectData,
  onUpdateAttendance,
}) {
  if (!subjectData) return null;

  const {
    name = '',
    code = '',
    attended = 0,
    total = 0,
    missed = 0,
    history = [],
    isLab = false,
  } = subjectData;

  // Flexible attendance target threshold (Defaults to standard 75%, no fixed 70%)
  const [selectedTarget, setSelectedTarget] = useState(75);
  const [attendNext, setAttendNext] = useState(0);
  const [leaveNext, setLeaveNext] = useState(0);
  const [historyFilter, setHistoryFilter] = useState('ALL'); // 'ALL' | 'ABSENT' | 'PRESENT'

  // Current attendance percentage
  const currentPercent = total > 0 ? (attended / total) * 100 : 0;

  // Forecasted values
  const projectedAttended = attended + attendNext;
  const projectedTotal = total + attendNext + leaveNext;
  const projectedPercent = projectedTotal > 0 ? (projectedAttended / projectedTotal) * 100 : currentPercent;

  // Calculate bunk capacity or classes needed for target
  const getBunkStatus = (att, tot, target) => {
    if (tot === 0) return { canBunk: true, text: 'No classes yet', count: 0 };
    const pct = (att / tot) * 100;
    if (pct >= target) {
      // Safe bunks calculation: Math.floor((100 * att - target * tot) / target)
      const safe = Math.floor((100 * att - target * tot) / target);
      return {
        canBunk: true,
        text: safe > 0 ? `Can bunk ${safe} ${safe === 1 ? 'class' : 'classes'} safely` : `At ${target}% threshold`,
        count: safe,
      };
    } else {
      // Classes needed: Math.ceil((target * tot - 100 * att) / (100 - target))
      const need = Math.ceil((target * tot - 100 * att) / (100 - target));
      return {
        canBunk: false,
        text: `Must attend next ${need} ${need === 1 ? 'class' : 'classes'}`,
        count: need,
      };
    }
  };

  const currentBunkStatus = useMemo(
    () => getBunkStatus(attended, total, selectedTarget),
    [attended, total, selectedTarget]
  );

  const projectedBunkStatus = useMemo(
    () => getBunkStatus(projectedAttended, projectedTotal, selectedTarget),
    [projectedAttended, projectedTotal, selectedTarget]
  );

  // Individual forecasts for Card 1 & Card 2
  const attendOnlyPercent = (total + attendNext) > 0 ? ((attended + attendNext) / (total + attendNext)) * 100 : currentPercent;
  const leaveOnlyPercent = (total + leaveNext) > 0 ? (attended / (total + leaveNext)) * 100 : currentPercent;

  // Filtered history list
  const historyList = useMemo(() => {
    if (!history || !Array.isArray(history) || history.length === 0) {
      const list = [];
      const now = new Date();
      for (let i = 0; i < total; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - (total - i) * 2);
        const dayNum = d.getDate();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const isPres = i < attended;
        list.unshift({
          id: `hist-${i}`,
          date: `${dayNum} ${monthNames[d.getMonth()]}`,
          time: i % 2 === 0 ? '2:00 PM' : '4:00 PM',
          slot: isLab ? 'P' : 'L',
          status: isPres ? 'present' : 'absent',
        });
      }
      return list;
    }
    return history;
  }, [history, total, attended, isLab]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'ABSENT') {
      return historyList.filter((item) => item.status === 'absent');
    }
    if (historyFilter === 'PRESENT') {
      return historyList.filter((item) => item.status === 'present');
    }
    return historyList;
  }, [historyList, historyFilter]);

  const presentCount = historyList.filter((h) => h.status === 'present').length;
  const absentCount = historyList.filter((h) => h.status === 'absent').length;

  const hasSimulations = attendNext > 0 || leaveNext > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Sheet Handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.subjectTitle} numberOfLines={1}>
                {name}
              </Text>
              <View style={styles.headerSubRow}>
                {code ? <Text style={styles.subjectCodeText}>{code}</Text> : null}
                <View style={styles.subDot} />
                <Text style={styles.subjectTypeTag}>{isLab ? 'Practical / Lab' : 'Theory Course'}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              activeOpacity={0.8}
              onPress={onClose}
            >
              <MaterialCommunityIcons name="close" size={20} color="#D1D0D8" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ─── HERO ATTENDANCE CARD ────────────────────────────────────── */}
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View>
                  <Text style={styles.heroLabel}>CURRENT ATTENDANCE</Text>
                  <Text style={[styles.heroPercent, { color: currentPercent >= selectedTarget ? '#38D39F' : '#E5A93C' }]}>
                    {total > 0 ? `${currentPercent.toFixed(1)}%` : '--'}
                  </Text>
                </View>

                <View style={styles.classesBox}>
                  <Text style={styles.classesNum}>{attended} <Text style={styles.classesTotal}>/ {total}</Text></Text>
                  <Text style={styles.classesSub}>Classes Attended</Text>
                  {missed > 0 && (
                    <Text style={styles.missedSub}>{missed} missed</Text>
                  )}
                </View>
              </View>

              {/* Threshold Target Selector */}
              <View style={styles.targetSection}>
                <View style={styles.targetHeaderRow}>
                  <Text style={styles.targetLabel}>Target Threshold:</Text>
                  <View style={styles.targetPillsContainer}>
                    {[75, 80, 85].map((tgt) => {
                      const isSelected = selectedTarget === tgt;
                      return (
                        <TouchableOpacity
                          key={tgt}
                          style={[
                            styles.targetPill,
                            isSelected && styles.targetPillActive,
                          ]}
                          activeOpacity={0.8}
                          onPress={() => setSelectedTarget(tgt)}
                        >
                          <Text
                            style={[
                              styles.targetPillText,
                              isSelected && styles.targetPillTextActive,
                            ]}
                          >
                            {tgt}%
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Status Margin Badge */}
                <View
                  style={[
                    styles.bunkStatusBadge,
                    currentBunkStatus.canBunk ? styles.bunkBadgeSafe : styles.bunkBadgeRisk,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={currentBunkStatus.canBunk ? 'check-circle' : 'alert-circle'}
                    size={15}
                    color={currentBunkStatus.canBunk ? '#38D39F' : '#FF5C5C'}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.bunkStatusText,
                      { color: currentBunkStatus.canBunk ? '#38D39F' : '#FF5C5C' },
                    ]}
                  >
                    {currentBunkStatus.text}
                  </Text>
                </View>
              </View>
            </View>

            {/* ─── FORECAST CARDS (ATTEND & LEAVE SEPARATE) ────────────────── */}
            <View style={styles.forecastSectionHeader}>
              <Text style={styles.forecastSectionTitle}>Attendance Forecast</Text>
              {hasSimulations && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setAttendNext(0);
                    setLeaveNext(0);
                  }}
                >
                  <Text style={styles.resetBtnText}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* CARD 1: FORECAST ATTENDING CLASS */}
            <View style={styles.forecastCardAttend}>
              <View style={styles.forecastCardTop}>
                <View style={styles.forecastIconBoxAttend}>
                  <MaterialCommunityIcons name="calendar-check" size={22} color="#38D39F" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.forecastCardTitle}>Attend Upcoming Classes</Text>
                  <Text style={styles.forecastCardSub}>Simulate attending next sessions</Text>
                </View>

                {/* Plus / Minus Stepper */}
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={[styles.stepperBtn, attendNext === 0 && styles.stepperBtnDisabled]}
                    activeOpacity={0.7}
                    disabled={attendNext === 0}
                    onPress={() => setAttendNext(Math.max(0, attendNext - 1))}
                  >
                    <MaterialCommunityIcons name="minus" size={16} color={attendNext === 0 ? '#4E4D5E' : '#FFF'} />
                  </TouchableOpacity>

                  <View style={styles.stepperValueBox}>
                    <Text style={styles.stepperValueText}>+{attendNext}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.stepperBtn, styles.stepperBtnAttend]}
                    activeOpacity={0.7}
                    onPress={() => setAttendNext(attendNext + 1)}
                  >
                    <MaterialCommunityIcons name="plus" size={16} color="#38D39F" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dynamic Attend Forecast Outcome */}
              <View style={styles.forecastOutcomeRow}>
                <MaterialCommunityIcons name="trending-up" size={16} color="#38D39F" style={{ marginRight: 6 }} />
                <Text style={styles.outcomeText}>
                  {attendNext > 0 ? (
                    <>
                      Attending {attendNext} more:{' '}
                      <Text style={styles.outcomeHighlightAttend}>
                        {attendOnlyPercent.toFixed(1)}%
                      </Text>{' '}
                      <Text style={styles.deltaText}>(+{((attendOnlyPercent - currentPercent)).toFixed(1)}%)</Text>
                    </>
                  ) : (
                    'Tap + to see your percentage boost'
                  )}
                </Text>
              </View>
            </View>

            {/* CARD 2: FORECAST LEAVING / BUNKING CLASS */}
            <View style={styles.forecastCardLeave}>
              <View style={styles.forecastCardTop}>
                <View style={styles.forecastIconBoxLeave}>
                  <MaterialCommunityIcons name="umbrella-beach" size={22} color="#FF7675" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.forecastCardTitle}>Leave / Bunk Classes</Text>
                  <Text style={styles.forecastCardSub}>Simulate missing next sessions</Text>
                </View>

                {/* Plus / Minus Stepper */}
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={[styles.stepperBtn, leaveNext === 0 && styles.stepperBtnDisabled]}
                    activeOpacity={0.7}
                    disabled={leaveNext === 0}
                    onPress={() => setLeaveNext(Math.max(0, leaveNext - 1))}
                  >
                    <MaterialCommunityIcons name="minus" size={16} color={leaveNext === 0 ? '#4E4D5E' : '#FFF'} />
                  </TouchableOpacity>

                  <View style={styles.stepperValueBox}>
                    <Text style={[styles.stepperValueText, { color: '#FF7675' }]}>-{leaveNext}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.stepperBtn, styles.stepperBtnLeave]}
                    activeOpacity={0.7}
                    onPress={() => setLeaveNext(leaveNext + 1)}
                  >
                    <MaterialCommunityIcons name="plus" size={16} color="#FF7675" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dynamic Leave Forecast Outcome */}
              <View style={styles.forecastOutcomeRow}>
                <MaterialCommunityIcons name="trending-down" size={16} color="#FF7675" style={{ marginRight: 6 }} />
                <Text style={styles.outcomeText}>
                  {leaveNext > 0 ? (
                    <>
                      Missing {leaveNext} more:{' '}
                      <Text style={styles.outcomeHighlightLeave}>
                        {leaveOnlyPercent.toFixed(1)}%
                      </Text>{' '}
                      <Text style={styles.deltaTextNegative}>({((leaveOnlyPercent - currentPercent)).toFixed(1)}%)</Text>
                      {' • '}
                      <Text style={leaveOnlyPercent >= selectedTarget ? styles.safeText : styles.dangerText}>
                        {leaveOnlyPercent >= selectedTarget ? 'Safe' : `Below ${selectedTarget}%`}
                      </Text>
                    </>
                  ) : (
                    'Tap + to test your safe bunk limit'
                  )}
                </Text>
              </View>
            </View>

            {/* COMBINED SIMULATION SUMMARY (If active) */}
            {hasSimulations && (
              <View style={styles.combinedSummaryCard}>
                <View style={styles.summaryTopRow}>
                  <Text style={styles.summaryTitle}>Combined Projection</Text>
                  <Text style={[styles.summaryPercent, { color: projectedPercent >= selectedTarget ? '#38D39F' : '#FF5C5C' }]}>
                    {projectedPercent.toFixed(1)}%
                  </Text>
                </View>
                <Text style={styles.summarySub}>
                  {projectedAttended} of {projectedTotal} total classes • {projectedBunkStatus.text}
                </Text>
              </View>
            )}

            {/* ─── CLASS HISTORY LIST ──────────────────────────────────────── */}
            <View style={styles.historySectionHeader}>
              <Text style={styles.historySectionTitle}>Class History</Text>
              <View style={styles.historyTabsRow}>
                <TouchableOpacity
                  style={[styles.historyTab, historyFilter === 'ALL' && styles.historyTabActive]}
                  onPress={() => setHistoryFilter('ALL')}
                >
                  <Text style={[styles.historyTabText, historyFilter === 'ALL' && styles.historyTabTextActive]}>
                    All ({historyList.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.historyTab, historyFilter === 'ABSENT' && styles.historyTabActive]}
                  onPress={() => setHistoryFilter('ABSENT')}
                >
                  <Text style={[styles.historyTabText, historyFilter === 'ABSENT' && styles.historyTabTextActive]}>
                    Absent ({absentCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.historyTab, historyFilter === 'PRESENT' && styles.historyTabActive]}
                  onPress={() => setHistoryFilter('PRESENT')}
                >
                  <Text style={[styles.historyTabText, historyFilter === 'PRESENT' && styles.historyTabTextActive]}>
                    Present ({presentCount})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Chronological History Cards */}
            <View style={styles.historyListContainer}>
              {filteredHistory.map((item, idx) => {
                const isPresent = item.status === 'present';
                return (
                  <View
                    key={item.id || idx}
                    style={[
                      styles.historyItemCard,
                      !isPresent && styles.historyItemCardAbsent,
                    ]}
                  >
                    <View style={styles.historyItemLeft}>
                      <View style={[styles.slotBadge, isPresent ? styles.slotBadgePresent : styles.slotBadgeAbsent]}>
                        <Text style={[styles.slotBadgeText, isPresent ? styles.slotTextPresent : styles.slotTextAbsent]}>
                          {item.slot === 'P' ? 'LAB' : item.slot === 'T' ? 'TUT' : 'LEC'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.historyItemDate}>{item.date}</Text>
                        <Text style={styles.historyItemTime}>{item.time || '10:00 AM'}</Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        isPresent ? styles.statusPillPresent : styles.statusPillAbsent,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: isPresent ? '#38D39F' : '#FF5C5C' },
                        ]}
                      >
                        {isPresent ? 'Present' : 'Absent'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#08080C',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.92,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  subjectTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  subjectCodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A29BFE',
  },
  subDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#5A5868',
    marginHorizontal: 8,
  },
  subjectTypeTag: {
    fontSize: 12,
    color: '#8E8D9A',
    fontWeight: '500',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#12121A',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#8E8D9A',
    marginBottom: 4,
  },
  heroPercent: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  classesBox: {
    alignItems: 'flex-end',
    backgroundColor: '#191824',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  classesNum: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
  },
  classesTotal: {
    fontSize: 13,
    color: '#8E8D9A',
    fontWeight: '600',
  },
  classesSub: {
    fontSize: 11,
    color: '#8E8D9A',
    marginTop: 2,
  },
  missedSub: {
    fontSize: 10,
    color: '#FF7675',
    fontWeight: '700',
    marginTop: 2,
  },

  // Target Section
  targetSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 14,
  },
  targetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D1D0D8',
  },
  targetPillsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  targetPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  targetPillActive: {
    backgroundColor: '#C5BBED',
  },
  targetPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8D9A',
  },
  targetPillTextActive: {
    color: '#08080C',
    fontWeight: '900',
  },
  bunkStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bunkBadgeSafe: {
    backgroundColor: 'rgba(56, 211, 159, 0.12)',
  },
  bunkBadgeRisk: {
    backgroundColor: 'rgba(255, 92, 92, 0.12)',
  },
  bunkStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Forecast Header
  forecastSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  forecastSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D1D0D8',
    letterSpacing: 0.2,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A29BFE',
  },

  // Card 1: Attend
  forecastCardAttend: {
    backgroundColor: '#0F1612',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 211, 159, 0.22)',
  },
  forecastCardLeave: {
    backgroundColor: '#170E12',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 118, 117, 0.22)',
  },
  forecastCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  forecastIconBoxAttend: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(56, 211, 159, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forecastIconBoxLeave: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 118, 117, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forecastCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  forecastCardSub: {
    fontSize: 11,
    color: '#8E8D9A',
    marginTop: 1,
  },

  // Steppers
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 3,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperBtnAttend: {
    backgroundColor: 'rgba(56, 211, 159, 0.2)',
  },
  stepperBtnLeave: {
    backgroundColor: 'rgba(255, 118, 117, 0.2)',
  },
  stepperValueBox: {
    paddingHorizontal: 8,
  },
  stepperValueText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38D39F',
  },

  // Forecast outcome
  forecastOutcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
  },
  outcomeText: {
    fontSize: 12,
    color: '#B5B4C2',
    fontWeight: '500',
  },
  outcomeHighlightAttend: {
    fontWeight: '800',
    color: '#38D39F',
  },
  outcomeHighlightLeave: {
    fontWeight: '800',
    color: '#FF7675',
  },
  deltaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38D39F',
  },
  deltaTextNegative: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF7675',
  },
  safeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38D39F',
  },
  dangerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF5C5C',
  },

  // Combined Summary Card
  combinedSummaryCard: {
    backgroundColor: '#161522',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C5BBED',
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  summaryPercent: {
    fontSize: 16,
    fontWeight: '900',
  },
  summarySub: {
    fontSize: 11,
    color: '#8E8D9A',
    marginTop: 3,
  },

  // History Section
  historySectionHeader: {
    marginTop: 6,
    marginBottom: 10,
  },
  historySectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D1D0D8',
    marginBottom: 8,
  },
  historyTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  historyTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyTabActive: {
    backgroundColor: '#C5BBED',
  },
  historyTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8D9A',
  },
  historyTabTextActive: {
    color: '#08080C',
    fontWeight: '900',
  },

  // History List Items
  historyListContainer: {
    gap: 8,
  },
  historyItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#12121A',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  historyItemCardAbsent: {
    borderColor: 'rgba(255, 92, 92, 0.15)',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slotBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBadgePresent: {
    backgroundColor: 'rgba(56, 211, 159, 0.14)',
  },
  slotBadgeAbsent: {
    backgroundColor: 'rgba(255, 92, 92, 0.14)',
  },
  slotBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  slotTextPresent: {
    color: '#38D39F',
  },
  slotTextAbsent: {
    color: '#FF5C5C',
  },
  historyItemDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  historyItemTime: {
    fontSize: 11,
    color: '#8E8D9A',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillPresent: {
    backgroundColor: 'rgba(56, 211, 159, 0.14)',
  },
  statusPillAbsent: {
    backgroundColor: 'rgba(255, 92, 92, 0.14)',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
