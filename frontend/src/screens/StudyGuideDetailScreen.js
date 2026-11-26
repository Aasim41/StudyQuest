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
  Platform,
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

  const guide = route.params?.guide || route.params?.topic || {
    title: 'Photoelectric Effect & Stopping Potential',
    subject: 'Physics',
    summary: 'Emission of electrons when electromagnetic radiation strikes a metal surface.',
    examRelevance: 'High Probability Exam Topic',
    aiBlindspots: [],
    coreConcepts: [],
    examQuestions: [],
    quiz: [],
  };

  const isSaved = savedGuides.some((g) => (g.id && g.id === guide.id) || g.title === guide.title);

  const [activeTab, setActiveTab] = useState('concepts'); // 'concepts' | 'blindspots' | 'pyqs' | 'quiz'
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
    if (isCorrect) awardCustomXp(25, 'Correct Quiz Answer');
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `StudyQuest Guide: ${guide.title} (${guide.subject})` });
    } catch {}
  };

  const handleExportPdf = async () => {
    try {
      setPdfLoading(true);
      const res = await generateAndShareCheatSheetPdf(guide.subject || 'Subject', 'Exam Guide', [guide]);
      if (!res.success) Alert.alert('PDF Export', res.error || 'Could not export PDF.');
    } catch {
      Alert.alert('Export Error', 'Failed to generate PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C10" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#F3F4F6" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerSub} numberOfLines={1}>{guide.subject}</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{guide.title}</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => toggleSaveGuide(guide)} style={styles.iconTap}>
              <MaterialCommunityIcons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isSaved ? '#38BDF8' : '#9CA3AF'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleExportPdf} disabled={pdfLoading} style={styles.iconTap}>
              {pdfLoading ? (
                <ActivityIndicator size="small" color="#38BDF8" />
              ) : (
                <MaterialCommunityIcons name="download" size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.iconTap}>
              <MaterialCommunityIcons name="share-variant-outline" size={19} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabsRow}>
          {[
            { id: 'concepts', label: 'Concepts' },
            { id: 'blindspots', label: `Traps (${(guide.aiBlindspots || []).length})` },
            { id: 'pyqs', label: 'Questions' },
            { id: 'quiz', label: 'Quiz' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabItem, active && styles.tabItemActive]}
                onPress={() => switchTab(tab.id)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
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
        style={{ opacity: tabAnim }}
      >
        {activeTab === 'concepts' && (
          <View>
            <View style={styles.sectionBlock}>
              <Text style={styles.bodyTitle}>{guide.title}</Text>
              <Text style={styles.bodyText}>{guide.summary}</Text>
              {guide.examRelevance ? <Text style={styles.metaText}>{guide.examRelevance}</Text> : null}
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>KEY CONCEPTS</Text>
              {(guide.coreConcepts || []).map((cc, i) => (
                <Text key={i} style={styles.listText}>
                  {i + 1}. {cc}
                </Text>
              ))}
            </View>

            <View style={styles.actionLinksRow}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() =>
                  navigation.navigate('Flow', {
                    searchQuery: guide.title,
                    initialSubject: guide.subject,
                  })
                }
              >
                <Text style={styles.primaryBtnText}>Watch Lecture</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() =>
                  navigation.navigate('AIGapAuditor', {
                    mode: 'TOPIC',
                    initialTopic: guide.title,
                    initialSubject: guide.subject,
                  })
                }
              >
                <Text style={styles.secondaryBtnText}>Audit Topic</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'blindspots' && (
          <View>
            {(guide.aiBlindspots || []).map((item, idx) => (
              <View key={idx} style={styles.sectionBlock}>
                <Text style={styles.bodyTitle}>{idx + 1}. {item.point}</Text>
                <Text style={styles.warnLabel}>COMMON OMISSION</Text>
                <Text style={styles.bodyText}>{item.whatAiMisses}</Text>
                <Text style={[styles.warnLabel, { color: '#38BDF8', marginTop: 12 }]}>EXAMINER KEY</Text>
                <Text style={styles.bodyText}>{item.examinerRubric}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'pyqs' && (
          <View>
            {(guide.examQuestions || []).map((eq, qi) => (
              <View key={qi} style={styles.sectionBlock}>
                <Text style={styles.metaText}>{eq.marks} Marks</Text>
                <Text style={styles.bodyTitle}>Q{qi + 1}. {eq.question}</Text>
                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>SCORING STEPS</Text>
                {(eq.keyPoints || []).map((kp, kpi) => (
                  <Text key={kpi} style={styles.listText}>• {kp}</Text>
                ))}
                <TouchableOpacity style={{ marginTop: 12 }} onPress={() => setSimulatorQuestion(eq)}>
                  <Text style={styles.linkText}>Open Score Simulator</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'quiz' && (
          <View>
            {(guide.quiz || []).map((q, qIndex) => {
              const hasAnswered = !!revealedQuiz[qIndex];
              const chosen = selectedAnswers[qIndex];
              return (
                <View key={qIndex} style={styles.sectionBlock}>
                  <Text style={styles.bodyTitle}>{qIndex + 1}. {q.question}</Text>
                  <View style={styles.optStack}>
                    {q.options.map((opt, oIndex) => {
                      const isCorrect = oIndex === q.correctIndex;
                      const isChosen = chosen === oIndex;
                      let color = '#D1D5DB';
                      let borderColor = '#1D1F2C';
                      if (hasAnswered) {
                        if (isCorrect) {
                          color = '#34D399';
                          borderColor = '#34D399';
                        } else if (isChosen) {
                          color = '#F87171';
                          borderColor = '#F87171';
                        }
                      }
                      return (
                        <TouchableOpacity
                          key={oIndex}
                          style={[styles.optBtn, { borderColor }]}
                          disabled={hasAnswered}
                          onPress={() => handleSelectOption(qIndex, oIndex, isCorrect)}
                        >
                          <Text style={[styles.optText, { color }]}>{opt}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {hasAnswered && <Text style={styles.expText}>{q.explanation}</Text>}
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
  container: { flex: 1, backgroundColor: '#0B0C10' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  headerSub: { color: '#38BDF8', fontSize: 11, fontWeight: '600' },
  headerTitle: { color: '#F9FAFB', fontSize: 16, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconTap: { padding: 2 },

  tabsRow: { flexDirection: 'row', gap: 20 },
  tabItem: { paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#38BDF8' },
  tabText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#F9FAFB' },

  scrollContent: { padding: 20 },
  sectionBlock: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1D1F2C' },
  bodyTitle: { color: '#F9FAFB', fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 6 },
  bodyText: { color: '#D1D5DB', fontSize: 14, lineHeight: 21 },
  metaText: { color: '#38BDF8', fontSize: 12, fontWeight: '600', marginTop: 6 },
  sectionLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8 },
  listText: { color: '#D1D5DB', fontSize: 14, lineHeight: 21, marginBottom: 8 },
  warnLabel: { color: '#F87171', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginTop: 6, marginBottom: 4 },
  linkText: { color: '#38BDF8', fontSize: 13, fontWeight: '600' },

  actionLinksRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  primaryBtn: { flex: 1, backgroundColor: '#38BDF8', paddingVertical: 13, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { color: '#0B0C10', fontSize: 14, fontWeight: '700' },
  secondaryBtn: { flex: 1, backgroundColor: '#14161F', paddingVertical: 13, borderRadius: 8, alignItems: 'center' },
  secondaryBtnText: { color: '#F3F4F6', fontSize: 14, fontWeight: '600' },

  optStack: { gap: 8, marginTop: 10 },
  optBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#14161F',
  },
  optText: { fontSize: 14, lineHeight: 20 },
  expText: { color: '#9CA3AF', fontSize: 13, lineHeight: 19, marginTop: 12 },
});
