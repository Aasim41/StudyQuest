import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Modal,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import {
  EXAM_TARGETS,
  getStreamsForExam,
  resolveStreamForExam,
  getChaptersForSubject,
  getCuratedSubjectsForExam,
  getCuratedTopicsForExam,
  getCuratedPlanForExam,
} from '../config/studyGuideData';
import { generateAndShareCheatSheetPdf } from '../services/pdfService';
import { gsapTabTransition } from '../utils/gsapAnim';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const {
    targetExam,
    targetStream,
    targetSubject,
    setTargetExam,
    setTargetStream,
    setTargetSubject,
    studyPlan,
    togglePlanItemCompleted,
    savedGuides,
  } = useUser();

  const [activeTab, setActiveTab] = useState('syllabus'); // 'syllabus' | 'plan' | 'tools'
  const [syllabusSubMode, setSyllabusSubMode] = useState('chapters'); // 'chapters' | 'guides'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [quickSwitchVisible, setQuickSwitchVisible] = useState(false);
  const [customExamInput, setCustomExamInput] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const tabAnim = useRef(new Animated.Value(1)).current;
  const selectedSubject = targetSubject || 'All';

  const switchTab = (newTab) => {
    if (newTab === activeTab) return;
    gsapTabTransition(tabAnim);
    setActiveTab(newTab);
  };

  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  const streams = useMemo(() => getStreamsForExam(targetExam), [targetExam]);
  const activeStream = useMemo(() => resolveStreamForExam(targetExam, targetStream), [targetExam, targetStream]);
  const examSubjectNames = useMemo(
    () => ['All', ...getCuratedSubjectsForExam(targetExam, targetStream)],
    [targetExam, targetStream]
  );

  useEffect(() => {
    setExpandedChapterId(null);
  }, [targetExam, targetStream, selectedSubject]);

  const displayedChapters = useMemo(() => {
    const list = getChaptersForSubject(targetExam, targetStream, selectedSubject);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        (c.subtopics && c.subtopics.some((s) => s.toLowerCase().includes(q)))
    );
  }, [targetExam, targetStream, selectedSubject, searchQuery]);

  const displayedTopics = useMemo(() => {
    const list = getCuratedTopicsForExam(targetExam, selectedSubject, targetStream);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.summary?.toLowerCase().includes(q)
    );
  }, [targetExam, targetStream, selectedSubject, searchQuery]);

  const planItems = useMemo(() => {
    return studyPlan && studyPlan.length > 0
      ? studyPlan
      : getCuratedPlanForExam(targetExam, targetStream, selectedSubject);
  }, [studyPlan, targetExam, targetStream, selectedSubject]);

  const completedPlanCount = useMemo(
    () => planItems.filter((i) => i.isCompleted).length,
    [planItems]
  );

  const handleExportPdf = async () => {
    try {
      setPdfLoading(true);
      const res = await generateAndShareCheatSheetPdf(
        selectedSubject === 'All' ? activeStream?.label || 'All Subjects' : selectedSubject,
        activeExamLabel,
        displayedTopics.slice(0, 8)
      );
      if (!res.success) Alert.alert('PDF Export', res.error || 'Could not generate PDF.');
    } catch {
      Alert.alert('Export Error', 'Failed to generate cheat sheet PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSelectExam = async (examLabel) => {
    const firstStream = getStreamsForExam(examLabel)[0]?.id || 'pcm';
    await setTargetExam(examLabel, firstStream);
    setQuickSwitchVisible(false);
  };

  const handleApplyCustomExam = async () => {
    const clean = customExamInput.trim();
    if (!clean) return;
    await setTargetExam(clean);
    setCustomExamInput('');
    setQuickSwitchVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C10" />

      {/* Minimal Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.examSwitchTouch}
            onPress={() => setQuickSwitchVisible(true)}
            activeOpacity={0.7}
          >
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {activeExamLabel} ▾
              </Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {streams.length > 1 && activeStream ? `${activeStream.label} · ` : ''}
                {selectedSubject === 'All' ? 'All Subjects' : selectedSubject}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
            <Text style={styles.headerLink}>Progress</Text>
          </TouchableOpacity>
        </View>

        {/* Clean Underline Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'syllabus' && styles.tabItemActive]}
            onPress={() => switchTab('syllabus')}
          >
            <Text style={[styles.tabText, activeTab === 'syllabus' && styles.tabTextActive]}>
              Syllabus
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'plan' && styles.tabItemActive]}
            onPress={() => switchTab('plan')}
          >
            <Text style={[styles.tabText, activeTab === 'plan' && styles.tabTextActive]}>
              Study Plan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'tools' && styles.tabItemActive]}
            onPress={() => switchTab('tools')}
          >
            <Text style={[styles.tabText, activeTab === 'tools' && styles.tabTextActive]}>
              Tools
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: tabAnim }}
      >
        {/* TAB 1: SYLLABUS */}
        {activeTab === 'syllabus' && (
          <View>
            {/* Simple Horizontal Subject Text Strip */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subjectStrip}
            >
              {examSubjectNames.map((subj) => {
                const active = selectedSubject === subj;
                return (
                  <TouchableOpacity
                    key={subj}
                    style={[styles.subjectTab, active && styles.subjectTabActive]}
                    onPress={() => setTargetSubject(subj)}
                  >
                    <Text style={[styles.subjectTabText, active && styles.subjectTabTextActive]}>
                      {subj === 'All' ? 'All Subjects' : subj}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Search & Chapters/Guides Inline Row */}
            <View style={styles.filterRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Filter chapters or topics..."
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity
                style={styles.modeSwitchTextBtn}
                onPress={() =>
                  setSyllabusSubMode(syllabusSubMode === 'chapters' ? 'guides' : 'chapters')
                }
              >
                <Text style={styles.modeSwitchText}>
                  {syllabusSubMode === 'chapters'
                    ? `Guides (${displayedTopics.length})`
                    : `Chapters (${displayedChapters.length})`}
                </Text>
              </TouchableOpacity>
            </View>

            {syllabusSubMode === 'chapters' ? (
              displayedChapters.map((chap) => {
                const isOpen = expandedChapterId === chap.id;
                return (
                  <View key={chap.id} style={styles.listRow}>
                    <TouchableOpacity
                      style={styles.listRowHead}
                      onPress={() => setExpandedChapterId(isOpen ? null : chap.id)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowMeta}>
                          {chap.subject} · {chap.unit} · {chap.weightage}
                        </Text>
                        <Text style={styles.rowTitle}>{chap.title}</Text>
                      </View>
                      <MaterialCommunityIcons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#6B7280"
                      />
                    </TouchableOpacity>

                    {isOpen && (
                      <View style={styles.subtopicsList}>
                        {(chap.subtopics || []).map((st, idx) => (
                          <View key={idx} style={styles.subtopicRow}>
                            <Text style={styles.subtopicText}>{st}</Text>
                            <View style={styles.subtopicActions}>
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate('AIGapAuditor', {
                                    mode: 'TOPIC',
                                    initialTopic: st,
                                    initialSubject: chap.subject,
                                  })
                                }
                              >
                                <Text style={styles.linkCyan}>Audit</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate('Flow', {
                                    searchQuery: st,
                                    initialSubject: chap.subject,
                                  })
                                }
                              >
                                <Text style={styles.linkMuted}>Watch</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              displayedTopics.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.listRow}
                  onPress={() => navigation.navigate('StudyGuideDetail', { guide: topic })}
                  activeOpacity={0.7}
                >
                  <View style={styles.listRowHead}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowMeta}>{topic.subject}</Text>
                      <Text style={styles.rowTitle}>{topic.title}</Text>
                      {topic.summary ? (
                        <Text style={styles.rowSummary} numberOfLines={2}>
                          {topic.summary}
                        </Text>
                      ) : null}
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={18} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* TAB 2: STUDY PLAN */}
        {activeTab === 'plan' && (
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subjectStrip}
            >
              {examSubjectNames.map((subj) => {
                const active = selectedSubject === subj;
                return (
                  <TouchableOpacity
                    key={subj}
                    style={[styles.subjectTab, active && styles.subjectTabActive]}
                    onPress={() => setTargetSubject(subj)}
                  >
                    <Text style={[styles.subjectTabText, active && styles.subjectTabTextActive]}>
                      {subj === 'All' ? 'All Subjects' : subj}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.planHeaderRow}>
              <Text style={styles.planMeta}>
                {completedPlanCount} of {planItems.length} completed ·{' '}
                {selectedSubject === 'All' ? 'Full Board Plan' : selectedSubject}
              </Text>
            </View>

            {planItems.map((item) => (
              <View key={item.id} style={styles.planRow}>
                <TouchableOpacity
                  style={[styles.checkbox, item.isCompleted && styles.checkboxDone]}
                  onPress={() => togglePlanItemCompleted(item.id)}
                >
                  {item.isCompleted && (
                    <MaterialCommunityIcons name="check" size={14} color="#0B0C10" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() =>
                    navigation.navigate('AIGapAuditor', {
                      mode: 'TOPIC',
                      initialTopic: item.topic,
                      initialSubject: item.subject,
                    })
                  }
                >
                  <Text style={styles.rowMeta}>
                    {item.day || item.week} · {item.subject}
                  </Text>
                  <Text style={[styles.rowTitle, item.isCompleted && styles.rowTitleDone]}>
                    {item.topic}
                  </Text>
                  <Text style={styles.rowSummary} numberOfLines={2}>
                    {item.focus}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: CLEAN TOOL LIST */}
        {activeTab === 'tools' && (
          <View>
            {[
              { title: 'Exam, Stream & Blueprints', sub: 'Switch exam or view official marking splits', screen: 'ExamTargets' },
              { title: 'Flow Lectures', sub: 'Ad-free in-app lectures & links', screen: 'Flow' },
              { title: 'Regain Focus Blocker', sub: 'Study timer, Shorts & OS app shield', screen: 'Regain' },
              { title: 'AI Blindspot Auditor', sub: 'Audit answers or scan handwritten notes', screen: 'AIGapAuditor' },
              { title: 'Flashcards', sub: 'Rapid 60-second revision cards', screen: 'Flashcards' },
              { title: 'Question Predictor', sub: 'Past recurrence & rubric practice', screen: 'Predictor' },
              { title: 'Saved & Progress', sub: `${savedGuides.length} saved guides & reports`, screen: 'Analytics' },
            ].map((tool) => (
              <TouchableOpacity
                key={tool.screen}
                style={styles.toolRow}
                onPress={() => navigation.navigate(tool.screen)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{tool.title}</Text>
                  <Text style={styles.rowMeta}>{tool.sub}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#6B7280" />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.toolRow}
              onPress={handleExportPdf}
              disabled={pdfLoading}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  {pdfLoading ? 'Generating Cheat Sheet...' : 'Export Cheat Sheet PDF'}
                </Text>
                <Text style={styles.rowMeta}>Download summary for active subject</Text>
              </View>
              {pdfLoading ? (
                <ActivityIndicator size="small" color="#38BDF8" />
              ) : (
                <MaterialCommunityIcons name="download" size={18} color="#38BDF8" />
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 90 }} />
      </Animated.ScrollView>

      {/* Clean Exam & Stream Selector Modal */}
      <Modal
        visible={quickSwitchVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQuickSwitchVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setQuickSwitchVisible(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Exam</Text>
              <TouchableOpacity onPress={() => setQuickSwitchVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {streams.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 36, marginBottom: 12 }}>
                {streams.map((st) => {
                  const sel = activeStream?.id === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={[styles.subjectTab, { marginRight: 16 }, sel && styles.subjectTabActive]}
                      onPress={() => setTargetStream(st.id)}
                    >
                      <Text style={[styles.subjectTabText, sel && styles.subjectTabTextActive]}>
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.customExamRow}>
              <TextInput
                style={styles.customExamInput}
                placeholder="Or enter custom exam..."
                placeholderTextColor="#6B7280"
                value={customExamInput}
                onChangeText={setCustomExamInput}
              />
              <TouchableOpacity style={styles.customApplyBtn} onPress={handleApplyCustomExam}>
                <Text style={styles.customApplyText}>Set</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {EXAM_TARGETS.map((target) => {
                const isSelected = activeExamLabel === target.label;
                return (
                  <TouchableOpacity
                    key={target.id}
                    style={styles.modalOption}
                    onPress={() => handleSelectExam(target.label)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalOptionLabel, isSelected && { color: '#38BDF8' }]}>
                        {target.label}
                      </Text>
                      <Text style={styles.modalOptionSub} numberOfLines={1}>
                        {target.weightage}
                      </Text>
                    </View>
                    {isSelected && <MaterialCommunityIcons name="check" size={18} color="#38BDF8" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C10' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingHorizontal: 20,
    backgroundColor: '#0B0C10',
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  examSwitchTouch: { flex: 1 },
  headerTitle: { color: '#F9FAFB', fontSize: 19, fontWeight: '700', letterSpacing: -0.3 },
  headerSub: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  headerLink: { color: '#38BDF8', fontSize: 13, fontWeight: '600' },

  tabsRow: { flexDirection: 'row', gap: 24 },
  tabItem: { paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#38BDF8' },
  tabText: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#F9FAFB' },

  scrollContent: { padding: 20 },

  subjectStrip: {
    gap: 18,
    paddingBottom: 10,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  subjectTab: { paddingVertical: 4 },
  subjectTabActive: { borderBottomWidth: 2, borderBottomColor: '#38BDF8' },
  subjectTabText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  subjectTabTextActive: { color: '#F9FAFB' },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#14161F',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#F9FAFB',
    fontSize: 13,
  },
  modeSwitchTextBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  modeSwitchText: { color: '#38BDF8', fontSize: 12, fontWeight: '600' },

  listRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  listRowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowMeta: { color: '#6B7280', fontSize: 12, marginBottom: 3 },
  rowTitle: { color: '#F3F4F6', fontSize: 15, fontWeight: '600', lineHeight: 21 },
  rowTitleDone: { color: '#6B7280', textDecorationLine: 'line-through' },
  rowSummary: { color: '#9CA3AF', fontSize: 13, lineHeight: 18, marginTop: 4 },

  subtopicsList: { marginTop: 10, paddingLeft: 10, gap: 10 },
  subtopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  subtopicText: { flex: 1, color: '#D1D5DB', fontSize: 13, lineHeight: 18 },
  subtopicActions: { flexDirection: 'row', gap: 12 },
  linkCyan: { color: '#38BDF8', fontSize: 12, fontWeight: '600' },
  linkMuted: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },

  planHeaderRow: { paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#1D1F2C' },
  planMeta: { color: '#9CA3AF', fontSize: 12 },
  planRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  checkboxDone: { backgroundColor: '#38BDF8', borderColor: '#38BDF8' },

  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#14161F',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: { color: '#F9FAFB', fontSize: 17, fontWeight: '700' },
  customExamRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  customExamInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#0B0C10',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#F9FAFB',
    fontSize: 13,
  },
  customApplyBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customApplyText: { color: '#0B0C10', fontSize: 13, fontWeight: '700' },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  modalOptionLabel: { color: '#F3F4F6', fontSize: 14, fontWeight: '600' },
  modalOptionSub: { color: '#6B7280', fontSize: 12, marginTop: 2 },
});
