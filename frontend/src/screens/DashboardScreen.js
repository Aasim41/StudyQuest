import React, { useState, useMemo, useEffect } from 'react';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [trendsModalVisible, setTrendsModalVisible] = useState(false);
  const [customExamInput, setCustomExamInput] = useState('');
  const [simulatorItem, setSimulatorItem] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showFullPlan, setShowFullPlan] = useState(false);

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
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1A" />

      {/* Clean Minimal Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.brandTitle}>StudyQuest</Text>
            <Text style={styles.brandSubtitle}>AI Exam Blindspot Auditor</Text>
          </View>

          <View style={styles.userBadge}>
            <MaterialCommunityIcons name="star-shooting" size={15} color="#FFD32A" />
            <Text style={styles.userBadgeText}>{userStats?.xp || 0} XP</Text>
          </View>
        </View>

        {/* Dynamic Target Exam Switcher */}
        <TouchableOpacity
          style={styles.targetExamBar}
          onPress={() => setTargetModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.targetExamLeft}>
            <MaterialCommunityIcons name="target" size={17} color="#00D2FF" />
            <Text style={styles.targetExamText} numberOfLines={1}>
              Target: <Text style={styles.targetExamHighlight}>{activeExamLabel}</Text>
            </Text>
          </View>
          <View style={styles.changeBadge}>
            <Text style={styles.changeBadgeText}>Change</Text>
            <MaterialCommunityIcons name="chevron-down" size={15} color="#00D2FF" />
          </View>
        </TouchableOpacity>

        {/* Dynamic 2026-27 Pattern & Syllabus Freshness Indicator */}
        <View style={styles.syllabusFreshnessBar}>
          <View style={styles.syllabusFreshnessLeft}>
            <MaterialCommunityIcons name="shield-check" size={14} color="#2ED573" />
            <Text style={styles.syllabusFreshnessText} numberOfLines={1}>
              2026-27 Pattern Verified • <Text style={{ color: '#00D2FF' }}>Live Curation</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.trendsBtn}
            onPress={() => setTrendsModalVisible(true)}
            activeOpacity={0.8}
          >
            {isRefreshingSyllabus ? (
              <ActivityIndicator size="small" color="#00D2FF" style={{ transform: [{ scale: 0.7 }] }} />
            ) : (
              <MaterialCommunityIcons name="trending-up" size={13} color="#00D2FF" />
            )}
            <Text style={styles.trendsBtnText}>
              {isRefreshingSyllabus ? 'Syncing...' : 'Trends'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Curated Study Plan Card */}
        <View style={styles.planCard}>
          <View style={styles.planCardHeader}>
            <View style={styles.planHeaderLeft}>
              <View style={styles.planIconBox}>
                <MaterialCommunityIcons name="calendar-check-outline" size={18} color="#00D2FF" />
              </View>
              <View>
                <Text style={styles.planTitle}>Curated Study Plan</Text>
                <Text style={styles.planSubtitle}>
                  {activeExamLabel} • {completedPlanCount}/{planItems.length} Milestones Done
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.planToggleBtn}
              onPress={() => setShowFullPlan((prev) => !prev)}
            >
              <Text style={styles.planToggleText}>{showFullPlan ? 'Collapse' : 'View Plan'}</Text>
              <MaterialCommunityIcons
                name={showFullPlan ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#00D2FF"
              />
            </TouchableOpacity>
          </View>

          {/* Plan Progress Bar */}
          <View style={styles.planProgressBg}>
            <View style={[styles.planProgressFill, { width: `${planProgressPercent}%` }]} />
          </View>

          {/* Active / Current Milestones */}
          <View style={styles.planMilestonesList}>
            {(showFullPlan ? planItems : planItems.slice(0, 2)).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.planItemRow, item.isCompleted && styles.planItemRowCompleted]}
                onPress={() => togglePlanItemCompleted(item.id)}
                activeOpacity={0.7}
              >
                <TouchableOpacity
                  style={[styles.checkbox, item.isCompleted && styles.checkboxChecked]}
                  onPress={() => togglePlanItemCompleted(item.id)}
                >
                  {item.isCompleted && (
                    <MaterialCommunityIcons name="check" size={13} color="#07070F" />
                  )}
                </TouchableOpacity>

                <View style={styles.planItemInfo}>
                  <View style={styles.planItemBadges}>
                    <Text style={styles.planDayBadge}>{item.day || item.week}</Text>
                    <Text style={styles.planSubjectBadge}>{item.subject}</Text>
                    {item.priority === 'CRITICAL' && (
                      <Text style={styles.planPriorityBadge}>Critical</Text>
                    )}
                  </View>
                  <Text
                    style={[styles.planItemTopic, item.isCompleted && styles.planItemTopicDone]}
                    numberOfLines={1}
                  >
                    {item.topic}
                  </Text>
                  <Text style={styles.planItemFocus} numberOfLines={2}>
                    🎯 {item.focus}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Flow & Regain Focus Power Duo */}
        <View style={styles.powerDuoRow}>
          <TouchableOpacity
            style={styles.powerDuoCardFlow}
            onPress={() => navigation.navigate('Flow')}
            activeOpacity={0.8}
          >
            <View style={styles.powerDuoHeader}>
              <MaterialCommunityIcons name="play-circle" size={18} color="#00E5FF" />
              <View style={styles.flowMiniBadge}>
                <Text style={styles.flowMiniBadgeText}>0 ADS • 0 SHORTS</Text>
              </View>
            </View>
            <Text style={styles.powerDuoTitle}>Flow Study Player</Text>
            <Text style={styles.powerDuoSub} numberOfLines={1}>
              Distraction-free lectures for {activeExamLabel.split(' ')[0]}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.powerDuoCardRegain}
            onPress={() => navigation.navigate('Regain')}
            activeOpacity={0.8}
          >
            <View style={styles.powerDuoHeader}>
              <MaterialCommunityIcons name="shield-lock" size={18} color="#FF4757" />
              <View style={styles.regainMiniBadge}>
                <Text style={styles.regainMiniBadgeText}>STRICT FOCUS</Text>
              </View>
            </View>
            <Text style={styles.powerDuoTitle}>Regain Shield</Text>
            <Text style={styles.powerDuoSub} numberOfLines={1}>
              Deep work timer & Reels blocker
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3-Feature Quick Tools Bar */}
        <View style={styles.quickToolsRow}>
          <TouchableOpacity
            style={styles.quickToolBtn}
            onPress={() => navigation.navigate('Flashcards')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="cards-outline" size={17} color="#A29BFE" />
            <Text style={styles.quickToolText}>60s Deck</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickToolBtn}
            onPress={() => navigation.navigate('Predictor')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="radar" size={17} color="#00D2FF" />
            <Text style={styles.quickToolText}>Exam Radar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickToolBtn}
            onPress={handleExportPdf}
            disabled={pdfLoading}
            activeOpacity={0.8}
          >
            {pdfLoading ? (
              <ActivityIndicator size="small" color="#FFD32A" />
            ) : (
              <>
                <MaterialCommunityIcons name="file-pdf-box" size={17} color="#FFD32A" />
                <Text style={styles.quickToolText}>Cheat Sheet</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Fast Action Buttons */}
        <View style={styles.heroActionsRow}>
          <TouchableOpacity
            style={styles.heroBtnPrimary}
            onPress={() => handleOpenAuditor('TOPIC')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#FFFFFF" />
            <Text style={styles.heroBtnPrimaryText}>Audit a Topic</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.heroBtnSecondary}
            onPress={() => handleOpenAuditor('ANSWER')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="file-document-edit-outline" size={16} color="#00D2FF" />
            <Text style={styles.heroBtnSecondaryText}>Check Notes</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#777799" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeExamLabel} topics, formulas...`}
            placeholderTextColor="#666688"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#8E8EA8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Dynamically Curated Subject Filter Chips */}
        <View style={styles.subjectTabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectTabsScroll}
          >
            {examSubjects.map((subj) => {
              const isSelected = selectedSubject === subj;
              return (
                <TouchableOpacity
                  key={subj}
                  style={[styles.subjectChip, isSelected && styles.subjectChipActive]}
                  onPress={() => setSelectedSubject(subj)}
                >
                  <Text style={[styles.subjectChipText, isSelected && styles.subjectChipTextActive]}>
                    {subj}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Curated Study Guides List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedSubject === 'All'
              ? `${activeExamLabel} Curated Guides`
              : `${selectedSubject} Guides`}
          </Text>
          <Text style={styles.sectionCount}>({displayedTopics.length})</Text>
        </View>

        <View style={styles.topicList}>
          {displayedTopics.map((topic) => {
            const isSaved = savedGuides.some(
              (g) => (g.id && g.id === topic.id) || g.title === topic.title
            );

            return (
              <View key={topic.id} style={styles.topicCard}>
                <View style={styles.topicCardTop}>
                  <View style={styles.topicSubjectPill}>
                    <Text style={styles.topicSubjectText}>{topic.subject}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleSaveGuide(topic)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons
                      name={isSaved ? 'bookmark' : 'bookmark-outline'}
                      size={20}
                      color={isSaved ? '#00D2FF' : '#777799'}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicRelevance}>{topic.examRelevance}</Text>

                {topic.aiBlindspots && topic.aiBlindspots[0] && (
                  <View style={styles.blindspotPreviewBox}>
                    <Text style={styles.blindspotPreviewHeading}>
                      ⚠️ AI Blindspot: {topic.aiBlindspots[0].point}
                    </Text>
                    <Text style={styles.blindspotPreviewBody} numberOfLines={2}>
                      {topic.aiBlindspots[0].whatAiMisses}
                    </Text>
                  </View>
                )}

                <View style={styles.topicCardActions}>
                  <TouchableOpacity
                    style={styles.openGuideBtn}
                    onPress={() => handleOpenGuide(topic)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.openGuideBtnText}>Guide</Text>
                    <MaterialCommunityIcons name="arrow-right" size={14} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.simulateTopicBtn}
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
                    <MaterialCommunityIcons
                      name="calculator-variant-outline"
                      size={14}
                      color="#00D2FF"
                    />
                    <Text style={styles.simulateTopicBtnText}>Rubric</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.auditTopicBtn}
                    onPress={() =>
                      handleOpenAuditor('TOPIC', topic.title, topic.subject)
                    }
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="shield-search" size={14} color="#A29BFE" />
                    <Text style={styles.auditTopicBtnText}>Audit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Clean Target Exam Selector Modal */}
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
            <Text style={styles.modalSubtitle}>
              Curates your plan, topics, rubrics & predictor instantly.
            </Text>

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
                      <Text style={styles.modalOptionDesc} numberOfLines={2}>
                        {target.desc}
                      </Text>
                    </View>
                    {isSelected && (
                      <MaterialCommunityIcons name="check-circle" size={20} color="#00D2FF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 2026-27 Syllabus & Exam Trends Modal */}
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="trending-up" size={20} color="#00D2FF" />
                <Text style={styles.modalTitle}>Latest Pattern & Trends</Text>
              </View>
              <TouchableOpacity onPress={() => setTrendsModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              {activeExamLabel} • 2026-27 Official Syllabus & Trend Analysis
            </Text>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {/* Official Marking Scheme & Weightage */}
              <View style={styles.trendSectionBox}>
                <View style={styles.trendSectionHeader}>
                  <MaterialCommunityIcons name="certificate" size={16} color="#FFD32A" />
                  <Text style={styles.trendSectionTitle}>Official Evaluation Scheme</Text>
                </View>
                <Text style={styles.trendSectionText}>
                  {EXAM_TARGETS.find((e) => e.label === activeExamLabel || e.id === targetExam)?.markingScheme ||
                    'Strict step-marking, formula statement, and diagram labeling criteria.'}
                </Text>
                <View style={styles.trendWeightageRow}>
                  <Text style={styles.trendWeightageLabel}>Weightage / Split:</Text>
                  <Text style={styles.trendWeightageValue}>
                    {EXAM_TARGETS.find((e) => e.label === activeExamLabel || e.id === targetExam)?.weightage || 'Theory + Practicals'}
                  </Text>
                </View>
              </View>

              {/* Dynamic Live AI Trends or High-Yield Core Areas */}
              <View style={styles.trendSectionBox}>
                <View style={styles.trendSectionHeader}>
                  <MaterialCommunityIcons name="lightning-bolt" size={16} color="#00D2FF" />
                  <Text style={styles.trendSectionTitle}>High-Yield Trend Alerts</Text>
                </View>
                {syllabusTrendData?.trendingTopics && syllabusTrendData.trendingTopics.length > 0 ? (
                  syllabusTrendData.trendingTopics.map((item, idx) => (
                    <View key={idx} style={styles.trendItemRow}>
                      <MaterialCommunityIcons name="chevron-right" size={14} color="#00D2FF" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.trendItemTitle}>{item.topic}</Text>
                        <Text style={styles.trendItemReason}>{item.reason}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View>
                    <View style={styles.trendItemRow}>
                      <MaterialCommunityIcons name="check-circle-outline" size={14} color="#2ED573" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.trendItemTitle}>Step-Marking & Derivation Priority</Text>
                        <Text style={styles.trendItemReason}>
                          Evaluators penalize missing SI units, formula declarations, and intermediate steps.
                        </Text>
                      </View>
                    </View>
                    <View style={styles.trendItemRow}>
                      <MaterialCommunityIcons name="check-circle-outline" size={14} color="#2ED573" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.trendItemTitle}>Internal Choice Optimization</Text>
                        <Text style={styles.trendItemReason}>
                          Sectional choices allow strategic focus on high-confidence questions.
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Live Sync Action */}
              <TouchableOpacity
                style={styles.syncTrendsBtn}
                onPress={() => refreshSyllabusData(targetExam)}
                disabled={isRefreshingSyllabus}
                activeOpacity={0.8}
              >
                {isRefreshingSyllabus ? (
                  <ActivityIndicator size="small" color="#07070F" />
                ) : (
                  <MaterialCommunityIcons name="cloud-sync" size={16} color="#07070F" />
                )}
                <Text style={styles.syncTrendsBtnText}>
                  {isRefreshingSyllabus ? 'Syncing Latest 2026-27 Trends...' : 'Check For Fresh 2026-27 Trends'}
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
    backgroundColor: '#0A0A1A',
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#0D0D20',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    color: '#00D2FF',
    fontSize: 11,
    fontWeight: '700',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 211, 42, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 211, 42, 0.25)',
  },
  userBadgeText: {
    color: '#FFD32A',
    fontSize: 12,
    fontWeight: '800',
  },
  targetExamBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
  },
  targetExamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  targetExamText: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  targetExamHighlight: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  changeBadgeText: {
    color: '#00D2FF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: 'rgba(16, 16, 36, 0.95)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
    marginBottom: 16,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  planIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  planSubtitle: {
    color: '#00D2FF',
    fontSize: 11,
    fontWeight: '600',
  },
  planToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  planToggleText: {
    color: '#00D2FF',
    fontSize: 11,
    fontWeight: '700',
  },
  planProgressBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  planProgressFill: {
    height: '100%',
    backgroundColor: '#00D2FF',
    borderRadius: 3,
  },
  planMilestonesList: {
    gap: 8,
  },
  planItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 10,
  },
  planItemRowCompleted: {
    opacity: 0.6,
    backgroundColor: 'rgba(0, 210, 255, 0.03)',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#00D2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#00D2FF',
  },
  planItemInfo: {
    flex: 1,
  },
  planItemBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  planDayBadge: {
    color: '#A29BFE',
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: 'rgba(162, 155, 254, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  planSubjectBadge: {
    color: '#00D2FF',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  planPriorityBadge: {
    color: '#FF6B6B',
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  planItemTopic: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  planItemTopicDone: {
    textDecorationLine: 'line-through',
    color: '#8E8EA8',
  },
  planItemFocus: {
    color: '#AAAAAA',
    fontSize: 11,
    lineHeight: 15,
  },
  quickToolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  quickToolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 6,
  },
  quickToolText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  heroBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C5CE7',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  heroBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  heroBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  heroBtnSecondaryText: {
    color: '#00D2FF',
    fontSize: 13,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  subjectTabsContainer: {
    marginBottom: 16,
  },
  subjectTabsScroll: {
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  subjectChipActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    borderColor: '#00D2FF',
  },
  subjectChipText: {
    color: '#8E8EA8',
    fontSize: 12,
    fontWeight: '700',
  },
  subjectChipTextActive: {
    color: '#00D2FF',
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionCount: {
    color: '#777799',
    fontSize: 13,
    fontWeight: '600',
  },
  topicList: {
    gap: 12,
  },
  topicCard: {
    backgroundColor: 'rgba(16, 16, 36, 0.9)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  topicCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicSubjectPill: {
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  topicSubjectText: {
    color: '#00D2FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topicTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  topicRelevance: {
    color: '#777799',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 10,
  },
  blindspotPreviewBox: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  blindspotPreviewHeading: {
    color: '#FF6B6B',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
  },
  blindspotPreviewBody: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    lineHeight: 16,
  },
  topicCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  openGuideBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C5CE7',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  openGuideBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  simulateTopicBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  simulateTopicBtnText: {
    color: '#00D2FF',
    fontSize: 12,
    fontWeight: '700',
  },
  auditTopicBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(162, 155, 254, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(162, 155, 254, 0.3)',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  auditTopicBtnText: {
    color: '#A29BFE',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0E0E22',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#777799',
    fontSize: 12,
    marginBottom: 14,
  },
  customExamRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  customExamInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    color: '#FFFFFF',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  customExamApplyBtn: {
    backgroundColor: '#00D2FF',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customExamApplyText: {
    color: '#07070F',
    fontSize: 12,
    fontWeight: '800',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalOptionActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    borderColor: '#00D2FF',
  },
  modalOptionContent: {
    flex: 1,
    marginRight: 10,
  },
  modalOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  modalOptionLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOptionLabelActive: {
    color: '#00D2FF',
    fontWeight: '800',
  },
  modalCategoryBadge: {
    color: '#8E8EA8',
    fontSize: 9,
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  modalOptionDesc: {
    color: '#777799',
    fontSize: 11,
    lineHeight: 15,
  },
});
