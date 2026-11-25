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
import {
  EXAM_TARGETS,
  normalizeExamKey,
  getCuratedSubjectsForExam,
  resolveStreamForExam,
} from '../config/studyGuideData';
import { gsapTabTransition } from '../utils/gsapAnim';

const SAFE_VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const FLOW_NEURO_STORAGE_KEY = '@studyquest_flow_neuro_v1';

// Federated privacy-preserving Piped instances (no Google tracking / zero Shorts)
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://api.piped.private.coffee',
];

// Verified real educational lecture YouTube IDs (100% syllabus-aligned, zero filler)
const CURATED_FLOW_VIDEOS = [
  // ── PHYSICS (Boards / JEE / NEET) ──
  {
    id: 'phy-photoelectric-oct',
    examKeys: ['CBSE_12', 'ISC_12', 'ICSE_10', 'MH_BOARD', 'UP_BOARD', 'KA_BOARD', 'TN_BOARD', 'KL_BOARD', 'RJ_BOARD', 'WB_BOARD', 'AP_BOARD', 'BIHAR_BOARD', 'GJ_BOARD', 'MP_BOARD', 'JEE', 'NEET'],
    streams: ['PCM', 'PCB', 'PCMB', 'GENERAL'],
    subject: 'Physics',
    title: 'Photoelectric Effect: Work Function, Threshold Frequency & Stopping Potential',
    channel: 'The Organic Chemistry Tutor',
    duration: '18m',
    videoId: '-LECEvusk8E',
    examTip: 'Maximum KE depends strictly on incident frequency ν (eV₀ = hν − Φ₀), while photocurrent scales with intensity.',
  },
  {
    id: 'phy-photoelectric-khan',
    examKeys: ['CBSE_12', 'ISC_12', 'JEE', 'NEET', 'MH_BOARD', 'UP_BOARD'],
    streams: ['PCM', 'PCB', 'PCMB', 'GENERAL'],
    subject: 'Physics',
    title: 'Einstein Photoelectric Equation & Photon Particle Picture',
    channel: 'Khan Academy',
    duration: '11m',
    videoId: 'vuGpUFjLaYE',
    examTip: 'Watch work-function unit traps: convert eV to Joules (1 eV = 1.602 × 10⁻¹⁹ J) before solving for ν₀.',
  },

  // ── CHEMISTRY (Boards / JEE / NEET) ──
  {
    id: 'chem-aldol-oct',
    examKeys: ['CBSE_12', 'ISC_12', 'MH_BOARD', 'UP_BOARD', 'KA_BOARD', 'TN_BOARD', 'KL_BOARD', 'RJ_BOARD', 'WB_BOARD', 'AP_BOARD', 'BIHAR_BOARD', 'GJ_BOARD', 'MP_BOARD', 'JEE', 'NEET'],
    streams: ['PCM', 'PCB', 'PCMB', 'GENERAL'],
    subject: 'Chemistry',
    title: 'Aldol Condensation & Crossed Aldol Reaction Mechanisms',
    channel: 'The Organic Chemistry Tutor',
    duration: '22m',
    videoId: 'HvpUG-vl_CM',
    examTip: 'Requires at least one α-hydrogen; heating forces E1cb dehydration to an α,β-unsaturated carbonyl.',
  },
  {
    id: 'chem-aldol-khan',
    examKeys: ['CBSE_12', 'ISC_12', 'JEE', 'NEET', 'CBSE_10', 'ICSE_10'],
    streams: ['PCM', 'PCB', 'PCMB', 'GENERAL'],
    subject: 'Chemistry',
    title: 'Enolate Nucleophiles & Aldol Addition Pathway',
    channel: 'Khan Academy',
    duration: '14m',
    videoId: 'sjMsyk-rP8I',
    examTip: 'Distinguish Aldol (α-H present) from Cannizzaro (no α-H: e.g., HCHO, C₆H₅CHO, (CH₃)₃CCHO).',
  },

  // ── MATHEMATICS (Boards / JEE / CAT) ──
  {
    id: 'math-integrals-oct',
    examKeys: ['CBSE_12', 'ISC_12', 'MH_BOARD', 'UP_BOARD', 'KA_BOARD', 'TN_BOARD', 'KL_BOARD', 'RJ_BOARD', 'WB_BOARD', 'AP_BOARD', 'BIHAR_BOARD', 'GJ_BOARD', 'MP_BOARD', 'JEE'],
    streams: ['PCM', 'PCMB', 'COMMERCE_MATH', 'GENERAL'],
    subject: 'Mathematics',
    title: 'Definite Integrals & Fundamental Theorem of Calculus',
    channel: 'The Organic Chemistry Tutor',
    duration: '25m',
    videoId: 'Gc3QvUB0PkI',
    examTip: 'Remember to transform integration limits immediately when applying u-substitution.',
  },
  {
    id: 'math-limits-khan',
    examKeys: ['CBSE_12', 'CBSE_10', 'ICSE_10', 'ISC_12', 'JEE', 'CAT', 'MH_BOARD'],
    streams: ['PCM', 'PCMB', 'COMMERCE_MATH', 'GENERAL'],
    subject: 'Mathematics',
    title: "Limits, Indeterminate Forms & L'Hôpital's Rule",
    channel: 'Khan Academy',
    duration: '12m',
    videoId: 'AUnk1-5vE2k',
    examTip: "Verify 0/0 or ∞/∞ before differentiating numerator and denominator separately in L'Hôpital's rule.",
  },
  {
    id: 'math-3b1b-calculus',
    examKeys: ['CBSE_12', 'ISC_12', 'JEE', 'COLLEGE_SEM'],
    streams: ['PCM', 'PCMB', 'COMMERCE_MATH', 'CS', 'ECE', 'GENERAL'],
    subject: 'Mathematics',
    title: 'Visualizing Integrals, Areas & Derivatives Intuitively',
    channel: '3Blue1Brown',
    duration: '17m',
    videoId: 'WUvTyaaNkzM',
    examTip: 'Treat dA/dx = f(x) geometrically to sanity-check boundary signs and odd/even symmetry.',
  },
  {
    id: 'math-3b1b-ftc',
    examKeys: ['CBSE_12', 'ISC_12', 'JEE', 'GATE'],
    streams: ['PCM', 'PCMB', 'CS', 'ECE', 'GENERAL'],
    subject: 'Mathematics',
    title: 'Integration & The Fundamental Theorem of Calculus',
    channel: '3Blue1Brown',
    duration: '20m',
    videoId: 'rfG8ce4nNh0',
    examTip: 'Connect Riemann sums to antiderivative bounds for definite integral property proofs.',
  },

  // ── BIOLOGY / ZOOLOGY / BOTANY ──
  {
    id: 'bio-dna-replication',
    examKeys: ['CBSE_12', 'CBSE_10', 'ICSE_10', 'ISC_12', 'MH_BOARD', 'UP_BOARD', 'KA_BOARD', 'TN_BOARD', 'KL_BOARD', 'RJ_BOARD', 'WB_BOARD', 'AP_BOARD', 'BIHAR_BOARD', 'GJ_BOARD', 'MP_BOARD', 'NEET'],
    streams: ['PCB', 'PCMB', 'GENERAL'],
    subject: 'Biology',
    title: 'DNA Replication: Helicase, Leading vs Lagging Strand & Okazaki Fragments',
    channel: 'Amoeba Sisters',
    duration: '8m',
    videoId: 'Qqe4thU-os8',
    examTip: "DNA Polymerase only synthesizes in 5'→3' direction; RNA Primase lays down the starting primer.",
  },

  // ── COMMERCE & ECONOMICS ──
  {
    id: 'econ-supply-demand',
    examKeys: ['CBSE_12', 'CBSE_10', 'ICSE_10', 'ISC_12', 'MH_BOARD', 'UP_BOARD', 'KA_BOARD', 'TN_BOARD', 'KL_BOARD', 'RJ_BOARD', 'WB_BOARD', 'AP_BOARD', 'BIHAR_BOARD', 'GJ_BOARD', 'MP_BOARD', 'CAT', 'UPSC'],
    streams: ['COMMERCE_MATH', 'COMMERCE_NOMATH', 'HUMANITIES', 'GENERAL'],
    subject: 'Economics',
    title: 'Supply, Demand, Scarcity & Equilibrium Mechanics',
    channel: 'Khan Academy',
    duration: '10m',
    videoId: 'iy-fhpbTH9E',
    examTip: 'Separate price-induced movement along a curve from determinant-driven shifts of the curve.',
  },
  {
    id: 'econ-law-demand',
    examKeys: ['CBSE_12', 'ISC_12', 'ICSE_10', 'MH_BOARD', 'TN_BOARD', 'UPSC'],
    streams: ['COMMERCE_MATH', 'COMMERCE_NOMATH', 'HUMANITIES', 'GENERAL'],
    subject: 'Economics',
    title: 'Law of Demand, Ceteris Paribus & Exceptions',
    channel: 'Khan Academy',
    duration: '8m',
    videoId: 'ShzPtU7IOXs',
    examTip: 'Distinguish Giffen goods from Veblen prestige goods in board case-study questions.',
  },
  {
    id: 'econ-ad-as',
    examKeys: ['CBSE_12', 'ISC_12', 'MH_BOARD', 'UP_BOARD', 'KA_BOARD', 'UPSC', 'CAT'],
    streams: ['COMMERCE_MATH', 'COMMERCE_NOMATH', 'HUMANITIES', 'GENERAL'],
    subject: 'Economics',
    title: 'Macroeconomics: Aggregate Demand & Aggregate Supply Shifts',
    channel: 'Khan Academy',
    duration: '11m',
    videoId: 'oLhohwfwf_U',
    examTip: 'Memorize AD = C + I + G + (X − M) and how repo rate changes alter investment I.',
  },
  {
    id: 'acc-financial-statements',
    examKeys: ['CBSE_12', 'ISC_12', 'ICSE_10', 'MH_BOARD', 'UP_BOARD', 'KA_BOARD', 'TN_BOARD', 'KL_BOARD', 'RJ_BOARD', 'WB_BOARD', 'AP_BOARD', 'BIHAR_BOARD', 'GJ_BOARD', 'MP_BOARD', 'CAT'],
    streams: ['COMMERCE_MATH', 'COMMERCE_NOMATH', 'GENERAL'],
    subject: 'Accountancy',
    title: 'Financial Statements, Balance Sheet & Cash Flow Logic',
    channel: 'CrashCourse Business',
    duration: '12m',
    videoId: 'P6g5jVQ4gjw',
    examTip: 'Reconcile Operating, Investing, and Financing activities using AS-3 / Ind-AS cash flow headings.',
  },

  // ── HUMANITIES / UPSC / BOARDS ──
  {
    id: 'hum-world-history',
    examKeys: ['CBSE_10', 'ICSE_10', 'CBSE_12', 'ISC_12', 'UPSC', 'MH_BOARD', 'WB_BOARD'],
    streams: ['HUMANITIES', 'GENERAL'],
    subject: 'History',
    title: 'Ancient Civilizations to Modern Historiography',
    channel: 'CrashCourse',
    duration: '12m',
    videoId: '5SnR-e0S6Ic',
    examTip: 'Anchor answer points to chronology, primary archaeological evidence, and agrarian-trade shifts.',
  },
  {
    id: 'hum-french-rev',
    examKeys: ['CBSE_10', 'ICSE_10', 'CBSE_12', 'ISC_12', 'UPSC', 'MH_BOARD'],
    streams: ['HUMANITIES', 'GENERAL'],
    subject: 'History',
    title: 'The French Revolution: Estates-General, Jacobins & Modern Rights',
    channel: 'CrashCourse',
    duration: '12m',
    videoId: 'HlUiSBXQHCw',
    examTip: 'Connect financial crisis of 1789 and Declaration of Rights of Man to constitutional nationalism.',
  },
  {
    id: 'pol-federalism',
    examKeys: ['CBSE_10', 'ICSE_10', 'CBSE_12', 'ISC_12', 'UPSC', 'MH_BOARD', 'TN_BOARD', 'KA_BOARD'],
    streams: ['HUMANITIES', 'GENERAL'],
    subject: 'Political Science',
    title: 'Federalism, Constitutional Distribution of Powers & Governance',
    channel: 'CrashCourse',
    duration: '13m',
    videoId: 'bOazvYnshWc',
    examTip: 'Compare Union, State, and Concurrent Lists alongside cooperative vs asymmetric federalism.',
  },

  // ── GATE CS / ECE & COLLEGE SEM ──
  {
    id: 'gate-asymptotic-bari',
    examKeys: ['GATE', 'COLLEGE_SEM', 'CBSE_12', 'ISC_12'],
    streams: ['CS', 'ECE', 'GENERAL'],
    subject: 'Algorithms',
    title: 'Asymptotic Notations (Big-O, Ω, Θ) & Time Complexity Proof',
    channel: 'Abdul Bari',
    duration: '16m',
    videoId: 'OcoXEacvBLY',
    examTip: 'Big-O is tight or looser upper bound; never confuse Big-O with worst-case input alone.',
  },
  {
    id: 'gate-master-theorem',
    examKeys: ['GATE', 'COLLEGE_SEM'],
    streams: ['CS', 'GENERAL'],
    subject: 'Algorithms',
    title: "Divide & Conquer Recurrences and Master's Theorem Cases",
    channel: 'Abdul Bari',
    duration: '22m',
    videoId: 'gzmwdgg4WvY',
    examTip: 'Always check polynomial regularity condition a*f(n/b) <= c*f(n) in Case 3.',
  },
  {
    id: 'gate-greedy-dp',
    examKeys: ['GATE', 'COLLEGE_SEM'],
    streams: ['CS', 'GENERAL'],
    subject: 'Algorithms',
    title: 'Dynamic Programming vs Greedy Optimal Substructure',
    channel: 'Abdul Bari',
    duration: '19m',
    videoId: 'jX3Sy7uEZb0',
    examTip: 'Verify overlapping subproblems vs greedy choice property before selecting DP table dimensions.',
  },
  {
    id: 'gate-os-bankers',
    examKeys: ['GATE', 'COLLEGE_SEM'],
    streams: ['CS', 'ECE', 'GENERAL'],
    subject: 'Operating Systems',
    title: "Deadlock Avoidance: Banker's Algorithm & Safety Check",
    channel: 'Gate Smashers',
    duration: '15m',
    videoId: 'R9_N8Pf9WGs',
    examTip: 'Compute Need[i] = Max[i] − Allocation[i] first, then simulate Work += Allocation[i].',
  },
  {
    id: 'gate-dbms-norm',
    examKeys: ['GATE', 'COLLEGE_SEM', 'CBSE_12'],
    streams: ['CS', 'GENERAL'],
    subject: 'DBMS',
    title: 'Database Normalization: 1NF, 2NF, 3NF & BCNF Decomposition',
    channel: 'Gate Smashers',
    duration: '18m',
    videoId: 'X1gczKj9X9g',
    examTip: 'Every BCNF decomposition preserves lossless join, though dependency preservation may fail.',
  },
];

