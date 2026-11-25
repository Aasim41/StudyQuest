import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import {
  EXAM_TARGETS,
  getCuratedSubjectsForExam,
  getCuratedPredictorQuestionsForExam,
  resolveStreamForExam,
} from '../config/studyGuideData';
import MarkingSimulatorModal from '../components/MarkingSimulatorModal';
import { gsapTabTransition } from '../utils/gsapAnim';

export default function PredictorScreen() {
  const navigation = useNavigation();
  const { targetExam, targetStream } = useUser();

  const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'filters'
  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [simulatorItem, setSimulatorItem] = useState(null);
  const tabAnim = useRef(new Animated.Value(1)).current;

  const streamObj = useMemo(() => resolveStreamForExam(targetExam, targetStream), [targetExam, targetStream]);

  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  const examSubjects = useMemo(() => {
    return ['All', ...getCuratedSubjectsForExam(targetExam, targetStream)];
  }, [targetExam, targetStream]);

  const allQuestions = useMemo(() => {
    return getCuratedPredictorQuestionsForExam(targetExam, targetStream) || [];
  }, [targetExam, targetStream]);

  useEffect(() => {
    setSelectedSubject('All');
    setSelectedTier('All');
  }, [targetExam, targetStream]);

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    gsapTabTransition(tabAnim);
    setActiveTab(tab);
  };

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const tierMatch =
        selectedTier === 'All' ||
        (selectedTier === 'Guaranteed' && q.probability >= 85) ||
        (selectedTier === 'High Recurrence' && q.probability >= 70 && q.probability < 85) ||
        (selectedTier === 'Frequent Trap' && q.probability < 70);

      const subjMatch = selectedSubject === 'All' || q.subject === selectedSubject;
      return tierMatch && subjMatch;
    });
  }, [allQuestions, selectedTier, selectedSubject]);

  const subjectSummary = useMemo(() => {
    const map = {};
    allQuestions.forEach((q) => {
      if (!map[q.subject]) map[q.subject] = { count: 0, maxProb: 0 };
      map[q.subject].count += 1;
      if (q.probability > map[q.subject].maxProb) map[q.subject].maxProb = q.probability;
    });
    return Object.entries(map).map(([subject, info]) => ({ subject, ...info }));
  }, [allQuestions]);

  const handleAudit = (item) => {
    navigation.navigate('AIGapAuditor', {
      initialTopic: item.topic,
      initialSubject: item.subject,
      mode: 'TOPIC',
      autoAudit: true,
    });
  };

  const handleWatchLecture = (item) => {
    navigation.navigate('Flow', {
      searchQuery: item.topic,
      initialSubject: item.subject,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C12" />

      {/* Minimal Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>PYQ Radar</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {streamObj ? `${activeExamLabel} • ${streamObj.shortLabel}` : activeExamLabel}
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filteredQuestions.length} Qs</Text>
          </View>
        </View>

        {/* 2-Card Segmented Tabs */}
        <View style={styles.cardTabsRow}>
          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'radar' && styles.cardTabActive]}
            onPress={() => switchTab('radar')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="radar"
              size={14}
              color={activeTab === 'radar' ? '#00E5FF' : '#777799'}
            />
            <Text style={[styles.cardTabText, activeTab === 'radar' && styles.cardTabTextActive]}>
              High-Yield Questions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'filters' && styles.cardTabActive]}
            onPress={() => switchTab('filters')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="tune-variant"
              size={14}
              color={activeTab === 'filters' ? '#00E5FF' : '#777799'}
            />
            <Text style={[styles.cardTabText, activeTab === 'filters' && styles.cardTabTextActive]}>
              Breakdown & Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: tabAnim }}
      >
        {activeTab === 'radar' && (
          <View style={styles.tabSection}>
            {/* Inline Subject Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {examSubjects.map((sub) => {
                const active = selectedSubject === sub;
                return (
                  <TouchableOpacity
                    key={sub}
                    style={[styles.subChip, active && styles.subChipActive]}
                    onPress={() => setSelectedSubject(sub)}
                  >
                    <Text style={[styles.subChipText, active && styles.subChipTextActive]}>
                      {sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Predicted High-Yield Question Cards */}
            <View style={styles.questionsList}>
              {filteredQuestions.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No predicted questions match current filter.</Text>
                </View>
              ) : (
                filteredQuestions.map((item) => {
                  const isHigh = item.probability >= 85;
                  return (
                    <View key={item.id} style={styles.card}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.subjectPill}>
                          <Text style={styles.subjectPillText}>{item.subject}</Text>
                        </View>
                        <View
                          style={[
                            styles.probBadge,
                            { borderColor: isHigh ? '#00E5A3' : '#FFB800' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.probBadgeText,
                              { color: isHigh ? '#00E5A3' : '#FFB800' },
                            ]}
                          >
                            {item.probability}% Likely
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.cardTopic}>{item.topic}</Text>
                      <Text style={styles.cardMarks}>
                        {item.marks} Marks • {item.pastFrequency}
                      </Text>

                      <View style={styles.trapBox}>
                        <Text style={styles.trapHeading}>BLINDSPOT TRAP</Text>
                        <Text style={styles.trapBody}>{item.trapSummary}</Text>
                      </View>

                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={styles.simulateBtn}
                          onPress={() => setSimulatorItem(item)}
                          activeOpacity={0.85}
                        >
                          <MaterialCommunityIcons
                            name="calculator-variant-outline"
                            size={14}
                            color="#00E5FF"
                          />
                          <Text style={styles.simulateBtnText}>Rubric</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.flowBtn}
                          onPress={() => handleWatchLecture(item)}
                          activeOpacity={0.85}
                        >
                          <MaterialCommunityIcons name="play-circle-outline" size={14} color="#FFFFFF" />
                          <Text style={styles.flowBtnText}>Lecture</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.auditBtn}
                          onPress={() => handleAudit(item)}
                          activeOpacity={0.85}
                        >
                          <MaterialCommunityIcons name="shield-search" size={14} color="#0B0C12" />
                          <Text style={styles.auditBtnText}>Audit</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}

        {activeTab === 'filters' && (
          <View style={styles.tabSection}>
            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>Probability Tier Filter</Text>
              <View style={styles.tierGrid}>
                {['All', 'Guaranteed', 'High Recurrence', 'Frequent Trap'].map((tier) => {
                  const active = selectedTier === tier;
                  return (
                    <TouchableOpacity
                      key={tier}
                      style={[styles.tierBtn, active && styles.tierBtnActive]}
                      onPress={() => {
                        setSelectedTier(tier);
                        switchTab('radar');
                      }}
                    >
                      <Text style={[styles.tierBtnText, active && styles.tierBtnTextActive]}>
                        {tier}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>Subject Radar Density</Text>
              {subjectSummary.map((row) => (
                <TouchableOpacity
                  key={row.subject}
                  style={styles.densityRow}
                  onPress={() => {
                    setSelectedSubject(row.subject);
                    switchTab('radar');
                  }}
                >
                  <Text style={styles.densitySub}>{row.subject}</Text>
                  <Text style={styles.densityMeta}>
                    {row.count} Qs • Peak {row.maxProb}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 90 }} />
      </Animated.ScrollView>

      {simulatorItem && (
        <MarkingSimulatorModal
          visible={!!simulatorItem}
          onClose={() => setSimulatorItem(null)}
          topicTitle={simulatorItem.topic}
          subject={simulatorItem.subject}
          targetExam={activeExamLabel}
          questionData={simulatorItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C12' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: '#12141F',
    borderBottomWidth: 1,
    borderBottomColor: '#222436',
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#222436',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  headerSub: { color: '#777799', fontSize: 11, fontWeight: '600', marginTop: 1 },
  countBadge: {
    backgroundColor: '#00E5FF14',
    borderWidth: 1,
    borderColor: '#00E5FF44',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  countBadgeText: { color: '#00E5FF', fontSize: 11, fontWeight: '800' },

  cardTabsRow: { flexDirection: 'row', gap: 10 },
  cardTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#222436',
  },
  cardTabActive: { backgroundColor: '#181B29', borderColor: '#00E5FF' },
  cardTabText: { color: '#777799', fontSize: 12, fontWeight: '700' },
  cardTabTextActive: { color: '#00E5FF', fontWeight: '800' },

  scrollContent: { padding: 18 },
  tabSection: { gap: 12 },
  filterScroll: { gap: 8, paddingVertical: 2 },
  subChip: {
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  subChipActive: { backgroundColor: '#00E5FF', borderColor: '#00E5FF' },
  subChipText: { color: '#8E8EA8', fontSize: 12, fontWeight: '700' },
  subChipTextActive: { color: '#0B0C12', fontWeight: '800' },

  questionsList: { gap: 12 },
  card: {
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subjectPill: {
    backgroundColor: '#00E5FF14',
    borderWidth: 1,
    borderColor: '#00E5FF44',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectPillText: { color: '#00E5FF', fontSize: 10, fontWeight: '800' },
  probBadge: {
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  probBadgeText: { fontSize: 10, fontWeight: '800' },
  cardTopic: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', lineHeight: 20 },
  cardMarks: { color: '#8E8EA8', fontSize: 11, fontWeight: '600', marginTop: 4, marginBottom: 10 },
  trapBox: {
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 3,
  },
  trapHeading: { color: '#FFB800', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  trapBody: { color: '#D0D2E2', fontSize: 12, lineHeight: 17 },

  actionsRow: { flexDirection: 'row', gap: 8 },
  simulateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#222436',
    paddingVertical: 9,
    borderRadius: 8,
  },
  simulateBtnText: { color: '#00E5FF', fontSize: 12, fontWeight: '700' },
  flowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#222436',
    paddingVertical: 9,
    borderRadius: 8,
  },
  flowBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  auditBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#00E5FF',
    paddingVertical: 9,
    borderRadius: 8,
  },
  auditBtnText: { color: '#0B0C12', fontSize: 12, fontWeight: '800' },

  panelCard: {
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  panelTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  tierGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tierBtn: {
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#222436',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tierBtnActive: { backgroundColor: '#00E5FF', borderColor: '#00E5FF' },
  tierBtnText: { color: '#8E8EA8', fontSize: 12, fontWeight: '700' },
  tierBtnTextActive: { color: '#0B0C12', fontWeight: '800' },

  densityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#222436',
  },
  densitySub: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  densityMeta: { color: '#00E5FF', fontSize: 12, fontWeight: '700' },

  emptyBox: {
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: { color: '#8E8EA8', fontSize: 13 },
});
