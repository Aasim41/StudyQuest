import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { useUser } from '../context/UserContext';
import API_BASE from '../config/apiConfig';
import {
  EXAM_TARGETS,
  normalizeExamKey,
  getCuratedSubjectsForExam,
  resolveStreamForExam,
} from '../config/studyGuideData';
import { gsapTabTransition } from '../utils/gsapAnim';

const SAFE_VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const FLOW_NEURO_STORAGE_KEY = '@studyquest_flow_neuro_v1';

const BLOCKED_DISTRACTION_DOMAINS = [
  '/shorts/',
  'instagram.com',
  'tiktok.com',
  'reddit.com',
  'snapchat.com',
  'netflix.com',
  'x.com/',
  'twitter.com/',
];

// All curated lecture IDs verified 200 OK & embeddable via youtube.com/oembed
const CURATED_FLOW_VIDEOS = [
  // Physics
  {
    id: 'phy-photoelectric-oct',
    examKeys: ['CBSE_12', 'ISC_12', 'MH_BOARD', 'UP_BOARD', 'KA_BOARD', 'TN_BOARD', 'KL_BOARD', 'RJ_BOARD', 'WB_BOARD', 'AP_BOARD', 'BIHAR_BOARD', 'GJ_BOARD', 'MP_BOARD', 'JEE', 'NEET'],
    subject: 'Physics',
    title: 'Photoelectric Effect: Work Function & Stopping Potential',
    channel: 'The Organic Chemistry Tutor',
    duration: '18m',
    videoId: '-LECEvusk8E',
  },
  {
    id: 'phy-photoelectric-khan',
    examKeys: ['CBSE_12', 'ISC_12', 'JEE', 'NEET', 'MH_BOARD', 'UP_BOARD'],
    subject: 'Physics',
    title: 'Einstein Photoelectric Equation & Photon Model',
    channel: 'Khan Academy',
    duration: '11m',
    videoId: 'vuGpUFjLaYE',
  },
  {
    id: 'phy-icse10-calorimetry',
    examKeys: ['ICSE_10', 'CBSE_10', 'STATE_10'],
    subject: 'Physics',
    title: 'Calorimetry, Latent Heat & Phase Equilibrium Questions',
    channel: 'Learn with Yusuf',
    duration: '24m',
    videoId: 'Irz_w0Oci94',
  },

  // Chemistry
  {
    id: 'chem-aldol-1',
    examKeys: ['CBSE_12', 'ISC_12', 'MH_BOARD', 'UP_BOARD', 'KA_BOARD', 'TN_BOARD', 'KL_BOARD', 'RJ_BOARD', 'WB_BOARD', 'AP_BOARD', 'BIHAR_BOARD', 'GJ_BOARD', 'MP_BOARD', 'JEE', 'NEET'],
    subject: 'Chemistry',
    title: 'Aldol Condensation Mechanism & Crossed Products',
    channel: 'Organic Chemistry with Victor',
    duration: '16m',
    videoId: 'HvpUG-vl_CM',
  },
  {
    id: 'chem-aldol-khan',
    examKeys: ['CBSE_12', 'ISC_12', 'JEE', 'NEET', 'CBSE_10', 'ICSE_10', 'STATE_10'],
    subject: 'Chemistry',
    title: 'Enolate Nucleophiles & Alpha Carbon Chemistry',
    channel: 'Khan Academy',
    duration: '14m',
    videoId: 'sjMsyk-rP8I',
  },

  // Mathematics
  {
    id: 'math-c10-quadratics',
    examKeys: ['CBSE_10', 'ICSE_10', 'STATE_10'],
    subject: 'Mathematics',
    title: 'Quadratic Equations Complete Class 10 Revision',
    channel: 'Ritik Mishra - Class 9 & 10',
    duration: '1h 15m',
    videoId: 'hayFtYnAB-Q',
  },
  {
    id: 'math-integrals-oct',
    examKeys: ['CBSE_12', 'ISC_12', 'MH_BOARD', 'UP_BOARD', 'KA_BOARD', 'TN_BOARD', 'KL_BOARD', 'RJ_BOARD', 'WB_BOARD', 'AP_BOARD', 'BIHAR_BOARD', 'GJ_BOARD', 'MP_BOARD', 'JEE'],
    subject: 'Mathematics',
    title: 'Definite Integrals & Evaluation Techniques',
    channel: 'The Organic Chemistry Tutor',
    duration: '25m',
    videoId: 'Gc3QvUB0PkI',
  },
  {
    id: 'math-limits-khan',
    examKeys: ['CBSE_12', 'ISC_12', 'JEE', 'CAT', 'MH_BOARD'],
    subject: 'Mathematics',
    title: "Introduction to L'Hôpital's Rule & Limits",
    channel: 'Khan Academy',
    duration: '12m',
    videoId: 'PdSzruR5OeE',
  },
  {
    id: 'math-3b1b-calculus',
    examKeys: ['CBSE_12', 'ISC_12', 'JEE', 'COLLEGE_SEM'],
    subject: 'Mathematics',
    title: 'Essence of Calculus & Geometric Proofs',
    channel: '3Blue1Brown',
    duration: '17m',
    videoId: 'WUvTyaaNkzM',
  },
  {
    id: 'math-3b1b-ftc',
    examKeys: ['CBSE_12', 'ISC_12', 'JEE', 'GATE'],
    subject: 'Mathematics',
    title: 'Integration & The Fundamental Theorem of Calculus',
    channel: '3Blue1Brown',
    duration: '20m',
    videoId: 'rfG8ce4nNh0',
  },

  // Biology
  {
    id: 'bio-dna-replication',
    examKeys: ['CBSE_12', 'CBSE_10', 'ICSE_10', 'STATE_10', 'ISC_12', 'MH_BOARD', 'UP_BOARD', 'KA_BOARD', 'TN_BOARD', 'KL_BOARD', 'RJ_BOARD', 'WB_BOARD', 'AP_BOARD', 'BIHAR_BOARD', 'GJ_BOARD', 'MP_BOARD', 'NEET'],
    subject: 'Biology',
    title: "DNA Replication: Helicase, Leading & 5'->3' Lagging Strand",
    channel: 'Amoeba Sisters',
    duration: '8m',
    videoId: 'Qqe4thU-os8',
  },

  // Commerce & Economics
  {
    id: 'acc-goodwill-class12',
    examKeys: ['CBSE_12', 'ISC_12', 'MH_BOARD', 'UP_BOARD', 'KA_BOARD', 'TN_BOARD', 'KL_BOARD', 'RJ_BOARD', 'WB_BOARD', 'AP_BOARD', 'BIHAR_BOARD', 'GJ_BOARD', 'MP_BOARD'],
    subject: 'Accountancy',
    title: 'Partnership Goodwill Valuation: All Methods',
    channel: 'Rajat Arora',
    duration: '26m',
    videoId: 'r8ZTuF_jmAc',
  },
  {
    id: 'econ-supply-demand',
    examKeys: ['CBSE_12', 'CBSE_10', 'ICSE_10', 'ISC_12', 'MH_BOARD', 'UP_BOARD', 'KA_BOARD', 'TN_BOARD', 'KL_BOARD', 'RJ_BOARD', 'WB_BOARD', 'AP_BOARD', 'BIHAR_BOARD', 'GJ_BOARD', 'MP_BOARD', 'CAT', 'UPSC'],
    subject: 'Economics',
    title: 'Scarcity, Supply & Market Equilibrium',
    channel: 'Khan Academy',
    duration: '10m',
    videoId: 'iy-fhpbTH9E',
  },
  {
    id: 'econ-law-demand',
    examKeys: ['CBSE_12', 'ISC_12', 'MH_BOARD', 'TN_BOARD', 'UPSC'],
    subject: 'Economics',
    title: 'Law of Demand & Market Curves',
    channel: 'Khan Academy',
    duration: '8m',
    videoId: 'ShzPtU7IOXs',
  },
  {
    id: 'econ-ad-as',
    examKeys: ['CBSE_12', 'ISC_12', 'MH_BOARD', 'UP_BOARD', 'KA_BOARD', 'UPSC', 'CAT'],
    subject: 'Economics',
    title: 'Macroeconomics: Aggregate Demand & Supply',
    channel: 'Khan Academy',
    duration: '11m',
    videoId: 'oLhohwfwf_U',
  },

  // Social Science / History / Hindi
  {
    id: 'sst-nationalism-india',
    examKeys: ['CBSE_10', 'ICSE_10', 'STATE_10', 'UPSC', 'CBSE_12'],
    subject: 'Social Science',
    title: 'Nationalism in India: NCM, CDM & Poona Pact',
    channel: "BYJU'S Class 9 & 10",
    duration: '38m',
    videoId: 'eksXhyfLs80',
  },
  {
    id: 'hum-world-history',
    examKeys: ['CBSE_10', 'ICSE_10', 'CBSE_12', 'ISC_12', 'UPSC', 'MH_BOARD', 'WB_BOARD'],
    subject: 'History',
    title: 'Globalization & Economic History',
    channel: 'CrashCourse',
    duration: '12m',
    videoId: '5SnR-e0S6Ic',
  },
  {
    id: 'hum-rev-history',
    examKeys: ['CBSE_10', 'ICSE_10', 'STATE_10', 'CBSE_12', 'UPSC'],
    subject: 'History',
    title: 'Revolutions, Taxation & Constitutional Change',
    channel: 'CrashCourse',
    duration: '12m',
    videoId: 'HlUiSBXQHCw',
  },
  {
    id: 'hin-c10-vachya',
    examKeys: ['CBSE_10', 'STATE_10'],
    subject: 'Hindi / Second Language',
    title: 'Vachya Parivartan Hindi Grammar Complete Revision',
    channel: 'Creative Learning 2.0',
    duration: '18m',
    videoId: 'poVdQLGXeuk',
  },

  // Computer Science / GATE / College Sem
  {
    id: 'gate-master-theorem',
    examKeys: ['GATE', 'COLLEGE_SEM'],
    subject: 'Algorithms',
    title: "Master's Theorem for Dividing Recurrences",
    channel: 'Abdul Bari',
    duration: '19m',
    videoId: 'OynWkEj0S-s',
  },
  {
    id: 'gate-os-bankers',
    examKeys: ['GATE', 'COLLEGE_SEM'],
    subject: 'Operating Systems',
    title: "Deadlock Avoidance: Banker's Algorithm with Example",
    channel: 'Gate Smashers',
    duration: '15m',
    videoId: '7gMLNiEz3nw',
  },
  {
    id: 'gate-dbms-norm',
    examKeys: ['GATE', 'COLLEGE_SEM', 'CBSE_10', 'CBSE_12'],
    subject: 'DBMS',
    title: 'Introduction to Normalization: Anomalies & Decomposition',
    channel: 'Gate Smashers',
    duration: '14m',
    videoId: '5GDTIUVlHB8',
  },
  {
    id: 'cs12-python-sql',
    examKeys: ['CBSE_12', 'ISC_12', 'CBSE_10', 'COLLEGE_SEM'],
    subject: 'Computer Science',
    title: 'Python & SQL Database Connectivity Revision',
    channel: 'Vedantu Master',
    duration: '24m',
    videoId: 'xwVO4rqI7FU',
  },
];

