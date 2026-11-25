import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import {
  EXAM_TARGETS,
  getCuratedTopicsForExam,
  resolveStreamForExam,
} from '../config/studyGuideData';
import { generateAndShareCheatSheetPdf } from '../services/pdfService';
import { gsapTabTransition } from '../utils/gsapAnim';

export default function AnalyticsScreen() {
  const navigation = useNavigation();
  const {
    userStats,
    targetExam,
    targetStream,
    targetSubject,
    masteredGapsCount,
    savedGuides,
    auditedHistory,
  } = useUser();

  const [activeTab, setActiveTab] = useState('mastery'); // 'mastery' | 'saved'
  const [pdfLoading, setPdfLoading] = useState(false);
  const tabAnim = useRef(new Animated.Value(1)).current;

  const streamObj = useMemo(() => resolveStreamForExam(targetExam, targetStream), [targetExam, targetStream]);

  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    gsapTabTransition(tabAnim);
    setActiveTab(tab);
  };

  const readinessScore = useMemo(() => {
    const base = 32;
    const fromMastery = (masteredGapsCount || 0) * 6;
    const fromAudits = (auditedHistory?.length || 0) * 4;
    const fromSaved = (savedGuides?.length || 0) * 3;
    return Math.min(98, base + fromMastery + fromAudits + fromSaved);
  }, [masteredGapsCount, auditedHistory, savedGuides]);

  const handleOpenGuide = (guide) => {
    navigation.navigate('StudyGuideDetail', {
      topic: guide,
      subject: guide.subject,
    });
  };

  const handleExportPdf = async () => {
    setPdfLoading(true);
    try {
      let exportTopics = savedGuides;
      if (!exportTopics || exportTopics.length === 0) {
        exportTopics = getCuratedTopicsForExam(targetExam, targetSubject || 'All', targetStream).slice(0, 12);
      }

      const subjectLabel =
        targetSubject && targetSubject !== 'All'
          ? targetSubject
          : streamObj
            ? streamObj.label
            : 'All Board Subjects';
      const res = await generateAndShareCheatSheetPdf(subjectLabel, activeExamLabel, exportTopics);
      if (!res.success) {
        Alert.alert('Export Notice', res.error || 'Could not generate PDF sheet.');
      }
    } catch {
      Alert.alert('Error', 'An error occurred while generating the cheat sheet.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C12" />

      {/* Minimal Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Mastery & Reports</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {activeExamLabel}
              {targetSubject && targetSubject !== 'All' ? ` • ${targetSubject}` : streamObj ? ` • ${streamObj.label}` : ''}
            </Text>
          </View>
        </View>

        {/* 2-Card Segmented Tabs */}
        <View style={styles.cardTabsRow}>
          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'mastery' && styles.cardTabActive]}
            onPress={() => switchTab('mastery')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="chart-box-outline"
              size={14}
              color={activeTab === 'mastery' ? '#00E5FF' : '#777799'}
            />
            <Text style={[styles.cardTabText, activeTab === 'mastery' && styles.cardTabTextActive]}>
              Readiness
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'saved' && styles.cardTabActive]}
            onPress={() => switchTab('saved')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="bookmark-check-outline"
              size={14}
              color={activeTab === 'saved' ? '#00E5FF' : '#777799'}
            />
            <Text style={[styles.cardTabText, activeTab === 'saved' && styles.cardTabTextActive]}>
              Saved & History ({savedGuides.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: tabAnim }}
      >
        {activeTab === 'mastery' && (
          <View style={styles.tabSection}>
            {/* Readiness Score Card */}
            <View style={styles.readinessCard}>
              <View style={styles.readinessTop}>
                <View>
                  <Text style={styles.readinessLabel}>EXAM READINESS</Text>
                  <Text style={styles.readinessScore}>{readinessScore}%</Text>
                </View>
                <View style={styles.readinessBadge}>
                  <MaterialCommunityIcons name="shield-check" size={26} color="#00E5FF" />
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${readinessScore}%` }]} />
              </View>
              <Text style={styles.readinessFootnote}>
                {readinessScore >= 80
                  ? 'Strong mastery across high-yield traps and examiner keys.'
                  : 'Complete topic audits and blindspot cards to lift readiness.'}
              </Text>
            </View>

            {/* 3 Metrics */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{masteredGapsCount || 0}</Text>
                <Text style={styles.statLabel}>Mastered</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{auditedHistory?.length || 0}</Text>
                <Text style={styles.statLabel}>Audits</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>Lv {userStats?.level || 1}</Text>
                <Text style={styles.statLabel}>{userStats?.xp || 0} XP</Text>
              </View>
            </View>

            {/* Clean Quick Tool Redirects */}
            <View style={styles.toolsRow}>
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => navigation.navigate('Flashcards')}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="cards-outline" size={16} color="#00E5FF" />
                <Text style={styles.toolBtnText}>60s Deck</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => navigation.navigate('Predictor')}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="radar" size={16} color="#00E5FF" />
                <Text style={styles.toolBtnText}>PYQ Radar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolBtn}
                onPress={handleExportPdf}
                disabled={pdfLoading}
                activeOpacity={0.85}
              >
                {pdfLoading ? (
                  <ActivityIndicator size="small" color="#FFB800" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="file-pdf-box" size={16} color="#FFB800" />
                    <Text style={styles.toolBtnText}>PDF Sheet</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.auditCtaBtn}
              onPress={() => navigation.navigate('AIGapAuditor')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="shield-search" size={17} color="#0B0C12" />
              <Text style={styles.auditCtaText}>Run AI Blindspot Audit (+35 XP)</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'saved' && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionTitle}>Saved Verified Guides ({savedGuides.length})</Text>
            {savedGuides.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons name="bookmark-outline" size={28} color="#555577" />
                <Text style={styles.emptyTitle}>No saved guides</Text>
                <Text style={styles.emptySubtitle}>
                  Bookmark topics inside your Syllabus tab for one-tap revision and PDF export.
                </Text>
              </View>
            ) : (
              savedGuides.map((guide, idx) => (
                <TouchableOpacity
                  key={guide.id || idx}
                  style={styles.savedCard}
                  onPress={() => handleOpenGuide(guide)}
                  activeOpacity={0.85}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.savedSubject}>{guide.subject}</Text>
                    <Text style={styles.savedTitle}>{guide.title}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#00E5FF" />
                </TouchableOpacity>
              ))
            )}

            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
              Recent AI Audits ({auditedHistory?.length || 0})
            </Text>
            {!auditedHistory || auditedHistory.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptySubtitle}>No audits recorded yet.</Text>
              </View>
            ) : (
              auditedHistory.slice(0, 10).map((item, idx) => (
                <View key={idx} style={styles.auditHistoryCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.savedSubject}>
                      {item.subject} • {item.type}
                    </Text>
                    <Text style={styles.savedTitle} numberOfLines={1}>
                      {item.topic}
                    </Text>
                  </View>
                  {typeof item.score === 'number' && (
                    <Text style={styles.scoreChip}>{item.score}/100</Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 90 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C12' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: '#12141F',
    borderBottomWidth: 1,
    borderBottomColor: '#222436',
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
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
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  headerSubtitle: { color: '#777799', fontSize: 11, fontWeight: '600', marginTop: 1 },

  cardTabsRow: { flexDirection: 'row', gap: 10 },
  cardTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#222436',
  },
  cardTabActive: { backgroundColor: '#181B29', borderColor: '#00E5FF' },
  cardTabText: { color: '#777799', fontSize: 12, fontWeight: '700' },
  cardTabTextActive: { color: '#00E5FF', fontWeight: '800' },

  scrollContent: { padding: 18 },
  tabSection: { gap: 14 },

  readinessCard: {
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  readinessTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  readinessLabel: { color: '#777799', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  readinessScore: { color: '#FFFFFF', fontSize: 34, fontWeight: '900', marginTop: 2 },
  readinessBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#00E5FF14',
    borderWidth: 1,
    borderColor: '#00E5FF44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: { height: 6, backgroundColor: '#0B0C12', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00E5FF' },
  readinessFootnote: { color: '#8E8EA8', fontSize: 12, lineHeight: 17 },

  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#777799', fontSize: 11, fontWeight: '600', marginTop: 2 },

  toolsRow: { flexDirection: 'row', gap: 8 },
  toolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    paddingVertical: 12,
    borderRadius: 10,
  },
  toolBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  auditCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#00E5FF',
    paddingVertical: 14,
    borderRadius: 10,
  },
  auditCtaText: { color: '#0B0C12', fontSize: 13, fontWeight: '800' },

  sectionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  emptyCard: {
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  emptySubtitle: { color: '#8E8EA8', fontSize: 12, textAlign: 'center', lineHeight: 17 },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 10,
    padding: 13,
    gap: 10,
  },
  auditHistoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  savedSubject: { color: '#00E5FF', fontSize: 10, fontWeight: '800', marginBottom: 3 },
  savedTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  scoreChip: { color: '#00E5A3', fontSize: 13, fontWeight: '800' },
});
