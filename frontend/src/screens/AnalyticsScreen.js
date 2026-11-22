import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { EXAM_TARGETS, SUBJECT_TOPICS } from '../config/studyGuideData';
import { generateAndShareCheatSheetPdf } from '../services/pdfService';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const navigation = useNavigation();
  const {
    userStats,
    targetExam,
    masteredGapsCount,
    savedGuides,
    auditedHistory,
  } = useUser();

  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  // Overall readiness calculation
  const readinessScore = useMemo(() => {
    const mastered = masteredGapsCount || 0;
    const audited = auditedHistory.length;
    const saved = savedGuides.length;
    const computed = Math.round((mastered * 5) + (audited * 6) + (saved * 4));
    return Math.min(100, Math.max(computed, 40));
  }, [masteredGapsCount, auditedHistory, savedGuides]);

  const handleOpenGuide = (guide) => {
    navigation.navigate('StudyGuideDetail', { guide });
  };

  const handleOpenAuditor = () => {
    navigation.navigate('AIGapAuditor', { mode: 'TOPIC' });
  };

  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExportPdf = async () => {
    try {
      setPdfLoading(true);
      // Compile topics from saved guides or fallback to default curated
      let exportTopics = savedGuides;
      if (!exportTopics || exportTopics.length === 0) {
        exportTopics = [];
        Object.values(SUBJECT_TOPICS).forEach((arr) => {
          if (arr[0]) exportTopics.push(arr[0]);
        });
      }
      const res = await generateAndShareCheatSheetPdf('Mastery Summary', activeExamLabel, exportTopics.slice(0, 8));
      if (!res.success) {
        Alert.alert('PDF Export', res.error || 'Could not generate PDF.');
      }
    } catch (e) {
      Alert.alert('Export Error', 'Failed to generate cheat sheet PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1A" />

      {/* Clean Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Mastery</Text>
        <Text style={styles.headerSubtitle}>
          Exam readiness & blindspots mastered for <Text style={styles.targetText}>{activeExamLabel}</Text>
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Readiness Score Card */}
        <View style={styles.readinessCard}>
          <View style={styles.readinessTop}>
            <View>
              <Text style={styles.readinessLabel}>EXAM READINESS</Text>
              <Text style={styles.readinessScore}>{readinessScore}%</Text>
            </View>
            <View style={styles.readinessBadge}>
              <MaterialCommunityIcons name="shield-check" size={28} color="#00D2FF" />
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${readinessScore}%` }]} />
          </View>
          <Text style={styles.readinessFootnote}>
            {readinessScore >= 80
              ? 'Excellent: Strong coverage of tricky edge cases & examiner keys.'
              : 'Keep going: Audit more topics to eliminate remaining blindspots.'}
          </Text>
        </View>

        {/* 3 Clean Minimal Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{masteredGapsCount || 0}</Text>
            <Text style={styles.statLabel}>Blindspots Mastered</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{auditedHistory.length}</Text>
            <Text style={styles.statLabel}>Audits Run</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{savedGuides.length}</Text>
            <Text style={styles.statLabel}>Saved Guides</Text>
          </View>
        </View>

        {/* Clean Quick Tools Row */}
        <View style={styles.masteryToolsRow}>
          <TouchableOpacity
            style={styles.masteryToolBtn}
            onPress={() => navigation.navigate('Flashcards')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="cards-outline" size={16} color="#A29BFE" />
            <Text style={styles.masteryToolText}>60s Deck</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.masteryToolBtn}
            onPress={() => navigation.navigate('Predictor')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="radar" size={16} color="#00D2FF" />
            <Text style={styles.masteryToolText}>Exam Radar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.masteryToolBtn}
            onPress={handleExportPdf}
            disabled={pdfLoading}
            activeOpacity={0.8}
          >
            {pdfLoading ? (
              <ActivityIndicator size="small" color="#FFD32A" />
            ) : (
              <>
                <MaterialCommunityIcons name="file-pdf-box" size={16} color="#FFD32A" />
                <Text style={styles.masteryToolText}>PDF Sheet</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Saved Study Guides Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Study Guides</Text>
          {savedGuides.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="bookmark-outline" size={32} color="#777799" />
              <Text style={styles.emptyTitle}>No saved guides yet</Text>
              <Text style={styles.emptySubtitle}>
                Bookmark high-yield topics from the Guides tab for quick revision.
              </Text>
            </View>
          ) : (
            <View style={styles.savedList}>
              {savedGuides.map((guide, idx) => (
                <TouchableOpacity
                  key={guide.id || idx}
                  style={styles.savedCard}
                  onPress={() => handleOpenGuide(guide)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.savedSubject}>{guide.subject}</Text>
                    <Text style={styles.savedTitle}>{guide.title}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#00D2FF" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Scholar Level Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelTop}>
            <View>
              <Text style={styles.levelTitle}>Scholar Level {userStats?.level || 1}</Text>
              <Text style={styles.levelXp}>{userStats?.xp || 0} Total XP</Text>
            </View>
            <View style={styles.streakBadge}>
              <MaterialCommunityIcons name="fire" size={16} color="#FF6B81" />
              <Text style={styles.streakText}>{userStats?.streak || 1} day streak</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.auditCtaBtn} onPress={handleOpenAuditor}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#FFFFFF" />
            <Text style={styles.auditCtaText}>Run New AI Audit (+35 XP)</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8E8EA8',
    marginTop: 2,
  },
  targetText: {
    color: '#00D2FF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  readinessCard: {
    backgroundColor: '#121228',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
  },
  readinessTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  readinessLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00D2FF',
    letterSpacing: 0.5,
  },
  readinessScore: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginTop: 2,
  },
  readinessBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D2FF',
    borderRadius: 3,
  },
  readinessFootnote: {
    fontSize: 12,
    color: '#A0A0C0',
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#121228',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8EA8',
    marginTop: 2,
    textAlign: 'center',
  },
  masteryToolsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  masteryToolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    gap: 5,
  },
  masteryToolText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DDDDEE',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  savedList: {
    gap: 8,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121228',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  savedSubject: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A29BFE',
    textTransform: 'uppercase',
  },
  savedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#121228',
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#8E8EA8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  levelCard: {
    backgroundColor: '#121228',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  levelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  levelXp: {
    fontSize: 12,
    color: '#FFD32A',
    fontWeight: '700',
    marginTop: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B81',
  },
  auditCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C5CE7',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  auditCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
