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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';

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
  const { targetExam, awardCustomXp, logStudySession } = useUser();

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

  // Regain Willpower & Screen Time Stats
  const [screenTimeSavedMinutes, setScreenTimeSavedMinutes] = useState(115);
  const [urgesBlockedCount, setUrgesBlockedCount] = useState(8);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(3);

  const timerRef = useRef(null);
  const breathTimerRef = useRef(null);

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

  // Save stats helper
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
      // Completed Focus Session!
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
      // Break Complete
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
      // Trigger Regain Mindful Friction before giving up!
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
    // Student resisted the urge and stayed focused!
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

  // Formatting helpers
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.regainLogoBox}>
              <MaterialCommunityIcons name="shield-lock" size={18} color="#FF4757" />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.headerTitle}>Regain</Text>
                <View style={styles.strictBadge}>
                  <Text style={styles.strictBadgeText}>FOCUS SHIELD</Text>
                </View>
              </View>
              <Text style={styles.headerSub}>Reels & Shorts Blocker • Deep Study Timer</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Willpower & Screen Time Analytics Strip */}
        <View style={styles.analyticsRow}>
          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="clock-check-outline" size={18} color="#00E5FF" />
            <Text style={styles.metricValue}>{Math.floor(screenTimeSavedMinutes / 60)}h {screenTimeSavedMinutes % 60}m</Text>
            <Text style={styles.metricLabel}>Time Reclaimed</Text>
          </View>

          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="shield-check" size={18} color="#00E676" />
            <Text style={styles.metricValue}>{urgesBlockedCount}</Text>
            <Text style={styles.metricLabel}>Urges Deflected</Text>
          </View>

          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="fire" size={18} color="#FFB800" />
            <Text style={styles.metricValue}>{completedSessionsCount}</Text>
            <Text style={styles.metricLabel}>Sessions Done</Text>
          </View>
        </View>

        {/* Central Focus Timer Card */}
        <View style={[styles.timerCard, isActive && styles.timerCardActive]}>
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

          {/* Timer Display */}
          <View style={styles.timerCenter}>
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseBadgeText}>
                {isBreak ? 'REST BREAK' : isActive ? 'STRICT FOCUS ACTIVE' : 'READY TO STUDY'}
              </Text>
            </View>
            <Text style={styles.timerDigits}>{formatTime(secondsRemaining)}</Text>
            <Text style={styles.timerTargetSub}>
              {isBreak ? 'Breathe & hydrate' : `Target: ${targetExam}`}
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

        {/* Regain Flagship: Reels & Shorts Blocker Switch */}
        <View style={styles.shortsBlockerCard}>
          <View style={styles.shortsBlockerLeft}>
            <View style={styles.shortsIconBox}>
              <MaterialCommunityIcons name="filmstrip-off" size={20} color="#FF4757" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.shortsBlockerTitle}>Reels & Shorts Blocker</Text>
                <View style={styles.shieldActiveBadge}>
                  <Text style={styles.shieldActiveText}>REGAIN PRO</Text>
                </View>
              </View>
              <Text style={styles.shortsBlockerDesc}>
                Intercepts algorithmic short-form video dopamine loops on Instagram, YouTube, and Snapchat.
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

        {/* Strict Mode Protection */}
        <View style={styles.strictModeCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <MaterialCommunityIcons
              name={strictMode ? 'lock-outline' : 'lock-open-outline'}
              size={18}
              color={strictMode ? '#00E676' : '#8E8EA0'}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.strictModeTitle}>
                Strict Mode {strictMode ? '(Enforced)' : '(Permissive)'}
              </Text>
              <Text style={styles.strictModeDesc}>
                Requires 5-second mindful breath exercise before leaving focus session.
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

        {/* Ambient Focus Sounds Selector */}
        <View style={styles.ambientCard}>
          <View style={styles.ambientHeader}>
            <MaterialCommunityIcons name="headphones" size={16} color="#00E5FF" />
            <Text style={styles.ambientTitle}>Study Ambient Noise (Alpha/Gamma Waves)</Text>
          </View>
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

        {/* Distraction App Shield Matrix */}
        <View style={styles.shieldSection}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="shield-sword" size={18} color="#FFB800" />
              <Text style={styles.sectionTitle}>App Blocker Matrix</Text>
            </View>
            <Text style={styles.sectionCount}>
              {blockedApps.filter((a) => a.blocked).length} Apps Shielded
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
                <View style={styles.appItemLeft}>
                  <MaterialCommunityIcons
                    name={app.icon}
                    size={20}
                    color={app.blocked ? '#FF4757' : '#8E8EA0'}
                  />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.appName, app.blocked && styles.appNameBlocked]}>
                      {app.name}
                    </Text>
                    {app.isReels && (
                      <Text style={styles.reelsTag}>Reels / Shorts Shield</Text>
                    )}
                  </View>
                </View>

                <View style={[styles.blockStatusBadge, app.blocked && styles.blockStatusBadgeBlocked]}>
                  <Text style={[styles.blockStatusText, app.blocked && styles.blockStatusTextBlocked]}>
                    {app.blocked ? 'BLOCKED' : 'ALLOWED'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Regain Mindful Friction Interceptor Modal */}
      <Modal
        visible={frictionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.frictionCard}>
            <View style={styles.breatheIconBox}>
              <MaterialCommunityIcons name="weather-windy" size={36} color="#00E5FF" />
            </View>

            <Text style={styles.frictionTitle}>Take a Mindful Breath</Text>
            <Text style={styles.frictionSub}>
              You're attempting to {targetAppName}. Pause for 5 seconds before giving in to the urge.
            </Text>

            {/* Breathing Circle / Countdown */}
            <View style={styles.countdownBox}>
              <Text style={styles.countdownDigits}>{breathCountdown}</Text>
              <Text style={styles.countdownLabel}>Breathe slowly...</Text>
            </View>

            <Text style={styles.intentionPrompt}>
              "Will opening this distraction help you crack your {targetExam} target score?"
            </Text>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.stayFocusedBtn}
              onPress={handleCancelFriction}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="shield-check" size={18} color="#0B0C12" />
              <Text style={styles.stayFocusedBtnText}>Stay Focused (+10 XP & Willpower)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.giveUpBtn, breathCountdown > 0 && { opacity: 0.3 }]}
              disabled={breathCountdown > 0}
              onPress={handleConfirmGiveUp}
              activeOpacity={0.8}
            >
              <Text style={styles.giveUpBtnText}>
                {breathCountdown > 0 ? `Wait ${breathCountdown}s to override` : 'I still need to break focus'}
              </Text>
            </TouchableOpacity>
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
  },
  regainLogoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1B1D2C',
    borderWidth: 1.5,
    borderColor: '#FF4757',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  strictBadge: {
    backgroundColor: 'rgba(255, 71, 87, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF4757',
  },
  strictBadgeText: {
    color: '#FF4757',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  headerSub: {
    color: '#8E8EA0',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#141522',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#222436',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  metricLabel: {
    color: '#8E8EA0',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  timerCard: {
    backgroundColor: '#141522',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#222436',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  timerCardActive: {
    borderColor: '#00E5FF',
    backgroundColor: '#151726',
  },
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#1A1C2C',
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
    width: '100%',
  },
  modeTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeTabActive: {
    backgroundColor: '#00E5FF',
  },
  modeTabText: {
    color: '#8E8EA0',
    fontSize: 11,
    fontWeight: '700',
  },
  modeTabTextActive: {
    color: '#0B0C12',
    fontWeight: '800',
  },
  timerCenter: {
    alignItems: 'center',
    marginVertical: 12,
  },
  phaseBadge: {
    backgroundColor: '#1C1E30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  phaseBadgeText: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerDigits: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  timerTargetSub: {
    color: '#8E8EA0',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  timerProgressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#202236',
    borderRadius: 2,
    marginVertical: 14,
    overflow: 'hidden',
  },
  timerProgressFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
    borderRadius: 2,
  },
  timerActionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  mainTimerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startBtn: {
    backgroundColor: '#00E5FF',
  },
  pauseBtn: {
    backgroundColor: '#FFB800',
  },
  mainTimerBtnText: {
    color: '#0B0C12',
    fontSize: 13,
    fontWeight: '800',
  },
  resetTimerBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1B1D2C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#292B40',
  },
  shortsBlockerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141522',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 71, 87, 0.35)',
    padding: 14,
    marginBottom: 12,
  },
  shortsBlockerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
    marginRight: 12,
  },
  shortsIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortsBlockerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  shieldActiveBadge: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  shieldActiveText: {
    color: '#0B0C12',
    fontSize: 8,
    fontWeight: '900',
  },
  shortsBlockerDesc: {
    color: '#8E8EA0',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#202236',
    padding: 3,
    justifyContent: 'center',
  },
  toggleSwitchOn: {
    backgroundColor: '#00E676',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  strictModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141522',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#222436',
    padding: 12,
    marginBottom: 12,
  },
  strictModeTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  strictModeDesc: {
    color: '#8E8EA0',
    fontSize: 10,
    marginTop: 1,
  },
  ambientCard: {
    backgroundColor: '#141522',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#222436',
    padding: 12,
    marginBottom: 16,
  },
  ambientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  ambientTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  ambientChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ambientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#1B1D2C',
    borderWidth: 1,
    borderColor: '#292B40',
  },
  ambientChipActive: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF',
  },
  ambientChipText: {
    color: '#8E8EA0',
    fontSize: 10,
    fontWeight: '700',
  },
  ambientChipTextActive: {
    color: '#0B0C12',
    fontWeight: '800',
  },
  shieldSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionCount: {
    color: '#8E8EA0',
    fontSize: 11,
    fontWeight: '600',
  },
  appsGrid: {
    gap: 8,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141522',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#222436',
    padding: 12,
  },
  appItemBlocked: {
    borderColor: 'rgba(255, 71, 87, 0.35)',
    backgroundColor: '#161726',
  },
  appItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appName: {
    color: '#8E8EA0',
    fontSize: 12,
    fontWeight: '700',
  },
  appNameBlocked: {
    color: '#FFFFFF',
  },
  reelsTag: {
    color: '#FF4757',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  blockStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#1F2136',
  },
  blockStatusBadgeBlocked: {
    backgroundColor: '#FF4757',
  },
  blockStatusText: {
    color: '#8E8EA0',
    fontSize: 9,
    fontWeight: '800',
  },
  blockStatusTextBlocked: {
    color: '#0B0C12',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 12, 18, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  frictionCard: {
    width: '100%',
    backgroundColor: '#141524',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    padding: 20,
    alignItems: 'center',
  },
  breatheIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderWidth: 2,
    borderColor: '#00E5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  frictionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  frictionSub: {
    color: '#8E8EA0',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
  },
  countdownBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1B1D30',
    borderWidth: 2,
    borderColor: '#00E5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  countdownDigits: {
    color: '#00E5FF',
    fontSize: 32,
    fontWeight: '900',
  },
  countdownLabel: {
    color: '#8E8EA0',
    fontSize: 9,
    fontWeight: '600',
  },
  intentionPrompt: {
    color: '#FFB800',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 18,
  },
  stayFocusedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00E5FF',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  stayFocusedBtnText: {
    color: '#0B0C12',
    fontSize: 13,
    fontWeight: '800',
  },
  giveUpBtn: {
    paddingVertical: 8,
  },
  giveUpBtnText: {
    color: '#8E8EA0',
    fontSize: 11,
    fontWeight: '600',
  },
});
