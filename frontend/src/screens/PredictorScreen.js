import React, { useState, useMemo } from 'react';
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
import { EXAM_TARGETS } from '../config/studyGuideData';
import MarkingSimulatorModal from '../components/MarkingSimulatorModal';

const { width } = Dimensions.get('window');

const PREDICTOR_DATABASE = [
  {
    id: 'pred-1',
    subject: 'Physics',
    topic: 'Photoelectric Effect: Stopping Potential vs Frequency',
    probability: 92,
    probabilityTier: 'Guaranteed (90%+)',
    marks: 5,
    pastFrequency: 'Appeared in 4 of last 5 board/entrance cycles',
    trapSummary: 'Generic AI confuses intensity with frequency; fails to show threshold frequency intercept on frequency axis.',
    keyPoints: [
      'Einstein photoelectric equation stated: e*V_0 = h*nu - Phi_0 (1.5 marks)',
      'Graph plotted showing straight line with threshold frequency intercept nu_0 (2.0 marks)',
      'Slope of line equated to h/e to find Planck constant h (1.5 marks)',
    ],
  },
  {
    id: 'pred-2',
    subject: 'Chemistry',
    topic: 'Aldol Condensation vs Cannizzaro Reaction Distinction',
    probability: 88,
    probabilityTier: 'Guaranteed (90%+)',
    marks: 4,
    pastFrequency: 'Tested in almost every organic carbonyl section',
    trapSummary: 'Generic AI fails to state that absence of alpha-hydrogens is the mandatory trigger for Cannizzaro disproportionation.',
    keyPoints: [
      'Alpha-hydrogen presence creates enolate ion for Aldol (1.5 marks)',
      'Absence of alpha-hydrogen triggers self-redox Cannizzaro (1.5 marks)',
      'Balanced equation showing alcohol and carboxylate salt (1.0 mark)',
    ],
  },
  {
    id: 'pred-3',
    subject: 'Mathematics',
    topic: "Definite Integrals: King's Property 2I Step",
    probability: 85,
    probabilityTier: 'Frequent Trap (75%+)',
    marks: 6,
    pastFrequency: 'Appears in section C/D in CBSE 12th & JEE Main',
    trapSummary: 'Generic AI states property formula but skips the vital "2I" addition and forgets division by 2 at the end.',
    keyPoints: [
      'Define integral as I and apply f(a + b - x) (2.0 marks)',
      'Add original and transformed integral to form 2I (2.5 marks)',
      'Integrate constant integrand and divide by 2 for final result (1.5 marks)',
    ],
  },
  {
    id: 'pred-4',
    subject: 'Biology',
    topic: 'DNA Replication: Okazaki Fragments & RNA Primase',
    probability: 82,
    probabilityTier: 'Frequent Trap (75%+)',
    marks: 5,
    pastFrequency: 'High frequency in NEET & Board genetics units',
    trapSummary: 'Generic AI skips that DNA Polymerase requires RNA primer 3-OH terminus to initiate synthesis.',
    keyPoints: [
      'DNA polymerase cannot initiate de novo; requires RNA primer (2.0 marks)',
      'Unidirectional 5-prime to 3-prime synthesis creates lagging strand fragments (2.0 marks)',
      'DNA ligase joins Okazaki fragments via phosphodiester bonds (1.0 mark)',
    ],
  },
  {
    id: 'pred-5',
    subject: 'Computer Science',
    topic: 'Red-Black Tree: Maximum Rotations Bound Proof',
    probability: 78,
    probabilityTier: 'Frequent Trap (75%+)',
    marks: 5,
    pastFrequency: 'Core question in GATE & University algorithms',
    trapSummary: 'Generic AI claims rotations take O(log N) time, confusing recoloring propagation with bounded O(1) rotations.',
    keyPoints: [
      'Insertion requires at most 2 structural rotations (2.0 marks)',
      'Deletion requires at most 3 structural rotations (1.5 marks)',
      'Recoloring propagates up to O(log N) times without rotations (1.5 marks)',
    ],
  },
  {
    id: 'pred-6',
    subject: 'Economics',
    topic: 'Fiscal Deficit vs Primary Deficit & Legacy Debt',
    probability: 80,
    probabilityTier: 'Frequent Trap (75%+)',
    marks: 4,
    pastFrequency: 'Featured in CBSE 12th macroeconomics & UPSC GS3',
    trapSummary: 'Generic AI defines formulas but misses that zero primary deficit means borrowing is solely consumed by past interest.',
    keyPoints: [
      'Primary Deficit = Fiscal Deficit - Interest Payments (1.5 marks)',
      'Explain that zero primary deficit indicates all loans service past debt (1.5 marks)',
      'Detail impact on crowding out and capital formation (1.0 mark)',
    ],
  },
];

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

  const filteredQuestions = useMemo(() => {
    return PREDICTOR_DATABASE.filter((q) => {
      const matchTier = selectedTier === 'All' || q.probabilityTier.includes(selectedTier);
      const matchSub = selectedSubject === 'All' || q.subject === selectedSubject;
      return matchTier && matchSub;
    });
  }, [selectedTier, selectedSubject]);

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
          <Text style={styles.headerSub}>High-probability exam traps for {activeExamLabel}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Probability Tier Filter Chips */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {['All', 'Guaranteed', 'Frequent Trap'].map((tier) => {
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
                  <View style={[styles.probBadge, { backgroundColor: isHigh ? 'rgba(46, 213, 115, 0.12)' : 'rgba(255, 165, 2, 0.12)', borderColor: isHigh ? '#2ED573' : '#FFA502' }]}>
                    <Text style={[styles.probBadgeText, { color: isHigh ? '#2ED573' : '#FFA502' }]}>
                      {item.probability}% Probability
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTopic}>{item.topic}</Text>
                <Text style={styles.cardMarks}>{item.marks} Marks • {item.pastFrequency}</Text>

                {/* Trap Summary */}
                <View style={styles.trapBox}>
                  <Text style={styles.trapHeading}>⚠️ AI Blindspot Trap:</Text>
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
                    <Text style={styles.simulateBtnText}>Simulate Score</Text>
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
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D0D20',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backBtn: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 11,
    color: '#00D2FF',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  filterSection: {
    marginBottom: 14,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  filterChipActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8EA8',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  questionsList: {
    gap: 12,
  },
  card: {
    backgroundColor: '#121228',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectPill: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A29BFE',
    textTransform: 'uppercase',
  },
  probBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  probBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardTopic: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 20,
  },
  cardMarks: {
    fontSize: 12,
    color: '#8E8EA8',
    marginBottom: 10,
  },
  trapBox: {
    backgroundColor: 'rgba(255, 71, 87, 0.08)',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4757',
    marginBottom: 12,
  },
  trapHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B81',
    marginBottom: 2,
  },
  trapBody: {
    fontSize: 12,
    color: '#CCD0E0',
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
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
    gap: 4,
  },
  simulateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00D2FF',
  },
  auditBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C5CE7',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  auditBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
