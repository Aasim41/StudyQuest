import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Modal,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { resolveStreamForExam } from '../config/studyGuideData';
import { gsapTabTransition } from '../utils/gsapAnim';

const { width } = Dimensions.get('window');

const TIMER_MODES = [
  { id: 'POMO_25', label: 'Pomodoro', durationMinutes: 25, breakMinutes: 5, desc: '25m Focus • 5m Rest' },
  { id: 'DEEP_50', label: 'Deep Sprint', durationMinutes: 50, breakMinutes: 10, desc: '50m Deep Work • 10m Rest' },
  { id: 'EXAM_180', label: 'Exam Sim', durationMinutes: 180, breakMinutes: 0, desc: '3h Timed Test Sprint' },
  { id: 'QUICK_15', label: 'Speed Drill', durationMinutes: 15, breakMinutes: 3, desc: '15m Formula Sprint' },
];

const DEFAULT_BLOCKED_APPS = [
  { id: 'insta', name: 'Instagram & Reels', icon: 'instagram', blocked: true, isReels: true },
  { id: 'yt_shorts', name: 'YouTube Shorts Feed', icon: 'youtube', blocked: true, isReels: true },
  { id: 'reddit', name: 'Reddit Doomscrolling', icon: 'reddit', blocked: true, isReels: false },
  { id: 'snap', name: 'Snapchat Spotlight', icon: 'snapchat', blocked: true, isReels: true },
  { id: 'whatsapp', name: 'WhatsApp Non-Essential', icon: 'whatsapp', blocked: false, isReels: false },
  { id: 'x_twitter', name: 'X / Twitter Feeds', icon: 'twitter', blocked: true, isReels: false },
  { id: 'games', name: 'Mobile Games', icon: 'gamepad-variant-outline', blocked: true, isReels: false },
  { id: 'netflix', name: 'Netflix & Streaming', icon: 'netflix', blocked: true, isReels: false },
];

const AMBIENT_SOUNDS = [
  { id: 'binaural', label: '40Hz Gamma Binaural', icon: 'brain' },
  { id: 'rain', label: 'Midnight Rain', icon: 'weather-pouring' },
  { id: 'library', label: 'Silent Library', icon: 'bookshelf' },
  { id: 'lofi', label: 'Deep Focus Lo-Fi', icon: 'headphones' },
];

