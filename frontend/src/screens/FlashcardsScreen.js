import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import {
  EXAM_TARGETS,
  getCuratedFlashcardsForExam,
} from '../config/studyGuideData';

const { width } = Dimensions.get('window');

export default function FlashcardsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { targetExam, markGapMastered, awardCustomXp } = useUser();

  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  // Build card deck curated specifically for the active target exam
  const cards = useMemo(() => {
    const curated = getCuratedFlashcardsForExam(targetExam);
    return curated && curated.length > 0 ? curated : [];
  }, [targetExam]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  // Reset progress when active target exam is switched
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedCount(0);
  }, [targetExam]);

  const currentCard = cards[currentIndex];
  const isComplete = currentIndex >= cards.length;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = (mastered = false) => {
    if (mastered && currentCard) {
      markGapMastered(currentCard.id);
      awardCustomXp(15, 'Mastered Flashcard');
    }
    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);
    setCompletedCount((prev) => prev + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedCount(0);
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

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>60-Second Exam Deck</Text>
          <Text style={styles.headerSubtitle}>{activeExamLabel}</Text>
        </View>

        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {isComplete ? cards.length : currentIndex + 1}/{cards.length}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${cards.length > 0 ? (completedCount / cards.length) * 100 : 0}%` },
          ]}
        />
      </View>

      {isComplete ? (
        /* Completion Screen */
        <View style={styles.completeContainer}>
          <View style={styles.trophyCircle}>
            <MaterialCommunityIcons name="trophy" size={48} color="#FFD32A" />
          </View>
          <Text style={styles.completeTitle}>Session Complete!</Text>
          <Text style={styles.completeSub}>
            You reviewed all {cards.length} high-yield blindspots for {activeExamLabel}.
          </Text>

          <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
            <MaterialCommunityIcons name="reload" size={18} color="#FFFFFF" />
            <Text style={styles.restartBtnText}>Review Deck Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backGuidesBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backGuidesText}>Return to Guides</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Active Flashcard */
        <View style={styles.cardArea}>
          <TouchableOpacity
            style={[styles.flashcard, isFlipped ? styles.flashcardBack : styles.flashcardFront]}
            onPress={handleFlip}
            activeOpacity={0.92}
          >
            {/* Top Tag */}
            <View style={styles.cardTopRow}>
              <View style={styles.subjectPill}>
                <Text style={styles.subjectPillText}>{currentCard.subject}</Text>
              </View>
              <Text style={styles.flipHintText}>
                {isFlipped ? 'Tap to see Question' : 'Tap to reveal Blindspot'}
              </Text>
            </View>

            {!isFlipped ? (
              /* Front of Card */
              <View style={styles.cardContentFront}>
                <Text style={styles.cardTopicTitle}>{currentCard.topicTitle}</Text>
                <Text style={styles.cardQuestionText}>{currentCard.question}</Text>
                <View style={styles.tapPrompt}>
                  <MaterialCommunityIcons name="gesture-tap" size={20} color="#00D2FF" />
                  <Text style={styles.tapPromptText}>Tap to reveal what generic AI misses</Text>
                </View>
              </View>
            ) : (
              /* Back of Card */
              <View style={styles.cardContentBack}>
                <Text style={styles.backBlindspotHeading}>
                  ⚠️ Point: {currentCard.point}
                </Text>

                <View style={styles.backMissBox}>
                  <Text style={styles.backMissLabel}>What Generic AI Skips:</Text>
                  <Text style={styles.backMissText}>{currentCard.whatAiMisses}</Text>
                </View>

                <View style={styles.backRubricBox}>
                  <Text style={styles.backRubricLabel}>Examiner Scoring Key:</Text>
                  <Text style={styles.backRubricText}>{currentCard.examinerRubric}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.reviewAgainBtn}
              onPress={() => handleNext(false)}
            >
              <MaterialCommunityIcons name="reload" size={16} color="#8E8EA8" />
              <Text style={styles.reviewAgainText}>Review Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.masteredBtn}
              onPress={() => handleNext(true)}
            >
              <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
              <Text style={styles.masteredBtnText}>Mastered (+15 XP)</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D0D20',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#00D2FF',
    marginTop: 1,
  },
  counterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DDDDEE',
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D2FF',
  },
  cardArea: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  flashcard: {
    borderRadius: 20,
    padding: 20,
    minHeight: 380,
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  flashcardFront: {
    backgroundColor: '#121228',
    borderColor: 'rgba(0, 210, 255, 0.25)',
  },
  flashcardBack: {
    backgroundColor: '#151532',
    borderColor: 'rgba(108, 92, 231, 0.4)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectPill: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subjectPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A29BFE',
    textTransform: 'uppercase',
  },
  flipHintText: {
    fontSize: 11,
    color: '#8E8EA8',
  },
  cardContentFront: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  cardTopicTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00D2FF',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardQuestionText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
  },
  tapPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tapPromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00D2FF',
  },
  cardContentBack: {
    flex: 1,
    justifyContent: 'center',
  },
  backBlindspotHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF6B81',
    marginBottom: 14,
  },
  backMissBox: {
    backgroundColor: 'rgba(255, 165, 2, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFA502',
    marginBottom: 12,
  },
  backMissLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFA502',
    marginBottom: 4,
  },
  backMissText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  backRubricBox: {
    backgroundColor: 'rgba(46, 213, 115, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2ED573',
  },
  backRubricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2ED573',
    marginBottom: 4,
  },
  backRubricText: {
    fontSize: 12,
    color: '#CCD0E0',
    lineHeight: 17,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  reviewAgainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  reviewAgainText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8EA8',
  },
  masteredBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C5CE7',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  masteredBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  completeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  completeSub: {
    fontSize: 13,
    color: '#8E8EA8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  restartBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backGuidesBtn: {
    paddingVertical: 10,
  },
  backGuidesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00D2FF',
  },
});
