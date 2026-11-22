import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { EXAM_TARGETS, COMMON_SUBJECTS } from '../config/studyGuideData';
import { auditTopic, auditUserAnswer } from '../services/aiService';
import { pickImageForOcr, extractTextFromImage } from '../services/ocrService';
import MarkingSimulatorModal from '../components/MarkingSimulatorModal';

const { width } = Dimensions.get('window');

const UNIVERSAL_PRESETS = [
  { subject: 'Physics', title: 'Photoelectric Effect & Stopping Potential' },
  { subject: 'Chemistry', title: 'Aldol Condensation vs Cannizzaro Reaction' },
  { subject: 'Mathematics', title: "Definite Integrals: King's Property" },
  { subject: 'Biology', title: 'DNA Replication & Leading vs Lagging Strand' },
  { subject: 'Computer Science', title: 'Red-Black Trees vs AVL Trees' },
  { subject: 'Economics', title: 'Fiscal Deficit vs Primary Deficit & Crowding Out' },
];

export default function AIGapAuditorScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { targetExam, setTargetExam, saveAuditResult, markGapMastered, awardCustomXp } = useUser();

  const [activeTab, setActiveTab] = useState(route.params?.mode || 'TOPIC'); // 'TOPIC' | 'ANSWER'
  const [selectedSubject, setSelectedSubject] = useState(route.params?.initialSubject || 'Physics');
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [topicInput, setTopicInput] = useState(route.params?.initialTopic || '');
  const [answerInput, setAnswerInput] = useState(route.params?.initialNotes || '');
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [masteredMap, setMasteredMap] = useState({});
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [customExamInput, setCustomExamInput] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [simulatorVisible, setSimulatorVisible] = useState(false);

  const handleScanNotes = async (source = 'camera') => {
    try {
      setOcrLoading(true);
      const res = await pickImageForOcr(source);
      if (res.canceled) {
        setOcrLoading(false);
        return;
      }
      if (!res.success) {
        Alert.alert('Permission / Scan Error', res.error || 'Could not access image.');
        setOcrLoading(false);
        return;
      }
      const ocrRes = await extractTextFromImage(res.asset.base64, res.asset.mimeType || 'image/jpeg');
      if (ocrRes.success && ocrRes.text) {
        if (activeTab === 'ANSWER') {
          setAnswerInput(ocrRes.text);
        } else {
          setTopicInput(ocrRes.text.slice(0, 80));
        }
        Alert.alert('Scan Complete! 📷', 'Extracted text inserted into the auditor box.');
      }
    } catch (e) {
      Alert.alert('Scan Error', 'Could not extract text from image.');
    } finally {
      setOcrLoading(false);
    }
  };

  const showScanOptions = () => {
    Alert.alert(
      'Scan Handwritten Notes / Paper',
      'Choose image source for AI text extraction:',
      [
        { text: '📷 Take Photo', onPress: () => handleScanNotes('camera') },
        { text: '🖼️ Choose from Gallery', onPress: () => handleScanNotes('gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Active exam label
  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  useEffect(() => {
    if (route.params?.initialTopic) {
      setTopicInput(route.params.initialTopic);
    }
    if (route.params?.initialSubject) {
      setSelectedSubject(route.params.initialSubject);
    }
    if (route.params?.mode) {
      setActiveTab(route.params.mode);
    }
    if (route.params?.initialNotes) {
      setAnswerInput(route.params.initialNotes);
    }
    if (route.params?.autoAudit && route.params?.initialTopic) {
      handleAuditTopic(route.params.initialTopic);
    }
  }, [route.params]);

  const resolvedSubject = useMemo(() => {
    if (selectedSubject === 'Other / Custom Subject' && customSubjectInput.trim()) {
      return customSubjectInput.trim();
    }
    return selectedSubject;
  }, [selectedSubject, customSubjectInput]);

  const handleAuditTopic = async (customTitle) => {
    const titleToAudit = (customTitle || topicInput).trim();
    if (!titleToAudit) {
      Alert.alert('Topic Required', 'Please enter or select a topic to audit for exam blindspots.');
      return;
    }

    setLoading(true);
    setAuditResult(null);
    try {
      const result = await auditTopic(resolvedSubject, titleToAudit, activeExamLabel);
      if (result.success) {
        setAuditResult({ type: 'TOPIC', data: result });
        saveAuditResult({
          type: 'TOPIC',
          topic: titleToAudit,
          subject: resolvedSubject,
          examTarget: activeExamLabel,
          blindspotCount: result.blindspotCount || 3,
        });
      } else {
        Alert.alert('Audit Error', 'Could not complete audit. Please try again.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred during audit.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuditAnswer = async () => {
    if (!answerInput.trim() || answerInput.trim().length < 15) {
      Alert.alert('Notes Required', 'Please paste your answer, lecture notes, or AI text to audit.');
      return;
    }

    const titleToAudit = topicInput.trim() || 'General Concept';
    setLoading(true);
    setAuditResult(null);
    try {
      const result = await auditUserAnswer(resolvedSubject, titleToAudit, activeExamLabel, answerInput);
      if (result.success) {
        setAuditResult({ type: 'ANSWER', data: result, topic: titleToAudit });
        saveAuditResult({
          type: 'ANSWER',
          topic: titleToAudit,
          subject: resolvedSubject,
          score: result.score,
          grade: result.grade,
        });
      } else {
        Alert.alert('Audit Error', result.error || 'Failed to audit text.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not audit answer.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMastered = (idx) => {
    setMasteredMap((prev) => {
      const current = !!prev[idx];
      if (!current) {
        markGapMastered(idx);
        awardCustomXp(25, 'Mastered AI Exam Blindspot');
      }
      return { ...prev, [idx]: !current };
    });
  };

  const handleSelectExam = (label) => {
    setTargetExam(label);
    setExamModalVisible(false);
  };

  const handleApplyCustomExam = () => {
    if (customExamInput.trim()) {
      setTargetExam(customExamInput.trim());
      setCustomExamInput('');
      setExamModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1A" />

      {/* Clean Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>AI Blindspot Auditor</Text>
          <TouchableOpacity
            style={styles.examBadge}
            onPress={() => setExamModalVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="target" size={14} color="#00D2FF" />
            <Text style={styles.examBadgeText} numberOfLines={1}>{activeExamLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* Clean Mode Switcher Tabs */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, activeTab === 'TOPIC' && styles.modeTabActive]}
            activeOpacity={0.8}
            onPress={() => {
              setActiveTab('TOPIC');
              setAuditResult(null);
            }}
          >
            <Text style={[styles.modeTabText, activeTab === 'TOPIC' && styles.modeTabTextActive]}>
              Audit a Topic
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, activeTab === 'ANSWER' && styles.modeTabActive]}
            activeOpacity={0.8}
            onPress={() => {
              setActiveTab('ANSWER');
              setAuditResult(null);
            }}
          >
            <Text style={[styles.modeTabText, activeTab === 'ANSWER' && styles.modeTabTextActive]}>
              Check Notes / Answer
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Subject Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.inputSectionLabel}>SUBJECT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectScroll}>
            {COMMON_SUBJECTS.map((subj) => {
              const isSel = selectedSubject === subj;
              return (
                <TouchableOpacity
                  key={subj}
                  style={[styles.subjectChip, isSel && styles.subjectChipActive]}
                  onPress={() => setSelectedSubject(subj)}
                >
                  <Text style={[styles.subjectChipText, isSel && styles.subjectChipTextActive]}>
                    {subj}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedSubject === 'Other / Custom Subject' && (
            <TextInput
              style={styles.customSubjectInput}
              placeholder="Enter custom subject (e.g. Accountancy, History, Law)..."
              placeholderTextColor="#777799"
              value={customSubjectInput}
              onChangeText={setCustomSubjectInput}
            />
          )}
        </View>

        {/* ─── MODE A: TOPIC AUDIT ────────────────────────────────────────── */}
        {activeTab === 'TOPIC' && (
          <View style={styles.card}>
            <View style={styles.inputHeaderRow}>
              <Text style={styles.inputSectionLabel}>TOPIC TO AUDIT</Text>
              <TouchableOpacity
                style={styles.scanBtn}
                onPress={showScanOptions}
                disabled={ocrLoading}
              >
                {ocrLoading ? (
                  <ActivityIndicator size="small" color="#00D2FF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="camera-outline" size={14} color="#00D2FF" />
                    <Text style={styles.scanBtnText}>Scan Paper</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.topicTextInput}
              placeholder="e.g. Photoelectric Effect, BCNF, Bayes' Theorem..."
              placeholderTextColor="#666688"
              value={topicInput}
              onChangeText={setTopicInput}
            />

            {/* Quick Presets */}
            <View style={styles.presetsBox}>
              <Text style={styles.presetsLabel}>Quick Presets:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
                {UNIVERSAL_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.title}
                    style={styles.presetChip}
                    onPress={() => {
                      setSelectedSubject(p.subject);
                      setTopicInput(p.title);
                      handleAuditTopic(p.title);
                    }}
                  >
                    <Text style={styles.presetChipText}>{p.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => handleAuditTopic()}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="lightning-bolt" size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Audit for Exam Blindspots</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ─── MODE B: ANSWER CHECKER ────────────────────────────────────────── */}
        {activeTab === 'ANSWER' && (
          <View style={styles.card}>
            <Text style={styles.inputSectionLabel}>TOPIC (OPTIONAL)</Text>
            <TextInput
              style={[styles.topicTextInput, { marginBottom: 12 }]}
              placeholder="e.g. Aldol vs Cannizzaro, Rolling friction..."
              placeholderTextColor="#666688"
              value={topicInput}
              onChangeText={setTopicInput}
            />

            <View style={styles.inputHeaderRow}>
              <Text style={styles.inputSectionLabel}>PASTE DRAFT ANSWER OR AI NOTES</Text>
              <TouchableOpacity
                style={styles.scanBtn}
                onPress={showScanOptions}
                disabled={ocrLoading}
              >
                {ocrLoading ? (
                  <ActivityIndicator size="small" color="#00D2FF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="camera-outline" size={14} color="#00D2FF" />
                    <Text style={styles.scanBtnText}>Scan Notes / Paper</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.answerTextArea}
              placeholder="Paste your revision notes, AI summary, or draft answer to find what crucial points or formulas were omitted..."
              placeholderTextColor="#666688"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={answerInput}
              onChangeText={setAnswerInput}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleAuditAnswer}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="shield-check" size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Audit My Text</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ─── AUDIT RESULTS VIEW ────────────────────────────────────────── */}
        {auditResult && auditResult.type === 'TOPIC' && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultBanner}>
              <MaterialCommunityIcons name="alert-decagram" size={20} color="#FF6B81" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.resultBannerTitle}>
                  {auditResult.data.blindspotCount || 3} Exam Blindspots Identified
                </Text>
                <Text style={styles.resultBannerSub}>
                  Generic AI explanations omit these critical points for {activeExamLabel}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.simulateScoreBtn}
              onPress={() => setSimulatorVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="calculator-variant-outline" size={16} color="#00D2FF" />
              <Text style={styles.simulateScoreBtnText}>Simulate Score with Examiner Rubric</Text>
            </TouchableOpacity>

            {auditResult.data.aiBlindspots?.map((blindspot, idx) => {
              const isMastered = !!masteredMap[idx];
              return (
                <View key={idx} style={[styles.blindspotCard, isMastered && styles.blindspotCardMastered]}>
                  <View style={styles.blindspotHeader}>
                    <Text style={styles.blindspotIndex}>#{idx + 1}</Text>
                    <Text style={styles.blindspotTitle}>{blindspot.point}</Text>
                    <TouchableOpacity
                      onPress={() => toggleMastered(idx)}
                      style={[styles.masterCheckBtn, isMastered && styles.masterCheckBtnActive]}
                    >
                      <MaterialCommunityIcons
                        name={isMastered ? 'check-circle' : 'circle-outline'}
                        size={20}
                        color={isMastered ? '#2ED573' : '#8888AA'}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* What Generic AI Says */}
                  <View style={styles.comparisonBoxSurface}>
                    <Text style={styles.compLabelSurface}>What Generic AI Summarizes:</Text>
                    <Text style={styles.compTextSurface}>{blindspot.whatAiSays}</Text>
                  </View>

                  {/* What Generic AI Leaves Out */}
                  <View style={styles.comparisonBoxMissing}>
                    <Text style={styles.compLabelMissing}>What Generic AI Leaves Out:</Text>
                    <Text style={styles.compTextMissing}>{blindspot.whatAiMisses}</Text>
                  </View>

                  {/* Examiner Deduction */}
                  <View style={styles.rubricCallout}>
                    <Text style={styles.rubricCalloutHeading}>Examiner Deduction:</Text>
                    <Text style={styles.rubricCalloutBody}>{blindspot.examinerRubric}</Text>
                  </View>
                </View>
              );
            })}

            {/* Full Marks Rubric */}
            {auditResult.data.examQuestions?.[0] && (
              <View style={styles.modelQuestionCard}>
                <Text style={styles.modelQuestionHeading}>
                  Examiner Question ({auditResult.data.examQuestions[0].marks} Marks)
                </Text>
                <Text style={styles.modelQuestionText}>
                  {auditResult.data.examQuestions[0].question}
                </Text>
                <Text style={styles.modelKeysLabel}>Full-Marks Criteria Checklist:</Text>
                {auditResult.data.examQuestions[0].keyPoints?.map((kp, kIdx) => (
                  <View key={kIdx} style={styles.keyPointRow}>
                    <MaterialCommunityIcons name="check" size={14} color="#2ED573" style={{ marginTop: 2, marginRight: 6 }} />
                    <Text style={styles.keyPointText}>{kp}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ─── ANSWER AUDIT RESULTS ────────────────────────────────────────── */}
        {auditResult && auditResult.type === 'ANSWER' && (
          <View style={styles.resultsContainer}>
            <View style={styles.scoreCard}>
              <View>
                <Text style={styles.scoreVal}>{auditResult.data.score}/100</Text>
                <Text style={styles.gradeVal}>{auditResult.data.grade}</Text>
              </View>
              <Text style={styles.verdictText}>{auditResult.data.overallVerdict}</Text>
            </View>

            {auditResult.data.blindspotsFound?.map((gap, gIdx) => (
              <View key={gIdx} style={styles.gapCard}>
                <View style={styles.gapHeader}>
                  <Text style={styles.gapTitle}>{gap.title}</Text>
                  <Text style={styles.gapSeverity}>{gap.severity}</Text>
                </View>
                <Text style={styles.gapExplanation}>{gap.explanation}</Text>
                <View style={styles.gapFixBox}>
                  <Text style={styles.gapFixLabel}>What To Add:</Text>
                  <Text style={styles.gapFixText}>"{gap.fix}"</Text>
                </View>
              </View>
            ))}

            {auditResult.data.fullMarksAdditions && (
              <View style={styles.modelAdditionBox}>
                <Text style={styles.modelAdditionHeading}>Examiner Full-Marks Summary:</Text>
                <Text style={styles.modelAdditionText}>{auditResult.data.fullMarksAdditions}</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Target Exam Selection Modal */}
      <Modal
        visible={examModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExamModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setExamModalVisible(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Target Exam</Text>
              <TouchableOpacity onPress={() => setExamModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

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

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {EXAM_TARGETS.map((target) => {
                const isSelected = activeExamLabel === target.label;
                return (
                  <TouchableOpacity
                    key={target.id}
                    style={[styles.modalOption, isSelected && styles.modalOptionActive]}
                    onPress={() => handleSelectExam(target.label)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalOptionLabel, isSelected && styles.modalOptionLabelActive]}>
                        {target.label}
                      </Text>
                      <Text style={styles.modalOptionDesc} numberOfLines={1}>{target.desc}</Text>
                    </View>
                    {isSelected && <MaterialCommunityIcons name="check" size={18} color="#00D2FF" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Interactive Marking Simulator Modal */}
      <MarkingSimulatorModal
        visible={simulatorVisible}
        onClose={() => setSimulatorVisible(false)}
        topicTitle={auditResult?.data?.topic || topicInput || 'Exam Question'}
        subject={resolvedSubject}
        targetExam={activeExamLabel}
        questionData={auditResult?.data?.examQuestions?.[0]}
      />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  examBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
    gap: 4,
    maxWidth: 180,
  },
  examBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00D2FF',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 3,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: '#6C5CE7',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8EA8',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  inputSection: {
    marginBottom: 14,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
    gap: 4,
  },
  scanBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00D2FF',
  },
  simulateScoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
    marginBottom: 12,
    gap: 6,
  },
  simulateScoreBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00D2FF',
  },
  inputSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8EA8',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subjectScroll: {
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
  customSubjectInput: {
    backgroundColor: '#121228',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  card: {
    backgroundColor: '#121228',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    marginBottom: 16,
  },
  topicTextInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  presetsBox: {
    marginBottom: 14,
  },
  presetsLabel: {
    fontSize: 11,
    color: '#8E8EA8',
    marginBottom: 6,
  },
  presetScroll: {
    gap: 8,
  },
  presetChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  presetChipText: {
    fontSize: 11,
    color: '#A29BFE',
  },
  answerTextArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: 120,
    marginBottom: 14,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C5CE7',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.08)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.25)',
  },
  resultBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF6B81',
  },
  resultBannerSub: {
    fontSize: 12,
    color: '#CCD0E0',
    marginTop: 2,
  },
  blindspotCard: {
    backgroundColor: '#121228',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  blindspotCardMastered: {
    borderColor: 'rgba(46, 213, 115, 0.35)',
  },
  blindspotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  blindspotIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00D2FF',
    marginRight: 6,
  },
  blindspotTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  masterCheckBtn: {
    padding: 2,
  },
  masterCheckBtnActive: {},
  comparisonBoxSurface: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  compLabelSurface: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8EA8',
    marginBottom: 3,
  },
  compTextSurface: {
    fontSize: 12,
    color: '#A0A0C0',
    lineHeight: 16,
  },
  comparisonBoxMissing: {
    backgroundColor: 'rgba(255, 165, 2, 0.08)',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFA502',
    marginBottom: 8,
  },
  compLabelMissing: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFA502',
    marginBottom: 3,
  },
  compTextMissing: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
    fontWeight: '600',
  },
  rubricCallout: {
    backgroundColor: 'rgba(46, 213, 115, 0.08)',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2ED573',
  },
  rubricCalloutHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2ED573',
    marginBottom: 2,
  },
  rubricCalloutBody: {
    fontSize: 12,
    color: '#CCD0E0',
    lineHeight: 16,
  },
  modelQuestionCard: {
    backgroundColor: '#121228',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  modelQuestionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00D2FF',
    marginBottom: 4,
  },
  modelQuestionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 19,
  },
  modelKeysLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8EA8',
    marginBottom: 6,
  },
  keyPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  keyPointText: {
    fontSize: 12,
    color: '#DDDDEE',
    flex: 1,
    lineHeight: 16,
  },
  scoreCard: {
    backgroundColor: '#121228',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
  },
  scoreVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00D2FF',
  },
  gradeVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  verdictText: {
    fontSize: 12,
    color: '#CCD0E0',
    marginTop: 6,
    lineHeight: 16,
  },
  gapCard: {
    backgroundColor: '#121228',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4757',
  },
  gapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gapTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  gapSeverity: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF6B81',
  },
  gapExplanation: {
    fontSize: 12,
    color: '#CCD0E0',
    lineHeight: 16,
    marginBottom: 8,
  },
  gapFixBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 8,
    padding: 8,
  },
  gapFixLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2ED573',
    marginBottom: 2,
  },
  gapFixText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontStyle: 'italic',
    lineHeight: 15,
  },
  modelAdditionBox: {
    backgroundColor: '#121228',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  modelAdditionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00D2FF',
    marginBottom: 4,
  },
  modelAdditionText: {
    fontSize: 12,
    color: '#CCD0E0',
    lineHeight: 17,
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
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
