import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'saved'
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
            : 'All Subjects';
      const res = await generateAndShareCheatSheetPdf(subjectLabel, activeExamLabel, exportTopics);
      if (!res.success) Alert.alert('Export Notice', res.error || 'Could not generate PDF.');
    } catch {
      Alert.alert('Error', 'An error occurred generating PDF.');
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
            <Text style={styles.headerTitle}>Progress</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {activeExamLabel}{targetSubject !== 'All' ? ` · ${targetSubject}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'overview' && styles.tabItemActive]}
            onPress={() => switchTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'saved' && styles.tabItemActive]}
            onPress={() => switchTab('saved')}
          >
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
              Saved ({savedGuides.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: tabAnim }}
      >
        {activeTab === 'overview' ? (
          <View>
            <View style={styles.scoreBlock}>
              <Text style={styles.label}>EXAM READINESS</Text>
              <Text style={styles.scoreVal}>{readinessScore}%</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${readinessScore}%` }]} />
              </View>
              <Text style={styles.summaryLine}>
                {masteredGapsCount || 0} blindspots mastered · {auditedHistory?.length || 0} audits · Level {userStats?.level || 1} ({userStats?.xp || 0} XP)
              </Text>
            </View>

            <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Flashcards')}>
              <Text style={styles.actionTitle}>Review Flashcards</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Predictor')}>
              <Text style={styles.actionTitle}>Open Question Predictor</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('AIGapAuditor')}>
              <Text style={styles.actionTitle}>Audit New Topic</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={handleExportPdf} disabled={pdfLoading}>
              <Text style={styles.actionTitle}>
                {pdfLoading ? 'Generating PDF...' : 'Export Cheat Sheet PDF'}
              </Text>
              {pdfLoading ? (
                <ActivityIndicator size="small" color="#38BDF8" />
              ) : (
                <MaterialCommunityIcons name="download" size={18} color="#38BDF8" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionLabel}>Saved Study Guides</Text>
            {savedGuides.length === 0 ? (
              <Text style={styles.emptyText}>No saved guides yet.</Text>
            ) : (
              savedGuides.map((guide, idx) => (
                <TouchableOpacity
                  key={guide.id || idx}
                  style={styles.actionRow}
                  onPress={() => navigation.navigate('StudyGuideDetail', { guide })}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemMeta}>{guide.subject}</Text>
                    <Text style={styles.actionTitle}>{guide.title}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} color="#6B7280" />
                </TouchableOpacity>
              ))
            )}

            <Text style={[styles.sectionLabel, { marginTop: 22 }]}>Recent Audits</Text>
            {!auditedHistory || auditedHistory.length === 0 ? (
              <Text style={styles.emptyText}>No audits logged yet.</Text>
            ) : (
              auditedHistory.slice(0, 10).map((item, idx) => (
                <View key={idx} style={styles.actionRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemMeta}>{item.subject} · {item.type}</Text>
                    <Text style={styles.actionTitle} numberOfLines={1}>{item.topic}</Text>
                  </View>
                  {typeof item.score === 'number' && (
                    <Text style={styles.scoreInline}>{item.score}/100</Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 80 }} />
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

  tabsRow: { flexDirection: 'row', gap: 24 },
  tabItem: { paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#38BDF8' },
  tabText: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#F9FAFB' },

  scrollContent: { padding: 20 },
  scoreBlock: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
    marginBottom: 8,
  },
  label: { color: '#6B7280', fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  scoreVal: { color: '#F9FAFB', fontSize: 40, fontWeight: '700', marginVertical: 8 },
  progressTrack: { height: 4, backgroundColor: '#1D1F2C', marginBottom: 10 },
  progressFill: { height: '100%', backgroundColor: '#38BDF8' },
  summaryLine: { color: '#9CA3AF', fontSize: 12 },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
    gap: 12,
  },
  actionTitle: { color: '#F3F4F6', fontSize: 14, fontWeight: '600' },
  itemMeta: { color: '#6B7280', fontSize: 11, marginBottom: 2 },
  scoreInline: { color: '#38BDF8', fontSize: 13, fontWeight: '700' },

  sectionLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: '#6B7280', fontSize: 13, paddingVertical: 12 },
});
