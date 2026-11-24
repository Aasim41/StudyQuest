import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { useUser } from '../context/UserContext';
import {
  EXAM_TARGETS,
  getCuratedSubjectsForExam,
  normalizeExamKey,
} from '../config/studyGuideData';

const { width } = Dimensions.get('window');

// Curated high-yield video catalogs per target exam
const CURATED_FLOW_VIDEOS = {
  CBSE_12: [
    {
      id: 'cbse12-vid-1',
      videoId: 'bha24P9uw-E',
      title: 'Photoelectric Effect & Einstein Equation Complete Derivation',
      channel: 'Physics Wallah - Alakh Pandey',
      subject: 'Physics',
      duration: '42 mins',
      views: '1.4M',
      tags: ['Guaranteed 3-Marker', 'Graph Slope h/e', 'NCERT Derivations'],
      examTip: 'Examiners check the negative work function intercept on frequency axis.',
    },
    {
      id: 'cbse12-vid-2',
      videoId: 'vB0S1s7qYwE',
      title: 'Aldehydes, Ketones & Carboxylic Acids: Name Reactions One-Shot',
      channel: 'Apni Kaksha - Shobhit Nirwan',
      subject: 'Chemistry',
      duration: '58 mins',
      views: '980K',
      tags: ['Aldol vs Cannizzaro', 'Clemmensen', 'Board PYQs'],
      examTip: 'Crossed-aldol products require drawing all 4 possible isomers.',
    },
    {
      id: 'cbse12-vid-3',
      videoId: '8qK_Q4gXz3M',
      title: "Definite Integrals King Property: 0 to pi/2 Proofs & 2I Traps",
      channel: 'Vedantu JEE & Boards',
      subject: 'Mathematics',
      duration: '52 mins',
      views: '750K',
      tags: ['Kings Property', 'Definite Integrals', '6-Marker Solved'],
      examTip: 'Always divide by 2 at the conclusion after adding the two equations (2I).',
    },
    {
      id: 'cbse12-vid-4',
      videoId: 'dQw4w9WgXcQ',
      title: 'Molecular Basis of Inheritance: Replication & Transcription Fork',
      channel: 'Unacademy NEET & Class 12',
      subject: 'Biology',
      duration: '65 mins',
      views: '1.1M',
      tags: ['5 to 3 Polarity', 'Okazaki Fragments', 'Meselson-Stahl Proof'],
      examTip: 'DNA polymerase cannot initiate de novo; RNA primer is mandatory.',
    },
  ],
  JEE: [
    {
      id: 'jee-vid-1',
      videoId: '7Y8G2N9qZ8M',
      title: 'Rolling Motion: Static Friction Invariants & Acceleration Bounds',
      channel: 'Physics Galaxy - Ashish Arora',
      subject: 'Physics',
      duration: '38 mins',
      views: '820K',
      tags: ['Zero Work Proof', 'Instantaneous Axis', 'JEE Advanced'],
      examTip: 'Static friction does zero net work in pure rolling but transfers energy.',
    },
    {
      id: 'jee-vid-2',
      videoId: 'pG2L8X3z1Wk',
      title: 'Carbocation Rearrangements: Wagner-Meerwein & Ring Expansions',
      channel: 'Mohit Tyagi - Competishun',
      subject: 'Chemistry',
      duration: '49 mins',
      views: '640K',
      tags: ['4-to-5 Ring Expansion', 'Hydride Shifts', 'Thermodynamic Product'],
      examTip: 'Ring strain release drives expansion from cyclobutyl to cyclopentyl cation.',
    },
    {
      id: 'jee-vid-3',
      videoId: 'aK3N9Q1b7Vp',
      title: "Limits & Squeeze Theorem: When L'Hopital Rule Fails",
      channel: 'Mathsmerizing - JEE Advanced',
      subject: 'Mathematics',
      duration: '44 mins',
      views: '410K',
      tags: ['Oscillatory Limits', 'Boundary Invariants', 'Multi-Concept Trap'],
      examTip: "L'Hopital rule cannot be used for limits involving non-differentiable points.",
    },
  ],
  NEET: [
    {
      id: 'neet-vid-1',
      videoId: 'bN7M2K9x4Lq',
      title: 'Photosynthesis in Higher Plants: C3 vs C4 Pathway & RuBisCO',
      channel: 'Competition Wallah - Tarun Sir',
      subject: 'Botany',
      duration: '72 mins',
      views: '1.8M',
      tags: ['Photorespiration', 'Kranz Anatomy', '100% NCERT Lines'],
      examTip: 'RuBisCO has greater affinity for CO2 than O2 only when CO2:O2 ratio is balanced.',
    },
    {
      id: 'neet-vid-2',
      videoId: 'kX8P1L4m9Qw',
      title: 'Chemical Coordination: Hypothalamic & Pituitary Hormone Loop',
      channel: 'Unacademy NEET - Seep Pahuja',
      subject: 'Zoology',
      duration: '54 mins',
      views: '1.2M',
      tags: ['Feedback Inhabitation', 'Portal Circulation', 'Target Organs'],
      examTip: 'Anterior pituitary receives hormones via hypophyseal portal system.',
    },
  ],
  MH_BOARD: [
    {
      id: 'mh-vid-1',
      videoId: 'mH1P8Q2w9Lk',
      title: 'Rotational Dynamics: Road Banking with Friction & Conical Pendulum',
      channel: 'Dinesh Sir Smart Study',
      subject: 'Physics',
      duration: '45 mins',
      views: '680K',
      tags: ['Balbharati Derivations', '4-Marker Guaranteed', 'HSC Board'],
      examTip: 'Maharashtra Board requires separate formulas for both v_max and v_min.',
    },
    {
      id: 'mh-vid-2',
      videoId: 'mH2C9K4x7Pw',
      title: 'Thermodynamics: Maximum Work W_max Reversible Expansion',
      channel: 'New Indian Era (NIE) - Prashant Sir',
      subject: 'Chemistry',
      duration: '40 mins',
      views: '540K',
      tags: ['P_ext = P - dP', 'HSC Section D', 'Balbharati Numericals'],
      examTip: 'Neglect dP * dV as a second order infinitesimal explicitly in the proof.',
    },
  ],
  UP_BOARD: [
    {
      id: 'up-vid-1',
      videoId: 'uP1W9K2b4Lx',
      title: 'Wave Optics: Huygens Principle Wavefront Refraction & Snell Law Proof',
      channel: 'Khan GS Research Centre / UP Board Hindi',
      subject: 'Physics',
      duration: '50 mins',
      views: '1.5M',
      tags: ['UPMSP 5-Marker', 'Hindi Medium & English', 'Ray Wavefront Diagram'],
      examTip: 'BC = v1*t and AD = v2*t with common hypotenuse AC is required.',
    },
  ],
  COLLEGE_SEM: [
    {
      id: 'col-vid-1',
      videoId: '0IAPZzGSbME',
      title: 'Dynamic Programming: 0/1 Knapsack & Bellman-Ford Algorithms',
      channel: 'Abdul Bari - Algorithms',
      subject: 'Data Structures & Algorithms',
      duration: '45 mins',
      views: '3.2M',
      tags: ['Tabulation Matrix', 'Optimal Substructure', 'University 10-Marker'],
      examTip: 'Always write the recurrence relation before filling the 2D table.',
    },
    {
      id: 'col-vid-2',
      videoId: 'yK2W1b8q7Lx',
      title: 'Deadlock Detection: Bankers Safety Algorithm Trace',
      channel: "Gate Smashers - Varun Singla",
      subject: 'Operating Systems',
      duration: '35 mins',
      views: '1.9M',
      tags: ['Work Vector', 'Safe Sequence', 'Need Matrix'],
      examTip: 'Calculate Need = Max - Allocation before evaluating resource request.',
    },
  ],
  GATE: [
    {
      id: 'gate-vid-1',
      videoId: 'gT1B9K3x4Lw',
      title: 'Master Theorem Non-Applicable Gaps & Akra-Bazzi Asymptotic Tight Bounds',
      channel: 'Ravindrababu Ravula - GATE CS',
      subject: 'Algorithms & Complexity',
      duration: '48 mins',
      views: '610K',
      tags: ['NAT Numerical Accuracy', 'Non-Polynomial Gaps', 'GATE Trap'],
      examTip: 'T(n) = 2T(n/2) + n/log n cannot be solved by standard Master Theorem.',
    },
  ],
  ICSE_10: [
    {
      id: 'icse-vid-1',
      videoId: 'iC1P9Q4b7Lx',
      title: 'Refraction through Prism & Total Internal Reflection (i1 + i2 = A + delta)',
      channel: 'Clarify Knowledge - CISCE',
      subject: 'Science (Physics/Chem/Bio)',
      duration: '38 mins',
      views: '420K',
      tags: ['Section A & B', 'Critical Angle 42 deg', 'Ray Path with Arrows'],
      examTip: 'Arrows must be drawn on every ray segment; minimum deviation r1 = r2 = A/2.',
    },
  ],
};