const SUBJECT_ALIASES = {
  Physics: ['physics', 'science (physics', 'science & tech'],
  Chemistry: ['chemistry', 'science (physics', 'science & tech'],
  Mathematics: ['mathematics', 'maths', 'quantitative aptitude'],
  Biology: ['biology', 'botany', 'zoology', 'science (physics', 'science & tech'],
  Accountancy: ['accountancy', 'book-keeping'],
  Economics: ['economics', 'economy'],
  History: ['history', 'social science', 'social studies'],
  'Social Science': ['social science', 'social studies', 'history', 'civics', 'geography'],
  'Hindi / Second Language': ['hindi', 'second', 'regional'],
  Algorithms: ['algorithms', 'data structures', 'computer'],
  'Operating Systems': ['operating systems', 'computer'],
  DBMS: ['dbms', 'database', 'it /', 'computer'],
  'Computer Science': ['computer', 'it /', 'software'],
};

function matchesSubjectAlias(videoSubj, selectedSubj) {
  if (!selectedSubj || selectedSubj === 'All') return true;
  const vLow = (videoSubj || '').toLowerCase();
  const sLow = selectedSubj.toLowerCase();
  if (vLow.includes(sLow) || sLow.includes(vLow)) return true;
  const aliases = SUBJECT_ALIASES[videoSubj] || [];
  return aliases.some((a) => sLow.includes(a));
}

