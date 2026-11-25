import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Share,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { generateAndShareCheatSheetPdf } from '../services/pdfService';
import MarkingSimulatorModal from '../components/MarkingSimulatorModal';
import { gsapTabTransition } from '../utils/gsapAnim';

export default function StudyGuideDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { toggleSaveGuide, savedGuides, awardCustomXp } = useUser();

  const guide = route.params?.guide || {
    title: 'Photoelectric Effect & Stopping Potential',
    subject: 'Physics',
    summary: 'Emission of electrons when electromagnetic radiation impinges on a material.',
    examRelevance: 'High Probability Exam Topic',
    aiBlindspots: [],
    coreConcepts: [],
    examQuestions: [],
    quiz: [],
  };

  const isSaved = savedGuides.some((g) => (g.id && g.id === guide.id) || g.title === guide.title);

  // 4 Clean Card Tabs: 'concepts' | 'blindspots' | 'pyqs' | 'quiz'
  const [activeTab, setActiveTab] = useState('concepts');
  const tabAnim = useRef(new Animated.Value(1)).current;

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [revealedQuiz, setRevealedQuiz] = useState({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const [simulatorQuestion, setSimulatorQuestion] = useState(null);

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    gsapTabTransition(tabAnim);
    setActiveTab(tab);
  };

  const handleSelectOption = (qIdx, optIdx, isCorrect) => {
    if (revealedQuiz[qIdx]) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    setRevealedQuiz((prev) => ({ ...prev, [qIdx]: true }));
    if (isCorrect) {
      awardCustomXp(25, 'Correct Gap Quiz Answer');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `StudyQuest Guide: ${guide.title} (${guide.subject})`,
      });
    } catch (e) {}
  };

  const handleExportPdf = async () => {
    try {
      setPdfLoading(true);
      const res = await generateAndShareCheatSheetPdf(guide.subject || 'Subject', 'Exam Guide', [guide]);
      if (!res.success) {
        Alert.alert('PDF Export', res.error || 'Could not export PDF.');
      }
    } catch (e) {
      Alert.alert('Export Error', 'Failed to generate PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C12" />

      {/* Minimal Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerMeta}>
            <Text style={styles.headerSubject} numberOfLines={1}>{guide.subject}</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{guide.title}</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => toggleSaveGuide(guide)}>
              <MaterialCommunityIcons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isSaved ? '#00E5FF' : '#FFFFFF'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleExportPdf} disabled={pdfLoading}>
              {pdfLoading ? (
                <ActivityIndicator size="small" color="#FFD32A" />
              ) : (
                <MaterialCommunityIcons name="file-pdf-box" size={18} color="#FFD32A" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
              <MaterialCommunityIcons name="share-variant-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 Segmented Card Tabs */}
        <View style={styles.cardTabsRow}>
          {[
            { id: 'concepts', label: 'Concepts' },
            { id: 'blindspots', label: `Traps (${(guide.aiBlindspots || []).length})` },
            { id: 'pyqs', label: 'PYQ Keys' },
            { id: 'quiz', label: 'Quiz' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.cardTab, active && styles.cardTabActive]}
                onPress={() => switchTab(tab.id)}
              >
                <Text style={[styles.cardTabText, active && styles.cardTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: tabAnim, transform: [{ scale: tabAnim }] }}
      >
        {/* TAB 1: CONCEPTS & FORMULAS */}
        {activeTab === 'concepts' && (
          <View style={styles.tabBody}>
            <View style={styles.card}>
              <Text style={styles.cardHeading}>{guide.title}</Text>
              <Text style={styles.cardSummary}>{guide.summary}</Text>
              {guide.examRelevance && (
                <Text style={styles.relevanceText}>{guide.examRelevance}</Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionLabel}>CORE FORMULAS & CONCEPTS</Text>
              {(guide.coreConcepts || []).map((cc, i) => (
                <View key={i} style={styles.conceptRow}>
                  <Text style={styles.conceptIndex}>{i + 1}.</Text>
                  <Text style={styles.conceptText}>{cc}</Text>
                </View>
              ))}
            </View>

            {/* Direct Action Bridges */}
            <View style={styles.bridgeRow}>
              <TouchableOpacity
                style={styles.bridgeBtnCyan}
                onPress={() => navigation.navigate('Flow', { searchQuery: guide.title })}
              >
                <MaterialCommunityIcons name="play-circle" size={16} color="#0B0C12" />
                <Text style={styles.bridgeBtnCyanText}>Watch in Flow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bridgeBtnDark}
                onPress={() =>
                  navigation.navigate('AIGapAuditor', {
                    mode: 'TOPIC',
                    initialTopic: guide.title,
                    initialSubject: guide.subject,
                  })
                }
              >
                <MaterialCommunityIcons name="shield-search" size={16} color="#00E5FF" />
                <Text style={styles.bridgeBtnDarkText}>Deep Audit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 2: EXAMINER BLINDSPOTS */}
        {activeTab === 'blindspots' && (
          <View style={styles.tabBody}>
            {(guide.aiBlindspots || []).map((item, idx) => (
              <View key={idx} style={styles.card}>
                <Text style={styles.blindspotTitle}>{idx + 1}. {item.point}</Text>
                <View style={styles.omissionBox}>
                  <Text style={styles.omissionLabel}>Omission Risk</Text>
                  <Text style={styles.omissionText}>{item.whatAiMisses}</Text>
                </View>
                <View style={styles.rubricBox}>
                  <Text style={styles.rubricLabel}>Marking Key</Text>
                  <Text style={styles.rubricText}>{item.examinerRubric}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: PYQ QUESTIONS & SCORING KEYS */}
        {activeTab === 'pyqs' && (
          <View style={styles.tabBody}>
            {(guide.examQuestions || []).map((eq, qi) => (
              <View key={qi} style={styles.card}>
                <View style={styles.qHeadRow}>
                  <Text style={styles.qText}>Q{qi + 1}: {eq.question}</Text>
                  <Text style={styles.qMarks}>{eq.marks}M</Text>
                </View>

                <Text style={styles.sectionLabel}>REQUIRED SCORING STEPS</Text>
                {(eq.keyPoints || []).map((kp, kpi) => (
                  <View key={kpi} style={styles.kpRow}>
                    <MaterialCommunityIcons name="check" size={14} color="#00E676" />
                    <Text style={styles.kpText}>{kp}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.simBtn}
                  onPress={() => setSimulatorQuestion(eq)}
                >
                  <MaterialCommunityIcons name="calculator-variant-outline" size={15} color="#00E5FF" />
                  <Text style={styles.simBtnText}>Open Score Simulator</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* TAB 4: QUICK QUIZ */}
        {activeTab === 'quiz' && (
          <View style={styles.tabBody}>
            {(guide.quiz || []).map((q, qIndex) => {
              const hasAnswered = !!revealedQuiz[qIndex];
              const chosen = selectedAnswers[qIndex];

              return (
                <View key={qIndex} style={styles.card}>
                  <Text style={styles.quizQ}>{qIndex + 1}. {q.question}</Text>
                  <View style={styles.optStack}>
                    {q.options.map((opt, oIndex) => {
                      const isCorrect = oIndex === q.correctIndex;
                      const isChosen = chosen === oIndex;

                      let btnStyle = styles.optBtn;
                      let txtStyle = styles.optText;
                      if (hasAnswered) {
                        if (isCorrect) {
                          btnStyle = [styles.optBtn, styles.optCorrect];
                          txtStyle = [styles.optText, { color: '#00E676', fontWeight: '800' }];
                        } else if (isChosen) {
                          btnStyle = [styles.optBtn, styles.optWrong];
                          txtStyle = [styles.optText, { color: '#FF4757', fontWeight: '800' }];
                        }
                      }

                      return (
                        <TouchableOpacity
                          key={oIndex}
                          style={btnStyle}
                          disabled={hasAnswered}
                          onPress={() => handleSelectOption(qIndex, oIndex, isCorrect)}
                        >
                          <Text style={txtStyle}>{opt}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {hasAnswered && (
                    <View style={styles.expBox}>
                      <Text style={styles.expText}>{q.explanation}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 48 }} />
      </Animated.ScrollView>

      {simulatorQuestion && (
        <MarkingSimulatorModal
          visible={!!simulatorQuestion}
          onClose={() => setSimulatorQuestion(null)}
          topicTitle={guide.title}
          subject={guide.subject}
          targetExam={guide.examRelevance || 'Target Exam'}
          questionData={simulatorQuestion}
        />
      )}
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
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#161824',
    borderWidth: 1.5,
    borderColor: '#2A2D40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: { flex: 1 },
  headerSubject: { fontSize: 10, fontWeight: '800', color: '#00E5FF' },
  headerTitle: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },
  headerActions: { flexDirection: 'row', gap: 6 },

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
  tabBody: { gap: 12 },
  card: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  cardHeading: { fontSize: 16, fontWeight: '900', color: '#FFFFFF', lineHeight: 21 },
  cardSummary: { fontSize: 12, color: '#D0D2E0', lineHeight: 18 },
  relevanceText: { fontSize: 11, fontWeight: '800', color: '#FFB800' },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#8E8EA8', letterSpacing: 0.7 },

  conceptRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  conceptIndex: { fontSize: 12, fontWeight: '800', color: '#00E5FF' },
  conceptText: { flex: 1, fontSize: 12, color: '#E0E2F0', lineHeight: 18 },

  bridgeRow: { flexDirection: 'row', gap: 10 },
  bridgeBtnCyan: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#00E5FF',
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bridgeBtnCyanText: { fontSize: 12, fontWeight: '900', color: '#0B0C12' },
  bridgeBtnDark: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#161824',
    borderWidth: 1.5,
    borderColor: '#2A2D40',
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bridgeBtnDarkText: { fontSize: 12, fontWeight: '800', color: '#00E5FF' },

  blindspotTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  omissionBox: {
    backgroundColor: '#181A26',
    borderLeftWidth: 3,
    borderLeftColor: '#FF4757',
    padding: 9,
    borderRadius: 6,
    gap: 2,
  },
  omissionLabel: { fontSize: 10, fontWeight: '800', color: '#FF6B81' },
  omissionText: { fontSize: 12, color: '#E0E2F0', lineHeight: 17 },
  rubricBox: {
    backgroundColor: '#13221D',
    borderLeftWidth: 3,
    borderLeftColor: '#00E676',
    padding: 9,
    borderRadius: 6,
    gap: 2,
  },
  rubricLabel: { fontSize: 10, fontWeight: '800', color: '#00E676' },
  rubricText: { fontSize: 12, color: '#D0E8DC', lineHeight: 17 },

  qHeadRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  qText: { flex: 1, fontSize: 13, fontWeight: '800', color: '#FFFFFF', lineHeight: 18 },
  qMarks: { fontSize: 11, fontWeight: '900', color: '#00E676' },
  kpRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  kpText: { flex: 1, fontSize: 12, color: '#D0D2E0', lineHeight: 17 },
  simBtn: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#181C2B',
    borderWidth: 1,
    borderColor: '#2A2E44',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  simBtnText: { fontSize: 12, fontWeight: '800', color: '#00E5FF' },

  quizQ: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', lineHeight: 18 },
  optStack: { gap: 8 },
  optBtn: {
    backgroundColor: '#161824',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 8,
    padding: 11,
  },
  optCorrect: { borderColor: '#00E676', backgroundColor: 'rgba(0, 230, 118, 0.1)' },
  optWrong: { borderColor: '#FF4757', backgroundColor: 'rgba(255, 71, 87, 0.1)' },
  optText: { fontSize: 12, color: '#D0D2E0', fontWeight: '600' },
  expBox: {
    backgroundColor: '#141B29',
    borderLeftWidth: 3,
    borderLeftColor: '#00E5FF',
    padding: 9,
    borderRadius: 6,
  },
  expText: { fontSize: 11, color: '#00E5FF', lineHeight: 16 },
});
