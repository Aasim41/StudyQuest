import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  TextInput,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import {
  EXAM_TARGETS,
  EXAM_CATEGORIES,
  getExamMeta,
  getStreamsForExam,
  resolveStreamForExam,
  getSubjectsForExamAndStream,
  getCuratedSubjectsForExam,
  getCuratedVaultQuestionsForExam,
} from '../config/studyGuideData';
import { gsapTabTransition } from '../utils/gsapAnim';

export default function ExamTargetsScreen() {
  const navigation = useNavigation();
  const {
    targetExam,
    targetStream,
    targetSubject,
    setTargetExam,
    setTargetStream,
    setTargetSubject,
    markGapMastered,
    awardCustomXp,
  } = useUser();

  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'pattern' | 'vault'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [customExamInput, setCustomExamInput] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [masteredItems, setMasteredItems] = useState({});

  const selectedSubject = targetSubject || 'All';
  const tabAnim = useRef(new Animated.Value(1)).current;

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    gsapTabTransition(tabAnim);
    setActiveTab(tab);
  };

  const activeExamObj = useMemo(() => {
    return (
      EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam) || {
        id: 'CUSTOM',
        label: targetExam || 'Custom Target',
        weightage: 'Custom Scheme',
        markingScheme: 'Standard step-marking with SI unit checks.',
      }
    );
  }, [targetExam]);

  const examMeta = useMemo(() => getExamMeta(targetExam), [targetExam]);
  const streams = useMemo(() => getStreamsForExam(targetExam), [targetExam]);
  const activeStreamObj = useMemo(() => resolveStreamForExam(targetExam, targetStream), [targetExam, targetStream]);
  const streamSubjects = useMemo(() => getSubjectsForExamAndStream(targetExam, targetStream), [targetExam, targetStream]);
  const examSubjectNames = useMemo(() => ['All', ...getCuratedSubjectsForExam(targetExam, targetStream)], [targetExam, targetStream]);

  const filteredExams = useMemo(() => {
    if (categoryFilter === 'ALL') return EXAM_TARGETS;
    return EXAM_TARGETS.filter((e) => e.category === categoryFilter);
  }, [categoryFilter]);

  const filteredQuestions = useMemo(
    () => getCuratedVaultQuestionsForExam(targetExam, selectedSubject, targetStream),
    [targetExam, selectedSubject, targetStream]
  );

  const handleSelectExam = async (examLabel) => {
    const newStreams = getStreamsForExam(examLabel);
    const firstStreamId = newStreams[0]?.id || 'pcm';
    await setTargetExam(examLabel, firstStreamId);
  };

  const handleApplyCustom = async () => {
    const clean = customExamInput.trim();
    if (!clean) return;
    await setTargetExam(clean);
    setCustomExamInput('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C10" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="arrow-left" size={22} color="#F3F4F6" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{activeExamObj.label}</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {streams.length > 1 && activeStreamObj ? activeStreamObj.label : 'All Board Subjects'}
              {selectedSubject !== 'All' ? ` · ${selectedSubject}` : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.canGoBack()
                ? navigation.goBack()
                : navigation.navigate('MainTabs', { screen: 'Dashboard' })
            }
          >
            <Text style={styles.headerLink}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsRow}>
          {[
            { id: 'exams', label: 'Exam & Stream' },
            { id: 'pattern', label: 'Pattern' },
            { id: 'vault', label: `Traps (${filteredQuestions.length})` },
          ].map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabItem, activeTab === t.id && styles.tabItemActive]}
              onPress={() => switchTab(t.id)}
            >
              <Text style={[styles.tabText, activeTab === t.id && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: tabAnim }}
      >
        {activeTab === 'exams' && (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.textStrip}>
              {EXAM_CATEGORIES.map((cat) => {
                const active = categoryFilter === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.stripTab, active && styles.stripTabActive]}
                    onPress={() => setCategoryFilter(cat.id)}
                  >
                    <Text style={[styles.stripText, active && styles.stripTextActive]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {streams.length > 1 ? (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>STREAM</Text>
                {streams.map((st) => {
                  const active = activeStreamObj?.id === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={styles.listRow}
                      onPress={() => setTargetStream(st.id)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.rowTitle, active && { color: '#38BDF8' }]}>{st.label}</Text>
                        <Text style={styles.rowSub}>{st.desc}</Text>
                      </View>
                      {active && <MaterialCommunityIcons name="check" size={18} color="#38BDF8" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              streams[0] && (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionLabel}>CURRICULUM SCOPE</Text>
                  <Text style={styles.rowTitle}>{streams[0].label}</Text>
                  <Text style={styles.rowSub}>{streams[0].desc}</Text>
                </View>
              )
            )}

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>SUBJECT FILTER</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.textStrip}>
                {examSubjectNames.map((sub) => {
                  const active = selectedSubject === sub;
                  return (
                    <TouchableOpacity
                      key={sub}
                      style={[styles.stripTab, active && styles.stripTabActive]}
                      onPress={() => setTargetSubject(sub)}
                    >
                      <Text style={[styles.stripText, active && styles.stripTextActive]}>
                        {sub === 'All' ? 'All Subjects' : sub}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.customExamRow}>
              <TextInput
                style={styles.customInput}
                placeholder="Or enter custom exam..."
                placeholderTextColor="#6B7280"
                value={customExamInput}
                onChangeText={setCustomExamInput}
              />
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCustom}>
                <Text style={styles.applyText}>Set</Text>
              </TouchableOpacity>
            </View>

            {filteredExams.map((ex) => {
              const isSel = activeExamObj.label === ex.label;
              return (
                <TouchableOpacity
                  key={ex.id}
                  style={styles.listRow}
                  onPress={() => handleSelectExam(ex.label)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, isSel && { color: '#38BDF8' }]}>{ex.label}</Text>
                    <Text style={styles.rowSub}>{ex.weightage} · {ex.examType}</Text>
                  </View>
                  {isSel && <MaterialCommunityIcons name="check" size={18} color="#38BDF8" />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {activeTab === 'pattern' && (
          <View>
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>BODY & PATTERN</Text>
              <Text style={styles.rowTitle}>{examMeta.boardBody}</Text>
              <Text style={styles.rowSub}>Duration: {examMeta.duration}</Text>
              <Text style={[styles.rowSub, { marginTop: 6 }]}>{examMeta.passingRule}</Text>
              {activeExamObj.markingScheme ? (
                <Text style={[styles.rowSub, { marginTop: 8, color: '#D1D5DB' }]}>
                  {activeExamObj.markingScheme}
                </Text>
              ) : null}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>SUBJECT BREAKDOWN</Text>
            {streamSubjects.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={styles.listRow}
                onPress={() => {
                  setTargetSubject(sub.name);
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>
                    {sub.name}{sub.code ? ` (${sub.code})` : ''}
                  </Text>
                  <Text style={styles.rowSub}>
                    {sub.marksSplit} · {(sub.chapters || []).length} units
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'vault' && (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.textStrip}>
              {examSubjectNames.map((sub) => {
                const active = selectedSubject === sub;
                return (
                  <TouchableOpacity
                    key={sub}
                    style={[styles.stripTab, active && styles.stripTabActive]}
                    onPress={() => setTargetSubject(sub)}
                  >
                    <Text style={[styles.stripText, active && styles.stripTextActive]}>
                      {sub === 'All' ? 'All Subjects' : sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {filteredQuestions.map((item) => {
              const isExp = !!expandedCards[item.id];
              const isMastered = !!masteredItems[item.id];
              return (
                <View key={item.id} style={styles.vaultRow}>
                  <TouchableOpacity
                    onPress={() => setExpandedCards((p) => ({ ...p, [item.id]: !p[item.id] }))}
                  >
                    <Text style={styles.rowSub}>{item.subject} · {item.marks} Marks</Text>
                    <Text style={[styles.rowTitle, isMastered && { color: '#34D399' }]}>{item.title}</Text>
                    <Text style={[styles.rowSub, { marginTop: 4 }]}>{item.trapDescription}</Text>
                  </TouchableOpacity>

                  {isExp && (
                    <View style={{ marginTop: 10, gap: 6 }}>
                      {(item.examinerRubric || []).map((r, rIdx) => (
                        <Text key={rIdx} style={styles.rubricText}>• {r}</Text>
                      ))}
                    </View>
                  )}

                  <View style={styles.vaultActions}>
                    <TouchableOpacity
                      onPress={() => setExpandedCards((p) => ({ ...p, [item.id]: !p[item.id] }))}
                    >
                      <Text style={styles.linkCyan}>{isExp ? 'Hide Key' : 'Examiner Key'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        const done = !!masteredItems[item.id];
                        setMasteredItems((p) => ({ ...p, [item.id]: !done }));
                        if (!done) {
                          markGapMastered(item.id);
                          awardCustomXp(25, 'Mastered Question');
                        }
                      }}
                    >
                      <Text style={styles.linkMuted}>{isMastered ? 'Mastered' : 'Mark Done'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('AIGapAuditor', {
                          initialTopic: item.title,
                          initialSubject: item.subject,
                          mode: 'TOPIC',
                        })
                      }
                    >
                      <Text style={styles.linkMuted}>Audit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 48 }} />
      </Animated.ScrollView>
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
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  headerTitle: { color: '#F9FAFB', fontSize: 18, fontWeight: '700' },
  headerSub: { color: '#9CA3AF', fontSize: 12, marginTop: 1 },
  headerLink: { color: '#38BDF8', fontSize: 13, fontWeight: '600' },

  tabsRow: { flexDirection: 'row', gap: 24 },
  tabItem: { paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#38BDF8' },
  tabText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#F9FAFB' },

  scrollContent: { padding: 20 },
  textStrip: {
    gap: 18,
    paddingBottom: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  stripTab: { paddingVertical: 4 },
  stripTabActive: { borderBottomWidth: 2, borderBottomColor: '#38BDF8' },
  stripText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  stripTextActive: { color: '#F9FAFB' },

  sectionBlock: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1D1F2C' },
  sectionLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
    gap: 12,
  },
  rowTitle: { color: '#F3F4F6', fontSize: 15, fontWeight: '600' },
  rowSub: { color: '#9CA3AF', fontSize: 12, marginTop: 2, lineHeight: 18 },

  customExamRow: { flexDirection: 'row', gap: 8, marginVertical: 14 },
  customInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#14161F',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#F9FAFB',
    fontSize: 13,
  },
  applyBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: { color: '#0B0C10', fontSize: 13, fontWeight: '700' },

  vaultRow: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#1D1F2C' },
  rubricText: { color: '#D1D5DB', fontSize: 13, lineHeight: 19 },
  vaultActions: { flexDirection: 'row', gap: 18, marginTop: 10 },
  linkCyan: { color: '#38BDF8', fontSize: 13, fontWeight: '600' },
  linkMuted: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
});
