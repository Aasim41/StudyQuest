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
  getSubjectsForExamAndStream,
  getChaptersForSubject,
  getCuratedSubjectsForExam,
  getCuratedTopicsForExam,
  getCuratedPlanForExam,
} from '../config/studyGuideData';
import { generateAndShareCheatSheetPdf } from '../services/pdfService';
import MarkingSimulatorModal from '../components/MarkingSimulatorModal';
import { gsapTabTransition } from '../utils/gsapAnim';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const {
    userStats,
    targetExam,
    targetStream,
    targetSubject,
    setTargetExam,
    setTargetStream,
    setTargetSubject,
    studyPlan,
    togglePlanItemCompleted,
    savedGuides,
    toggleSaveGuide,
  } = useUser();

  // 3 Primary Card Tabs: 'syllabus' | 'plan' | 'tools'
  const [activeTab, setActiveTab] = useState('syllabus');
  // Sub-view inside Syllabus tab: 'chapters' | 'guides'
  const [syllabusSubMode, setSyllabusSubMode] = useState('chapters');

  const tabAnim = useRef(new Animated.Value(1)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const selectedSubject = targetSubject || 'All';
  const [expandedChapterId, setExpandedChapterId] = useState(null);

  const [quickSwitchVisible, setQuickSwitchVisible] = useState(false);
  const [customExamInput, setCustomExamInput] = useState('');
  const [simulatorItem, setSimulatorItem] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

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
  const streamSubjects = useMemo(() => getSubjectsForExamAndStream(targetExam, targetStream), [targetExam, targetStream]);

  const examSubjectNames = useMemo(() => {
    return ['All', ...getCuratedSubjectsForExam(targetExam, targetStream)];
  }, [targetExam, targetStream]);

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
        t.summary?.toLowerCase().includes(q) ||
        (t.aiBlindspots && t.aiBlindspots.some((b) => b.point.toLowerCase().includes(q)))
    );
  }, [targetExam, targetStream, selectedSubject, searchQuery]);

  const planItems = useMemo(() => {
    return studyPlan && studyPlan.length > 0 ? studyPlan : getCuratedPlanForExam(targetExam, targetStream, selectedSubject);
  }, [studyPlan, targetExam, targetStream, selectedSubject]);

  const completedPlanCount = useMemo(() => planItems.filter((i) => i.isCompleted).length, [planItems]);
  const planProgressPercent = useMemo(
    () => (planItems.length > 0 ? Math.round((completedPlanCount / planItems.length) * 100) : 0),
    [planItems, completedPlanCount]
  );

  const handleExportPdf = async () => {
    try {
      setPdfLoading(true);
      const res = await generateAndShareCheatSheetPdf(
        selectedSubject === 'All' ? `${activeExamLabel} (${activeStream?.label || 'Core'})` : selectedSubject,
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

  const handleOpenAuditor = (mode = 'TOPIC', initialTopic = '', initialSubject = '') => {
    const defaultSub = selectedSubject !== 'All' ? selectedSubject : (examSubjectNames[1] || 'Physics');
    navigation.navigate('AIGapAuditor', {
      mode,
      initialTopic,
      initialSubject: initialSubject || defaultSub,
    });
  };

  const handleQuickSelectExam = async (examLabel) => {
    const firstStream = getStreamsForExam(examLabel)[0]?.id || 'pcm';
    await setTargetExam(examLabel, firstStream);
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
      <StatusBar barStyle="light-content" backgroundColor="#0B0C12" />

      {/* Clean Minimal Obsidian Top Bar */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.targetChip}
            onPress={() => setQuickSwitchVisible(true)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="target" size={14} color="#00E5FF" />
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.targetChipExam} numberOfLines={1}>
                {activeExamLabel}
              </Text>
              <Text style={styles.targetChipStream} numberOfLines={1}>
                {streams.length > 1 && activeStream ? `${activeStream.label} • ` : ''}
                {selectedSubject === 'All' ? 'All Board Subjects' : selectedSubject}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-down" size={15} color="#8E8EA8" />
          </TouchableOpacity>

          <View style={styles.rightHeaderRow}>
            <TouchableOpacity
              style={styles.xpBtn}
              onPress={() => navigation.navigate('Analytics')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={13} color="#FFD32A" />
              <Text style={styles.xpBtnText}>{userStats?.xp || 0} XP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3 Clean Card Tabs */}
        <View style={styles.cardTabsRow}>
          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'syllabus' && styles.cardTabActive]}
            onPress={() => switchTab('syllabus')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={14}
              color={activeTab === 'syllabus' ? '#00E5FF' : '#777799'}
            />
            <Text style={[styles.cardTabText, activeTab === 'syllabus' && styles.cardTabTextActive]}>
              Syllabus
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'plan' && styles.cardTabActive]}
            onPress={() => switchTab('plan')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="calendar-check"
              size={14}
              color={activeTab === 'plan' ? '#00E5FF' : '#777799'}
            />
            <Text style={[styles.cardTabText, activeTab === 'plan' && styles.cardTabTextActive]}>
              Study Plan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'tools' && styles.cardTabActive]}
            onPress={() => switchTab('tools')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="view-grid-outline"
              size={14}
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
        style={{ opacity: tabAnim, transform: [{ scale: tabAnim }] }}
      >
        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 1: EXAM -> STREAM -> SUBJECT -> CHAPTER -> TOPIC SYLLABUS */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'syllabus' && (
          <View style={styles.tabBody}>
            {/* Stream Quick Cards (only when exam offers multiple streams) */}
            {streams.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {streams.map((st) => {
                  const active = activeStream?.id === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={[styles.streamChip, active && styles.streamChipActive]}
                      onPress={() => setTargetStream(st.id)}
                    >
                      <Text style={[styles.streamChipText, active && styles.streamChipTextActive]}>
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Search Input */}
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={18} color="#777799" />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search chapters, topics, formulas...`}
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

            {/* Subject Cards Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {examSubjectNames.map((subj) => {
                const isSelected = selectedSubject === subj;
                const subMeta = streamSubjects.find((s) => s.name === subj);
                return (
                  <TouchableOpacity
                    key={subj}
                    style={[styles.subjectCard, isSelected && styles.subjectCardActive]}
                    onPress={() => setTargetSubject(subj)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.subjectCardTitle, isSelected && { color: '#00E5FF' }]}>
                      {subj === 'All' ? 'All Subjects' : subj}
                    </Text>
                    {subMeta && (
                      <Text style={styles.subjectCardSub} numberOfLines={1}>
                        {subMeta.code ? `${subMeta.code} • ` : ''}{subMeta.marksSplit.split('(')[0].trim()}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Clean Sub-Mode Toggle: Chapters vs Verified Topic Guides */}
            <View style={styles.subToggleRow}>
              <TouchableOpacity
                style={[styles.subToggleBtn, syllabusSubMode === 'chapters' && styles.subToggleBtnActive]}
                onPress={() => setSyllabusSubMode('chapters')}
              >
                <Text style={[styles.subToggleText, syllabusSubMode === 'chapters' && styles.subToggleTextActive]}>
                  Chapters ({displayedChapters.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subToggleBtn, syllabusSubMode === 'guides' && styles.subToggleBtnActive]}
                onPress={() => setSyllabusSubMode('guides')}
              >
                <Text style={[styles.subToggleText, syllabusSubMode === 'guides' && styles.subToggleTextActive]}>
                  Verified Guides ({displayedTopics.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Chapters Accordion / Drilldown List */}
            {syllabusSubMode === 'chapters' && (
              <View style={styles.listStack}>
                {displayedChapters.map((chap) => {
                  const isOpen = expandedChapterId === chap.id;
                  return (
                    <View key={chap.id} style={styles.chapterCard}>
                      <TouchableOpacity
                        style={styles.chapterHeader}
                        onPress={() => setExpandedChapterId(isOpen ? null : chap.id)}
                        activeOpacity={0.85}
                      >
                        <View style={{ flex: 1, gap: 3 }}>
                          <View style={styles.chapterMetaRow}>
                            <Text style={styles.chapterUnitText}>{chap.unit} • {chap.subject}</Text>
                            <Text style={styles.chapterWeight}>{chap.weightage}</Text>
                          </View>
                          <Text style={styles.chapterTitle}>{chap.title}</Text>
                        </View>
                        <MaterialCommunityIcons
                          name={isOpen ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color="#8E8EA8"
                        />
                      </TouchableOpacity>

                      {isOpen && (
                        <View style={styles.chapterSubtopicsBox}>
                          {(chap.subtopics || []).map((st, idx) => (
                            <View key={idx} style={styles.subtopicRow}>
                              <Text style={styles.subtopicTitle}>• {st}</Text>
                              <View style={styles.subtopicActions}>
                                <TouchableOpacity
                                  style={styles.miniActionBtn}
                                  onPress={() => handleOpenAuditor('TOPIC', st, chap.subject)}
                                >
                                  <Text style={styles.miniActionText}>Audit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.miniActionBtnFlow}
                                  onPress={() => navigation.navigate('Flow', { searchQuery: st })}
                                >
                                  <Text style={styles.miniActionTextFlow}>Watch</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Verified Guides & Marking Keys List */}
            {syllabusSubMode === 'guides' && (
              <View style={styles.listStack}>
                {displayedTopics.map((topic) => {
                  const isSaved = savedGuides.some(
                    (g) => (g.id && g.id === topic.id) || g.title === topic.title
                  );

                  return (
                    <View key={topic.id} style={styles.topicCard}>
                      <View style={styles.topicHeadRow}>
                        <Text style={styles.topicSubjectTag}>{topic.subject}</Text>
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

                      <Text style={styles.topicTitle}>{topic.title}</Text>

                      {topic.aiBlindspots && topic.aiBlindspots[0] && (
                        <View style={styles.blindspotBox}>
                          <Text style={styles.blindspotHead}>{topic.aiBlindspots[0].point}</Text>
                          <Text style={styles.blindspotText} numberOfLines={2}>
                            {topic.aiBlindspots[0].whatAiMisses}
                          </Text>
                        </View>
                      )}

                      <View style={styles.topicActions}>
                        <TouchableOpacity
                          style={styles.btnDark}
                          onPress={() => handleOpenGuide(topic)}
                        >
                          <Text style={styles.btnDarkText}>Open Guide</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.btnCyan}
                          onPress={() =>
                            setSimulatorItem({
                              topic: topic.title,
                              subject: topic.subject,
                              marks: topic.examQuestions?.[0]?.marks || 5,
                              keyPoints: topic.examQuestions?.[0]?.keyPoints || topic.coreConcepts || [],
                            })
                          }
                        >
                          <Text style={styles.btnCyanText}>Rubric</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.btnGreen}
                          onPress={() => handleOpenAuditor('TOPIC', topic.title, topic.subject)}
                        >
                          <Text style={styles.btnGreenText}>Audit</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 2: STREAM-CURATED STUDY PLAN                              */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'plan' && (
          <View style={styles.tabBody}>
            {/* Subject Filter Pills Directly in Plan */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {examSubjectNames.map((subj) => {
                const isSel = selectedSubject === subj;
                return (
                  <TouchableOpacity
                    key={subj}
                    style={[styles.streamChip, isSel && styles.streamChipActive]}
                    onPress={() => setTargetSubject(subj)}
                  >
                    <Text style={[styles.streamChipText, isSel && styles.streamChipTextActive]}>
                      {subj === 'All' ? 'All Subjects' : subj}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.planSummaryCard}>
              <View style={styles.planSummaryHead}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.planSummaryTitle} numberOfLines={1}>
                    {selectedSubject === 'All' ? 'Full Board Roadmap' : `${selectedSubject} Roadmap`}
                  </Text>
                  <Text style={styles.planSummarySub}>
                    {completedPlanCount} / {planItems.length} Done ({planProgressPercent}%)
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.auditNowBtn}
                  onPress={() => handleOpenAuditor('TOPIC')}
                >
                  <Text style={styles.auditNowText}>Audit Topic</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${planProgressPercent}%` }]} />
              </View>
            </View>

            <View style={styles.listStack}>
              {planItems.map((item) => (
                <View
                  key={item.id}
                  style={[styles.milestoneCard, item.isCompleted && styles.milestoneCardDone]}
                >
                  <TouchableOpacity
                    style={[styles.checkbox, item.isCompleted && styles.checkboxChecked]}
                    onPress={() => togglePlanItemCompleted(item.id)}
                  >
                    {item.isCompleted && (
                      <MaterialCommunityIcons name="check" size={14} color="#0B0C12" />
                    )}
                  </TouchableOpacity>

                  <View style={styles.milestoneContent}>
                    <View style={styles.milestoneMetaRow}>
                      <Text style={styles.milestoneDay}>{item.day || item.week}</Text>
                      <Text style={styles.milestoneSubject}>{item.subject}</Text>
                    </View>

                    <Text style={[styles.milestoneTitle, item.isCompleted && styles.milestoneDoneText]}>
                      {item.topic}
                    </Text>
                    <Text style={styles.milestoneFocus} numberOfLines={2}>{item.focus}</Text>

                    <View style={styles.milestoneButtons}>
                      <TouchableOpacity
                        style={styles.milestoneLinkBtn}
                        onPress={() => handleOpenAuditor('TOPIC', item.topic, item.subject)}
                      >
                        <Text style={styles.milestoneLinkText}>Audit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.milestoneLinkBtn}
                        onPress={() => navigation.navigate('Flow', { searchQuery: item.topic })}
                      >
                        <Text style={[styles.milestoneLinkText, { color: '#FFB800' }]}>Watch in Flow</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 3: STUDY TOOLKIT (CLEAN SCREEN REDIRECT CARDS)            */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'tools' && (
          <View style={styles.tabBody}>
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => navigation.navigate('Flow')}
              activeOpacity={0.85}
            >
              <View style={[styles.toolIconBox, { backgroundColor: 'rgba(0, 229, 255, 0.1)' }]}>
                <MaterialCommunityIcons name="play-circle" size={22} color="#00E5FF" />
              </View>
              <View style={styles.toolTextBox}>
                <Text style={styles.toolTitle}>Flow Study Player</Text>
                <Text style={styles.toolDesc}>Ad-free lectures & live topic search</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#777799" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => navigation.navigate('Regain')}
              activeOpacity={0.85}
            >
              <View style={[styles.toolIconBox, { backgroundColor: 'rgba(255, 71, 87, 0.1)' }]}>
                <MaterialCommunityIcons name="shield-lock" size={22} color="#FF4757" />
              </View>
              <View style={styles.toolTextBox}>
                <Text style={styles.toolTitle}>Regain Focus Shield</Text>
                <Text style={styles.toolDesc}>Deep focus timer & Reels blocker</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#777799" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => handleOpenAuditor('TOPIC')}
              activeOpacity={0.85}
            >
              <View style={[styles.toolIconBox, { backgroundColor: 'rgba(0, 230, 118, 0.1)' }]}>
                <MaterialCommunityIcons name="shield-search" size={22} color="#00E676" />
              </View>
              <View style={styles.toolTextBox}>
                <Text style={styles.toolTitle}>AI Blindspot Auditor</Text>
                <Text style={styles.toolDesc}>Audit topics or scan handwritten answers</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#777799" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => navigation.navigate('ExamTargets')}
              activeOpacity={0.85}
            >
              <View style={[styles.toolIconBox, { backgroundColor: 'rgba(162, 155, 254, 0.1)' }]}>
                <MaterialCommunityIcons name="school-outline" size={22} color="#A29BFE" />
              </View>
              <View style={styles.toolTextBox}>
                <Text style={styles.toolTitle}>Exam, Stream & Blueprints</Text>
                <Text style={styles.toolDesc}>Official marking splits & Trap Vault</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#777799" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => navigation.navigate('Flashcards')}
              activeOpacity={0.85}
            >
              <View style={[styles.toolIconBox, { backgroundColor: 'rgba(255, 211, 42, 0.1)' }]}>
                <MaterialCommunityIcons name="cards-outline" size={22} color="#FFD32A" />
              </View>
              <View style={styles.toolTextBox}>
                <Text style={styles.toolTitle}>60s Morning Flashcards</Text>
                <Text style={styles.toolDesc}>Rapid recall of examiner edge cases</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#777799" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => navigation.navigate('Predictor')}
              activeOpacity={0.85}
            >
              <View style={[styles.toolIconBox, { backgroundColor: 'rgba(0, 210, 255, 0.1)' }]}>
                <MaterialCommunityIcons name="radar" size={22} color="#00D2FF" />
              </View>
              <View style={styles.toolTextBox}>
                <Text style={styles.toolTitle}>5-Year Question Radar</Text>
                <Text style={styles.toolDesc}>High-recurrence probability predictor</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#777799" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => navigation.navigate('Analytics')}
              activeOpacity={0.85}
            >
              <View style={[styles.toolIconBox, { backgroundColor: 'rgba(255, 159, 67, 0.1)' }]}>
                <MaterialCommunityIcons name="chart-box-outline" size={22} color="#FF9F43" />
              </View>
              <View style={styles.toolTextBox}>
                <Text style={styles.toolTitle}>My Mastery & Saved Guides</Text>
                <Text style={styles.toolDesc}>Bookmarks, readiness score & XP</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#777799" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={handleExportPdf}
              disabled={pdfLoading}
              activeOpacity={0.85}
            >
              <View style={[styles.toolIconBox, { backgroundColor: 'rgba(255, 107, 129, 0.1)' }]}>
                {pdfLoading ? (
                  <ActivityIndicator size="small" color="#FF6B81" />
                ) : (
                  <MaterialCommunityIcons name="file-pdf-box" size={22} color="#FF6B81" />
                )}
              </View>
              <View style={styles.toolTextBox}>
                <Text style={styles.toolTitle}>{pdfLoading ? 'Creating PDF...' : 'Export Cheat Sheet PDF'}</Text>
                <Text style={styles.toolDesc}>Printable 1-page summary</Text>
              </View>
              <MaterialCommunityIcons name="download" size={18} color="#777799" />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 105 }} />
      </Animated.ScrollView>

      {/* Quick Exam & Stream Switcher Modal */}
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
              <Text style={styles.modalTitle}>Exam & Stream</Text>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => {
                    setQuickSwitchVisible(false);
                    navigation.navigate('ExamTargets');
                  }}
                >
                  <Text style={styles.fullDirLink}>Full Directory →</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setQuickSwitchVisible(false)}>
                  <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stream Selector inside Modal (only when exam has branches) */}
            {streams.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40, marginBottom: 10 }}>
                {streams.map((st) => {
                  const sel = activeStream?.id === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={[styles.modalStreamPill, sel && styles.modalStreamPillActive]}
                      onPress={() => setTargetStream(st.id)}
                    >
                      <Text style={[styles.modalStreamText, sel && styles.modalStreamTextActive]}>
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Quick Subject Scope Pills inside Modal */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 38, marginBottom: 10 }}>
              {examSubjectNames.map((subj) => {
                const sel = selectedSubject === subj;
                return (
                  <TouchableOpacity
                    key={subj}
                    style={[styles.modalStreamPill, sel && styles.modalStreamPillActive]}
                    onPress={() => setTargetSubject(subj)}
                  >
                    <Text style={[styles.modalStreamText, sel && styles.modalStreamTextActive]}>
                      {subj === 'All' ? 'All Subjects' : subj}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.customExamRow}>
              <TextInput
                style={styles.customExamInput}
                placeholder="Type custom exam..."
                placeholderTextColor="#666688"
                value={customExamInput}
                onChangeText={setCustomExamInput}
              />
              <TouchableOpacity style={styles.customApplyBtn} onPress={handleApplyCustomExam}>
                <Text style={styles.customApplyText}>Set</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 330 }} showsVerticalScrollIndicator={false}>
              {EXAM_TARGETS.map((target) => {
                const isSelected = activeExamLabel === target.label;
                return (
                  <TouchableOpacity
                    key={target.id}
                    style={[styles.modalOption, isSelected && styles.modalOptionActive]}
                    onPress={() => handleQuickSelectExam(target.label)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalOptionLabel, isSelected && { color: '#00E5FF' }]}>
                        {target.label}
                      </Text>
                      <Text style={styles.modalOptionSub} numberOfLines={1}>
                        {target.weightage}
                      </Text>
                    </View>
                    {isSelected && <MaterialCommunityIcons name="check-circle" size={18} color="#00E5FF" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
    paddingTop: 46,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#0E1018',
    borderBottomWidth: 1.5,
    borderBottomColor: '#222436',
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  targetChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#161824',
    borderWidth: 1.5,
    borderColor: '#2A2D40',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  targetChipExam: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  targetChipStream: { fontSize: 10, fontWeight: '700', color: '#00E5FF' },
  rightHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  xpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#161824',
    borderWidth: 1.5,
    borderColor: '#2A2D40',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  xpBtnText: { fontSize: 11, fontWeight: '800', color: '#FFD32A' },

  cardTabsRow: { flexDirection: 'row', gap: 8 },
  cardTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    backgroundColor: '#141622',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 10,
  },
  cardTabActive: { backgroundColor: '#1A1E2E', borderColor: '#00E5FF' },
  cardTabText: { fontSize: 12, fontWeight: '700', color: '#8E8EA8' },
  cardTabTextActive: { color: '#00E5FF', fontWeight: '800' },

  scrollContent: { paddingHorizontal: 16, paddingTop: 14 },
  tabBody: { gap: 12 },
  chipsScroll: { gap: 8, paddingVertical: 2 },

  streamChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
  },
  streamChipActive: { borderColor: '#00E5FF', backgroundColor: '#171C2B' },
  streamChipText: { fontSize: 11, fontWeight: '700', color: '#8E8EA8' },
  streamChipTextActive: { color: '#00E5FF', fontWeight: '800' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 12 },

  subjectCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 96,
    gap: 2,
  },
  subjectCardActive: { borderColor: '#00E5FF', backgroundColor: '#171B2B' },
  subjectCardTitle: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  subjectCardSub: { fontSize: 10, color: '#8E8EA8' },

  subToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  subToggleBtn: { flex: 1, paddingVertical: 7, borderRadius: 7, alignItems: 'center' },
  subToggleBtnActive: { backgroundColor: '#1E2336' },
  subToggleText: { fontSize: 11, fontWeight: '700', color: '#8E8EA8' },
  subToggleTextActive: { color: '#00E5FF', fontWeight: '800' },

  listStack: { gap: 10 },
  chapterCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 13,
  },
  chapterHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chapterMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chapterUnitText: { fontSize: 10, fontWeight: '800', color: '#00E5FF' },
  chapterWeight: { fontSize: 10, fontWeight: '800', color: '#00E676' },
  chapterTitle: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', lineHeight: 18 },
  chapterSubtopicsBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#222436',
    gap: 8,
  },
  subtopicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  subtopicTitle: { flex: 1, fontSize: 11, color: '#D0D2E0', lineHeight: 16 },
  subtopicActions: { flexDirection: 'row', gap: 6 },
  miniActionBtn: {
    backgroundColor: '#132820',
    borderWidth: 1,
    borderColor: '#1F4B37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  miniActionText: { fontSize: 10, fontWeight: '800', color: '#00E676' },
  miniActionBtnFlow: {
    backgroundColor: '#1A1C2B',
    borderWidth: 1,
    borderColor: '#2D324C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  miniActionTextFlow: { fontSize: 10, fontWeight: '800', color: '#FFB800' },

  // Topics
  topicCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  topicHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topicSubjectTag: { fontSize: 10, fontWeight: '800', color: '#00E5FF' },
  topicTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', lineHeight: 19 },
  blindspotBox: {
    backgroundColor: '#181A26',
    borderLeftWidth: 3,
    borderLeftColor: '#FF4757',
    padding: 8,
    borderRadius: 6,
    gap: 2,
  },
  blindspotHead: { fontSize: 11, fontWeight: '700', color: '#FF6B81' },
  blindspotText: { fontSize: 11, color: '#8E8EA8', lineHeight: 15 },
  topicActions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  btnDark: {
    flex: 1,
    backgroundColor: '#1D2133',
    borderWidth: 1,
    borderColor: '#2D334C',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnDarkText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  btnCyan: {
    flex: 1,
    backgroundColor: '#132128',
    borderWidth: 1,
    borderColor: '#1D3B47',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnCyanText: { fontSize: 11, fontWeight: '700', color: '#00E5FF' },
  btnGreen: {
    flex: 1,
    backgroundColor: '#12251D',
    borderWidth: 1,
    borderColor: '#1D4532',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnGreenText: { fontSize: 11, fontWeight: '700', color: '#00E676' },

  // Plan Tab
  planSummaryCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  planSummaryHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planSummaryTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  planSummarySub: { fontSize: 11, color: '#8E8EA8', marginTop: 2 },
  auditNowBtn: { backgroundColor: '#00E5FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7 },
  auditNowText: { fontSize: 11, fontWeight: '900', color: '#0B0C12' },
  progressTrack: { height: 6, backgroundColor: '#1A1C2C', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00E5FF' },
  milestoneCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 13,
  },
  milestoneCardDone: { opacity: 0.6 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#3B3E56',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: '#00E5FF', borderColor: '#00E5FF' },
  milestoneContent: { flex: 1, gap: 5 },
  milestoneMetaRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  milestoneDay: { fontSize: 10, fontWeight: '800', color: '#00E5FF' },
  milestoneSubject: { fontSize: 10, fontWeight: '700', color: '#A29BFE' },
  milestoneTitle: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  milestoneDoneText: { textDecorationLine: 'line-through', color: '#777799' },
  milestoneFocus: { fontSize: 11, color: '#8E8EA8', lineHeight: 15 },
  milestoneButtons: { flexDirection: 'row', gap: 8, marginTop: 4 },
  milestoneLinkBtn: {
    backgroundColor: '#181B28',
    borderWidth: 1,
    borderColor: '#2A2E44',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  milestoneLinkText: { fontSize: 10, fontWeight: '800', color: '#00E5FF' },

  // Toolkit Tab
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 13,
  },
  toolIconBox: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toolTextBox: { flex: 1, gap: 2 },
  toolTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  toolDesc: { fontSize: 11, color: '#8E8EA8' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center', padding: 18 },
  modalCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#24263A',
    borderRadius: 14,
    padding: 16,
    maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  fullDirLink: { fontSize: 11, fontWeight: '800', color: '#00E5FF' },
  modalStreamPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#161824',
    borderWidth: 1,
    borderColor: '#2A2D40',
    marginRight: 6,
  },
  modalStreamPillActive: { borderColor: '#00E5FF', backgroundColor: '#1A1E2E' },
  modalStreamText: { fontSize: 11, fontWeight: '700', color: '#8E8EA8' },
  modalStreamTextActive: { color: '#00E5FF', fontWeight: '800' },
  customExamRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  customExamInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#2A2D40',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#FFFFFF',
    fontSize: 12,
  },
  customApplyBtn: { backgroundColor: '#00E5FF', paddingHorizontal: 12, borderRadius: 8, justifyContent: 'center' },
  customApplyText: { fontSize: 11, fontWeight: '900', color: '#0B0C12' },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161824',
    borderWidth: 1,
    borderColor: '#24263A',
    borderRadius: 9,
    padding: 11,
    marginBottom: 7,
  },
  modalOptionActive: { borderColor: '#00E5FF', backgroundColor: '#1A1E2E' },
  modalOptionLabel: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  modalOptionSub: { fontSize: 10, color: '#8E8EA8', marginTop: 2 },
});
