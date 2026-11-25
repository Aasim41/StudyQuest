import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import {
  EXAM_TARGETS,
  EXAM_CATEGORIES,
  getExamMeta,
  getStreamsForExam,
  resolveStreamForExam,
  getSubjectsForExamAndStream,
  getCuratedSubjectsForExam,
  getCuratedVaultQuestionsForExam,
} from '../config/studyGuideData';
import { gsapTabTransition } from '../utils/gsapAnim';

export default function ExamTargetsScreen() {
  const navigation = useNavigation();
  const {
    targetExam,
    targetStream,
    targetSubject,
    setTargetExam,
    setTargetStream,
    setTargetSubject,
    markGapMastered,
    awardCustomXp,
  } = useUser();

  // 3 Card Tabs: 'exams' | 'pattern' | 'vault'
  const [activeTab, setActiveTab] = useState('exams');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const selectedSubject = targetSubject || 'All';
  const [customExamInput, setCustomExamInput] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [masteredItems, setMasteredItems] = useState({});

  const tabAnim = useRef(new Animated.Value(1)).current;

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    gsapTabTransition(tabAnim);
    setActiveTab(tab);
  };

  const activeExamObj = useMemo(() => {
    return (
      EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam) || {
        id: 'CUSTOM',
        label: targetExam || 'Custom Target',
        category: 'COMPETITIVE',
        weightage: 'Custom Scheme',
        markingScheme: 'Standard examiner step-marking with SI unit validation.',
      }
    );
  }, [targetExam]);

  const examMeta = useMemo(() => getExamMeta(targetExam), [targetExam]);
  const streams = useMemo(() => getStreamsForExam(targetExam), [targetExam]);
  const activeStreamObj = useMemo(() => resolveStreamForExam(targetExam, targetStream), [targetExam, targetStream]);
  const streamSubjects = useMemo(() => getSubjectsForExamAndStream(targetExam, targetStream), [targetExam, targetStream]);

  const filteredExams = useMemo(() => {
    if (categoryFilter === 'ALL') return EXAM_TARGETS;
    return EXAM_TARGETS.filter((e) => e.category === categoryFilter);
  }, [categoryFilter]);

  const examSubjectNames = useMemo(() => {
    return ['All', ...getCuratedSubjectsForExam(targetExam, targetStream)];
  }, [targetExam, targetStream]);

  const filteredQuestions = useMemo(() => {
    return getCuratedVaultQuestionsForExam(targetExam, selectedSubject, targetStream);
  }, [targetExam, selectedSubject, targetStream]);

  const handleSelectExam = async (examLabel) => {
    const newStreams = getStreamsForExam(examLabel);
    const firstStreamId = newStreams[0]?.id || 'pcm';
    await setTargetExam(examLabel, firstStreamId);
  };

  const handleApplyCustom = async () => {
    const clean = customExamInput.trim();
    if (!clean) return;
    await setTargetExam(clean);
    setCustomExamInput('');
  };

  const handleConfirmAndRedirect = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Dashboard' });
    }
  };

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMaster = (id) => {
    const isMastered = !!masteredItems[id];
    setMasteredItems((prev) => ({ ...prev, [id]: !isMastered }));
    if (!isMastered) {
      markGapMastered(id);
      awardCustomXp(25, 'Mastered High-Risk Exam Question');
    }
  };

  const handleAuditQuestion = (item) => {
    navigation.navigate('AIGapAuditor', {
      initialTopic: item.title,
      initialSubject: item.subject,
      mode: 'TOPIC',
      autoAudit: true,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C12" />

      {/* Minimal Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            {navigation.canGoBack() && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>{activeExamObj.label}</Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {activeStreamObj ? activeStreamObj.label : 'General Syllabus'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.doneChipBtn}
            onPress={handleConfirmAndRedirect}
            activeOpacity={0.85}
          >
            <Text style={styles.doneChipText}>Open Syllabus →</Text>
          </TouchableOpacity>
        </View>

        {/* 3 Card Tabs */}
        <View style={styles.cardTabsRow}>
          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'exams' && styles.cardTabActive]}
            onPress={() => switchTab('exams')}
          >
            <Text style={[styles.cardTabText, activeTab === 'exams' && styles.cardTabTextActive]}>
              Exam & Stream
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'pattern' && styles.cardTabActive]}
            onPress={() => switchTab('pattern')}
          >
            <Text style={[styles.cardTabText, activeTab === 'pattern' && styles.cardTabTextActive]}>
              Blueprint & Split
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'vault' && styles.cardTabActive]}
            onPress={() => switchTab('vault')}
          >
            <Text style={[styles.cardTabText, activeTab === 'vault' && styles.cardTabTextActive]}>
              Trap Vault ({filteredQuestions.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: tabAnim, transform: [{ scale: tabAnim }] }}
      >
        {/* ─── TAB 1: EXAM & STREAM SELECTOR ───────────────────────────── */}
        {activeTab === 'exams' && (
          <View style={styles.tabBody}>
            {/* Category Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
              {EXAM_CATEGORIES.map((cat) => {
                const active = categoryFilter === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catChip, active && styles.catChipActive]}
                    onPress={() => setCategoryFilter(cat.id)}
                  >
                    <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Stream Selection Cards (Hidden split when Class 10 / Unified Exam) */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionLabel}>
                {streams.length > 1 ? 'ACTIVE STREAM / TRACK' : 'CURRICULUM COVERAGE'}
              </Text>
              <View style={styles.streamList}>
                {streams.length > 1 ? (
                  streams.map((st) => {
                    const active = activeStreamObj?.id === st.id;
                    return (
                      <TouchableOpacity
                        key={st.id}
                        style={[styles.streamCard, active && styles.streamCardActive]}
                        onPress={() => setTargetStream(st.id)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.streamRowTop}>
                          <Text style={[styles.streamTitle, active && { color: '#00E5FF' }]}>
                            {st.label}
                          </Text>
                          {active && <MaterialCommunityIcons name="check-circle" size={16} color="#00E5FF" />}
                        </View>
                        <Text style={styles.streamDesc}>{st.desc}</Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  streams[0] && (
                    <View style={[styles.streamCard, styles.streamCardActive]}>
                      <View style={styles.streamRowTop}>
                        <Text style={[styles.streamTitle, { color: '#00E5FF' }]}>
                          {streams[0].label}
                        </Text>
                        <MaterialCommunityIcons name="check-circle" size={16} color="#00E5FF" />
                      </View>
                      <Text style={styles.streamDesc}>{streams[0].desc}</Text>
                    </View>
                  )
                )}
              </View>
            </View>

            {/* Active Subject Curate Filter */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionLabel}>CURATE FOR SUBJECT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
                {examSubjectNames.map((sub) => {
                  const active = selectedSubject === sub;
                  return (
                    <TouchableOpacity
                      key={sub}
                      style={[styles.catChip, active && styles.catChipActive]}
                      onPress={() => setTargetSubject(sub)}
                    >
                      <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                        {sub === 'All' ? 'All Subjects' : sub}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Exam Directory */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionLabel}>TARGET EXAMS ({filteredExams.length})</Text>

              <View style={styles.customExamRow}>
                <TextInput
                  style={styles.customExamInput}
                  placeholder="Custom exam (e.g. CUET, SAT, KCET)..."
                  placeholderTextColor="#666688"
                  value={customExamInput}
                  onChangeText={setCustomExamInput}
                />
                <TouchableOpacity style={styles.customApplyBtn} onPress={handleApplyCustom}>
                  <Text style={styles.customApplyText}>Apply</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.examList}>
                {filteredExams.map((ex) => {
                  const isSel = activeExamObj.label === ex.label;
                  return (
                    <TouchableOpacity
                      key={ex.id}
                      style={[styles.examCard, isSel && styles.examCardActive]}
                      onPress={() => handleSelectExam(ex.label)}
                      activeOpacity={0.85}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.examCardTitle, isSel && { color: '#00E5FF' }]}>
                          {ex.label}
                        </Text>
                        <Text style={styles.examCardSub} numberOfLines={1}>
                          {ex.weightage} • {ex.examType}
                        </Text>
                      </View>
                      {isSel ? (
                        <MaterialCommunityIcons name="check-circle" size={18} color="#00E5FF" />
                      ) : (
                        <MaterialCommunityIcons name="chevron-right" size={18} color="#555870" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ─── TAB 2: OFFICIAL PATTERN & SUBJECT WEIGHTAGES ────────────── */}
        {activeTab === 'pattern' && (
          <View style={styles.tabBody}>
            <View style={styles.metaCard}>
              <Text style={styles.sectionLabel}>EXAMINATION BODY & PATTERN</Text>
              <Text style={styles.metaTitle}>{examMeta.boardBody}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaKey}>Duration</Text>
                <Text style={styles.metaVal}>{examMeta.duration}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaKey}>Rule</Text>
                <Text style={styles.metaVal}>{examMeta.passingRule}</Text>
              </View>

              {activeExamObj.markingScheme && (
                <View style={styles.schemeBox}>
                  <Text style={styles.schemeLabel}>Evaluation Key</Text>
                  <Text style={styles.schemeText}>{activeExamObj.markingScheme}</Text>
                </View>
              )}
            </View>

            <Text style={styles.sectionLabel}>STREAM SUBJECTS & MARKS SPLIT</Text>
            <View style={styles.subjectList}>
              {streamSubjects.map((sub) => (
                <View key={sub.id} style={styles.subjectRowCard}>
                  <View style={styles.subjectRowHead}>
                    <Text style={styles.subjectName}>
                      {sub.name}{sub.code ? ` (${sub.code})` : ''}
                    </Text>
                    <Text style={styles.subjectSplit}>{sub.marksSplit}</Text>
                  </View>
                  <Text style={styles.subjectChapterCount}>
                    {(sub.chapters || []).length} Official Syllabus Units
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ─── TAB 3: HIGH-RISK BLINDSPOT VAULT ───────────────────────── */}
        {activeTab === 'vault' && (
          <View style={styles.tabBody}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
              {examSubjectNames.map((sub) => {
                const active = selectedSubject === sub;
                return (
                  <TouchableOpacity
                    key={sub}
                    style={[styles.catChip, active && styles.catChipActive]}
                    onPress={() => setTargetSubject(sub)}
                  >
                    <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                      {sub === 'All' ? 'All Subjects' : sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.vaultList}>
              {filteredQuestions.map((item) => {
                const isExpanded = !!expandedCards[item.id];
                const isMastered = !!masteredItems[item.id];

                return (
                  <View key={item.id} style={[styles.vaultCard, isMastered && styles.vaultCardDone]}>
                    <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.85}>
                      <View style={styles.vaultCardHead}>
                        <Text style={styles.vaultSubject}>{item.subject}</Text>
                        <Text style={styles.vaultMarks}>{item.marks} Marks</Text>
                      </View>
                      <Text style={styles.vaultTitle}>{item.title}</Text>
                    </TouchableOpacity>

                    <View style={styles.vaultTrapBox}>
                      <Text style={styles.vaultTrapText}>{item.trapDescription}</Text>
                    </View>

                    {isExpanded && (
                      <View style={styles.rubricList}>
                        {(item.examinerRubric || []).map((r, rIdx) => (
                          <View key={rIdx} style={styles.rubricRow}>
                            <MaterialCommunityIcons name="check-circle" size={14} color="#00E676" />
                            <Text style={styles.rubricText}>{r}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={styles.vaultActions}>
                      <TouchableOpacity
                        style={styles.vaultToggleBtn}
                        onPress={() => toggleExpand(item.id)}
                      >
                        <Text style={styles.vaultToggleText}>
                          {isExpanded ? 'Hide Rubric' : 'View Marking Key'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.vaultMasterBtn}
                        onPress={() => toggleMaster(item.id)}
                      >
                        <MaterialCommunityIcons
                          name={isMastered ? 'check-circle' : 'circle-outline'}
                          size={14}
                          color={isMastered ? '#00E676' : '#8E8EA8'}
                        />
                        <Text style={styles.vaultMasterText}>
                          {isMastered ? 'Mastered' : 'Mark Done'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.vaultAuditBtn}
                        onPress={() => handleAuditQuestion(item)}
                      >
                        <Text style={styles.vaultAuditText}>Audit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C12' },
  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#0E1018',
    borderBottomWidth: 1.5,
    borderBottomColor: '#222436',
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#161824',
    borderWidth: 1.5,
    borderColor: '#2A2D40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  headerSub: { fontSize: 11, fontWeight: '700', color: '#00E5FF', marginTop: 1 },
  doneChipBtn: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  doneChipText: { fontSize: 11, fontWeight: '900', color: '#0B0C12' },

  cardTabsRow: { flexDirection: 'row', gap: 6 },
  cardTab: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#141622',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 8,
    alignItems: 'center',
  },
  cardTabActive: { backgroundColor: '#1A1E2E', borderColor: '#00E5FF' },
  cardTabText: { fontSize: 11, fontWeight: '700', color: '#8E8EA8' },
  cardTabTextActive: { color: '#00E5FF', fontWeight: '800' },

  scrollContent: { padding: 16 },
  tabBody: { gap: 14 },
  catRow: { gap: 6 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
  },
  catChipActive: { backgroundColor: '#1A1E2E', borderColor: '#00E5FF' },
  catChipText: { fontSize: 11, fontWeight: '700', color: '#8E8EA8' },
  catChipTextActive: { color: '#00E5FF', fontWeight: '800' },

  sectionBox: { gap: 8 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#777799', letterSpacing: 0.7 },

  streamList: { gap: 8 },
  streamCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  streamCardActive: { borderColor: '#00E5FF', backgroundColor: '#171B2A' },
  streamRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streamTitle: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  streamDesc: { fontSize: 11, color: '#8E8EA8' },

  customExamRow: { flexDirection: 'row', gap: 8 },
  customExamInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#FFFFFF',
    fontSize: 12,
  },
  customApplyBtn: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
  },
  customApplyText: { fontSize: 11, fontWeight: '900', color: '#0B0C12' },

  examList: { gap: 8 },
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 10,
    padding: 12,
  },
  examCardActive: { borderColor: '#00E5FF', backgroundColor: '#171B2A' },
  examCardTitle: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  examCardSub: { fontSize: 11, color: '#777799', marginTop: 2 },

  // Pattern Tab
  metaCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  metaTitle: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
  metaRow: { gap: 2 },
  metaKey: { fontSize: 10, fontWeight: '800', color: '#00E5FF' },
  metaVal: { fontSize: 12, color: '#D0D2E0', lineHeight: 17 },
  schemeBox: {
    backgroundColor: '#181A28',
    borderLeftWidth: 3,
    borderLeftColor: '#FFB800',
    padding: 10,
    borderRadius: 6,
    gap: 3,
    marginTop: 4,
  },
  schemeLabel: { fontSize: 10, fontWeight: '800', color: '#FFB800' },
  schemeText: { fontSize: 11, color: '#D0D2E0', lineHeight: 16 },
  subjectList: { gap: 8 },
  subjectRowCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  subjectRowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  subjectName: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', flex: 1 },
  subjectSplit: { fontSize: 11, fontWeight: '700', color: '#00E676' },
  subjectChapterCount: { fontSize: 11, color: '#8E8EA8' },

  // Vault Tab
  vaultList: { gap: 10 },
  vaultCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  vaultCardDone: { opacity: 0.7, borderColor: '#1B3A2F' },
  vaultCardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  vaultSubject: { fontSize: 10, fontWeight: '800', color: '#00E5FF' },
  vaultMarks: { fontSize: 10, fontWeight: '800', color: '#FFB800' },
  vaultTitle: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', lineHeight: 18 },
  vaultTrapBox: {
    backgroundColor: '#181A26',
    borderLeftWidth: 3,
    borderLeftColor: '#FF4757',
    padding: 8,
    borderRadius: 6,
  },
  vaultTrapText: { fontSize: 11, color: '#D0D2E0', lineHeight: 16 },
  rubricList: { gap: 5, paddingTop: 4 },
  rubricRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  rubricText: { flex: 1, fontSize: 11, color: '#00E676', lineHeight: 15 },
  vaultActions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  vaultToggleBtn: {
    flex: 1.2,
    backgroundColor: '#181C2B',
    borderWidth: 1,
    borderColor: '#2A2E44',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  vaultToggleText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  vaultMasterBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#161824',
    borderWidth: 1,
    borderColor: '#2A2D40',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultMasterText: { fontSize: 11, fontWeight: '700', color: '#8E8EA8' },
  vaultAuditBtn: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    justifyContent: 'center',
  },
  vaultAuditText: { fontSize: 11, fontWeight: '900', color: '#0B0C12' },
});