export default function FlowScreen() {
  const navigation = useNavigation();
  const { targetExam } = useUser();

  const [activeVideo, setActiveVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [customUrl, setCustomUrl] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0');
  const [savedVideoIds, setSavedVideoIds] = useState(new Set());

  // Dynamic exam key and label
  const examKey = useMemo(() => normalizeExamKey(targetExam), [targetExam]);
  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  // Dynamic subjects for current exam
  const examSubjects = useMemo(() => {
    return ['All', ...getCuratedSubjectsForExam(targetExam)];
  }, [targetExam]);

  // Video catalog for current exam with fallback
  const videoCatalog = useMemo(() => {
    const primary = CURATED_FLOW_VIDEOS[examKey];
    if (primary && primary.length > 0) return primary;
    return CURATED_FLOW_VIDEOS['CBSE_12'] || [];
  }, [examKey]);

  // Filtered videos based on subject and search
  const filteredVideos = useMemo(() => {
    let list = videoCatalog;
    if (selectedSubject !== 'All') {
      list = list.filter((v) => v.subject === selectedSubject || v.subject.toLowerCase().includes(selectedSubject.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((v) =>
        v.title.toLowerCase().includes(q) ||
        v.channel.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [videoCatalog, selectedSubject, searchQuery]);

  const handlePlayVideo = (video) => {
    setActiveVideo(video);
  };

  const handleAuditVideoTopic = (video) => {
    navigation.navigate('AIGapAuditor', {
      initialTopic: video.title,
      initialSubject: video.subject,
      mode: 'TOPIC',
      autoAudit: true,
    });
  };

  const handlePlayCustomUrl = () => {
    if (!customUrl.trim()) return;
    let vid = customUrl.trim();
    // Parse YouTube ID if full URL
    if (vid.includes('v=')) {
      vid = vid.split('v=')[1]?.split('&')[0];
    } else if (vid.includes('youtu.be/')) {
      vid = vid.split('youtu.be/')[1]?.split('?')[0];
    }

    if (vid) {
      setActiveVideo({
        id: `custom-${Date.now()}`,
        videoId: vid,
        title: `Custom Study Lecture (${vid})`,
        channel: 'Distraction-Free Focus Stream',
        subject: selectedSubject !== 'All' ? selectedSubject : 'General Study',
        duration: 'Custom Stream',
        views: 'Private',
        tags: ['Flow Distraction-Free', 'Zero Ads', 'Zero Shorts'],
        examTip: 'Take structured handwritten notes while watching this session.',
      });
      setCustomUrl('');
    }
  };

  const toggleBookmark = (id) => {
    setSavedVideoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C12" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.flowLogoBox}>
              <MaterialCommunityIcons name="play-circle" size={18} color="#00E5FF" />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.headerTitle}>Flow</Text>
                <View style={styles.shieldBadge}>
                  <Text style={styles.shieldBadgeText}>0 ADS • 0 SHORTS</Text>
                </View>
              </View>
              <Text style={styles.headerSub}>Distraction-Free Study Lectures & PYQs</Text>
            </View>
          </View>
        </View>

        {/* Target Exam Indicator */}
        <View style={styles.examIndicatorBar}>
          <MaterialCommunityIcons name="school-outline" size={14} color="#8E8EA0" />
          <Text style={styles.examIndicatorText} numberOfLines={1}>
            Curated For: <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{activeExamLabel}</Text>
          </Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchRow}>
          <MaterialCommunityIcons name="magnify" size={18} color="#8E8EA0" style={{ marginLeft: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeExamLabel} lectures, topics, PYQs...`}
            placeholderTextColor="#686B82"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
              <MaterialCommunityIcons name="close-circle" size={16} color="#8E8EA0" />
            </TouchableOpacity>
          )}
        </View>

        {/* Subject Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectPillsScroll}
        >
          {examSubjects.map((sub) => {
            const active = selectedSubject === sub;
            return (
              <TouchableOpacity
                key={sub}
                style={[styles.subjectPill, active && styles.subjectPillActive]}
                onPress={() => setSelectedSubject(sub)}
              >
                <Text style={[styles.subjectPillText, active && styles.subjectPillTextActive]}>
                  {sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Distraction-Free Flow Player */}
        {activeVideo && (
          <View style={styles.playerContainer}>
            <View style={styles.playerHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.playerTitle} numberOfLines={1}>
                  {activeVideo.title}
                </Text>
                <Text style={styles.playerChannel}>{activeVideo.channel}</Text>
              </View>
              <TouchableOpacity
                style={styles.closePlayerBtn}
                onPress={() => setActiveVideo(null)}
              >
                <MaterialCommunityIcons name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Embedded YouTube Player (No Ads, No Sidebar, No Comments) */}
            <View style={styles.videoEmbedWrapper}>
              <WebView
                source={{
                  uri: `https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`,
                }}
                style={styles.webView}
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                renderLoading={() => (
                  <View style={styles.loadingEmbed}>
                    <ActivityIndicator size="small" color="#00E5FF" />
                    <Text style={styles.loadingEmbedText}>Loading Distraction-Free Stream...</Text>
                  </View>
                )}
              />
            </View>

            {/* Player Controls & Action Bridge to AI Auditor */}
            <View style={styles.playerActionsRow}>
              {/* Speed Buttons */}
              <View style={styles.speedRow}>
                <Text style={styles.speedLabel}>Speed:</Text>
                {['1.0', '1.25', '1.5', '2.0'].map((spd) => (
                  <TouchableOpacity
                    key={spd}
                    style={[styles.speedChip, playbackSpeed === spd && styles.speedChipActive]}
                    onPress={() => setPlaybackSpeed(spd)}
                  >
                    <Text style={[styles.speedChipText, playbackSpeed === spd && styles.speedChipTextActive]}>
                      {spd}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Audit Video in AI Gap Auditor */}
              <TouchableOpacity
                style={styles.auditBridgeBtn}
                onPress={() => handleAuditVideoTopic(activeVideo)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="shield-search" size={15} color="#0C0D14" />
                <Text style={styles.auditBridgeText}>Audit This Topic</Text>
              </TouchableOpacity>
            </View>

            {/* Exam Trap Warning Box */}
            {activeVideo.examTip && (
              <View style={styles.videoTipBox}>
                <MaterialCommunityIcons name="alert-decagram" size={15} color="#FFB800" />
                <Text style={styles.videoTipText}>
                  <Text style={{ fontWeight: '800', color: '#FFB800' }}>Examiner Focus: </Text>
                  {activeVideo.examTip}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Custom YouTube URL / Topic Direct Loader */}
        <View style={styles.customUrlCard}>
          <View style={styles.customUrlHeader}>
            <MaterialCommunityIcons name="link-variant" size={16} color="#00E5FF" />
            <Text style={styles.customUrlTitle}>Watch Any YouTube Lecture in Flow Mode</Text>
          </View>
          <Text style={styles.customUrlSub}>
            Paste any educational YouTube link or video ID to strip all ads, shorts, and distractions.
          </Text>
          <View style={styles.customUrlInputRow}>
            <TextInput
              style={styles.customUrlInput}
              placeholder="e.g. https://youtu.be/... or video ID"
              placeholderTextColor="#686B82"
              value={customUrl}
              onChangeText={setCustomUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.customUrlBtn}
              onPress={handlePlayCustomUrl}
              activeOpacity={0.8}
            >
              <Text style={styles.customUrlBtnText}>Load</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Video List Heading */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="youtube" size={18} color="#FF4757" />
            <Text style={styles.sectionTitle}>High-Yield Study Streams</Text>
          </View>
          <Text style={styles.sectionCount}>{filteredVideos.length} Curated Lectures</Text>
        </View>

        {/* Video Cards Grid */}
        {filteredVideos.map((video) => {
          const isSaved = savedVideoIds.has(video.id);
          const isPlaying = activeVideo?.videoId === video.videoId;

          return (
            <View key={video.id} style={[styles.videoCard, isPlaying && styles.videoCardPlaying]}>
              {/* Top Meta */}
              <View style={styles.cardTopRow}>
                <View style={styles.subjectTag}>
                  <Text style={styles.subjectTagText}>{video.subject}</Text>
                </View>
                <View style={styles.durationTag}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color="#8E8EA0" />
                  <Text style={styles.durationTagText}>{video.duration}</Text>
                </View>
                <TouchableOpacity
                  style={styles.bookmarkBtn}
                  onPress={() => toggleBookmark(video.id)}
                >
                  <MaterialCommunityIcons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color={isSaved ? '#00E5FF' : '#686B82'}
                  />
                </TouchableOpacity>
              </View>

              {/* Title & Channel */}
              <Text style={styles.cardTitle}>{video.title}</Text>
              <View style={styles.channelRow}>
                <MaterialCommunityIcons name="account-circle-outline" size={14} color="#8E8EA0" />
                <Text style={styles.channelText}>{video.channel}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.viewsText}>{video.views} views</Text>
              </View>

              {/* Tags */}
              <View style={styles.tagsRow}>
                {video.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Examiner Focus Snippet */}
              {video.examTip && (
                <View style={styles.cardTipRow}>
                  <MaterialCommunityIcons name="target" size={13} color="#00E676" />
                  <Text style={styles.cardTipText} numberOfLines={2}>
                    {video.examTip}
                  </Text>
                </View>
              )}

              {/* Card Bottom Actions */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={[styles.playBtn, isPlaying && styles.playBtnActive]}
                  onPress={() => handlePlayVideo(video)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={isPlaying ? 'pause-circle' : 'play-circle'}
                    size={16}
                    color="#0C0D14"
                  />
                  <Text style={styles.playBtnText}>
                    {isPlaying ? 'Currently Watching' : 'Watch in Flow (0 Ads)'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickAuditBtn}
                  onPress={() => handleAuditVideoTopic(video)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="shield-search" size={14} color="#A29BFE" />
                  <Text style={styles.quickAuditText}>Audit</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C12',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#11121C',
    borderBottomWidth: 1.5,
    borderBottomColor: '#202234',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  flowLogoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1B1D2C',
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  shieldBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  shieldBadgeText: {
    color: '#00E5FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  headerSub: {
    color: '#8E8EA0',
    fontSize: 11,
    fontWeight: '500',
  },
  examIndicatorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#161724',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#24263A',
    marginBottom: 10,
  },
  examIndicatorText: {
    color: '#8E8EA0',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161724',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#24263A',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontWeight: '500',
  },
  subjectPillsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  subjectPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#161724',
    borderWidth: 1,
    borderColor: '#24263A',
  },
  subjectPillActive: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF',
  },
  subjectPillText: {
    color: '#8E8EA0',
    fontSize: 11,
    fontWeight: '700',
  },
  subjectPillTextActive: {
    color: '#0B0C12',
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
  },
  playerContainer: {
    backgroundColor: '#141522',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    overflow: 'hidden',
    marginBottom: 16,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#17192A',
    borderBottomWidth: 1,
    borderBottomColor: '#24263C',
  },
  playerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  playerChannel: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  closePlayerBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#202236',
  },
  videoEmbedWrapper: {
    width: '100%',
    height: 215,
    backgroundColor: '#000000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingEmbed: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B0C12',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingEmbedText: {
    color: '#8E8EA0',
    fontSize: 12,
    fontWeight: '600',
  },
  playerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#17192A',
    borderTopWidth: 1,
    borderTopColor: '#24263C',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speedLabel: {
    color: '#8E8EA0',
    fontSize: 11,
    fontWeight: '600',
    marginRight: 4,
  },
  speedChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#202236',
  },
  speedChipActive: {
    backgroundColor: '#00E5FF',
  },
  speedChipText: {
    color: '#8E8EA0',
    fontSize: 10,
    fontWeight: '700',
  },
  speedChipTextActive: {
    color: '#0B0C12',
    fontWeight: '800',
  },
  auditBridgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00E5FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  auditBridgeText: {
    color: '#0B0C12',
    fontSize: 11,
    fontWeight: '800',
  },
  videoTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 10,
    backgroundColor: 'rgba(255, 184, 0, 0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 184, 0, 0.2)',
  },
  videoTipText: {
    color: '#E0E0EC',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  customUrlCard: {
    backgroundColor: '#141522',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#222436',
    padding: 12,
    marginBottom: 16,
  },
  customUrlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  customUrlTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  customUrlSub: {
    color: '#8E8EA0',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 10,
  },
  customUrlInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  customUrlInput: {
    flex: 1,
    backgroundColor: '#1B1D2C',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#292B40',
    color: '#FFFFFF',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  customUrlBtn: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customUrlBtnText: {
    color: '#0B0C12',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionCount: {
    color: '#8E8EA0',
    fontSize: 11,
    fontWeight: '600',
  },
  videoCard: {
    backgroundColor: '#141522',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#222436',
    padding: 14,
    marginBottom: 12,
  },
  videoCardPlaying: {
    borderColor: '#00E5FF',
    backgroundColor: '#17192A',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectTag: {
    backgroundColor: '#1C1E30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#292B42',
    marginRight: 8,
  },
  subjectTagText: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '800',
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  durationTagText: {
    color: '#8E8EA0',
    fontSize: 11,
    fontWeight: '600',
  },
  bookmarkBtn: {
    padding: 4,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginBottom: 6,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  channelText: {
    color: '#8E8EA0',
    fontSize: 11,
    fontWeight: '600',
  },
  dotSeparator: {
    color: '#686B82',
    fontSize: 10,
  },
  viewsText: {
    color: '#686B82',
    fontSize: 11,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tagBadge: {
    backgroundColor: '#1B1D2C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBadgeText: {
    color: '#8E8EA0',
    fontSize: 10,
    fontWeight: '600',
  },
  cardTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#1A1C2C',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 2.5,
    borderLeftColor: '#00E676',
  },
  cardTipText: {
    color: '#C8C8DC',
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  playBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00E5FF',
    paddingVertical: 9,
    borderRadius: 6,
  },
  playBtnActive: {
    backgroundColor: '#00E676',
  },
  playBtnText: {
    color: '#0B0C12',
    fontSize: 12,
    fontWeight: '800',
  },
  quickAuditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1F2136',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2C2E4A',
  },
  quickAuditText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
