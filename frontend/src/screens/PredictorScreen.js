import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import {
  EXAM_TARGETS,
  getCuratedSubjectsForExam,
  getCuratedPredictorQuestionsForExam,
} from '../config/studyGuideData';
import MarkingSimulatorModal from '../components/MarkingSimulatorModal';
import { gsapTabTransition } from '../utils/gsapAnim';

export default function PredictorScreen() {
  const navigation = useNavigation();
  const { targetExam, targetStream, targetSubject, setTargetSubject } = useUser();

  const [selectedTier, setSelectedTier] = useState('All');
  const [simulatorItem, setSimulatorItem] = useState(null);
  const tabAnim = useRef(new Animated.Value(1)).current;

  const selectedSubject = targetSubject || 'All';

  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  const examSubjects = useMemo(
    () => ['All', ...getCuratedSubjectsForExam(targetExam, targetStream)],
    [targetExam, targetStream]
  );

  const allQuestions = useMemo(
    () => getCuratedPredictorQuestionsForExam(targetExam, targetStream, selectedSubject) || [],
    [targetExam, targetStream, selectedSubject]
  );

  useEffect(() => {
    setSelectedTier('All');
  }, [targetExam, targetStream, selectedSubject]);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (selectedTier === 'Guaranteed') return q.probability >= 85;
      if (selectedTier === 'Frequent') return q.probability < 85;
      return true;
    });
  }, [allQuestions, selectedTier]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C10" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#F3F4F6" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Question Predictor</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {activeExamLabel}{selectedSubject !== 'All' ? ` · ${selectedSubject}` : ''}
          </Text>
        </View>
        <Text style={styles.countText}>{filteredQuestions.length}</Text>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: tabAnim }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectStrip}>
          {examSubjects.map((sub) => {
            const active = selectedSubject === sub;
            return (
              <TouchableOpacity
                key={sub}
                style={[styles.subjectTab, active && styles.subjectTabActive]}
                onPress={() => {
                  gsapTabTransition(tabAnim);
                  setTargetSubject(sub);
                }}
              >
                <Text style={[styles.subjectTabText, active && styles.subjectTabTextActive]}>
                  {sub === 'All' ? 'All Subjects' : sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.tierRow}>
          {['All', 'Guaranteed', 'Frequent'].map((t) => (
            <TouchableOpacity key={t} onPress={() => setSelectedTier(t)}>
              <Text style={[styles.tierText, selectedTier === t && styles.tierTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredQuestions.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemMeta}>
              {item.subject} · {item.probability}% Likely · {item.marks} Marks
            </Text>
            <Text style={styles.itemTopic}>{item.topic}</Text>
            <Text style={styles.itemTrap}>{item.trapSummary}</Text>

            <View style={styles.itemActions}>
              <TouchableOpacity onPress={() => setSimulatorItem(item)}>
                <Text style={styles.linkCyan}>Practice Rubric</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Flow', {
                    searchQuery: item.topic,
                    initialSubject: item.subject,
                  })
                }
              >
                <Text style={styles.linkMuted}>Watch</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('AIGapAuditor', {
                    initialTopic: item.topic,
                    initialSubject: item.subject,
                    mode: 'TOPIC',
                  })
                }
              >
                <Text style={styles.linkMuted}>Audit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 80 }} />
      </Animated.ScrollView>

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
  container: { flex: 1, backgroundColor: '#0B0C10' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  headerTitle: { color: '#F9FAFB', fontSize: 18, fontWeight: '700' },
  headerSub: { color: '#9CA3AF', fontSize: 12, marginTop: 1 },
  countText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },

  scrollContent: { padding: 20 },
  subjectStrip: {
    gap: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  subjectTab: { paddingVertical: 4 },
  subjectTabActive: { borderBottomWidth: 2, borderBottomColor: '#38BDF8' },
  subjectTabText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  subjectTabTextActive: { color: '#F9FAFB' },

  tierRow: {
    flexDirection: 'row',
    gap: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  tierText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  tierTextActive: { color: '#38BDF8' },

  itemRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
    gap: 5,
  },
  itemMeta: { color: '#6B7280', fontSize: 12 },
  itemTopic: { color: '#F9FAFB', fontSize: 15, fontWeight: '600', lineHeight: 21 },
  itemTrap: { color: '#9CA3AF', fontSize: 13, lineHeight: 19 },
  itemActions: { flexDirection: 'row', gap: 18, marginTop: 6 },
  linkCyan: { color: '#38BDF8', fontSize: 13, fontWeight: '600' },
  linkMuted: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
});