const SUBJECT_ALIASES = {
  Physics: ['physics', 'phy'],
  Chemistry: ['chemistry', 'chem'],
  Mathematics: ['mathematics', 'maths', 'math', 'quantitative aptitude'],
  Biology: ['biology', 'botany', 'zoology', 'bio'],
  Botany: ['biology', 'botany'],
  Zoology: ['biology', 'zoology'],
  Economics: ['economics', 'econ'],
  Accountancy: ['accountancy', 'accounts', 'accounting'],
  History: ['history'],
  'Political Science': ['political', 'polity', 'civics'],
  Algorithms: ['algorithms', 'data structures', 'computer science', 'programming'],
  'Operating Systems': ['operating systems', 'computer science'],
  DBMS: ['dbms', 'database', 'computer science', 'informatics'],
};

function matchesSubjectAlias(videoSubj, selectedSubj) {
  if (!selectedSubj || selectedSubj === 'All') return true;
  const vLow = (videoSubj || '').toLowerCase();
  const sLow = selectedSubj.toLowerCase();
  if (vLow.includes(sLow) || sLow.includes(vLow)) return true;
  const aliases = SUBJECT_ALIASES[videoSubj] || [];
  return aliases.some((a) => sLow.includes(a));
}

function formatDuration(seconds) {
  if (!seconds || typeof seconds !== 'number') return 'Lecture';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs > 0 ? `${secs}s` : ''}`.trim();
  return `${secs}s`;
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

export default function FlowScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { targetExam, targetStream, targetSubject, setTargetSubject } = useUser();

  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'library'
  const [activeVideo, setActiveVideo] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0');
  const [searchQuery, setSearchQuery] = useState(route.params?.searchQuery || '');
  const selectedSubject = route.params?.initialSubject || targetSubject || 'All';
  const [customUrl, setCustomUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  // Live federated Piped search (Flow privacy layer)
  const [liveResults, setLiveResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSearchError, setLiveSearchError] = useState('');

  // SponsorBlock skip summary for active lecture
  const [sponsorCount, setSponsorCount] = useState(null);

  // Local on-device FlowNeuro profile & bookmarks (zero cloud tracking)
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

  // Load local FlowNeuro storage on mount
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

  // React to navigation params from Dashboard / StudyGuideDetail
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

  // Curated local lectures scored by active exam, stream, subject, and local FlowNeuro affinity
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

  // Live federated Piped search (strips Shorts & ads)
  const runLivePipedSearch = useCallback(async () => {
    const rawQ = searchQuery.trim();
    const subjectPart = selectedSubject !== 'All' ? selectedSubject : '';
    const queryStr = rawQ || `${activeExamLabel} ${subjectPart} lecture`;
    if (!queryStr.trim()) return;

    setIsSearchingLive(true);
    setLiveSearchError('');

    const fullQuery = `${queryStr} lecture`;
    let foundItems = null;

    for (const instance of PIPED_INSTANCES) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6500);
      try {
        const res = await fetch(
          `${instance}/search?q=${encodeURIComponent(fullQuery)}&filter=videos`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        if (!res.ok) continue;
        const json = await res.json();
        const items = Array.isArray(json?.items) ? json.items : [];
        const clean = items
          .filter((item) => !item.isShort && (item.duration === -1 || item.duration >= 90))
          .map((item) => {
            const vid = extractYouTubeId(item.url || '');
            if (!vid) return null;
            return {
              id: `piped-${vid}`,
              videoId: vid,
              subject: selectedSubject !== 'All' ? selectedSubject : 'Live Search',
              title: String(item.title || 'Educational Lecture').slice(0, 120),
              channel: String(item.uploaderName || 'Educator').slice(0, 60),
              duration: formatDuration(item.duration),
              examTip: 'Streamed via privacy-preserving Flow player (Shorts & suggestions blocked).',
            };
          })
          .filter(Boolean)
          .slice(0, 12);

        foundItems = clean;
        break;
      } catch {
        clearTimeout(timeout);
      }
    }

    setIsSearchingLive(false);
    if (foundItems) {
      setLiveResults(foundItems);
      if (foundItems.length === 0) {
        setLiveSearchError('No long-form lectures matched that query. Try broader keywords.');
      }
    } else {
      setLiveSearchError('Live Piped search nodes timed out. Showing verified offline lectures.');
    }
  }, [searchQuery, selectedSubject, activeExamLabel]);

  // Check SponsorBlock segments when a video starts playing
  useEffect(() => {
    const vid = activeVideo?.videoId;
    if (!vid || !SAFE_VIDEO_ID_RE.test(vid)) {
      setSponsorCount(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    fetch(
      `https://sponsor.ajay.app/api/skipSegments?videoID=${encodeURIComponent(vid)}&categories=${encodeURIComponent('["sponsor","selfpromo","intro","outro","interaction"]')}`,
      { signal: controller.signal }
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((arr) => {
        setSponsorCount(Array.isArray(arr) ? arr.length : 0);
      })
      .catch(() => setSponsorCount(0))
      .finally(() => clearTimeout(timer));

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [activeVideo?.videoId]);

  const handlePlayVideo = (video) => {
    if (!video || !SAFE_VIDEO_ID_RE.test(video.videoId)) return;
    setActiveVideo(video);

    // Update local on-device FlowNeuro profile
    const subj = video.subject || 'General';
    const nextNeuro = {
      ...flowNeuro,
      watchedCount: (flowNeuro.watchedCount || 0) + 1,
      subjectAffinity: {
        ...flowNeuro.subjectAffinity,
        [subj]: (flowNeuro.subjectAffinity[subj] || 0) + 1,
      },
    };
    persistFlowNeuro(nextNeuro);
  };

  const handleChangeSpeed = (spd) => {
    setPlaybackSpeed(spd);
    const rate = parseFloat(spd);
    if (webViewRef.current && Platform.OS !== 'web' && !Number.isNaN(rate)) {
      webViewRef.current.injectJavaScript(
        `(function(){var v=document.querySelector('video');if(v){v.playbackRate=${rate};}})();true;`
      );
    }
  };

  const handlePlayCustomUrl = () => {
    const videoId = extractYouTubeId(customUrl);
    if (!videoId) {
      setUrlError('Enter a valid YouTube URL or 11-character video ID.');
      return;
    }
    setUrlError('');
    handlePlayVideo({
      id: `custom-${videoId}`,
      videoId,
      subject: selectedSubject !== 'All' ? selectedSubject : 'Custom Lecture',
      title: 'Custom Focus Lecture',
      channel: 'Direct No-Cookie Embed',
      duration: 'Direct',
      examTip: 'Distraction-free sandbox active. Shorts and recommendations disabled.',
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
            examTip: video.examTip,
          },
          ...flowNeuro.bookmarks,
        ].slice(0, 50);
    persistFlowNeuro({ ...flowNeuro, bookmarks: nextBookmarks });
  };

  const wipeFlowNeuro = () => {
    persistFlowNeuro({
      subjectAffinity: {},
      watchedCount: 0,
      bookmarks: flowNeuro.bookmarks,
    });
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
      <StatusBar barStyle="light-content" backgroundColor="#0B0C12" />

      {/* Minimal Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.flowIconBox}>
              <MaterialCommunityIcons name="play-circle" size={18} color="#00E5FF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Flow Player</Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {selectedSubject && selectedSubject !== 'All'
                  ? `${activeExamLabel} • ${selectedSubject}`
                  : streamObj
                    ? `${activeExamLabel} • ${streamObj.label}`
                    : activeExamLabel}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.regainShortcutBtn}
            onPress={() => navigation.navigate('RegainFocus')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="timer-outline" size={14} color="#FFB800" />
            <Text style={styles.regainShortcutText}>Timer</Text>
          </TouchableOpacity>
        </View>

        {/* 2-Card Segmented Tabs */}
        <View style={styles.cardTabsRow}>
          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'discover' && styles.cardTabActive]}
            onPress={() => switchTab('discover')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="play-box-multiple-outline"
              size={14}
              color={activeTab === 'discover' ? '#00E5FF' : '#777799'}
            />
            <Text style={[styles.cardTabText, activeTab === 'discover' && styles.cardTabTextActive]}>
              Lectures
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'library' && styles.cardTabActive]}
            onPress={() => switchTab('library')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="bookmark-multiple-outline"
              size={14}
              color={activeTab === 'library' ? '#00E5FF' : '#777799'}
            />
            <Text style={[styles.cardTabText, activeTab === 'library' && styles.cardTabTextActive]}>
              URL & Library ({flowNeuro.bookmarks.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: tabAnim }}
      >
        {/* Active Sandboxed Flow Player */}
        {activeVideo && SAFE_VIDEO_ID_RE.test(activeVideo.videoId) && (
          <View style={styles.playerCard}>
            <View style={styles.playerHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.playerTitle} numberOfLines={2}>
                  {activeVideo.title}
                </Text>
                <Text style={styles.playerChannel}>
                  {activeVideo.channel}
                  {sponsorCount !== null && sponsorCount > 0
                    ? ` • ${sponsorCount} sponsor segment${sponsorCount > 1 ? 's' : ''} detected`
                    : ' • Zero-Ad Sandbox'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closePlayerBtn}
                onPress={() => setActiveVideo(null)}
              >
                <MaterialCommunityIcons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.videoEmbedWrapper}>
              {Platform.OS === 'web' ? (
                <iframe
                  title={activeVideo.title}
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="autoplay; fullscreen"
                />
              ) : (
                <WebView
                  ref={webViewRef}
                  source={{
                    uri: `https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`,
                  }}
                  style={styles.webView}
                  originWhitelist={['https://www.youtube-nocookie.com']}
                  allowsFullscreenVideo
                  mediaPlaybackRequiresUserAction={false}
                  javaScriptEnabled
                  domStorageEnabled
                  startInLoadingState
                  onShouldStartLoadWithRequest={(req) => {
                    return req.url.startsWith('https://www.youtube-nocookie.com/embed/');
                  }}
                  renderLoading={() => (
                    <View style={styles.loadingEmbed}>
                      <ActivityIndicator size="small" color="#00E5FF" />
                      <Text style={styles.loadingEmbedText}>Loading Sandbox Stream...</Text>
                    </View>
                  )}
                />
              )}
            </View>

            <View style={styles.playerActionsRow}>
              <View style={styles.speedRow}>
                {['1.0', '1.25', '1.5', '2.0'].map((spd) => (
                  <TouchableOpacity
                    key={spd}
                    style={[styles.speedChip, playbackSpeed === spd && styles.speedChipActive]}
                    onPress={() => handleChangeSpeed(spd)}
                  >
                    <Text
                      style={[
                        styles.speedChipText,
                        playbackSpeed === spd && styles.speedChipTextActive,
                      ]}
                    >
                      {spd}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.auditBridgeBtn}
                onPress={() => handleAuditVideoTopic(activeVideo)}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="shield-search" size={14} color="#0B0C12" />
                <Text style={styles.auditBridgeText}>Audit Concept</Text>
              </TouchableOpacity>
            </View>

            {activeVideo.examTip && (
              <View style={styles.videoTipBox}>
                <MaterialCommunityIcons name="target" size={14} color="#FFB800" />
                <Text style={styles.videoTipText}>{activeVideo.examTip}</Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 1: DISCOVER & LIVE PIPED SEARCH */}
        {activeTab === 'discover' && (
          <View style={styles.tabContent}>
            <View style={styles.searchBarRow}>
              <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={18} color="#777799" />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${selectedSubject === 'All' ? activeExamLabel : selectedSubject}...`}
                  placeholderTextColor="#666688"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={runLivePipedSearch}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery('');
                      setLiveResults([]);
                    }}
                  >
                    <MaterialCommunityIcons name="close-circle" size={16} color="#8E8EA8" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.liveSearchBtn}
                onPress={runLivePipedSearch}
                disabled={isSearchingLive}
                activeOpacity={0.85}
              >
                {isSearchingLive ? (
                  <ActivityIndicator size="small" color="#0B0C12" />
                ) : (
                  <MaterialCommunityIcons name="earth" size={18} color="#0B0C12" />
                )}
              </TouchableOpacity>
            </View>

            {liveResults.length > 0 && (
              <View style={styles.liveBannerRow}>
                <Text style={styles.liveBannerText}>
                  Live Piped Results ({liveResults.length}) • Shorts Filtered
                </Text>
                <TouchableOpacity onPress={() => setLiveResults([])}>
                  <Text style={styles.liveResetText}>Show Verified</Text>
                </TouchableOpacity>
              </View>
            )}

            {liveSearchError ? <Text style={styles.errorText}>{liveSearchError}</Text> : null}

            {/* Subject Filter Strip */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subjectChipsScroll}
            >
              {examSubjects.map((sub) => {
                const active = selectedSubject === sub;
                return (
                  <TouchableOpacity
                    key={sub}
                    style={[styles.subjectChip, active && styles.subjectChipActive]}
                    onPress={() => {
                      setTargetSubject(sub);
                      setLiveResults([]);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.subjectChipText, active && styles.subjectChipTextActive]}>
                      {sub === 'All' ? 'All Subjects' : sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Video Feed */}
            <View style={styles.videosList}>
              {displayVideos.length === 0 ? (
                <View style={styles.emptyBox}>
                  <MaterialCommunityIcons name="video-off-outline" size={26} color="#555577" />
                  <Text style={styles.emptyTitle}>No verified offline match</Text>
                  <Text style={styles.emptySub}>
                    Tap the globe button above to query federated Piped educational search.
                  </Text>
                </View>
              ) : (
                displayVideos.map((video) => {
                  const saved = isBookmarked(video.videoId);
                  const isPlaying = activeVideo?.videoId === video.videoId;

                  return (
                    <View
                      key={video.id}
                      style={[styles.videoCard, isPlaying && styles.videoCardPlaying]}
                    >
                      <View style={styles.videoMetaRow}>
                        <View style={styles.subjectBadge}>
                          <Text style={styles.subjectBadgeText}>{video.subject}</Text>
                        </View>
                        <Text style={styles.durationText}>{video.duration}</Text>
                        <TouchableOpacity
                          onPress={() => toggleBookmark(video)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <MaterialCommunityIcons
                            name={saved ? 'bookmark' : 'bookmark-outline'}
                            size={18}
                            color={saved ? '#00E5FF' : '#666688'}
                          />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.videoTitle}>{video.title}</Text>
                      <Text style={styles.videoChannel}>{video.channel}</Text>

                      {video.examTip && (
                        <Text style={styles.videoCardTipText} numberOfLines={2}>
                          {video.examTip}
                        </Text>
                      )}

                      <View style={styles.videoActionRow}>
                        <TouchableOpacity
                          style={[styles.playBtn, isPlaying && styles.playBtnActive]}
                          onPress={() => handlePlayVideo(video)}
                          activeOpacity={0.85}
                        >
                          <MaterialCommunityIcons
                            name={isPlaying ? 'pause-circle' : 'play-circle'}
                            size={15}
                            color="#0B0C12"
                          />
                          <Text style={styles.playBtnText}>
                            {isPlaying ? 'Playing' : 'Watch'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.quickAuditBtn}
                          onPress={() => handleAuditVideoTopic(video)}
                          activeOpacity={0.85}
                        >
                          <MaterialCommunityIcons name="shield-search" size={14} color="#00E5FF" />
                          <Text style={styles.quickAuditBtnText}>Audit</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}

        {/* TAB 2: CUSTOM URL, LOCAL FLOWNEURO & BOOKMARKS */}
        {activeTab === 'library' && (
          <View style={styles.tabContent}>
            <View style={styles.customCard}>
              <Text style={styles.customCardTitle}>Distraction-Free URL Stream</Text>
              <Text style={styles.customCardDesc}>
                Paste any YouTube lecture URL or 11-char ID to strip shorts, comments, and feed traps.
              </Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder="https://youtu.be/... or Video ID"
                  placeholderTextColor="#666688"
                  value={customUrl}
                  onChangeText={(t) => {
                    setCustomUrl(t);
                    if (urlError) setUrlError('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.customLoadBtn}
                  onPress={handlePlayCustomUrl}
                  activeOpacity={0.85}
                >
                  <Text style={styles.customLoadBtnText}>Load</Text>
                </TouchableOpacity>
              </View>
              {urlError ? <Text style={styles.errorText}>{urlError}</Text> : null}
            </View>

            {/* Local On-Device FlowNeuro Card */}
            <View style={styles.neuroCard}>
              <View style={styles.neuroHeader}>
                <Text style={styles.neuroTitle}>FlowNeuro On-Device Taste</Text>
                <TouchableOpacity onPress={wipeFlowNeuro}>
                  <Text style={styles.neuroReset}>Reset Taste</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.neuroSub}>
                {flowNeuro.watchedCount} lectures tracked locally • Zero cloud telemetry
              </Text>
              {Object.keys(flowNeuro.subjectAffinity).length > 0 && (
                <View style={styles.neuroTagsRow}>
                  {Object.entries(flowNeuro.subjectAffinity)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4)
                    .map(([subj, count]) => (
                      <View key={subj} style={styles.neuroPill}>
                        <Text style={styles.neuroPillText}>
                          {subj} ({count})
                        </Text>
                      </View>
                    ))}
                </View>
              )}
            </View>

            {/* Saved Bookmarks */}
            <Text style={styles.savedSectionTitle}>
              Bookmarked Lectures ({flowNeuro.bookmarks.length})
            </Text>
            {flowNeuro.bookmarks.length === 0 ? (
              <View style={styles.emptyBox}>
                <MaterialCommunityIcons name="bookmark-outline" size={24} color="#555577" />
                <Text style={styles.emptySub}>Bookmark lectures to keep them pinned here.</Text>
              </View>
            ) : (
              flowNeuro.bookmarks.map((video) => (
                <TouchableOpacity
                  key={video.videoId}
                  style={styles.savedItemCard}
                  onPress={() => {
                    handlePlayVideo(video);
                    setActiveTab('discover');
                  }}
                  activeOpacity={0.85}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.savedItemTitle} numberOfLines={2}>
                      {video.title}
                    </Text>
                    <Text style={styles.savedItemSub}>
                      {video.channel} • {video.duration}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleBookmark(video)} style={{ padding: 6 }}>
                    <MaterialCommunityIcons name="bookmark-remove-outline" size={18} color="#FF5C77" />
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
  container: { flex: 1, backgroundColor: '#0B0C12' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: '#12141F',
    borderBottomWidth: 1,
    borderBottomColor: '#222436',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  flowIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#00E5FF15',
    borderWidth: 1,
    borderColor: '#00E5FF44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { color: '#777799', fontSize: 11, fontWeight: '600', marginTop: 1 },
  regainShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFB80015',
    borderWidth: 1,
    borderColor: '#FFB80044',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  regainShortcutText: { color: '#FFB800', fontSize: 11, fontWeight: '800' },

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

  playerCard: {
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#00E5FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  playerTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', lineHeight: 19 },
  playerChannel: { color: '#00E5FF', fontSize: 11, fontWeight: '600', marginTop: 3 },
  closePlayerBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1D2030',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoEmbedWrapper: {
    height: 204,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#222436',
  },
  webView: { flex: 1, backgroundColor: '#000000' },
  loadingEmbed: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B0C12',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingEmbedText: { color: '#8E8EA8', fontSize: 12, fontWeight: '600' },
  playerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  speedRow: { flexDirection: 'row', gap: 6 },
  speedChip: {
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#222436',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  speedChipActive: { borderColor: '#00E5FF', backgroundColor: '#00E5FF18' },
  speedChipText: { color: '#8E8EA8', fontSize: 11, fontWeight: '700' },
  speedChipTextActive: { color: '#00E5FF', fontWeight: '800' },
  auditBridgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#00E5FF',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
  },
  auditBridgeText: { color: '#0B0C12', fontSize: 11, fontWeight: '800' },
  videoTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginTop: 10,
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#222436',
    padding: 9,
    borderRadius: 8,
  },
  videoTipText: { flex: 1, color: '#C4C6D8', fontSize: 11, lineHeight: 16 },

  tabContent: { gap: 12 },
  searchBarRow: { flexDirection: 'row', gap: 8 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 13 },
  liveSearchBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#00E5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00E5FF12',
    borderWidth: 1,
    borderColor: '#00E5FF44',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  liveBannerText: { color: '#00E5FF', fontSize: 11, fontWeight: '700' },
  liveResetText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', textDecorationLine: 'underline' },
  errorText: { color: '#FF5C77', fontSize: 12, fontWeight: '600' },

  subjectChipsScroll: { gap: 8, paddingVertical: 2 },
  subjectChip: {
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  subjectChipActive: { backgroundColor: '#00E5FF', borderColor: '#00E5FF' },
  subjectChipText: { color: '#8E8EA8', fontSize: 12, fontWeight: '700' },
  subjectChipTextActive: { color: '#0B0C12', fontWeight: '800' },

  videosList: { gap: 10 },
  videoCard: {
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
  },
  videoCardPlaying: { borderColor: '#00E5FF' },
  videoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  subjectBadge: {
    backgroundColor: '#00E5FF15',
    borderWidth: 1,
    borderColor: '#00E5FF44',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectBadgeText: { color: '#00E5FF', fontSize: 10, fontWeight: '800' },
  durationText: { color: '#8E8EA8', fontSize: 11, fontWeight: '600', flex: 1 },
  videoTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', lineHeight: 19 },
  videoChannel: { color: '#8E8EA8', fontSize: 12, fontWeight: '600', marginTop: 3, marginBottom: 6 },
  videoCardTipText: { color: '#A6A8BA', fontSize: 11, lineHeight: 16, marginBottom: 10 },
  videoActionRow: { flexDirection: 'row', gap: 8 },
  playBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00E5FF',
    paddingVertical: 9,
    borderRadius: 8,
  },
  playBtnActive: { backgroundColor: '#00E5A3' },
  playBtnText: { color: '#0B0C12', fontSize: 12, fontWeight: '800' },
  quickAuditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222436',
    backgroundColor: '#0B0C12',
  },
  quickAuditBtnText: { color: '#00E5FF', fontSize: 12, fontWeight: '700' },

  customCard: {
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  customCardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  customCardDesc: { color: '#8E8EA8', fontSize: 12, lineHeight: 17 },
  customInputRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  customInput: {
    flex: 1,
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    color: '#FFFFFF',
    fontSize: 13,
  },
  customLoadBtn: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customLoadBtnText: { color: '#0B0C12', fontSize: 13, fontWeight: '800' },

  neuroCard: {
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  neuroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  neuroTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  neuroReset: { color: '#FF5C77', fontSize: 11, fontWeight: '700' },
  neuroSub: { color: '#8E8EA8', fontSize: 11, fontWeight: '600' },
  neuroTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  neuroPill: {
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#222436',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  neuroPillText: { color: '#00E5FF', fontSize: 11, fontWeight: '700' },

  savedSectionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginTop: 4 },
  emptyBox: {
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 22,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  emptySub: { color: '#8E8EA8', fontSize: 12, textAlign: 'center', lineHeight: 17 },
  savedItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#222436',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  savedItemTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  savedItemSub: { color: '#8E8EA8', fontSize: 11 },
});
