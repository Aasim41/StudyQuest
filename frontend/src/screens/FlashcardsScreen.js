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
  resolveStreamForExam,
} from '../config/studyGuideData';
import { gsapTabTransition } from '../utils/gsapAnim';

export default function FlashcardsScreen() {
  const navigation = useNavigation();
  const { targetExam, targetStream, targetSubject, setTargetSubject, markGapMastered, awardCustomXp } = useUser();

  const streamObj = useMemo(() => resolveStreamForExam(targetExam, targetStream), [targetExam, targetStream]);

  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  const cardSubjects = useMemo(() => {
    return ['All', ...getCuratedSubjectsForExam(targetExam, targetStream)];
  }, [targetExam, targetStream]);

  const selectedSubject = targetSubject || 'All';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const cardAnim = useRef(new Animated.Value(1)).current;

  const cards = useMemo(() => {
    return getCuratedFlashcardsForExam(targetExam, targetStream, selectedSubject) || [];
  }, [targetExam, targetStream, selectedSubject]);

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
      <StatusBar barStyle="light-content" backgroundColor="#0B0C12" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>60s Blindspot Deck</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {selectedSubject && selectedSubject !== 'All'
              ? `${activeExamLabel} • ${selectedSubject}`
              : streamObj
                ? `${activeExamLabel} • ${streamObj.label}`
                : activeExamLabel}
          </Text>
        </View>

        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {cards.length === 0 ? '0/0' : `${isComplete ? cards.length : currentIndex + 1}/${cards.length}`}
          </Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${cards.length > 0 ? (completedCount / cards.length) * 100 : 0}%` },
          ]}
        />
      </View>

      {/* Compact Subject Filter Strip */}
      {cardSubjects.length > 1 && (
        <View style={styles.filterWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {cardSubjects.map((sub) => {
              const active = selectedSubject === sub;
              return (
                <TouchableOpacity
                  key={sub}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setTargetSubject(sub)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
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
          <MaterialCommunityIcons name="cards-outline" size={38} color="#555577" />
          <Text style={styles.emptyTitle}>No Cards For Selection</Text>
          <Text style={styles.emptySub}>Switch subject filter or change your exam stream.</Text>
        </View>
      ) : isComplete ? (
        <Animated.View style={[styles.completeContainer, { opacity: cardAnim }]}>
          <View style={styles.trophyCircle}>
            <MaterialCommunityIcons name="trophy" size={42} color="#FFB800" />
          </View>
          <Text style={styles.completeTitle}>Deck Cleared</Text>
          <Text style={styles.completeSub}>
            Reviewed all {cards.length} verified blindspots for {activeExamLabel}.
          </Text>

          <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
            <MaterialCommunityIcons name="reload" size={17} color="#0B0C12" />
            <Text style={styles.restartBtnText}>Review Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backGuidesBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backGuidesText}>Back to Syllabus</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.cardArea, { opacity: cardAnim }]}>
          <TouchableOpacity
            style={[styles.flashcard, isFlipped && styles.flashcardBack]}
            onPress={handleFlip}
            activeOpacity={0.92}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.subjectPill}>
                <Text style={styles.subjectPillText}>{currentCard.subject}</Text>
              </View>
              <Text style={styles.flipHintText}>
                {isFlipped ? 'Tap for Question' : 'Tap to Reveal Key'}
              </Text>
            </View>

            {!isFlipped ? (
              <View style={styles.cardBody}>
                <Text style={styles.cardTopicTitle}>{currentCard.topicTitle}</Text>
                <Text style={styles.cardQuestionText}>{currentCard.question}</Text>
                <View style={styles.tapPrompt}>
                  <MaterialCommunityIcons name="gesture-tap" size={18} color="#00E5FF" />
                  <Text style={styles.tapPromptText}>Reveal examiner key & hidden trap</Text>
                </View>
              </View>
            ) : (
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.backBlindspotHeading}>{currentCard.point}</Text>

                <View style={styles.backMissBox}>
                  <Text style={styles.backMissLabel}>WHERE STUDENTS LOSE MARKS</Text>
                  <Text style={styles.backMissText}>{currentCard.whatAiMisses}</Text>
                </View>

                <View style={styles.backRubricBox}>
                  <Text style={styles.backRubricLabel}>EXAMINER SCORING KEY</Text>
                  <Text style={styles.backRubricText}>{currentCard.examinerRubric}</Text>
                </View>
              </ScrollView>
            )}
          </TouchableOpacity>

          {/* Bottom Controls */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.reviewAgainBtn}
              onPress={() => handleNext(false)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="reload" size={16} color="#8E8EA8" />
              <Text style={styles.reviewAgainText}>Review Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.masteredBtn}
              onPress={() => handleNext(true)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="check-decagram" size={16} color="#0B0C12" />
              <Text style={styles.masteredBtnText}>Mastered (+15 XP)</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C12' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: '#12141F',
    borderBottomWidth: 1,
    borderBottomColor: '#222436',
    gap: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#222436',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  headerSubtitle: { color: '#777799', fontSize: 11, fontWeight: '600', marginTop: 1 },
  counterBadge: {
    backgroundColor: '#00E5FF14',
    borderWidth: 1,
    borderColor: '#00E5FF44',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  counterText: { color: '#00E5FF', fontSize: 12, fontWeight: '800' },

  progressTrack: { height: 3, backgroundColor: '#181B29', width: '100%' },
  progressFill: { height: '100%', backgroundColor: '#00E5FF' },

  filterWrap: { paddingTop: 12, paddingBottom: 4 },
  filterScroll: { paddingHorizontal: 18, gap: 8 },
  filterChip: {
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterChipActive: { backgroundColor: '#00E5FF', borderColor: '#00E5FF' },
  filterChipText: { color: '#8E8EA8', fontSize: 11, fontWeight: '700' },
  filterChipTextActive: { color: '#0B0C12', fontWeight: '800' },

  cardArea: { flex: 1, padding: 18, justifyContent: 'space-between' },
  flashcard: {
    flex: 1,
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  },
  flashcardBack: { borderColor: '#00E5FF' },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  subjectPill: {
    backgroundColor: '#00E5FF15',
    borderWidth: 1,
    borderColor: '#00E5FF44',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subjectPillText: { color: '#00E5FF', fontSize: 11, fontWeight: '800' },
  flipHintText: { color: '#777799', fontSize: 11, fontWeight: '600' },

  cardBody: { flex: 1, justifyContent: 'center', gap: 14 },
  cardTopicTitle: { color: '#00E5FF', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  cardQuestionText: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', lineHeight: 27 },
  tapPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#222436',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tapPromptText: { color: '#8E8EA8', fontSize: 12, fontWeight: '600' },

  backBlindspotHeading: { color: '#FFB800', fontSize: 16, fontWeight: '800', lineHeight: 22, marginBottom: 14 },
  backMissBox: {
    backgroundColor: '#FF475712',
    borderWidth: 1,
    borderColor: '#FF475744',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 5,
  },
  backMissLabel: { color: '#FF6B81', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  backMissText: { color: '#E2E4F0', fontSize: 13, lineHeight: 19 },
  backRubricBox: {
    backgroundColor: '#00E5A312',
    borderWidth: 1,
    borderColor: '#00E5A344',
    borderRadius: 10,
    padding: 12,
    gap: 5,
  },
  backRubricLabel: { color: '#00E5A3', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  backRubricText: { color: '#FFFFFF', fontSize: 13, lineHeight: 19, fontWeight: '600' },

  actionsRow: { flexDirection: 'row', gap: 10, paddingBottom: Platform.OS === 'ios' ? 16 : 6 },
  reviewAgainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    paddingVertical: 14,
    borderRadius: 10,
  },
  reviewAgainText: { color: '#8E8EA8', fontSize: 13, fontWeight: '700' },
  masteredBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00E5FF',
    paddingVertical: 14,
    borderRadius: 10,
  },
  masteredBtnText: { color: '#0B0C12', fontSize: 13, fontWeight: '800' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 8 },
  emptyTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  emptySub: { color: '#8E8EA8', fontSize: 13, textAlign: 'center' },

  completeContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  trophyCircle: {
    width: 78,
    height: 78,
    borderRadius: 16,
    backgroundColor: '#FFB80015',
    borderWidth: 1,
    borderColor: '#FFB80044',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  completeSub: { color: '#8E8EA8', fontSize: 13, textAlign: 'center', lineHeight: 19 },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#00E5FF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  restartBtnText: { color: '#0B0C12', fontSize: 14, fontWeight: '800' },
  backGuidesBtn: { paddingVertical: 12 },
  backGuidesText: { color: '#8E8EA8', fontSize: 13, fontWeight: '700' },
});
