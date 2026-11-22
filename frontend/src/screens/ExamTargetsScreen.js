import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';
import { useUser } from '../context/UserContext';
import { EXAM_TARGETS, HIGH_RISK_EXAM_VAULT } from '../config/studyGuideData';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const SUBJECT_FILTERS = ['All', 'Data Structures', 'Database Systems (DBMS)', 'Operating Systems'];

export default function ExamTargetsScreen() {
  const navigation = useNavigation();
  const { targetExam, setTargetExam, markGapMastered, awardCustomXp } = useUser();

  const [selectedSubject, setSelectedSubject] = useState('All');
  const [expandedCards, setExpandedCards] = useState({});
  const [masteredItems, setMasteredItems] = useState({});

  // Filter vault questions
  const filteredQuestions = useMemo(() => {
    return HIGH_RISK_EXAM_VAULT.filter((q) => {
      const matchExam = q.examTarget === targetExam || targetExam === 'GATE';
      const matchSub = selectedSubject === 'All' || q.subject === selectedSubject;
      return matchExam && matchSub;
    });
  }, [targetExam, selectedSubject]);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

  const masteredCount = Object.values(masteredItems).filter(Boolean).length;
  const totalCount = filteredQuestions.length;
  const readinessPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1A" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerBadge}>
            <MaterialCommunityIcons name="target" size={14} color="#00D2FF" />
            <Text style={styles.headerBadgeText}>EXAM FOCUS VAULT</Text>
          </View>
          <Text style={styles.headerTitle}>High-Risk Questions</Text>
          <Text style={styles.headerSubtitle}>
            Where generic AI & lecture notes miss points in exams
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Exam Target Selector Tabs */}
        <View style={styles.examTabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.examTabsScroll}>
            {EXAM_TARGETS.map((target) => {
              const isSelected = targetExam === target.id;
              return (
                <TouchableOpacity
                  key={target.id}
                  style={[styles.examTabPill, isSelected && styles.examTabPillActive]}
                  onPress={() => setTargetExam(target.id)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                    size={14}
                    color={isSelected ? '#00D2FF' : '#8888AA'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.examTabText, isSelected && styles.examTabTextActive]}>
                    {target.label.split(' ')[0]} ({target.weightage})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Readiness Meter Card */}
        <View style={styles.readinessCard}>
          <View style={styles.readinessTop}>
            <View>
              <Text style={styles.readinessTitle}>
                {EXAM_TARGETS.find((e) => e.id === targetExam)?.label || 'Target Exam'}
              </Text>
              <Text style={styles.readinessSub}>
                {masteredCount} of {totalCount} high-risk questions mastered
              </Text>
            </View>
            <View style={styles.readinessBadge}>
              <Text style={styles.readinessBadgeValue}>{readinessPercent}%</Text>
              <Text style={styles.readinessBadgeLabel}>Readiness</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(readinessPercent, 8)}%` },
              ]}
            />
          </View>
        </View>

        {/* Subject Filter Pills */}
        <View style={styles.subjectFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {SUBJECT_FILTERS.map((sub) => {
              const active = selectedSubject === sub;
              return (
                <TouchableOpacity
                  key={sub}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setSelectedSubject(sub)}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Question Vault List */}
        <View style={styles.questionsContainer}>
          {filteredQuestions.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="shield-check" size={48} color="#00D2FF" />
              <Text style={styles.emptyTitle}>All Caught Up!</Text>
              <Text style={styles.emptySub}>
                No pending high-risk questions for this filter. Switch targets or subjects above!
              </Text>
            </View>
          ) : (
            filteredQuestions.map((item) => {
              const isExpanded = !!expandedCards[item.id];
              const isMastered = !!masteredItems[item.id];

              return (
                <View
                  key={item.id}
                  style={[
                    styles.vaultCard,
                    isMastered && styles.vaultCardMastered,
                  ]}
                >
                  {/* Top Tags */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardBadgesRow}>
                      <View style={styles.subjectTag}>
                        <Text style={styles.subjectTagText}>{item.subject}</Text>
                      </View>
                      <View style={styles.marksTag}>
                        <Text style={styles.marksTagText}>{item.marks} Marks</Text>
                      </View>
                      <View
                        style={[
                          styles.trapBadge,
                          item.trapLevel.includes('CRITICAL') && { backgroundColor: 'rgba(255, 71, 87, 0.15)', borderColor: '#FF4757' },
                          item.trapLevel.includes('NUMERICAL') && { backgroundColor: 'rgba(255, 177, 66, 0.15)', borderColor: '#FFB142' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.trapBadgeText,
                            item.trapLevel.includes('CRITICAL') && { color: '#FF4757' },
                            item.trapLevel.includes('NUMERICAL') && { color: '#FFB142' },
                          ]}
                        >
                          {item.trapLevel}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.masterCheckbox}
                      onPress={() => toggleMaster(item.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialCommunityIcons
                        name={isMastered ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                        size={24}
                        color={isMastered ? '#2ED573' : '#666688'}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Title & Unit */}
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardUnit}>{item.unit}</Text>

                  {/* Common Student Mistake / Trap */}
                  <View style={styles.trapBox}>
                    <View style={styles.trapHeader}>
                      <MaterialCommunityIcons name="alert-decagram" size={16} color="#FF6B81" />
                      <Text style={styles.trapHeading}>Examiner Trap</Text>
                    </View>
                    <Text style={styles.trapText}>{item.trapDescription}</Text>
                  </View>

                  {/* Expand / Collapse Section */}
                  {isExpanded && (
                    <View style={styles.expandedSection}>
                      {/* What Generic AI Misses */}
                      <View style={styles.aiMissBox}>
                        <View style={styles.aiMissHeader}>
                          <MaterialCommunityIcons name="robot-confused" size={16} color="#FFA502" />
                          <Text style={styles.aiMissTitle}>What Generic AI Leaves Out</Text>
                        </View>
                        <Text style={styles.aiMissContent}>{item.aiBlindspot}</Text>
                      </View>

                      {/* Examiner Marking Rubric */}
                      <View style={styles.rubricBox}>
                        <View style={styles.rubricHeader}>
                          <MaterialCommunityIcons name="check-decagram" size={16} color="#2ED573" />
                          <Text style={styles.rubricTitle}>Examiner Full-Marks Rubric</Text>
                        </View>
                        {item.examinerRubric.map((point, idx) => (
                          <View key={idx} style={styles.rubricPointRow}>
                            <MaterialCommunityIcons
                              name="arrow-right-bold"
                              size={12}
                              color="#2ED573"
                              style={{ marginTop: 3, marginRight: 6 }}
                            />
                            <Text style={styles.rubricPointText}>{point}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Model Answer Snippet */}
                      <View style={styles.snippetBox}>
                        <Text style={styles.snippetLabel}>Exam-Ready Phrasing:</Text>
                        <Text style={styles.snippetText}>"{item.modelAnswerSnippet}"</Text>
                      </View>
                    </View>
                  )}

                  {/* Card Actions */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.expandButton}
                      onPress={() => toggleExpand(item.id)}
                    >
                      <Text style={styles.expandButtonText}>
                        {isExpanded ? 'Hide Rubric' : 'View AI Blindspot & Rubric'}
                      </Text>
                      <MaterialCommunityIcons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#00D2FF"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.auditNowButton}
                      onPress={() => handleAuditQuestion(item)}
                    >
                      <MaterialCommunityIcons name="shield-search" size={15} color="#FFFFFF" />
                      <Text style={styles.auditNowText}>AI Deep Audit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
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
    paddingBottom: 16,
    backgroundColor: 'rgba(12, 12, 26, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00D2FF',
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8E8EA8',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  examTabsContainer: {
    marginBottom: 16,
  },
  examTabsScroll: {
    gap: 8,
  },
  examTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 20, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  examTabPillActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.25)',
    borderColor: '#00D2FF',
  },
  examTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8EA8',
  },
  examTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  readinessCard: {
    backgroundColor: 'rgba(20, 20, 45, 0.9)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  readinessTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  readinessTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  readinessSub: {
    fontSize: 12,
    color: '#8E8EA8',
    marginTop: 3,
  },
  readinessBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
  },
  readinessBadgeValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00D2FF',
  },
  readinessBadgeLabel: {
    fontSize: 10,
    color: '#A0E8FF',
    textTransform: 'uppercase',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00D2FF',
    borderRadius: 4,
  },
  subjectFilterContainer: {
    marginBottom: 18,
  },
  filterScroll: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  filterPillActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#8B5CF6',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8EA8',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  questionsContainer: {
    gap: 14,
  },
  vaultCard: {
    backgroundColor: 'rgba(18, 18, 38, 0.95)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  vaultCardMastered: {
    borderColor: 'rgba(46, 213, 115, 0.4)',
    backgroundColor: 'rgba(18, 28, 32, 0.95)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  subjectTag: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subjectTagText: {
    fontSize: 11,
    color: '#A29BFE',
    fontWeight: '600',
  },
  marksTag: {
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  marksTagText: {
    fontSize: 11,
    color: '#00D2FF',
    fontWeight: '700',
  },
  trapBadge: {
    backgroundColor: 'rgba(255, 71, 87, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },
  trapBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF6B81',
    letterSpacing: 0.4,
  },
  masterCheckbox: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 4,
  },
  cardUnit: {
    fontSize: 12,
    color: '#8E8EA8',
    marginBottom: 12,
  },
  trapBox: {
    backgroundColor: 'rgba(255, 71, 87, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4757',
    marginBottom: 12,
  },
  trapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trapHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B81',
    marginLeft: 6,
  },
  trapText: {
    fontSize: 13,
    color: '#DDDDEE',
    lineHeight: 18,
  },
  expandedSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    paddingTop: 12,
    marginTop: 6,
    gap: 12,
  },
  aiMissBox: {
    backgroundColor: 'rgba(255, 165, 2, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFA502',
  },
  aiMissHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiMissTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFA502',
    marginLeft: 6,
  },
  aiMissContent: {
    fontSize: 13,
    color: '#EEEEFF',
    lineHeight: 19,
  },
  rubricBox: {
    backgroundColor: 'rgba(46, 213, 115, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2ED573',
  },
  rubricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rubricTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2ED573',
    marginLeft: 6,
  },
  rubricPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  rubricPointText: {
    fontSize: 13,
    color: '#EEEEFF',
    flex: 1,
    lineHeight: 18,
  },
  snippetBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 10,
  },
  snippetLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00D2FF',
    marginBottom: 4,
  },
  snippetText: {
    fontSize: 12,
    color: '#A29BFE',
    fontStyle: 'italic',
    lineHeight: 17,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  expandButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00D2FF',
    marginRight: 4,
  },
  auditNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  auditNowText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'rgba(20, 20, 45, 0.6)',
    borderRadius: 20,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#8E8EA8',
    textAlign: 'center',
    marginTop: 6,
  },
});
