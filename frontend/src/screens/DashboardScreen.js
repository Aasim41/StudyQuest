import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Dimensions,
  Modal,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import {
  EXAM_TARGETS,
  getCuratedSubjectsForExam,
  getCuratedTopicsForExam,
  getCuratedPlanForExam,
} from '../config/studyGuideData';
import { generateAndShareCheatSheetPdf } from '../services/pdfService';
import MarkingSimulatorModal from '../components/MarkingSimulatorModal';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const navigation = useNavigation();
  const {
    userStats,
    targetExam,
    setTargetExam,
    studyPlan,
    togglePlanItemCompleted,
    savedGuides,
    toggleSaveGuide,
    syllabusLastUpdated,
    syllabusTrendData,
    isRefreshingSyllabus,
    refreshSyllabusData,
  } = useUser();

  // Active Card Tab: 'plan' | 'guides' | 'tools'
  const [activeTab, setActiveTab] = useState('plan');
  const tabAnim = useRef(new Animated.Value(1)).current;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [trendsModalVisible, setTrendsModalVisible] = useState(false);
  const [customExamInput, setCustomExamInput] = useState('');
  const [simulatorItem, setSimulatorItem] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Switch tabs with smooth animation
  const switchTab = (newTab) => {
    if (newTab === activeTab) return;
    Animated.sequence([
      Animated.timing(tabAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(tabAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setActiveTab(newTab);
  };

  // Active exam label
  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  // Dynamically curated subjects for the active exam
  const examSubjects = useMemo(() => {
    return ['All', ...getCuratedSubjectsForExam(targetExam)];
  }, [targetExam]);

  // Reset selected subject if not valid for new exam
  useEffect(() => {
    if (selectedSubject !== 'All' && !examSubjects.includes(selectedSubject)) {
      setSelectedSubject('All');
    }
  }, [targetExam, examSubjects]);

  // Curated topics for the active exam and subject filter
  const displayedTopics = useMemo(() => {
    const list = getCuratedTopicsForExam(targetExam, selectedSubject);
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.summary?.toLowerCase().includes(q) ||
        (t.aiBlindspots && t.aiBlindspots.some((b) => b.point.toLowerCase().includes(q)))
    );
  }, [targetExam, selectedSubject, searchQuery]);

  // Study plan stats
  const planItems = useMemo(() => {
    return studyPlan && studyPlan.length > 0 ? studyPlan : getCuratedPlanForExam(targetExam);
  }, [studyPlan, targetExam]);

  const completedPlanCount = useMemo(() => {
    return planItems.filter((i) => i.isCompleted).length;
  }, [planItems]);

  const planProgressPercent = useMemo(() => {
    return planItems.length > 0 ? Math.round((completedPlanCount / planItems.length) * 100) : 0;
  }, [planItems, completedPlanCount]);

  const handleExportPdf = async () => {
    try {
      setPdfLoading(true);
      const res = await generateAndShareCheatSheetPdf(
        selectedSubject === 'All' ? `${activeExamLabel} High-Yield Summary` : selectedSubject,
        activeExamLabel,
        displayedTopics.slice(0, 8)
      );
      if (!res.success) {
        Alert.alert('PDF Export', res.error || 'Could not generate PDF.');
      }
    } catch (e) {
      Alert.alert('Export Error', 'Failed to generate cheat sheet PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleOpenGuide = (guide) => {
    navigation.navigate('StudyGuideDetail', { guide });
  };

  const handleOpenAuditor = (mode = 'TOPIC', initialTopic = '', initialSubject = 'Physics') => {
    navigation.navigate('AIGapAuditor', {
      mode,
      initialTopic,
      initialSubject: selectedSubject !== 'All' ? selectedSubject : initialSubject,
    });
  };

  const handleSelectExam = (examLabel) => {
    setSelectedSubject('All');
    setTargetExam(examLabel);
    setTargetModalVisible(false);
  };

  const handleApplyCustomExam = () => {
    if (customExamInput.trim()) {
      setSelectedSubject('All');
      setTargetExam(customExamInput.trim());
      setCustomExamInput('');
      setTargetModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C12" />

      {/* Minimal Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>StudyQuest</Text>
            <TouchableOpacity
              style={styles.targetExamChip}
              onPress={() => setTargetModalVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="target" size={13} color="#00E5FF" />
              <Text style={styles.targetExamChipText} numberOfLines={1}>
                {activeExamLabel}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={13} color="#8E8EA8" />
            </TouchableOpacity>
          </View>

          <View style={styles.rightHeaderActions}>
            <TouchableOpacity
              style={styles.trendsIconBtn}
              onPress={() => setTrendsModalVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="trending-up" size={16} color="#00D2FF" />
            </TouchableOpacity>

            <View style={styles.xpPill}>
              <MaterialCommunityIcons name="lightning-bolt" size={13} color="#FFD32A" />
              <Text style={styles.xpPillText}>{userStats?.xp || 0} XP</Text>
            </View>
          </View>
        </View>

        {/* 3-Card Segmented Tabs Switcher */}
        <View style={styles.cardTabsRow}>
          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'plan' && styles.cardTabActive]}
            onPress={() => switchTab('plan')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="calendar-check"
              size={15}
              color={activeTab === 'plan' ? '#00E5FF' : '#777799'}
            />
            <Text style={[styles.cardTabText, activeTab === 'plan' && styles.cardTabTextActive]}>
              Study Plan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'guides' && styles.cardTabActive]}
            onPress={() => switchTab('guides')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={15}
              color={activeTab === 'guides' ? '#00E5FF' : '#777799'}
            />
            <Text style={[styles.cardTabText, activeTab === 'guides' && styles.cardTabTextActive]}>
              Guides & Rubrics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'tools' && styles.cardTabActive]}
            onPress={() => switchTab('tools')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="view-grid-plus-outline"
              size={15}
              color={activeTab === 'tools' ? '#00E5FF' : '#777799'}
            />
            <Text style={[styles.cardTabText, activeTab === 'tools' && styles.cardTabTextActive]}>
              Toolkit
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ transform: [{ scale: tabAnim }] }}
      >
        {/* ───────────────────────────────────────────────────────────── */}
        {/* CARD TAB 1: CURATED STUDY PLAN                                */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'plan' && (
          <View style={styles.tabContent}>
            {/* Plan Progress Header */}
            <View style={styles.planOverviewCard}>
              <View style={styles.planOverviewHeader}>
                <View>
                  <Text style={styles.planSectionTitle}>Milestone Timeline</Text>
                  <Text style={styles.planSectionSub}>
                    {completedPlanCount} of {planItems.length} Milestones Completed ({planProgressPercent}%)
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.planQuickActionBtn}
                  onPress={() => handleOpenAuditor('TOPIC')}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="shield-search" size={14} color="#0B0C12" />
                  <Text style={styles.planQuickActionText}>Audit Today</Text>
                </TouchableOpacity>
              </View>

              {/* Progress Bar Track */}
              <View style={styles.planProgressTrack}>
                <View style={[styles.planProgressFill, { width: `${planProgressPercent}%` }]} />
              </View>
            </View>

            {/* Milestones List */}
            <View style={styles.milestonesList}>
              {planItems.map((item) => (
                <View
                  key={item.id}
                  style={[styles.milestoneCard, item.isCompleted && styles.milestoneCardDone]}
                >
                  <TouchableOpacity
                    style={[styles.milestoneCheckbox, item.isCompleted && styles.milestoneCheckboxChecked]}
                    onPress={() => togglePlanItemCompleted(item.id)}
                    activeOpacity={0.8}
                  >
                    {item.isCompleted && (
                      <MaterialCommunityIcons name="check" size={14} color="#0B0C12" />
                    )}
                  </TouchableOpacity>

                  <View style={styles.milestoneBody}>
                    <View style={styles.milestoneTagRow}>
                      <Text style={styles.milestoneDayTag}>{item.day || item.week}</Text>
                      <Text style={styles.milestoneSubjectTag}>{item.subject}</Text>
                      {item.priority === 'CRITICAL' && (
                        <Text style={styles.milestonePriorityTag}>CRITICAL</Text>
                      )}
                    </View>

                    <Text
                      style={[styles.milestoneTopicTitle, item.isCompleted && styles.milestoneTopicDone]}
                    >
                      {item.topic}
                    </Text>

                    <Text style={styles.milestoneFocusText} numberOfLines={2}>
                      🎯 {item.focus}
                    </Text>

                    <View style={styles.milestoneActionRow}>
                      <TouchableOpacity
                        style={styles.milestoneAuditBtn}
                        onPress={() => handleOpenAuditor('TOPIC', item.topic, item.subject)}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name="shield-search" size={13} color="#00E5FF" />
                        <Text style={styles.milestoneAuditBtnText}>Audit Blindspots</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.milestoneFlowBtn}
                        onPress={() => navigation.navigate('Flow', { searchQuery: item.topic })}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name="play-circle" size={13} color="#FFB800" />
                        <Text style={styles.milestoneFlowBtnText}>Watch Lecture</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CARD TAB 2: GUIDES & EXAMINER RUBRICS                         */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'guides' && (
          <View style={styles.tabContent}>
            {/* Search Input */}
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={18} color="#777799" />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${activeExamLabel} topics, formulas...`}
                placeholderTextColor="#666688"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialCommunityIcons name="close-circle" size={16} color="#8E8EA8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Subject Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subjectChipsScroll}
            >
              {examSubjects.map((subj) => {
                const isSelected = selectedSubject === subj;
                return (
                  <TouchableOpacity
                    key={subj}
                    style={[styles.subjectChip, isSelected && styles.subjectChipActive]}
                    onPress={() => setSelectedSubject(subj)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.subjectChipText, isSelected && styles.subjectChipTextActive]}>
                      {subj}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Topics List */}
            <View style={styles.topicsGrid}>
              {displayedTopics.map((topic) => {
                const isSaved = savedGuides.some(
                  (g) => (g.id && g.id === topic.id) || g.title === topic.title
                );

                return (
                  <View key={topic.id} style={styles.topicCard}>
                    <View style={styles.topicHeaderRow}>
                      <View style={styles.topicSubjectBadge}>
                        <Text style={styles.topicSubjectBadgeText}>{topic.subject}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleSaveGuide(topic)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialCommunityIcons
                          name={isSaved ? 'bookmark' : 'bookmark-outline'}
                          size={18}
                          color={isSaved ? '#00E5FF' : '#666688'}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.topicCardTitle}>{topic.title}</Text>
                    <Text style={styles.topicExamRelevance}>{topic.examRelevance}</Text>

                    {topic.aiBlindspots && topic.aiBlindspots[0] && (
                      <View style={styles.blindspotBox}>
                        <Text style={styles.blindspotTitle}>
                          ⚠️ AI Blindspot: {topic.aiBlindspots[0].point}
                        </Text>
                        <Text style={styles.blindspotSnippet} numberOfLines={2}>
                          {topic.aiBlindspots[0].whatAiMisses}
                        </Text>
                      </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.topicActionsRow}>
                      <TouchableOpacity
                        style={styles.guideActionBtn}
                        onPress={() => handleOpenGuide(topic)}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name="book-open-outline" size={13} color="#FFFFFF" />
                        <Text style={styles.guideActionText}>Guide</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.rubricActionBtn}
                        onPress={() =>
                          setSimulatorItem({
                            topic: topic.title,
                            subject: topic.subject,
                            marks: 5,
                            keyPoints: topic.coreConcepts || [],
                          })
                        }
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name="calculator-variant-outline" size={13} color="#00E5FF" />
                        <Text style={styles.rubricActionText}>Rubric</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.auditActionBtn}
                        onPress={() => handleOpenAuditor('TOPIC', topic.title, topic.subject)}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name="shield-search" size={13} color="#00E676" />
                        <Text style={styles.auditActionText}>Audit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CARD TAB 3: STUDY TOOLKIT                                     */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'tools' && (
          <View style={styles.tabContent}>
            {/* Flow Study Video Player Card */}
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => navigation.navigate('Flow')}
              activeOpacity={0.85}
            >
              <View style={styles.toolCardIconBoxFlow}>
                <MaterialCommunityIcons name="play-circle" size={24} color="#00E5FF" />
              </View>
              <View style={styles.toolCardBody}>
                <View style={styles.toolCardTitleRow}>
                  <Text style={styles.toolCardTitle}>Flow Study Player</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#00E5FF" />
                </View>
                <Text style={styles.toolCardDesc}>
                  Distraction-free lectures, PYQ one-shots & revision streams without ads or shorts.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Regain Focus Shield Card */}
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => navigation.navigate('Regain')}
              activeOpacity={0.85}
            >
              <View style={styles.toolCardIconBoxRegain}>
                <MaterialCommunityIcons name="shield-lock" size={24} color="#FF4757" />
              </View>
              <View style={styles.toolCardBody}>
                <View style={styles.toolCardTitleRow}>
                  <Text style={styles.toolCardTitle}>Regain Focus Shield</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#FF4757" />
                </View>
                <Text style={styles.toolCardDesc}>
                  Deep work Pomodoro timer, Reels & Shorts blocker, and mindful friction pauses.
                </Text>
              </View>
            </TouchableOpacity>

            {/* AI Gap Auditor Card */}
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => handleOpenAuditor('TOPIC')}
              activeOpacity={0.85}
            >
              <View style={styles.toolCardIconBoxAuditor}>
                <MaterialCommunityIcons name="shield-search" size={24} color="#00E676" />
              </View>
              <View style={styles.toolCardBody}>
                <View style={styles.toolCardTitleRow}>
                  <Text style={styles.toolCardTitle}>AI Gap Auditor</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#00E676" />
                </View>
                <Text style={styles.toolCardDesc}>
                  Scan notes and syllabi against official examiner marking rubrics to expose lost marks.
                </Text>
              </View>
            </TouchableOpacity>

            {/* 60s Flashcard Deck Card */}
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => navigation.navigate('Flashcards')}
              activeOpacity={0.85}
            >
              <View style={styles.toolCardIconBoxDeck}>
                <MaterialCommunityIcons name="cards-outline" size={24} color="#A29BFE" />
              </View>
              <View style={styles.toolCardBody}>
                <View style={styles.toolCardTitleRow}>
                  <Text style={styles.toolCardTitle}>60s Formula Deck</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#A29BFE" />
                </View>
                <Text style={styles.toolCardDesc}>
                  Rapid spaced-repetition flashcards of high-yield definitions, laws, and units.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Exam Radar & Predictor Card */}
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => navigation.navigate('Predictor')}
              activeOpacity={0.85}
            >
              <View style={styles.toolCardIconBoxRadar}>
                <MaterialCommunityIcons name="radar" size={24} color="#FFD32A" />
              </View>
              <View style={styles.toolCardBody}>
                <View style={styles.toolCardTitleRow}>
                  <Text style={styles.toolCardTitle}>Exam Radar Predictor</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#FFD32A" />
                </View>
                <Text style={styles.toolCardDesc}>
                  Predict mark probabilities and high-risk questions for {activeExamLabel}.
                </Text>
              </View>
            </TouchableOpacity>

            {/* One-Tap Cheat Sheet PDF Export */}
            <TouchableOpacity
              style={styles.toolCard}
              onPress={handleExportPdf}
              disabled={pdfLoading}
              activeOpacity={0.85}
            >
              <View style={styles.toolCardIconBoxPdf}>
                {pdfLoading ? (
                  <ActivityIndicator size="small" color="#FF9F43" />
                ) : (
                  <MaterialCommunityIcons name="file-pdf-box" size={24} color="#FF9F43" />
                )}
              </View>
              <View style={styles.toolCardBody}>
                <View style={styles.toolCardTitleRow}>
                  <Text style={styles.toolCardTitle}>
                    {pdfLoading ? 'Generating Sheet...' : 'Export Cheat Sheet PDF'}
                  </Text>
                  <MaterialCommunityIcons name="download" size={16} color="#FF9F43" />
                </View>
                <Text style={styles.toolCardDesc}>
                  Printable high-yield summary of formulas, blindspots, and examiner criteria.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 110 }} />
      </Animated.ScrollView>

      {/* Target Exam Selector Modal */}
      <Modal
        visible={targetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTargetModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTargetModalVisible(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Target Exam</Text>
              <TouchableOpacity onPress={() => setTargetModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Custom Exam Input */}
            <View style={styles.customExamRow}>
              <TextInput
                style={styles.customExamInput}
                placeholder="Or type custom exam (e.g. CUET, SAT, State Boards)..."
                placeholderTextColor="#777799"
                value={customExamInput}
                onChangeText={setCustomExamInput}
              />
              <TouchableOpacity
                style={styles.customExamApplyBtn}
                onPress={handleApplyCustomExam}
              >
                <Text style={styles.customExamApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {EXAM_TARGETS.map((target) => {
                const isSelected = activeExamLabel === target.label;
                return (
                  <TouchableOpacity
                    key={target.id}
                    style={[styles.modalOption, isSelected && styles.modalOptionActive]}
                    onPress={() => handleSelectExam(target.label)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.modalOptionContent}>
                      <View style={styles.modalOptionHeader}>
                        <Text
                          style={[
                            styles.modalOptionLabel,
                            isSelected && styles.modalOptionLabelActive,
                          ]}
                        >
                          {target.label}
                        </Text>
                        <Text style={styles.modalCategoryBadge}>{target.category}</Text>
                      </View>
                      <Text style={styles.modalOptionDesc} numberOfLines={1}>
                        {target.subjects ? target.subjects.join(' • ') : target.desc}
                      </Text>
                    </View>
                    {isSelected && (
                      <MaterialCommunityIcons name="check-circle" size={18} color="#00E5FF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 2026-27 Syllabus Trends Modal */}
      <Modal
        visible={trendsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTrendsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTrendsModalVisible(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>2026-27 Pattern & Trends</Text>
              <TouchableOpacity onPress={() => setTrendsModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <View style={styles.trendsInfoBox}>
                <MaterialCommunityIcons name="shield-check" size={18} color="#2ED573" />
                <Text style={styles.trendsInfoText}>
                  Curated for {activeExamLabel}. Updated with latest board and exam patterns.
                </Text>
              </View>

              {/* Sync Button */}
              <TouchableOpacity
                style={styles.syncTrendsBtn}
                onPress={() => refreshSyllabusData(targetExam)}
                disabled={isRefreshingSyllabus}
                activeOpacity={0.8}
              >
                {isRefreshingSyllabus ? (
                  <ActivityIndicator size="small" color="#0B0C12" />
                ) : (
                  <MaterialCommunityIcons name="cloud-sync" size={16} color="#0B0C12" />
                )}
                <Text style={styles.syncTrendsBtnText}>
                  {isRefreshingSyllabus ? 'Syncing Pattern...' : 'Sync Fresh 2026-27 Pattern'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Interactive Marking Simulator Modal */}
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
  container: {
    flex: 1,
    backgroundColor: '#0B0C12',
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#0E1018',
    borderBottomWidth: 1.5,
    borderBottomColor: '#222436',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  targetExamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#161824',
    borderWidth: 1.5,
    borderColor: '#2A2D40',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    maxWidth: 160,
  },
  targetExamChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00E5FF',
    maxWidth: 115,
  },
  rightHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendsIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#161824',
    borderWidth: 1.5,
    borderColor: '#2A2D40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#161824',
    borderWidth: 1.5,
    borderColor: '#2A2D40',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  xpPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFD32A',
  },

  // 3-Card Segmented Tabs Switcher
  cardTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cardTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    backgroundColor: '#141622',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 10,
  },
  cardTabActive: {
    backgroundColor: '#1A1E2E',
    borderColor: '#00E5FF',
  },
  cardTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8EA8',
  },
  cardTabTextActive: {
    color: '#00E5FF',
    fontWeight: '800',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabContent: {
    gap: 12,
  },

  // Plan Tab Styles
  planOverviewCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  planOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planSectionSub: {
    fontSize: 11,
    color: '#8E8EA8',
    marginTop: 2,
  },
  planQuickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00E5FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  planQuickActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0B0C12',
  },
  planProgressTrack: {
    height: 6,
    backgroundColor: '#1A1C2C',
    borderRadius: 3,
    overflow: 'hidden',
  },
  planProgressFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
    borderRadius: 3,
  },
  milestonesList: {
    gap: 10,
  },
  milestoneCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
  },
  milestoneCardDone: {
    opacity: 0.65,
    borderColor: '#1D2A2A',
  },
  milestoneCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#3B3E56',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  milestoneCheckboxChecked: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF',
  },
  milestoneBody: {
    flex: 1,
    gap: 6,
  },
  milestoneTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneDayTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  milestoneSubjectTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A29BFE',
    backgroundColor: 'rgba(162, 155, 254, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  milestonePriorityTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF4757',
    backgroundColor: 'rgba(255, 71, 87, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  milestoneTopicTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  milestoneTopicDone: {
    textDecorationLine: 'line-through',
    color: '#777799',
  },
  milestoneFocusText: {
    fontSize: 11,
    color: '#8E8EA8',
    lineHeight: 16,
  },
  milestoneActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  milestoneAuditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#181B28',
    borderWidth: 1,
    borderColor: '#2A2E44',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  milestoneAuditBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00E5FF',
  },
  milestoneFlowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#181B28',
    borderWidth: 1,
    borderColor: '#2A2E44',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  milestoneFlowBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFB800',
  },

  // Guides Tab Styles
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  subjectChipsScroll: {
    gap: 6,
    paddingVertical: 4,
  },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
  },
  subjectChipActive: {
    backgroundColor: '#1A1E2E',
    borderColor: '#00E5FF',
  },
  subjectChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8EA8',
  },
  subjectChipTextActive: {
    color: '#00E5FF',
    fontWeight: '800',
  },
  topicsGrid: {
    gap: 12,
  },
  topicCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  topicHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicSubjectBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  topicSubjectBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00E5FF',
  },
  topicCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 19,
  },
  topicExamRelevance: {
    fontSize: 11,
    color: '#FFB800',
    fontWeight: '600',
  },
  blindspotBox: {
    backgroundColor: '#181A26',
    borderLeftWidth: 3,
    borderLeftColor: '#FF4757',
    padding: 8,
    borderRadius: 6,
    gap: 3,
  },
  blindspotTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B81',
  },
  blindspotSnippet: {
    fontSize: 11,
    color: '#8E8EA8',
    lineHeight: 15,
  },
  topicActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  guideActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#1D2133',
    borderWidth: 1,
    borderColor: '#2D334C',
    paddingVertical: 7,
    borderRadius: 6,
  },
  guideActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rubricActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#132128',
    borderWidth: 1,
    borderColor: '#1D3B47',
    paddingVertical: 7,
    borderRadius: 6,
  },
  rubricActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00E5FF',
  },
  auditActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#12251D',
    borderWidth: 1,
    borderColor: '#1D4532',
    paddingVertical: 7,
    borderRadius: 6,
  },
  auditActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00E676',
  },

  // Toolkit Tab Styles
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 14,
    padding: 14,
  },
  toolCardIconBoxFlow: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolCardIconBoxRegain: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolCardIconBoxAuditor: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolCardIconBoxDeck: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(162, 155, 254, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolCardIconBoxRadar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 211, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolCardIconBoxPdf: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 159, 67, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolCardBody: {
    flex: 1,
    gap: 3,
  },
  toolCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  toolCardDesc: {
    fontSize: 11,
    color: '#8E8EA8',
    lineHeight: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#24263A',
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  customExamRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  customExamInput: {
    flex: 1,
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#2A2D40',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    color: '#FFFFFF',
    fontSize: 12,
  },
  customExamApplyBtn: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customExamApplyText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0B0C12',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161824',
    borderWidth: 1,
    borderColor: '#24263A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  modalOptionActive: {
    borderColor: '#00E5FF',
    backgroundColor: '#1A1E2E',
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalOptionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOptionLabelActive: {
    color: '#00E5FF',
  },
  modalCategoryBadge: {
    fontSize: 9,
    color: '#777799',
    fontWeight: '600',
  },
  modalOptionDesc: {
    fontSize: 11,
    color: '#8E8EA8',
  },
  trendsInfoBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(46, 213, 115, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(46, 213, 115, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  trendsInfoText: {
    flex: 1,
    fontSize: 11,
    color: '#E0E0E0',
    lineHeight: 16,
  },
  syncTrendsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00E5FF',
    paddingVertical: 10,
    borderRadius: 8,
  },
  syncTrendsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B0C12',
  },
});