export default function RegainFocusScreen() {
  const navigation = useNavigation();
  const { targetExam, targetStream, awardCustomXp, logStudySession } = useUser();
  const streamObj = useMemo(() => resolveStreamForExam(targetExam, targetStream), [targetExam, targetStream]);

  // Active Card Tab: 'timer' | 'shields'
  const [activeTab, setActiveTab] = useState('timer');
  const tabAnim = useRef(new Animated.Value(1)).current;

  // Timer States
  const [selectedMode, setSelectedMode] = useState(TIMER_MODES[0]);
  const [secondsRemaining, setSecondsRemaining] = useState(TIMER_MODES[0].durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [strictMode, setStrictMode] = useState(true);
  const [blockShortsReels, setBlockShortsReels] = useState(true);

  // App Shield Matrix
  const [blockedApps, setBlockedApps] = useState(DEFAULT_BLOCKED_APPS);

  // Regain Mindful Friction Modal
  const [frictionModalVisible, setFrictionModalVisible] = useState(false);
  const [breathCountdown, setBreathCountdown] = useState(5);
  const [targetAppName, setTargetAppName] = useState('');

  // Ambient Sound
  const [activeSound, setActiveSound] = useState(null);

  // Regain Willpower & Screen Time Stats (persisted on device)
  const [screenTimeSavedMinutes, setScreenTimeSavedMinutes] = useState(0);
  const [urgesBlockedCount, setUrgesBlockedCount] = useState(0);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  const timerRef = useRef(null);
  const breathTimerRef = useRef(null);

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    gsapTabTransition(tabAnim);
    setActiveTab(tab);
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(breathTimerRef.current);
    };
  }, []);

  // Load persisted stats on mount
  useEffect(() => {
    AsyncStorage.getItem('@regain_stats').then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (parsed.screenTimeSavedMinutes) setScreenTimeSavedMinutes(parsed.screenTimeSavedMinutes);
          if (parsed.urgesBlockedCount) setUrgesBlockedCount(parsed.urgesBlockedCount);
          if (parsed.completedSessionsCount) setCompletedSessionsCount(parsed.completedSessionsCount);
        } catch (e) {}
      }
    });
  }, []);

  const persistStats = (savedMins, urges, sessions) => {
    AsyncStorage.setItem(
      '@regain_stats',
      JSON.stringify({
        screenTimeSavedMinutes: savedMins,
        urgesBlockedCount: urges,
        completedSessionsCount: sessions,
      })
    ).catch(() => {});
  };

  // Timer Tick
  useEffect(() => {
    if (isActive && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      clearInterval(timerRef.current);
      handleTimerComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, secondsRemaining]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (!isBreak) {
      const gainedMins = selectedMode.durationMinutes;
      const newSaved = screenTimeSavedMinutes + gainedMins;
      const newSessions = completedSessionsCount + 1;
      setScreenTimeSavedMinutes(newSaved);
      setCompletedSessionsCount(newSessions);
      persistStats(newSaved, urgesBlockedCount, newSessions);

      awardCustomXp(gainedMins * 2, 'Completed Regain Focus Session');
      logStudySession('Deep Focus Sprint', gainedMins);

      Alert.alert(
        '🎯 Session Conquered!',
        `You completed ${gainedMins} minutes of zero-distraction deep work for ${targetExam}! Take a well-earned break.`
      );

      if (selectedMode.breakMinutes > 0) {
        setIsBreak(true);
        setSecondsRemaining(selectedMode.breakMinutes * 60);
      } else {
        setSecondsRemaining(selectedMode.durationMinutes * 60);
      }
    } else {
      setIsBreak(false);
      setSecondsRemaining(selectedMode.durationMinutes * 60);
      Alert.alert('⚡ Break Complete', 'Ready to dive back into your next focus block?');
    }
  };

  const handleSelectMode = (mode) => {
    if (isActive) {
      triggerMindfulFriction('Switch Mode');
      return;
    }
    setSelectedMode(mode);
    setIsBreak(false);
    setSecondsRemaining(mode.durationMinutes * 60);
  };

  const toggleTimer = () => {
    if (isActive) {
      if (strictMode) {
        triggerMindfulFriction('Exit Focus Session');
        return;
      }
      setIsActive(false);
    } else {
      setIsActive(true);
    }
  };

  const resetTimer = () => {
    if (isActive && strictMode) {
      triggerMindfulFriction('Reset Timer');
      return;
    }
    setIsActive(false);
    setIsBreak(false);
    setSecondsRemaining(selectedMode.durationMinutes * 60);
  };

  // Trigger Mindful Friction Interceptor
  const triggerMindfulFriction = (reason) => {
    setTargetAppName(reason);
    setBreathCountdown(5);
    setFrictionModalVisible(true);

    clearInterval(breathTimerRef.current);
    breathTimerRef.current = setInterval(() => {
      setBreathCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(breathTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancelFriction = () => {
    clearInterval(breathTimerRef.current);
    setFrictionModalVisible(false);
    const newUrges = urgesBlockedCount + 1;
    setUrgesBlockedCount(newUrges);
    persistStats(screenTimeSavedMinutes, newUrges, completedSessionsCount);
    awardCustomXp(10, 'Deflected Distraction Urge');
    Alert.alert('🛡️ Urge Deflected!', '+10 XP! Your willpower score increased. Great job staying on track.');
  };

  const handleConfirmGiveUp = () => {
    clearInterval(breathTimerRef.current);
    setFrictionModalVisible(false);
    setIsActive(false);
  };

  const toggleAppBlock = (id) => {
    if (isActive && strictMode) {
      triggerMindfulFriction('Unblock App');
      return;
    }
    setBlockedApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, blocked: !app.blocked } : app))
    );
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = useMemo(() => {
    const total = isBreak ? selectedMode.breakMinutes * 60 : selectedMode.durationMinutes * 60;
    if (total === 0) return 0;
    return Math.round(((total - secondsRemaining) / total) * 100);
  }, [secondsRemaining, selectedMode, isBreak]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C12" />

      {/* Minimal Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandRow}>
            <View style={styles.regainIconBox}>
              <MaterialCommunityIcons name="shield-lock" size={18} color="#FF4757" />
            </View>
            <Text style={styles.brandTitle}>Regain Focus Shield</Text>
          </View>

          <View style={styles.activeExamChip}>
            <Text style={styles.activeExamChipText} numberOfLines={1}>
              {streamObj ? `${(targetExam || 'Study').split(' ')[0]} • ${streamObj.label.split(' ')[0]}` : (targetExam ? targetExam.split(' ')[0] : 'Study')}
            </Text>
          </View>
        </View>

        {/* 2-Card Segmented Tabs Switcher */}
        <View style={styles.cardTabsRow}>
          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'timer' && styles.cardTabActive]}
            onPress={() => switchTab('timer')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="timer-outline"
              size={15}
              color={activeTab === 'timer' ? '#00E5FF' : '#777799'}
            />
            <Text style={[styles.cardTabText, activeTab === 'timer' && styles.cardTabTextActive]}>
              Focus Timer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardTab, activeTab === 'shields' && styles.cardTabActive]}
            onPress={() => switchTab('shields')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="shield-sword-outline"
              size={15}
              color={activeTab === 'shields' ? '#00E5FF' : '#777799'}
            />
            <Text style={[styles.cardTabText, activeTab === 'shields' && styles.cardTabTextActive]}>
              Shield Matrix
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ transform: [{ scale: tabAnim }] }}
      >
        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 1: FOCUS TIMER & REELS BLOCKER                           */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'timer' && (
          <View style={styles.tabContent}>
            {/* Mode Selector Tabs */}
            <View style={styles.modeTabsRow}>
              {TIMER_MODES.map((mode) => {
                const isSel = selectedMode.id === mode.id;
                return (
                  <TouchableOpacity
                    key={mode.id}
                    style={[styles.modeTab, isSel && styles.modeTabActive]}
                    onPress={() => handleSelectMode(mode)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modeTabText, isSel && styles.modeTabTextActive]}>
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Central Focus Timer Card */}
            <View style={[styles.timerCard, isActive && styles.timerCardActive]}>
              <View style={styles.timerCenter}>
                <View style={styles.phaseBadge}>
                  <Text style={styles.phaseBadgeText}>
                    {isBreak ? 'REST BREAK' : isActive ? 'STRICT FOCUS ACTIVE' : 'READY TO STUDY'}
                  </Text>
                </View>

                <Text style={styles.timerDigits}>{formatTime(secondsRemaining)}</Text>

                <Text style={styles.timerTargetSub}>
                  {isBreak
                    ? 'Breathe & hydrate'
                    : `Target: ${targetExam}${streamObj ? ` • ${streamObj.label}` : ''}`}
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.timerProgressTrack}>
                <View style={[styles.timerProgressFill, { width: `${progressPercent}%` }]} />
              </View>

              {/* Timer Action Buttons */}
              <View style={styles.timerActionsRow}>
                <TouchableOpacity
                  style={[styles.mainTimerBtn, isActive ? styles.pauseBtn : styles.startBtn]}
                  onPress={toggleTimer}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={isActive ? 'pause' : 'play'}
                    size={20}
                    color="#0B0C12"
                  />
                  <Text style={styles.mainTimerBtnText}>
                    {isActive ? 'Pause (Mindful Check)' : 'Start Deep Work'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resetTimerBtn}
                  onPress={resetTimer}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="reload" size={18} color="#8E8EA0" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Reels & Shorts Blocker Switch Card */}
            <View style={styles.settingToggleCard}>
              <View style={styles.settingToggleLeft}>
                <View style={styles.settingIconBoxShorts}>
                  <MaterialCommunityIcons name="filmstrip-off" size={20} color="#FF4757" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingToggleTitle}>Reels & Shorts Blocker</Text>
                  <Text style={styles.settingToggleDesc}>
                    Shields against dopamine scroll loops on Instagram, YouTube Shorts, and Snapchat.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.toggleSwitch, blockShortsReels && styles.toggleSwitchOn]}
                onPress={() => setBlockShortsReels((prev) => !prev)}
                activeOpacity={0.8}
              >
                <View style={[styles.toggleThumb, blockShortsReels && styles.toggleThumbOn]} />
              </TouchableOpacity>
            </View>

            {/* Strict Mode Protection Switch Card */}
            <View style={styles.settingToggleCard}>
              <View style={styles.settingToggleLeft}>
                <View style={styles.settingIconBoxStrict}>
                  <MaterialCommunityIcons
                    name={strictMode ? 'lock-outline' : 'lock-open-outline'}
                    size={20}
                    color="#00E676"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingToggleTitle}>Strict Mode Protection</Text>
                  <Text style={styles.settingToggleDesc}>
                    Enforces 5-second mindful breathing friction before interrupting your session.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.toggleSwitch, strictMode && styles.toggleSwitchOn]}
                onPress={() => setStrictMode((prev) => !prev)}
                activeOpacity={0.8}
              >
                <View style={[styles.toggleThumb, strictMode && styles.toggleThumbOn]} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 2: SHIELDS, APPS & AMBIENT NOISE                          */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'shields' && (
          <View style={styles.tabContent}>
            {/* Willpower Metrics Strip */}
            <View style={styles.analyticsRow}>
              <View style={styles.metricCard}>
                <MaterialCommunityIcons name="clock-check-outline" size={16} color="#00E5FF" />
                <Text style={styles.metricValue}>
                  {Math.floor(screenTimeSavedMinutes / 60)}h {screenTimeSavedMinutes % 60}m
                </Text>
                <Text style={styles.metricLabel}>Time Saved</Text>
              </View>

              <View style={styles.metricCard}>
                <MaterialCommunityIcons name="shield-check" size={16} color="#00E676" />
                <Text style={styles.metricValue}>{urgesBlockedCount}</Text>
                <Text style={styles.metricLabel}>Urges Deflected</Text>
              </View>

              <View style={styles.metricCard}>
                <MaterialCommunityIcons name="fire" size={16} color="#FFB800" />
                <Text style={styles.metricValue}>{completedSessionsCount}</Text>
                <Text style={styles.metricLabel}>Sessions Done</Text>
              </View>
            </View>

            {/* Ambient Noise Selector */}
            <View style={styles.ambientCard}>
              <Text style={styles.ambientCardTitle}>Ambient Study Noise</Text>
              <View style={styles.ambientChipsRow}>
                {AMBIENT_SOUNDS.map((snd) => {
                  const active = activeSound === snd.id;
                  return (
                    <TouchableOpacity
                      key={snd.id}
                      style={[styles.ambientChip, active && styles.ambientChipActive]}
                      onPress={() => setActiveSound(active ? null : snd.id)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name={snd.icon}
                        size={14}
                        color={active ? '#0B0C12' : '#8E8EA0'}
                      />
                      <Text style={[styles.ambientChipText, active && styles.ambientChipTextActive]}>
                        {snd.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Distraction App Blocker Matrix */}
            <View style={styles.appShieldCard}>
              <View style={styles.appShieldHeader}>
                <Text style={styles.appShieldTitle}>App Blocker Matrix</Text>
                <Text style={styles.appShieldCount}>
                  {blockedApps.filter((a) => a.blocked).length} of {blockedApps.length} Blocked
                </Text>
              </View>

              <View style={styles.appsGrid}>
                {blockedApps.map((app) => (
                  <TouchableOpacity
                    key={app.id}
                    style={[styles.appItem, app.blocked && styles.appItemBlocked]}
                    onPress={() => toggleAppBlock(app.id)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={app.icon}
                      size={20}
                      color={app.blocked ? '#FF4757' : '#777799'}
                    />
                    <Text
                      style={[styles.appName, app.blocked && styles.appNameBlocked]}
                      numberOfLines={1}
                    >
                      {app.name.split(' ')[0]}
                    </Text>
                    <View style={[styles.appStatusDot, app.blocked && styles.appStatusDotBlocked]} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Regain Mindful Friction Modal (5-Second Breathing Interceptor) */}
      <Modal
        visible={frictionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.frictionOverlay}>
          <View style={styles.frictionCard}>
            <View style={styles.frictionIconCircle}>
              <MaterialCommunityIcons name="weather-windy" size={36} color="#00E5FF" />
            </View>

            <Text style={styles.frictionTitle}>Mindful Breath Pause</Text>
            <Text style={styles.frictionDesc}>
              Before you {targetAppName.toLowerCase()}, take one deep conscious breath. Is this aligned with your {targetExam} goal?
            </Text>

            {/* Countdown Circle */}
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{breathCountdown}</Text>
              <Text style={styles.countdownSub}>seconds remaining</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.frictionActions}>
              <TouchableOpacity
                style={styles.stayFocusedBtn}
                onPress={handleCancelFriction}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="shield-check" size={16} color="#0B0C12" />
                <Text style={styles.stayFocusedBtnText}>I Will Stay Focused (+10 XP)</Text>
              </TouchableOpacity>

              {breathCountdown === 0 && (
                <TouchableOpacity
                  style={styles.giveUpBtn}
                  onPress={handleConfirmGiveUp}
                  activeOpacity={0.8}
                >
                  <Text style={styles.giveUpBtnText}>Proceed Anyway</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C12',
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#0E1018',
    borderBottomWidth: 1.5,
    borderBottomColor: '#222436',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  regainIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  activeExamChip: {
    backgroundColor: '#161824',
    borderWidth: 1,
    borderColor: '#2A2D40',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeExamChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF4757',
  },

  // 2-Card Segmented Tabs Switcher
  cardTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cardTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    backgroundColor: '#141622',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 10,
  },
  cardTabActive: {
    backgroundColor: '#1A1E2E',
    borderColor: '#00E5FF',
  },
  cardTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8EA8',
  },
  cardTabTextActive: {
    color: '#00E5FF',
    fontWeight: '800',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabContent: {
    gap: 12,
  },

  // Timer Modes
  modeTabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: '#1A1E2E',
    borderColor: '#00E5FF',
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8EA8',
  },
  modeTabTextActive: {
    color: '#00E5FF',
    fontWeight: '800',
  },

  // Timer Card
  timerCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  timerCardActive: {
    borderColor: '#00E5FF',
  },
  timerCenter: {
    alignItems: 'center',
    gap: 8,
  },
  phaseBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  phaseBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00E5FF',
    letterSpacing: 0.5,
  },
  timerDigits: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  timerTargetSub: {
    fontSize: 12,
    color: '#8E8EA8',
  },
  timerProgressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#1A1C2C',
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerProgressFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
    borderRadius: 3,
  },
  timerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  mainTimerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startBtn: {
    backgroundColor: '#00E5FF',
  },
  pauseBtn: {
    backgroundColor: '#FF4757',
  },
  mainTimerBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B0C12',
  },
  resetTimerBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#161824',
    borderWidth: 1,
    borderColor: '#2A2D40',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Toggle Cards
  settingToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  settingToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIconBoxShorts: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconBoxStrict: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingToggleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  settingToggleDesc: {
    fontSize: 10,
    color: '#8E8EA8',
    lineHeight: 14,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2A2D40',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchOn: {
    backgroundColor: '#00E5FF',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
    backgroundColor: '#0B0C12',
  },

  // Shields Tab Styles
  analyticsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 10,
    color: '#8E8EA8',
  },
  ambientCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  ambientCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ambientChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ambientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#161824',
    borderWidth: 1,
    borderColor: '#2A2D40',
  },
  ambientChipActive: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF',
  },
  ambientChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8EA8',
  },
  ambientChipTextActive: {
    color: '#0B0C12',
    fontWeight: '800',
  },
  appShieldCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  appShieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appShieldTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  appShieldCount: {
    fontSize: 11,
    color: '#8E8EA8',
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  appItem: {
    width: (width - 72) / 4,
    backgroundColor: '#161824',
    borderWidth: 1.5,
    borderColor: '#2A2D40',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  appItemBlocked: {
    borderColor: '#FF4757',
    backgroundColor: 'rgba(255, 71, 87, 0.08)',
  },
  appName: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E8EA8',
  },
  appNameBlocked: {
    color: '#FF4757',
  },
  appStatusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#555577',
  },
  appStatusDotBlocked: {
    backgroundColor: '#FF4757',
  },

  // Mindful Friction Modal
  frictionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 10, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  frictionCard: {
    width: '100%',
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    gap: 14,
  },
  frictionIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frictionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  frictionDesc: {
    fontSize: 12,
    color: '#8E8EA8',
    textAlign: 'center',
    lineHeight: 18,
  },
  countdownBox: {
    alignItems: 'center',
    marginVertical: 6,
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#00E5FF',
  },
  countdownSub: {
    fontSize: 11,
    color: '#777799',
  },
  frictionActions: {
    width: '100%',
    gap: 10,
  },
  stayFocusedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00E5FF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  stayFocusedBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B0C12',
  },
  giveUpBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  giveUpBtnText: {
    fontSize: 11,
    color: '#8E8EA8',
  },
});
