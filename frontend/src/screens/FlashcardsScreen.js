import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  getCuratedFlashcardsForExam,
} from '../config/studyGuideData';
import { gsapTabTransition } from '../utils/gsapAnim';

export default function FlashcardsScreen() {
  const navigation = useNavigation();
  const { targetExam, targetStream, targetSubject, setTargetSubject, markGapMastered, awardCustomXp } = useUser();

  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  const cardSubjects = useMemo(
    () => ['All', ...getCuratedSubjectsForExam(targetExam, targetStream)],
    [targetExam, targetStream]
  );

  const selectedSubject = targetSubject || 'All';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const cardAnim = useRef(new Animated.Value(1)).current;

  const cards = useMemo(
    () => getCuratedFlashcardsForExam(targetExam, targetStream, selectedSubject) || [],
    [targetExam, targetStream, selectedSubject]
  );

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedCount(0);
  }, [targetExam, targetStream, selectedSubject]);

  const currentCard = cards[currentIndex];
  const isComplete = cards.length > 0 && currentIndex >= cards.length;

  const handleFlip = () => {
    gsapTabTransition(cardAnim);
    setIsFlipped((prev) => !prev);
  };

  const handleNext = (mastered = false) => {
    if (mastered && currentCard) {
      markGapMastered(currentCard.id);
      awardCustomXp(15, 'Mastered Flashcard');
    }
    gsapTabTransition(cardAnim);
    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);
    setCompletedCount((prev) => prev + 1);
  };

  const handleRestart = () => {
    gsapTabTransition(cardAnim);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedCount(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C10" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#F3F4F6" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Flashcards</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {activeExamLabel}{selectedSubject !== 'All' ? ` · ${selectedSubject}` : ''}
          </Text>
        </View>
        <Text style={styles.counterText}>
          {cards.length === 0 ? '0/0' : `${isComplete ? cards.length : currentIndex + 1}/${cards.length}`}
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${cards.length > 0 ? (completedCount / cards.length) * 100 : 0}%` },
          ]}
        />
      </View>

      {cardSubjects.length > 1 && (
        <View style={styles.subjectWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectStrip}>
            {cardSubjects.map((sub) => {
              const active = selectedSubject === sub;
              return (
                <TouchableOpacity
                  key={sub}
                  style={[styles.subjectTab, active && styles.subjectTabActive]}
                  onPress={() => setTargetSubject(sub)}
                >
                  <Text style={[styles.subjectTabText, active && styles.subjectTabTextActive]}>
                    {sub === 'All' ? 'All Subjects' : sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {cards.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No flashcards for this filter</Text>
          <Text style={styles.emptySub}>Try selecting All Subjects.</Text>
        </View>
      ) : isComplete ? (
        <Animated.View style={[styles.completeContainer, { opacity: cardAnim }]}>
          <Text style={styles.completeTitle}>Deck Complete</Text>
          <Text style={styles.completeSub}>Reviewed all {cards.length} cards.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleRestart}>
            <Text style={styles.primaryBtnText}>Review Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.textBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.textBtnText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.cardArea, { opacity: cardAnim }]}>
          <TouchableOpacity style={styles.flashcard} onPress={handleFlip} activeOpacity={0.9}>
            <View style={styles.cardTop}>
              <Text style={styles.cardSubject}>{currentCard.subject}</Text>
              <Text style={styles.flipHint}>{isFlipped ? 'Question' : 'Tap to flip'}</Text>
            </View>

            {!isFlipped ? (
              <View style={styles.frontBody}>
                <Text style={styles.topicLabel}>{currentCard.topicTitle}</Text>
                <Text style={styles.questionText}>{currentCard.question}</Text>
              </View>
            ) : (
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.pointTitle}>{currentCard.point}</Text>
                <Text style={styles.answerLabel}>WHERE MARKS ARE LOST</Text>
                <Text style={styles.answerBody}>{currentCard.whatAiMisses}</Text>
                <Text style={[styles.answerLabel, { color: '#38BDF8', marginTop: 16 }]}>EXAMINER KEY</Text>
                <Text style={styles.answerBody}>{currentCard.examinerRubric}</Text>
              </ScrollView>
            )}
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleNext(false)}>
              <Text style={styles.secondaryBtnText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { flex: 1.5 }]} onPress={() => handleNext(true)}>
              <Text style={styles.primaryBtnText}>Mastered</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
  counterText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },

  progressTrack: { height: 2, backgroundColor: '#1D1F2C', width: '100%' },
  progressFill: { height: '100%', backgroundColor: '#38BDF8' },

  subjectWrap: { borderBottomWidth: 1, borderBottomColor: '#1D1F2C' },
  subjectStrip: { paddingHorizontal: 20, gap: 18, paddingVertical: 10 },
  subjectTab: { paddingVertical: 4 },
  subjectTabActive: { borderBottomWidth: 2, borderBottomColor: '#38BDF8' },
  subjectTabText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  subjectTabTextActive: { color: '#F9FAFB' },

  cardArea: { flex: 1, padding: 20, justifyContent: 'space-between' },
  flashcard: {
    flex: 1,
    backgroundColor: '#14161F',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  cardSubject: { color: '#38BDF8', fontSize: 12, fontWeight: '600' },
  flipHint: { color: '#6B7280', fontSize: 12 },
  frontBody: { flex: 1, justifyContent: 'center', gap: 12 },
  topicLabel: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  questionText: { color: '#F9FAFB', fontSize: 20, fontWeight: '700', lineHeight: 28 },

  pointTitle: { color: '#F9FAFB', fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 14 },
  answerLabel: { color: '#F87171', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  answerBody: { color: '#D1D5DB', fontSize: 14, lineHeight: 21 },

  actionsRow: { flexDirection: 'row', gap: 12, paddingBottom: Platform.OS === 'ios' ? 16 : 6 },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#14161F',
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
  primaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#0B0C10', fontSize: 14, fontWeight: '700' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  emptyTitle: { color: '#F3F4F6', fontSize: 16, fontWeight: '600' },
  emptySub: { color: '#6B7280', fontSize: 13 },

  completeContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 },
  completeTitle: { color: '#F9FAFB', fontSize: 22, fontWeight: '700' },
  completeSub: { color: '#9CA3AF', fontSize: 14 },
  textBtn: { paddingVertical: 10 },
  textBtnText: { color: '#9CA3AF', fontSize: 14 },
});
