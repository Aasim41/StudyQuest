import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Modal,
  Platform,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import {
  EXAM_TARGETS,
  getStreamsForExam,
  getCuratedSubjectsForExam,
  getCuratedTopicsForExam,
} from '../config/studyGuideData';
import { auditTopic, auditUserAnswer } from '../services/aiService';
import { pickImageForOcr, extractTextFromImage } from '../services/ocrService';
import MarkingSimulatorModal from '../components/MarkingSimulatorModal';
import { gsapTabTransition } from '../utils/gsapAnim';

export default function AIGapAuditorScreen() {
  const route = useRoute();
  const {
    targetExam,
    targetStream,
    targetSubject,
    setTargetExam,
    setTargetSubject,
    saveAuditResult,
    markGapMastered,
    awardCustomXp,
  } = useUser();

  const curatedSubjects = useMemo(
    () => [...getCuratedSubjectsForExam(targetExam, targetStream), 'Custom'],
    [targetExam, targetStream]
  );

  const [activeTab, setActiveTab] = useState(route.params?.mode || 'TOPIC');
  const [selectedSubject, setSelectedSubject] = useState(
    route.params?.initialSubject ||
      (targetSubject && targetSubject !== 'All' ? targetSubject : curatedSubjects[0]) ||
      'Physics'
  );
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

  const tabAnim = useRef(new Animated.Value(1)).current;

  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  const curatedPresets = useMemo(() => {
    const scope = selectedSubject !== 'Custom' ? selectedSubject : 'All';
    return getCuratedTopicsForExam(targetExam, scope, targetStream)
      .slice(0, 5)
      .map((t) => ({ subject: t.subject, title: t.title }));
  }, [targetExam, targetStream, selectedSubject]);

  useEffect(() => {
    if (targetSubject && targetSubject !== 'All' && curatedSubjects.includes(targetSubject)) {
      setSelectedSubject(targetSubject);
    } else if (!curatedSubjects.includes(selectedSubject) && selectedSubject !== 'Custom') {
      setSelectedSubject(curatedSubjects[0] || 'Physics');
    }
  }, [targetExam, targetStream, targetSubject, curatedSubjects]);

  const resolvedSubject = useMemo(() => {
    if (selectedSubject === 'Custom' && customSubjectInput.trim()) {
      return customSubjectInput.trim();
    }
    return selectedSubject;
  }, [selectedSubject, customSubjectInput]);

  useEffect(() => {
    if (route.params?.initialTopic) setTopicInput(route.params.initialTopic);
    if (route.params?.initialSubject) setSelectedSubject(route.params.initialSubject);
    if (route.params?.mode) setActiveTab(route.params.mode);
    if (route.params?.initialNotes) setAnswerInput(route.params.initialNotes);
    if (route.params?.autoAudit && route.params?.initialTopic) {
      handleAuditTopic(route.params.initialTopic);
    }
  }, [route.params]);

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    gsapTabTransition(tabAnim);
    setActiveTab(tab);
    setAuditResult(null);
  };

  const handleScanNotes = async (source = 'camera') => {
    try {
      setOcrLoading(true);
      const res = await pickImageForOcr(source);
      if (res.canceled) return;
      if (!res.success) {
        Alert.alert('Scan Error', res.error || 'Could not read image.');
        return;
      }
      const ocrRes = await extractTextFromImage(res.asset.base64, res.asset.mimeType || 'image/jpeg');
      if (ocrRes.success && ocrRes.text) {
        if (activeTab === 'ANSWER') setAnswerInput(ocrRes.text);
        else setTopicInput(ocrRes.text.slice(0, 80));
      }
    } catch {
      Alert.alert('Scan Error', 'Could not extract text from image.');
    } finally {
      setOcrLoading(false);
    }
  };

  const showScanOptions = () => {
    Alert.alert('Scan Handwritten Notes', 'Choose image source:', [
      { text: 'Camera', onPress: () => handleScanNotes('camera') },
      { text: 'Gallery', onPress: () => handleScanNotes('gallery') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleAuditTopic = async (customTitle) => {
    const titleToAudit = (customTitle || topicInput).trim();
    if (!titleToAudit) {
      Alert.alert('Topic Required', 'Enter a topic to audit.');
      return;
    }
    setLoading(true);
    setAuditResult(null);
    try {
      const result = await auditTopic(resolvedSubject, titleToAudit, activeExamLabel);
      if (result.success) {
        setAuditResult({ type: 'TOPIC', data: result });
        saveAuditResult({ type: 'TOPIC', topic: titleToAudit, subject: resolvedSubject });
      } else {
        Alert.alert('Audit Error', result.error || 'Failed to audit topic.');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuditAnswer = async () => {
    const trimmed = answerInput.trim();
    if (!trimmed) {
      Alert.alert('Answer Required', 'Paste notes or a draft answer first.');
      return;
    }
    const titleToAudit = topicInput.trim() || `${resolvedSubject} Draft`;
    setLoading(true);
    setAuditResult(null);
    try {
      const result = await auditUserAnswer(resolvedSubject, titleToAudit, trimmed, activeExamLabel);
      if (result.success) {
        setAuditResult({ type: 'ANSWER', data: result });
        saveAuditResult({
          type: 'ANSWER',
          topic: titleToAudit,
          subject: resolvedSubject,
          score: result.score,
          grade: result.grade,
        });
      } else {
        Alert.alert('Audit Error', result.error || 'Failed to check answer.');
      }
    } catch {
      Alert.alert('Error', 'Could not evaluate answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExam = (label) => {
    const firstStream = getStreamsForExam(label)[0]?.id || 'pcm';
    setTargetExam(label, firstStream);
    setExamModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C10" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Auditor</Text>
          <TouchableOpacity onPress={() => setExamModalVisible(true)}>
            <Text style={styles.headerLink} numberOfLines={1}>
              {activeExamLabel} ▾
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'TOPIC' && styles.tabItemActive]}
            onPress={() => switchTab('TOPIC')}
          >
            <Text style={[styles.tabText, activeTab === 'TOPIC' && styles.tabTextActive]}>
              Topic Audit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'ANSWER' && styles.tabItemActive]}
            onPress={() => switchTab('ANSWER')}
          >
            <Text style={[styles.tabText, activeTab === 'ANSWER' && styles.tabTextActive]}>
              Check Answer
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: tabAnim }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectStrip}>
          {curatedSubjects.map((subj) => {
            const active = selectedSubject === subj;
            return (
              <TouchableOpacity
                key={subj}
                style={[styles.subjectTab, active && styles.subjectTabActive]}
                onPress={() => {
                  setSelectedSubject(subj);
                  if (subj !== 'Custom') setTargetSubject(subj);
                }}
              >
                <Text style={[styles.subjectTabText, active && styles.subjectTabTextActive]}>
                  {subj}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {selectedSubject === 'Custom' && (
          <TextInput
            style={styles.input}
            placeholder="Custom subject name..."
            placeholderTextColor="#6B7280"
            value={customSubjectInput}
            onChangeText={setCustomSubjectInput}
          />
        )}

        {activeTab === 'TOPIC' && (
          <View style={styles.formSection}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Topic</Text>
              <TouchableOpacity onPress={showScanOptions} disabled={ocrLoading}>
                <Text style={styles.scanLink}>{ocrLoading ? 'Scanning...' : 'Scan Image'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g. Photoelectric Effect, Newton's Laws..."
              placeholderTextColor="#6B7280"
              value={topicInput}
              onChangeText={setTopicInput}
            />

            {curatedPresets.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
                {curatedPresets.map((p) => (
                  <TouchableOpacity
                    key={p.title}
                    onPress={() => {
                      setSelectedSubject(p.subject);
                      setTopicInput(p.title);
                      handleAuditTopic(p.title);
                    }}
                  >
                    <Text style={styles.presetText}>{p.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => handleAuditTopic()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0B0C10" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Find Exam Blindspots</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'ANSWER' && (
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Topic (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Topic title"
              placeholderTextColor="#6B7280"
              value={topicInput}
              onChangeText={setTopicInput}
            />

            <View style={[styles.labelRow, { marginTop: 12 }]}>
              <Text style={styles.fieldLabel}>Draft Answer or Notes</Text>
              <TouchableOpacity onPress={showScanOptions} disabled={ocrLoading}>
                <Text style={styles.scanLink}>{ocrLoading ? 'Scanning...' : 'Scan Paper'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Paste answer text or notes to evaluate..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={answerInput}
              onChangeText={setAnswerInput}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleAuditAnswer} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#0B0C10" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Evaluate Answer</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Topic Audit Results */}
        {auditResult && auditResult.type === 'TOPIC' && (
          <View>
            <View style={styles.resultHeader}>
              <Text style={styles.resultSummary}>
                {auditResult.data.blindspotCount || 3} blindspots found for {activeExamLabel}
              </Text>
              <TouchableOpacity onPress={() => setSimulatorVisible(true)}>
                <Text style={styles.scanLink}>Simulate Score</Text>
              </TouchableOpacity>
            </View>

            {auditResult.data.aiBlindspots?.map((b, idx) => {
              const done = !!masteredMap[idx];
              return (
                <View key={idx} style={styles.resultRow}>
                  <View style={styles.resultTop}>
                    <Text style={[styles.resultTitle, done && { color: '#34D399' }]}>
                      {idx + 1}. {b.point}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setMasteredMap((prev) => ({ ...prev, [idx]: !done }));
                        if (!done) {
                          markGapMastered(idx);
                          awardCustomXp(25, 'Mastered Blindspot');
                        }
                      }}
                    >
                      <Text style={styles.linkMuted}>{done ? 'Done' : 'Mark'}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.warnLabel}>OMISSION</Text>
                  <Text style={styles.bodyText}>{b.whatAiMisses}</Text>
                  <Text style={[styles.warnLabel, { color: '#38BDF8', marginTop: 8 }]}>MARKING KEY</Text>
                  <Text style={styles.bodyText}>{b.examinerRubric}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Answer Audit Results */}
        {auditResult && auditResult.type === 'ANSWER' && (
          <View>
            <View style={styles.resultRow}>
              <Text style={styles.scoreNum}>{auditResult.data.score}/100 · {auditResult.data.grade}</Text>
              <Text style={styles.bodyText}>{auditResult.data.overallVerdict}</Text>
            </View>

            {auditResult.data.blindspotsFound?.map((gap, idx) => (
              <View key={idx} style={styles.resultRow}>
                <Text style={styles.resultTitle}>{gap.title}</Text>
                <Text style={styles.bodyText}>{gap.explanation}</Text>
                <Text style={[styles.bodyText, { color: '#38BDF8', marginTop: 6 }]}>Fix: {gap.fix}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 96 }} />
      </Animated.ScrollView>

      <Modal visible={examModalVisible} transparent animationType="fade" onRequestClose={() => setExamModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setExamModalVisible(false)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Exam</Text>
              <TouchableOpacity onPress={() => setExamModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.customRow}>
              <TextInput
                style={styles.customInput}
                placeholder="Custom exam..."
                placeholderTextColor="#6B7280"
                value={customExamInput}
                onChangeText={setCustomExamInput}
              />
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => {
                  if (customExamInput.trim()) {
                    setTargetExam(customExamInput.trim());
                    setCustomExamInput('');
                    setExamModalVisible(false);
                  }
                }}
              >
                <Text style={styles.applyText}>Set</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 340 }}>
              {EXAM_TARGETS.map((target) => {
                const isSel = activeExamLabel === target.label;
                return (
                  <TouchableOpacity
                    key={target.id}
                    style={styles.modalOption}
                    onPress={() => handleSelectExam(target.label)}
                  >
                    <Text style={[styles.modalOptText, isSel && { color: '#38BDF8' }]}>
                      {target.label}
                    </Text>
                    {isSel && <MaterialCommunityIcons name="check" size={18} color="#38BDF8" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
  container: { flex: 1, backgroundColor: '#0B0C10' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  headerTitle: { color: '#F9FAFB', fontSize: 22, fontWeight: '700' },
  headerLink: { color: '#38BDF8', fontSize: 12, fontWeight: '600', maxWidth: 200 },

  tabsRow: { flexDirection: 'row', gap: 24 },
  tabItem: { paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#38BDF8' },
  tabText: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#F9FAFB' },

  scrollContent: { padding: 20 },
  subjectStrip: {
    gap: 18,
    paddingBottom: 10,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  subjectTab: { paddingVertical: 4 },
  subjectTabActive: { borderBottomWidth: 2, borderBottomColor: '#38BDF8' },
  subjectTabText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  subjectTabTextActive: { color: '#F9FAFB' },

  formSection: { paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#1D1F2C' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  fieldLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  scanLink: { color: '#38BDF8', fontSize: 12, fontWeight: '600' },

  input: {
    backgroundColor: '#14161F',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#F9FAFB',
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: { minHeight: 110 },
  presetsRow: { gap: 14, marginBottom: 14 },
  presetText: { color: '#9CA3AF', fontSize: 12, textDecorationLine: 'underline' },

  primaryBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#0B0C10', fontSize: 14, fontWeight: '700' },

  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  resultSummary: { color: '#F3F4F6', fontSize: 13, fontWeight: '600' },
  resultRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1D1F2C', gap: 5 },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  resultTitle: { flex: 1, color: '#F9FAFB', fontSize: 15, fontWeight: '700' },
  linkMuted: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  warnLabel: { color: '#F87171', fontSize: 10, fontWeight: '700', marginTop: 4 },
  bodyText: { color: '#D1D5DB', fontSize: 13, lineHeight: 20 },
  scoreNum: { color: '#38BDF8', fontSize: 24, fontWeight: '700', marginBottom: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#14161F', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { color: '#F9FAFB', fontSize: 16, fontWeight: '700' },
  customRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  customInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#0B0C10',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#F9FAFB',
    fontSize: 13,
  },
  applyBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyText: { color: '#0B0C10', fontSize: 13, fontWeight: '700' },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  modalOptText: { color: '#F3F4F6', fontSize: 14 },
});
