import React, { useState } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';
import { useUser } from '../context/UserContext';
import { generateAndShareCheatSheetPdf } from '../services/pdfService';
import MarkingSimulatorModal from '../components/MarkingSimulatorModal';

export default function StudyGuideDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { toggleSaveGuide, savedGuides, awardCustomXp } = useUser();

  const guide = route.params?.guide || {
    title: 'Photoelectric Effect & Stopping Potential',
    subject: 'Physics',
    summary: 'Emission of electrons when electromagnetic radiation impinges on a material.',
    examRelevance: 'High Probability Board & Competitive Exam Topic',
    aiBlindspots: [],
    coreConcepts: [],
    examQuestions: [],
    quiz: [],
  };

  const isSaved = savedGuides.some(g => (g.id && g.id === guide.id) || g.title === guide.title);

  // Interactive Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [revealedQuiz, setRevealedQuiz] = useState({});

  const handleSelectOption = (qIdx, optIdx, isCorrect) => {
    if (revealedQuiz[qIdx]) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    setRevealedQuiz(prev => ({ ...prev, [qIdx]: true }));
    if (isCorrect) {
      awardCustomXp(25, 'Correct Gap Quiz Answer');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `StudyQuest Guide: ${guide.title} (${guide.subject})\n\nCheck out the AI Blindspots & Examiner Scoring Keys on StudyQuest!`,
      });
    } catch (e) {}
  };

  const [pdfLoading, setPdfLoading] = useState(false);
  const [simulatorQuestion, setSimulatorQuestion] = useState(null);

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
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backCircleBtn}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="chevron-left" size={26} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerRightRow}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            activeOpacity={0.8}
            onPress={toggleSaveGuide.bind(null, guide)}
          >
            <MaterialCommunityIcons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isSaved ? "#00D2FF" : "#FFF"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionBtn}
            activeOpacity={0.8}
            onPress={handleExportPdf}
            disabled={pdfLoading}
          >
            {pdfLoading ? (
              <ActivityIndicator size="small" color="#FFD32A" />
            ) : (
              <MaterialCommunityIcons name="file-pdf-box" size={22} color="#FFD32A" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionBtn}
            activeOpacity={0.8}
            onPress={handleShare}
          >
            <MaterialCommunityIcons name="share-variant-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Subject & Title */}
        <View style={styles.titleSection}>
          <View style={styles.subjectBadge}>
            <Text style={styles.subjectBadgeText}>{guide.subject || 'Core Subject'}</Text>
          </View>
          <Text style={styles.guideTitle}>{guide.title}</Text>
          <Text style={styles.guideSummary}>{guide.summary}</Text>
          {guide.examRelevance ? (
            <View style={styles.relevanceTag}>
              <MaterialCommunityIcons name="fire" size={14} color="#FF6B35" style={{ marginRight: 4 }} />
              <Text style={styles.relevanceTagText}>{guide.examRelevance}</Text>
            </View>
          ) : null}
        </View>

        {/* ─── 1. AI BLINDSPOTS SECTION (FLAGSHIP) ────────────────────── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBadge}>
              <MaterialCommunityIcons name="shield-alert-outline" size={18} color="#FF6B35" />
            </View>
            <Text style={styles.sectionTitle}>What Generic AI Leaves Out</Text>
          </View>
          <Text style={styles.sectionSub}>
            Examiners look for these specific details that standard online AI explanations miss:
          </Text>

          {(guide.aiBlindspots || []).map((item, idx) => (
            <View key={idx} style={styles.blindspotBlock}>
              <Text style={styles.blindspotPointTitle}>
                {idx + 1}. {item.point}
              </Text>
              <View style={styles.omissionBox}>
                <Text style={styles.omissionLabel}>❌ Crucial Omission:</Text>
                <Text style={styles.omissionText}>{item.whatAiMisses}</Text>
              </View>
              <View style={styles.rubricBox}>
                <MaterialCommunityIcons name="gavel" size={14} color="#FFD93D" style={{ marginRight: 6 }} />
                <Text style={styles.rubricText}>
                  <Text style={{ fontWeight: '800', color: '#FFD93D' }}>Marking Key: </Text>
                  {item.examinerRubric}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ─── 2. CORE CONCEPTS ROADMAP ─────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBadge, { backgroundColor: 'rgba(0, 210, 255, 0.15)' }]}>
              <MaterialCommunityIcons name="book-open-page-variant" size={18} color="#00D2FF" />
            </View>
            <Text style={[styles.sectionTitle, { color: '#00D2FF' }]}>Core Syllabus Essentials</Text>
          </View>

          {(guide.coreConcepts || []).map((cc, i) => (
            <View key={i} style={styles.coreItemRow}>
              <View style={styles.coreNumberBox}>
                <Text style={styles.coreNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.coreItemText}>{cc}</Text>
            </View>
          ))}
        </View>

        {/* ─── 3. EXAMINER QUESTIONS & RUBRICS ──────────────────────────── */}
        {guide.examQuestions && guide.examQuestions.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBadge, { backgroundColor: 'rgba(46, 204, 113, 0.15)' }]}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={18} color="#2ECC71" />
              </View>
              <Text style={[styles.sectionTitle, { color: '#2ECC71' }]}>Expected Exam Questions & Scoring Keys</Text>
            </View>

            {guide.examQuestions.map((eq, qi) => (
              <View key={qi} style={styles.examQBlock}>
                <View style={styles.examQHeader}>
                  <Text style={styles.examQTitle}>Q{qi + 1}: {eq.question}</Text>
                  <View style={styles.marksBadge}>
                    <Text style={styles.marksBadgeText}>{eq.marks} Marks</Text>
                  </View>
                </View>
                <Text style={styles.keyHeading}>Points Required for 100% Marks:</Text>
                {eq.keyPoints.map((kp, kpi) => (
                  <View key={kpi} style={styles.kpRow}>
                    <MaterialCommunityIcons name="check-circle" size={14} color="#2ECC71" style={{ marginRight: 6 }} />
                    <Text style={styles.kpText}>{kp}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.simulateQBtn}
                  onPress={() => setSimulatorQuestion(eq)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="calculator-variant-outline" size={15} color="#00D2FF" />
                  <Text style={styles.simulateQBtnText}>Simulate Score with Step-by-Step Rubric</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ─── 4. INTERACTIVE GAP CHECK QUIZ ────────────────────────────── */}
        {guide.quiz && guide.quiz.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBadge, { backgroundColor: 'rgba(255, 217, 61, 0.15)' }]}>
                <MaterialCommunityIcons name="head-check-outline" size={18} color="#FFD93D" />
              </View>
              <Text style={[styles.sectionTitle, { color: '#FFD93D' }]}>Test Your Knowledge: Tricky Details</Text>
            </View>

            {guide.quiz.map((q, qIndex) => {
              const hasAnswered = !!revealedQuiz[qIndex];
              const chosen = selectedAnswers[qIndex];

              return (
                <View key={qIndex} style={styles.quizBlock}>
                  <Text style={styles.quizQText}>{qIndex + 1}. {q.question}</Text>
                  <View style={styles.optionsList}>
                    {q.options.map((opt, oIndex) => {
                      const isCorrect = oIndex === q.correctIndex;
                      const isChosen = chosen === oIndex;

                      let btnStyle = styles.optionBtn;
                      let textStyle = styles.optionText;

                      if (hasAnswered) {
                        if (isCorrect) {
                          btnStyle = [styles.optionBtn, styles.optionCorrect];
                          textStyle = [styles.optionText, styles.optionTextCorrect];
                        } else if (isChosen) {
                          btnStyle = [styles.optionBtn, styles.optionWrong];
                          textStyle = [styles.optionText, styles.optionTextWrong];
                        }
                      }

                      return (
                        <TouchableOpacity
                          key={oIndex}
                          style={btnStyle}
                          activeOpacity={0.8}
                          disabled={hasAnswered}
                          onPress={() => handleSelectOption(qIndex, oIndex, isCorrect)}
                        >
                          <Text style={textStyle}>{opt}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {hasAnswered && (
                    <View style={styles.explanationBox}>
                      <MaterialCommunityIcons name="information" size={16} color="#00D2FF" style={{ marginRight: 6 }} />
                      <Text style={styles.explanationText}>{q.explanation}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Marking Simulator Modal */}
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
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  backCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightRow: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  titleSection: {
    marginBottom: 20,
  },
  subjectBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(108, 92, 231, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  subjectBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A29BFE',
    letterSpacing: 0.5,
  },
  guideTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  guideSummary: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
  },
  relevanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  relevanceTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF8A50',
  },

  // Section Card
  sectionCard: {
    backgroundColor: '#12122A',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF8A50',
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 14,
    lineHeight: 16,
  },

  // Blindspots
  blindspotBlock: {
    backgroundColor: '#191836',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  blindspotPointTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
  },
  omissionBox: {
    backgroundColor: 'rgba(255, 92, 92, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF5C5C',
  },
  omissionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF5C5C',
    marginBottom: 2,
  },
  omissionText: {
    fontSize: 12,
    color: '#FFF',
    lineHeight: 17,
  },
  rubricBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 217, 61, 0.08)',
    borderRadius: 8,
    padding: 8,
  },
  rubricText: {
    flex: 1,
    fontSize: 11,
    color: '#E0DFEC',
    lineHeight: 15,
  },

  // Core Concepts
  coreItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  coreNumberBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  coreNumberText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00D2FF',
  },
  coreItemText: {
    flex: 1,
    fontSize: 13,
    color: '#D1D0E4',
    lineHeight: 18,
  },

  // Exam Questions
  examQBlock: {
    backgroundColor: '#151C22',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  examQHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  examQTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    paddingRight: 6,
  },
  marksBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  marksBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2ECC71',
  },
  keyHeading: {
    fontSize: 11,
    color: '#A29BFE',
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 4,
  },
  kpRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  kpText: {
    flex: 1,
    fontSize: 12,
    color: '#C5E8D3',
    lineHeight: 16,
  },
  simulateQBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
    marginTop: 8,
    gap: 6,
  },
  simulateQBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00D2FF',
  },

  // Quiz
  quizBlock: {
    marginBottom: 16,
  },
  quizQText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 10,
    lineHeight: 18,
  },
  optionsList: {
    gap: 8,
  },
  optionBtn: {
    backgroundColor: '#181836',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  optionCorrect: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    borderColor: '#2ECC71',
  },
  optionWrong: {
    backgroundColor: 'rgba(255, 92, 92, 0.2)',
    borderColor: '#FF5C5C',
  },
  optionText: {
    fontSize: 13,
    color: '#D1D0E4',
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#2ECC71',
    fontWeight: '800',
  },
  optionTextWrong: {
    color: '#FF5C5C',
    fontWeight: '800',
  },
  explanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00D2FF',
  },
  explanationText: {
    flex: 1,
    fontSize: 12,
    color: '#00D2FF',
    lineHeight: 16,
  },
});