function extractYouTubeId(input) {
  if (!input) return null;
  const clean = String(input).trim();
  if (SAFE_VIDEO_ID_RE.test(clean)) return clean;
  const match = clean.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|live\/|watch\?v=|watch\?.+&v=)|piped\.video\/watch\?v=)([a-zA-Z0-9_-]{11})/
  );
  return match && SAFE_VIDEO_ID_RE.test(match[1]) ? match[1] : null;
}

/**
 * Self-contained HTML5 YouTube IFrame API shell rendered strictly inside WebView.
 * Using an explicit HTML container with valid baseUrl/origin eliminates Error 153
 * and ensures all controls & links stay locked inside StudyQuest.
 */
function buildInAppPlayerHtml(videoId) {
  const safeId = SAFE_VIDEO_ID_RE.test(videoId) ? videoId : '';
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta name="referrer" content="strict-origin-when-cross-origin" />
<style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
  #player { width: 100%; height: 100%; }
  #topShield { position: fixed; top: 0; left: 0; right: 0; height: 48px; z-index: 20; background: transparent; }
</style>
</head>
<body>
<div id="player"></div>
<div id="topShield" title="Locked inside StudyQuest"></div>
<script src="https://www.youtube.com/iframe_api"></script>
<script>
  var player;
  function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
      videoId: '${safeId}',
      host: 'https://www.youtube-nocookie.com',
      playerVars: {
        autoplay: 1,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        controls: 1,
        fs: 1,
        disablekb: 0,
        origin: 'https://www.youtube.com'
      },
      events: {
        onReady: function(e) {
          window.__sqPlayer = e.target;
          e.target.playVideo();
        }
      }
    });
  }
  window.__sqCmd = function(cmd, arg) {
    var p = window.__sqPlayer;
    if (!p) return;
    try {
      if (cmd === 'play') p.playVideo();
      else if (cmd === 'pause') p.pauseVideo();
      else if (cmd === 'seekBy') p.seekTo(Math.max(0, (p.getCurrentTime() || 0) + arg), true);
      else if (cmd === 'rate') p.setPlaybackRate(arg);
    } catch (err) {}
  };
