import React, { useState, useMemo } from 'react';
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
import { EXAM_TARGETS, SUBJECT_TOPICS, COMMON_SUBJECTS } from '../config/studyGuideData';
import { generateAndShareCheatSheetPdf } from '../services/pdfService';
import MarkingSimulatorModal from '../components/MarkingSimulatorModal';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const navigation = useNavigation();
  const {
    userStats,
    targetExam,
    setTargetExam,
    savedGuides,
    toggleSaveGuide,
  } = useUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [customExamInput, setCustomExamInput] = useState('');
  const [simulatorItem, setSimulatorItem] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExportPdf = async () => {
    try {
      setPdfLoading(true);
      const res = await generateAndShareCheatSheetPdf(
        selectedSubject === 'All' ? 'High-Yield Topics' : selectedSubject,
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

  // Flatten all topics
  const allTopics = useMemo(() => {
    const list = [];
    Object.entries(SUBJECT_TOPICS).forEach(([subj, topics]) => {
      topics.forEach((t) => {
        list.push({ ...t, subject: subj });
      });
    });
    return list;
  }, []);

  // Filtered topics based on search and subject
  const displayedTopics = useMemo(() => {
    let list = allTopics;
    if (selectedSubject !== 'All') {
      list = list.filter((t) => t.subject === selectedSubject);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          (t.aiBlindspots && t.aiBlindspots.some((b) => b.point.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [allTopics, selectedSubject, searchQuery]);

  // Current active exam label
  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  const handleOpenGuide = (guide) => {
    navigation.navigate('StudyGuideDetail', { guide });
  };

  const handleOpenAuditor = (mode = 'TOPIC', initialTopic = '', initialSubject = 'Physics') => {
    navigation.navigate('AIGapAuditor', {
      mode,
      initialTopic,
      initialSubject,
    });
  };

  const handleSelectExam = (examLabel) => {
    setTargetExam(examLabel);
    setTargetModalVisible(false);
  };

  const handleApplyCustomExam = () => {
    if (customExamInput.trim()) {
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

        {/* Target Exam Button */}
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
          <MaterialCommunityIcons name="chevron-down" size={18} color="#8E8EA8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Clean Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Catch What AI Misses</Text>
          <Text style={styles.heroDesc}>
            Generic AI leaves out critical edge cases, proof steps & marking rubrics.
            Audit your topic or notes before your exam.
          </Text>

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
        </View>

        {/* Clean 3-Feature Quick Tools Bar */}
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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#777799" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search any topic, formula, or concept..."
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

        {/* Clean Subject Filter Chips */}
        <View style={styles.subjectTabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectTabsScroll}>
            {['All', ...COMMON_SUBJECTS.filter((s) => s !== 'Other / Custom Subject')].map((subj) => {
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

        {/* Study Guides List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedSubject === 'All' ? 'Curated Exam Guides' : `${selectedSubject} Guides`}
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
                  <Text style={styles.topicSubjectText}>{topic.subject}</Text>
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
                    onPress={() => setSimulatorItem({
                      topic: topic.title,
                      subject: topic.subject,
                      marks: 5,
                      keyPoints: topic.coreConcepts || [],
                    })}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="calculator-variant-outline" size={14} color="#00D2FF" />
                    <Text style={styles.simulateTopicBtnText}>Simulate</Text>
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

      {/* Clean Exam Selection Modal */}
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
              <Text style={styles.modalTitle}>Select Target Exam</Text>
              <TouchableOpacity onPress={() => setTargetModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Works for all Competitive, Board, and College exams.
            </Text>

            {/* Custom Exam Input */}
            <View style={styles.customExamRow}>
              <TextInput
                style={styles.customExamInput}
                placeholder="Or type custom exam (e.g. CUET, GRE)..."
                placeholderTextColor="#777799"
                value={customExamInput}
                onChangeText={setCustomExamInput}
              />
              <TouchableOpacity
                style={styles.customExamApplyBtn}
                onPress={handleApplyCustomExam}
              >
                <Text style={styles.customExamApplyText}>Set</Text>
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
                      <Text style={[styles.modalOptionLabel, isSelected && styles.modalOptionLabelActive]}>
                        {target.label}
                      </Text>
                      <Text style={styles.modalOptionDesc} numberOfLines={1}>
                        {target.desc}
                      </Text>
                    </View>
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={18} color="#00D2FF" />
                    )}
                  </TouchableOpacity>
                );
              })}
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
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#8E8EA8',
    marginTop: 1,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  userBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD32A',
  },
  targetExamBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 42, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  targetExamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  targetExamText: {
    fontSize: 13,
    color: '#8E8EA8',
    marginLeft: 8,
  },
  targetExamHighlight: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  heroCard: {
    backgroundColor: '#13132B',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 13,
    color: '#A0A0C0',
    lineHeight: 18,
    marginBottom: 14,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C5CE7',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  heroBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
    gap: 6,
  },
  heroBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00D2FF',
  },
  quickToolsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  quickToolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    gap: 6,
  },
  quickToolText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DDDDEE',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13132B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#FFFFFF',
  },
  subjectTabsContainer: {
    marginBottom: 16,
  },
  subjectTabsScroll: {
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  subjectChipActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  subjectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8EA8',
  },
  subjectChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionCount: {
    fontSize: 13,
    color: '#8E8EA8',
    marginLeft: 6,
  },
  topicList: {
    gap: 12,
  },
  topicCard: {
    backgroundColor: '#121228',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  topicCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  topicSubjectText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A29BFE',
    textTransform: 'uppercase',
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  topicRelevance: {
    fontSize: 12,
    color: '#FFA502',
    marginBottom: 10,
  },
  blindspotPreviewBox: {
    backgroundColor: 'rgba(255, 71, 87, 0.08)',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4757',
    marginBottom: 12,
  },
  blindspotPreviewHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B81',
    marginBottom: 3,
  },
  blindspotPreviewBody: {
    fontSize: 12,
    color: '#CCD0E0',
    lineHeight: 16,
  },
  topicCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  openGuideBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C5CE7',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  openGuideBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  simulateTopicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
    gap: 4,
  },
  simulateTopicBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00D2FF',
  },
  auditTopicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
    gap: 4,
  },
  auditTopicBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00D2FF',
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
    maxWidth: 400,
    backgroundColor: '#121228',
    borderRadius: 20,
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
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#8E8EA8',
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
    paddingVertical: 8,
    fontSize: 13,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  customExamApplyBtn: {
    backgroundColor: '#00D2FF',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 10,
  },
  customExamApplyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A0A1A',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  modalOptionActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DDDDEE',
  },
  modalOptionLabelActive: {
    color: '#00D2FF',
  },
  modalOptionDesc: {
    fontSize: 11,
    color: '#8888AA',
    marginTop: 2,
  },
});
