import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import {
  EXAM_TARGETS,
  getCuratedPredictorQuestionsForExam,
  getCuratedSubjectsForExam,
} from '../config/studyGuideData';
import MarkingSimulatorModal from '../components/MarkingSimulatorModal';

const { width } = Dimensions.get('window');

export default function PredictorScreen() {
  const navigation = useNavigation();
  const { targetExam } = useUser();

  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [simulatorItem, setSimulatorItem] = useState(null);

  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  // Dynamically curated subjects for the active exam
  const examSubjects = useMemo(() => {
    return ['All', ...getCuratedSubjectsForExam(targetExam)];
  }, [targetExam]);

  useEffect(() => {
    if (selectedSubject !== 'All' && !examSubjects.includes(selectedSubject)) {
      setSelectedSubject('All');
    }
  }, [targetExam, examSubjects]);

  // Curated questions for this specific exam
  const allQuestions = useMemo(() => {
    return getCuratedPredictorQuestionsForExam(targetExam);
  }, [targetExam]);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchTier = selectedTier === 'All' || q.probabilityTier.includes(selectedTier);
      const matchSub = selectedSubject === 'All' || q.subject === selectedSubject;
      return matchTier && matchSub;
    });
  }, [allQuestions, selectedTier, selectedSubject]);

  const handleAudit = (item) => {
    navigation.navigate('AIGapAuditor', {
      initialTopic: item.topic,
      initialSubject: item.subject,
      mode: 'TOPIC',
      autoAudit: true,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="chevron-left" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Question Predictor Radar</Text>
          <Text style={styles.headerSub}>5-Year high-yield recurrence for {activeExamLabel}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Probability Tier Filter Chips */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {['All', 'Guaranteed', 'High Recurrence', 'Frequent Trap'].map((tier) => {
              const active = selectedTier === tier;
              return (
                <TouchableOpacity
                  key={tier}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedTier(tier)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {tier}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Dynamic Subject Filters */}
        <View style={styles.subjectFilterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
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
        </View>

        {/* Question Cards */}
        <View style={styles.questionsList}>
          {filteredQuestions.map((item) => {
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
                      {
                        backgroundColor: isHigh ? 'rgba(46, 213, 115, 0.12)' : 'rgba(255, 165, 2, 0.12)',
                        borderColor: isHigh ? '#2ED573' : '#FFA502',
                      },
                    ]}
                  >
                    <Text style={[styles.probBadgeText, { color: isHigh ? '#2ED573' : '#FFA502' }]}>
                      {item.probability}% Probability
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTopic}>{item.topic}</Text>
                <Text style={styles.cardMarks}>{item.marks} Marks • {item.pastFrequency}</Text>

                {/* Trap Summary */}
                <View style={styles.trapBox}>
                  <Text style={styles.trapHeading}>⚠️ Exam Blindspot Trap:</Text>
                  <Text style={styles.trapBody}>{item.trapSummary}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.simulateBtn}
                    onPress={() => setSimulatorItem(item)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="calculator-variant-outline" size={15} color="#00D2FF" />
                    <Text style={styles.simulateBtnText}>Rubric Simulator</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.auditBtn}
                    onPress={() => handleAudit(item)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="lightning-bolt" size={15} color="#FFFFFF" />
                    <Text style={styles.auditBtnText}>Deep Audit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Interactive Simulator Modal */}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#0D0D20',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  headerSub: {
    color: '#00D2FF',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingTop: 14,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginBottom: 8,
  },
  subjectFilterSection: {
    marginBottom: 16,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    borderColor: '#00D2FF',
  },
  filterChipText: {
    color: '#777799',
    fontSize: 11,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#00D2FF',
    fontWeight: '800',
  },
  subChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  subChipActive: {
    backgroundColor: 'rgba(162, 155, 254, 0.15)',
    borderColor: '#A29BFE',
  },
  subChipText: {
    color: '#8E8EA8',
    fontSize: 11,
    fontWeight: '600',
  },
  subChipTextActive: {
    color: '#A29BFE',
    fontWeight: '800',
  },
  questionsList: {
    gap: 12,
  },
  card: {
    backgroundColor: 'rgba(16, 16, 36, 0.9)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectPill: {
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectPillText: {
    color: '#00D2FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  probBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  probBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardTopic: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardMarks: {
    color: '#777799',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 10,
  },
  trapBox: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  trapHeading: {
    color: '#FF6B6B',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
  },
  trapBody: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  simulateBtn: {
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
  simulateBtnText: {
    color: '#00D2FF',
    fontSize: 12,
    fontWeight: '700',
  },
  auditBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C5CE7',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  auditBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