</script>
</body>
</html>`;
}

export default function FlowScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    targetExam,
    targetStream,
    targetSubject,
    setTargetSubject,
    focusShieldState,
  } = useUser();

  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'library'
  const [activeVideo, setActiveVideo] = useState(null);
  const [isPlayingState, setIsPlayingState] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0');
  const [searchQuery, setSearchQuery] = useState(route.params?.searchQuery || '');
  const selectedSubject = route.params?.initialSubject || targetSubject || 'All';
  const [customUrl, setCustomUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const [liveResults, setLiveResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSearchError, setLiveSearchError] = useState('');

  const [flowNeuro, setFlowNeuro] = useState({
    subjectAffinity: {},
    watchedCount: 0,
    bookmarks: [],
  });

  const webViewRef = useRef(null);
  const tabAnim = useRef(new Animated.Value(1)).current;

  const examKey = useMemo(() => normalizeExamKey(targetExam), [targetExam]);
  const streamObj = useMemo(() => resolveStreamForExam(targetExam, targetStream), [targetExam, targetStream]);

  const activeExamLabel = useMemo(() => {
    const match = EXAM_TARGETS.find((e) => e.id === targetExam || e.label === targetExam);
    return match ? match.label : (targetExam || 'CBSE Class 12 Boards');
  }, [targetExam]);

  const examSubjects = useMemo(() => {
    return ['All', ...getCuratedSubjectsForExam(targetExam, targetStream)];
  }, [targetExam, targetStream]);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(FLOW_NEURO_STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setFlowNeuro({
            subjectAffinity: parsed.subjectAffinity || {},
            watchedCount: parsed.watchedCount || 0,
            bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
          });
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const persistFlowNeuro = useCallback((nextState) => {
    setFlowNeuro(nextState);
    AsyncStorage.setItem(FLOW_NEURO_STORAGE_KEY, JSON.stringify(nextState)).catch(() => {});
  }, []);

  useEffect(() => {
    if (route.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
      setActiveTab('discover');
    }
    if (route.params?.initialSubject) {
      setTargetSubject(route.params.initialSubject);
    }
  }, [route.params?.searchQuery, route.params?.initialSubject]);

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    gsapTabTransition(tabAnim);
    setActiveTab(tab);
  };

  const curatedVideos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CURATED_FLOW_VIDEOS.filter((v) => {
      const subjOk = matchesSubjectAlias(v.subject, selectedSubject);
      const queryOk =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.channel.toLowerCase().includes(q) ||
        v.subject.toLowerCase().includes(q);
      return subjOk && queryOk;
    }).sort((a, b) => {
      const aExam = a.examKeys.includes(examKey) ? 10 : 0;
      const bExam = b.examKeys.includes(examKey) ? 10 : 0;
      const aNeuro = flowNeuro.subjectAffinity[a.subject] || 0;
      const bNeuro = flowNeuro.subjectAffinity[b.subject] || 0;
      return bExam + bNeuro - (aExam + aNeuro);
    });
  }, [examKey, selectedSubject, searchQuery, flowNeuro.subjectAffinity]);

  const runLiveSearch = useCallback(async () => {
    const rawQ = searchQuery.trim();
    const subjPart = selectedSubject !== 'All' ? selectedSubject : '';
    const queryStr = rawQ || `${activeExamLabel} ${subjPart} lecture`;
    if (!queryStr.trim()) return;

    setIsSearchingLive(true);
    setLiveSearchError('');

    try {
      const c = new AbortController();
      const timer = setTimeout(() => c.abort(), 7000);
      const resp = await fetch(`${API_BASE}/api/flow/search?q=${encodeURIComponent(queryStr)}`, {
        signal: c.signal,
      });
      clearTimeout(timer);

      if (resp.ok) {
        const json = await resp.json();
        const items = Array.isArray(json?.items) ? json.items : [];
        if (items.length > 0) {
          setLiveResults(
            items.map((it) => ({
              ...it,
              subject: selectedSubject !== 'All' ? selectedSubject : 'Lecture',
            }))
          );
          setIsSearchingLive(false);
          return;
        }
      }
      setLiveSearchError('No online search results — showing offline syllabus lectures.');
    } catch {
      setLiveSearchError('Search offline — showing verified in-app lectures.');
    } finally {
      setIsSearchingLive(false);
    }
  }, [searchQuery, selectedSubject, activeExamLabel]);

  const handlePlayVideo = (video) => {
    if (!video || !SAFE_VIDEO_ID_RE.test(video.videoId)) return;
    setActiveVideo(video);
    setIsPlayingState(true);
    setPlaybackSpeed('1.0');

    const subj = video.subject || 'General';
    persistFlowNeuro({
      ...flowNeuro,
      watchedCount: (flowNeuro.watchedCount || 0) + 1,
      subjectAffinity: {
        ...flowNeuro.subjectAffinity,
        [subj]: (flowNeuro.subjectAffinity[subj] || 0) + 1,
      },
    });
  };

  const sendPlayerCmd = (cmd, arg = null) => {
    if (Platform.OS === 'web' || !webViewRef.current) return;
    webViewRef.current.injectJavaScript(
      `window.__sqCmd && window.__sqCmd(${JSON.stringify(cmd)}, ${JSON.stringify(arg)}); true;`
    );
  };

  const togglePlayPause = () => {
    const next = !isPlayingState;
    setIsPlayingState(next);
    sendPlayerCmd(next ? 'play' : 'pause');
  };

  const handleChangeSpeed = (spd) => {
    setPlaybackSpeed(spd);
    const rate = parseFloat(spd);
    if (!Number.isNaN(rate)) {
      sendPlayerCmd('rate', rate);
    }
  };

  const handlePlayCustomUrl = () => {
    const raw = customUrl.trim().toLowerCase();
    if (
      focusShieldState?.blockShortsReels &&
      BLOCKED_DISTRACTION_DOMAINS.some((pattern) => raw.includes(pattern))
    ) {
      setUrlError('Blocked by Regain Shorts & Distraction Shield.');
      return;
    }

    const videoId = extractYouTubeId(customUrl);
    if (!videoId) {
      setUrlError('Enter a valid YouTube link or 11-character ID.');
      return;
    }
    setUrlError('');
    handlePlayVideo({
      id: `custom-${videoId}`,
      videoId,
      subject: selectedSubject !== 'All' ? selectedSubject : 'Study',
      title: 'Custom Study Lecture',
      channel: 'In-App Player',
      duration: 'Stream',
    });
    setCustomUrl('');
    setActiveTab('discover');
  };

  const isBookmarked = useCallback(
    (videoId) => flowNeuro.bookmarks.some((b) => b.videoId === videoId),
    [flowNeuro.bookmarks]
  );

  const toggleBookmark = (video) => {
    const exists = isBookmarked(video.videoId);
    const nextBookmarks = exists
      ? flowNeuro.bookmarks.filter((b) => b.videoId !== video.videoId)
      : [
          {
            id: video.id || `bm-${video.videoId}`,
            videoId: video.videoId,
            title: video.title,
            channel: video.channel,
            duration: video.duration,
            subject: video.subject,
          },
          ...flowNeuro.bookmarks,
        ].slice(0, 50);
    persistFlowNeuro({ ...flowNeuro, bookmarks: nextBookmarks });
  };

  const handleAuditVideoTopic = (video) => {
    navigation.navigate('AIGapAuditor', {
      initialTopic: video.title,
      initialSubject: video.subject,
      mode: 'TOPIC',
      autoAudit: true,
    });
  };

  const displayVideos = liveResults.length > 0 ? liveResults : curatedVideos;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C10" />

      {/* Quiet Minimal Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Flow</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {activeExamLabel}
              {selectedSubject && selectedSubject !== 'All'
                ? ` · ${selectedSubject}`
                : streamObj
                  ? ` · ${streamObj.label}`
                  : ''}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('RegainFocus')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.headerLink}>Focus Timer</Text>
          </TouchableOpacity>
        </View>

        {/* Clean Underline Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'discover' && styles.tabItemActive]}
            onPress={() => switchTab('discover')}
          >
            <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
              Lectures
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'library' && styles.tabItemActive]}
            onPress={() => switchTab('library')}
          >
            <Text style={[styles.tabText, activeTab === 'library' && styles.tabTextActive]}>
              Saved & Link ({flowNeuro.bookmarks.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: tabAnim }}
      >
        {/* In-App Locked Video Player */}
        {activeVideo && SAFE_VIDEO_ID_RE.test(activeVideo.videoId) && (
          <View style={styles.playerSection}>
            <View style={styles.playerTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.playerTitle} numberOfLines={2}>
                  {activeVideo.title}
                </Text>
                <Text style={styles.playerChannel}>{activeVideo.channel}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveVideo(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.videoFrame}>
              {Platform.OS === 'web' ? (
                <iframe
                  title={activeVideo.title}
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="autoplay; fullscreen"
                />
              ) : (
                <WebView
                  ref={webViewRef}
                  source={{
                    html: buildInAppPlayerHtml(activeVideo.videoId),
                    baseUrl: 'https://www.youtube.com',
                  }}
                  style={styles.webView}
                  originWhitelist={['*']}
                  setSupportMultipleWindows={false}
                  allowsInlineMediaPlayback
                  allowsFullscreenVideo
                  mediaPlaybackRequiresUserAction={false}
                  javaScriptEnabled
                  domStorageEnabled
                  mixedContentMode="compatibility"
                  userAgent="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
                  onShouldStartLoadWithRequest={(req) => {
                    const url = req?.url || '';
                    if (
                      url === 'about:blank' ||
                      url.startsWith('data:') ||
                      url.startsWith('blob:') ||
                      url === 'https://www.youtube.com/' ||
                      url.startsWith('https://www.youtube-nocookie.com/embed/') ||
                      url.startsWith('https://www.youtube.com/embed/') ||
                      url.includes('.googlevideo.com') ||
                      url.includes('.ytimg.com')
                    ) {
                      return true;
                    }
                    // Block opening external YouTube app, Shorts, or watch pages
                    return false;
                  }}
                />
              )}
            </View>

            {/* Clean Single Control Row */}
            <View style={styles.controlsRow}>
              <View style={styles.playbackGroup}>
                <TouchableOpacity style={styles.ctrlBtn} onPress={togglePlayPause}>
                  <MaterialCommunityIcons
                    name={isPlayingState ? 'pause' : 'play'}
                    size={16}
                    color="#F3F4F6"
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.ctrlBtn} onPress={() => sendPlayerCmd('seekBy', -10)}>
                  <Text style={styles.ctrlText}>-10s</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ctrlBtn} onPress={() => sendPlayerCmd('seekBy', 10)}>
                  <Text style={styles.ctrlText}>+10s</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.playbackGroup}>
                {['1.0', '1.25', '1.5', '2.0'].map((spd) => (
                  <TouchableOpacity
                    key={spd}
                    onPress={() => handleChangeSpeed(spd)}
                    style={styles.speedTap}
                  >
                    <Text
                      style={[
                        styles.speedText,
                        playbackSpeed === spd && styles.speedTextActive,
                      ]}
                    >
                      {spd}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={() => handleAuditVideoTopic(activeVideo)}>
                <Text style={styles.auditLinkText}>Audit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 1: LECTURES */}
        {activeTab === 'discover' && (
          <View>
            {/* Simple Search Row */}
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${selectedSubject === 'All' ? 'lectures' : selectedSubject}...`}
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={runLiveSearch}
                returnKeyType="search"
              />
              <TouchableOpacity
                style={styles.searchGoBtn}
                onPress={runLiveSearch}
                disabled={isSearchingLive}
              >
                {isSearchingLive ? (
                  <ActivityIndicator size="small" color="#0B0C10" />
                ) : (
                  <Text style={styles.searchGoText}>Search</Text>
                )}
              </TouchableOpacity>
            </View>

            {liveResults.length > 0 && (
              <View style={styles.liveNoteRow}>
                <Text style={styles.liveNoteText}>Online results ({liveResults.length})</Text>
                <TouchableOpacity onPress={() => setLiveResults([])}>
                  <Text style={styles.clearLink}>Reset</Text>
                </TouchableOpacity>
              </View>
            )}

            {liveSearchError ? <Text style={styles.errorText}>{liveSearchError}</Text> : null}

            {/* Clean Text Subject Strip */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subjectStrip}
            >
              {examSubjects.map((sub) => {
                const active = selectedSubject === sub;
                return (
                  <TouchableOpacity
                    key={sub}
                    style={[styles.subjectTab, active && styles.subjectTabActive]}
                    onPress={() => {
                      setTargetSubject(sub);
                      setLiveResults([]);
                    }}
                  >
                    <Text style={[styles.subjectTabText, active && styles.subjectTabTextActive]}>
                      {sub === 'All' ? 'All Subjects' : sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Hairline Lecture List */}
            {displayVideos.length === 0 ? (
              <View style={styles.emptyBlock}>
                <Text style={styles.emptyTitle}>No matching offline lectures</Text>
                <Text style={styles.emptySub}>Tap Search to query live educational videos.</Text>
              </View>
            ) : (
              displayVideos.map((video) => {
                const saved = isBookmarked(video.videoId);
                const playing = activeVideo?.videoId === video.videoId;

                return (
                  <TouchableOpacity
                    key={video.id}
                    style={styles.lectureRow}
                    onPress={() => handlePlayVideo(video)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.lectureTitle, playing && styles.lectureTitlePlaying]}>
                        {video.title}
                      </Text>
                      <Text style={styles.lectureMeta}>
                        {video.subject} · {video.channel} · {video.duration}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleBookmark(video)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialCommunityIcons
                        name={saved ? 'bookmark' : 'bookmark-outline'}
                        size={18}
                        color={saved ? '#38BDF8' : '#6B7280'}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* TAB 2: PASTE LINK & BOOKMARKS */}
        {activeTab === 'library' && (
          <View>
            <View style={styles.urlSection}>
              <Text style={styles.sectionHeading}>Open YouTube Link in App</Text>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Paste YouTube link or video ID"
                  placeholderTextColor="#6B7280"
                  value={customUrl}
                  onChangeText={(t) => {
                    setCustomUrl(t);
                    if (urlError) setUrlError('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.searchGoBtn} onPress={handlePlayCustomUrl}>
                  <Text style={styles.searchGoText}>Play</Text>
                </TouchableOpacity>
              </View>
              {urlError ? <Text style={styles.errorText}>{urlError}</Text> : null}
            </View>

            <Text style={[styles.sectionHeading, { marginTop: 22 }]}>
              Saved ({flowNeuro.bookmarks.length})
            </Text>
            {flowNeuro.bookmarks.length === 0 ? (
              <Text style={styles.emptySub}>No saved lectures yet.</Text>
            ) : (
              flowNeuro.bookmarks.map((video) => (
                <TouchableOpacity
                  key={video.videoId}
                  style={styles.lectureRow}
                  onPress={() => {
                    handlePlayVideo(video);
                    setActiveTab('discover');
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lectureTitle}>{video.title}</Text>
                    <Text style={styles.lectureMeta}>
                      {video.channel} · {video.duration}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleBookmark(video)}>
                    <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <View style={{ height: 96 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C10' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingHorizontal: 20,
    backgroundColor: '#0B0C10',
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: { color: '#F9FAFB', fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  headerSub: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  headerLink: { color: '#38BDF8', fontSize: 13, fontWeight: '600' },

  tabsRow: { flexDirection: 'row', gap: 22 },
  tabItem: { paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#38BDF8' },
  tabText: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#F9FAFB' },

  scrollContent: { padding: 20 },

  playerSection: {
    marginBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
    paddingBottom: 14,
  },
  playerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  playerTitle: { color: '#F9FAFB', fontSize: 15, fontWeight: '600', lineHeight: 20 },
  playerChannel: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  videoFrame: {
    height: 210,
    backgroundColor: '#000000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webView: { flex: 1, backgroundColor: '#000000' },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  playbackGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ctrlBtn: { paddingVertical: 4, paddingHorizontal: 4 },
  ctrlText: { color: '#E5E7EB', fontSize: 12, fontWeight: '600' },
  speedTap: { paddingVertical: 4, paddingHorizontal: 3 },
  speedText: { color: '#6B7280', fontSize: 12, fontWeight: '600' },
  speedTextActive: { color: '#38BDF8' },
  auditLinkText: { color: '#38BDF8', fontSize: 12, fontWeight: '600' },

  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  searchInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#14161F',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#F9FAFB',
    fontSize: 14,
  },
  searchGoBtn: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchGoText: { color: '#0B0C10', fontSize: 13, fontWeight: '700' },

  liveNoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  liveNoteText: { color: '#38BDF8', fontSize: 12 },
  clearLink: { color: '#9CA3AF', fontSize: 12, textDecorationLine: 'underline' },
  errorText: { color: '#F87171', fontSize: 12, marginBottom: 10 },

  subjectStrip: {
    gap: 18,
    paddingBottom: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  subjectTab: { paddingVertical: 4 },
  subjectTabActive: { borderBottomWidth: 2, borderBottomColor: '#38BDF8' },
  subjectTabText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  subjectTabTextActive: { color: '#F9FAFB' },

  lectureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
    gap: 12,
  },
  lectureTitle: { color: '#F3F4F6', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  lectureTitlePlaying: { color: '#38BDF8' },
  lectureMeta: { color: '#6B7280', fontSize: 12, marginTop: 4 },

  emptyBlock: { paddingVertical: 28, alignItems: 'center', gap: 4 },
  emptyTitle: { color: '#E5E7EB', fontSize: 14, fontWeight: '600' },
  emptySub: { color: '#6B7280', fontSize: 13, textAlign: 'center', paddingVertical: 12 },

  urlSection: { borderBottomWidth: 1, borderBottomColor: '#1D1F2C', paddingBottom: 16 },
  sectionHeading: { color: '#F9FAFB', fontSize: 14, fontWeight: '600', marginBottom: 10 },
});
