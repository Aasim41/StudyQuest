import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Platform,
  Alert,
  Switch,
  AppState,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useUser } from '../context/UserContext';
import {
  DEFAULT_BLOCKED_PACKAGES,
  isNativeShieldAvailable,
  getNativeShieldStatus,
  syncNativeShield,
  loadInstalledAppsList,
  openAndroidAccessibilitySettings,
  openAndroidOverlaySettings,
  openSystemDigitalWellbeing,
} from '../services/focusShieldService';
import { gsapTabTransition } from '../utils/gsapAnim';

const TIMER_MODES = [
  { id: 'QUICK_15', label: '15m', durationMinutes: 15, breakMinutes: 3 },
  { id: 'POMO_25', label: '25m', durationMinutes: 25, breakMinutes: 5 },
  { id: 'DEEP_50', label: '50m', durationMinutes: 50, breakMinutes: 10 },
  { id: 'EXAM_180', label: '3h', durationMinutes: 180, breakMinutes: 0 },
];

const REGAIN_STORAGE_KEY = '@studyquest_regain_v2';

export default function RegainFocusScreen() {
  const {
    targetExam,
    targetSubject,
    awardCustomXp,
    logStudySession,
    setFocusShieldState,
  } = useUser();

  const [activeTab, setActiveTab] = useState('timer'); // 'timer' | 'blocker'
  const tabAnim = useRef(new Animated.Value(1)).current;

  // Timer state
  const [selectedMode, setSelectedMode] = useState(TIMER_MODES[1]);
  const [secondsRemaining, setSecondsRemaining] = useState(TIMER_MODES[1].durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // Shield configuration
  const [strictMode, setStrictMode] = useState(true);
  const [blockShortsReels, setBlockShortsReels] = useState(true);
  const [alwaysGuard, setAlwaysGuard] = useState(true);
  const [blockedApps, setBlockedApps] = useState(DEFAULT_BLOCKED_PACKAGES);

  // Native OS shield status (Android Accessibility + Overlay + Installed Apps)
  const [nativeStatus, setNativeStatus] = useState({
    nativeSupported: isNativeShieldAvailable,
    accessibilityEnabled: false,
    overlayEnabled: false,
    urgesBlockedCount: 0,
  });

  // Stats
  const [screenTimeSavedMinutes, setScreenTimeSavedMinutes] = useState(0);
  const [urgesBlockedCount, setUrgesBlockedCount] = useState(0);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  // Mindful Pause Modal
  const [frictionModalVisible, setFrictionModalVisible] = useState(false);
  const [breathCountdown, setBreathCountdown] = useState(5);
  const [frictionReason, setFrictionReason] = useState('');

  const timerRef = useRef(null);
  const breathTimerRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const leftAtRef = useRef(null);

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    gsapTabTransition(tabAnim);
    setActiveTab(tab);
  };

  // Load saved Regain config & stats on mount
  useEffect(() => {
    AsyncStorage.getItem(REGAIN_STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (typeof parsed.screenTimeSavedMinutes === 'number') setScreenTimeSavedMinutes(parsed.screenTimeSavedMinutes);
        if (typeof parsed.urgesBlockedCount === 'number') setUrgesBlockedCount(parsed.urgesBlockedCount);
        if (typeof parsed.completedSessionsCount === 'number') setCompletedSessionsCount(parsed.completedSessionsCount);
        if (typeof parsed.strictMode === 'boolean') setStrictMode(parsed.strictMode);
        if (typeof parsed.blockShortsReels === 'boolean') setBlockShortsReels(parsed.blockShortsReels);
        if (typeof parsed.alwaysGuard === 'boolean') setAlwaysGuard(parsed.alwaysGuard);
        if (Array.isArray(parsed.blockedApps) && parsed.blockedApps.length > 0) {
          setBlockedApps(parsed.blockedApps);
        }
      })
      .catch(() => {});

    return () => {
      clearInterval(timerRef.current);
      clearInterval(breathTimerRef.current);
    };
  }, []);

  const refreshNativeStatus = async () => {
    const st = await getNativeShieldStatus();
    setNativeStatus(st);
    if (st.urgesBlockedCount && st.urgesBlockedCount > urgesBlockedCount) {
      setUrgesBlockedCount(st.urgesBlockedCount);
    }
    const installed = await loadInstalledAppsList();
    if (installed && installed.length > 0) {
      setBlockedApps((prev) => {
        const prevMap = new Map(prev.map((p) => [p.packageName, p.blocked]));
        const merged = installed.map((item) => ({
          packageName: item.packageName,
          label: item.label,
          blocked: prevMap.has(item.packageName) ? prevMap.get(item.packageName) : item.blocked,
        }));
        return merged;
      });
    }
  };

  useEffect(() => {
    refreshNativeStatus();
  }, []);

  // Persist locally, update shared UserContext shield, and push to native Android service
  useEffect(() => {
    setFocusShieldState({
      focusActive: isActive,
      strictMode,
      blockShortsReels,
      alwaysGuard,
    });

    syncNativeShield({
      focusActive: isActive,
      strictMode,
      blockShortsReels,
      alwaysGuard,
      blockedPackages: blockedApps,
    });

    AsyncStorage.setItem(
      REGAIN_STORAGE_KEY,
      JSON.stringify({
        screenTimeSavedMinutes,
        urgesBlockedCount,
        completedSessionsCount,
        strictMode,
        blockShortsReels,
        alwaysGuard,
        blockedApps,
      })
    ).catch(() => {});
  }, [
    isActive,
    strictMode,
    blockShortsReels,
    alwaysGuard,
    blockedApps,
    screenTimeSavedMinutes,
    urgesBlockedCount,
    completedSessionsCount,
  ]);

  // AppState monitor: refreshes native permissions on resume & warns if user leaves mid-focus
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (prevState === 'active' && (nextState === 'background' || nextState === 'inactive')) {
        if (isActive && !isBreak && strictMode) {
          leftAtRef.current = Date.now();
          if (Platform.OS !== 'web') {
            Notifications.scheduleNotificationAsync({
              content: {
                title: 'Focus Shield Active',
                body: `Stay in StudyQuest to finish your ${selectedMode.label} sprint.`,
              },
              trigger: null,
            }).catch(() => {});
          }
        }
      } else if (nextState === 'active' && (prevState === 'background' || prevState === 'inactive')) {
        refreshNativeStatus();
        if (leftAtRef.current && isActive && strictMode && Date.now() - leftAtRef.current > 2500) {
          leftAtRef.current = null;
          triggerMindfulFriction('left Focus Shield');
        }
      }
    });
    return () => sub.remove();
  }, [isActive, isBreak, strictMode, selectedMode]);

  // Countdown tick
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
      setScreenTimeSavedMinutes((m) => m + gainedMins);
      setCompletedSessionsCount((c) => c + 1);
      awardCustomXp(gainedMins * 2, 'Completed Focus Session');
      logStudySession(targetSubject !== 'All' ? targetSubject : 'Deep Focus', gainedMins);

      Alert.alert(
        'Session Complete',
        `Completed ${gainedMins} minutes for ${targetExam}.`
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
      Alert.alert('Break Finished', 'Ready for the next study block.');
    }
  };

  const triggerMindfulFriction = (reason) => {
    setFrictionReason(reason);
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

  const handleStayFocused = () => {
    clearInterval(breathTimerRef.current);
    setFrictionModalVisible(false);
    setUrgesBlockedCount((c) => c + 1);
    awardCustomXp(10, 'Stayed Focused');
  };

  const handleGiveUp = () => {
    clearInterval(breathTimerRef.current);
    setFrictionModalVisible(false);
    setIsActive(false);
  };

  const handleSelectMode = (mode) => {
    if (isActive) {
      triggerMindfulFriction('change duration');
      return;
    }
    setSelectedMode(mode);
    setIsBreak(false);
    setSecondsRemaining(mode.durationMinutes * 60);
  };

  const toggleTimer = () => {
    if (isActive) {
      if (strictMode) {
        triggerMindfulFriction('pause focus session');
        return;
      }
      setIsActive(false);
    } else {
      setIsActive(true);
    }
  };

  const resetTimer = () => {
    if (isActive && strictMode) {
      triggerMindfulFriction('reset focus timer');
      return;
    }
    setIsActive(false);
    setIsBreak(false);
    setSecondsRemaining(selectedMode.durationMinutes * 60);
  };

  const toggleAppBlock = (pkg) => {
    if (isActive && strictMode) {
      const targetApp = blockedApps.find((a) => a.packageName === pkg);
      if (targetApp?.blocked) {
        triggerMindfulFriction(`unblock ${targetApp.label}`);
        return;
      }
    }
    setBlockedApps((prev) =>
      prev.map((a) => (a.packageName === pkg ? { ...a, blocked: !a.blocked } : a))
    );
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = useMemo(() => {
    const total = isBreak ? selectedMode.breakMinutes * 60 : selectedMode.durationMinutes * 60;
    if (total <= 0) return 0;
    return Math.round(((total - secondsRemaining) / total) * 100);
  }, [secondsRemaining, selectedMode, isBreak]);

  const blockedCount = blockedApps.filter((a) => a.blocked).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C10" />

      {/* Clean Simple Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Regain</Text>
          <Text style={styles.headerMeta} numberOfLines={1}>
            {targetExam}{targetSubject && targetSubject !== 'All' ? ` · ${targetSubject}` : ''}
          </Text>
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'timer' && styles.tabItemActive]}
            onPress={() => switchTab('timer')}
          >
            <Text style={[styles.tabText, activeTab === 'timer' && styles.tabTextActive]}>
              Focus Timer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'blocker' && styles.tabItemActive]}
            onPress={() => switchTab('blocker')}
          >
            <Text style={[styles.tabText, activeTab === 'blocker' && styles.tabTextActive]}>
              App Blocker ({blockedCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: tabAnim }}
      >
        {/* TAB 1: CLEAN FOCUS TIMER */}
        {activeTab === 'timer' && (
          <View>
            {/* Duration Text Row */}
            <View style={styles.durationRow}>
              {TIMER_MODES.map((mode) => {
                const active = selectedMode.id === mode.id;
                return (
                  <TouchableOpacity
                    key={mode.id}
                    style={[styles.durationTab, active && styles.durationTabActive]}
                    onPress={() => handleSelectMode(mode)}
                  >
                    <Text style={[styles.durationText, active && styles.durationTextActive]}>
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Minimal Centered Clock */}
            <View style={styles.clockBlock}>
              <Text style={styles.phaseLabel}>
                {isBreak ? 'REST BREAK' : isActive ? 'FOCUS ACTIVE' : 'READY'}
              </Text>
              <Text style={styles.clockDigits}>{formatTime(secondsRemaining)}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>

              <View style={styles.timerControls}>
                <TouchableOpacity
                  style={[styles.primaryBtn, isActive && styles.pauseBtn]}
                  onPress={toggleTimer}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>
                    {isActive ? 'Pause' : 'Start Focus'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resetBtn} onPress={resetTimer}>
                  <Text style={styles.resetBtnText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Clean Toggle List */}
            <View style={styles.toggleRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.toggleTitle}>Block Shorts & Reels</Text>
                <Text style={styles.toggleSub}>
                  Auto-exits YouTube Shorts & Instagram Reels; blocks distraction URLs in Flow
                </Text>
              </View>
              <Switch
                value={blockShortsReels}
                onValueChange={setBlockShortsReels}
                trackColor={{ false: '#262938', true: '#38BDF8' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.toggleTitle}>Strict Breathing Lock</Text>
                <Text style={styles.toggleSub}>
                  Enforces a 5-second pause when leaving StudyQuest or ending focus early
                </Text>
              </View>
              <Switch
                value={strictMode}
                onValueChange={setStrictMode}
                trackColor={{ false: '#262938', true: '#38BDF8' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        )}

        {/* TAB 2: GENUINE APP BLOCKER */}
        {activeTab === 'blocker' && (
          <View>
            {/* Plain Stats Line */}
            <View style={styles.statsSummary}>
              <Text style={styles.statsLine}>
                {Math.floor(screenTimeSavedMinutes / 60)}h {screenTimeSavedMinutes % 60}m saved · {urgesBlockedCount} urges blocked · {completedSessionsCount} sessions
              </Text>
            </View>

            {/* Real OS Shield Status Row */}
            <View style={styles.osStatusBlock}>
              {isNativeShieldAvailable ? (
                <>
                  <TouchableOpacity
                    style={styles.osRow}
                    onPress={openAndroidAccessibilitySettings}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleTitle}>Android App & Shorts Blocker</Text>
                      <Text
                        style={[
                          styles.toggleSub,
                          nativeStatus.accessibilityEnabled && { color: '#34D399' },
                        ]}
                      >
                        {nativeStatus.accessibilityEnabled
                          ? 'Active across device — blocked apps redirect back here'
                          : 'Tap to enable StudyQuest in Android Accessibility Settings'}
                      </Text>
                    </View>
                    <Text style={styles.actionText}>
                      {nativeStatus.accessibilityEnabled ? 'Enabled' : 'Enable'}
                    </Text>
                  </TouchableOpacity>

                  {!nativeStatus.overlayEnabled && (
                    <TouchableOpacity
                      style={styles.osRow}
                      onPress={openAndroidOverlaySettings}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.toggleTitle}>Display Over Other Apps</Text>
                        <Text style={styles.toggleSub}>Allows lock screen overlay on Android</Text>
                      </View>
                      <Text style={styles.actionText}>Allow</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <TouchableOpacity style={styles.osRow} onPress={openSystemDigitalWellbeing}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleTitle}>Device Focus Mode (Digital Wellbeing)</Text>
                    <Text style={styles.toggleSub}>
                      In-app breach notifications active; open Digital Wellbeing or build APK for full OS blocking
                    </Text>
                  </View>
                  <Text style={styles.actionText}>Open</Text>
                </TouchableOpacity>
              )}

              <View style={styles.toggleRow}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.toggleTitle}>Always Guard Selected Apps</Text>
                  <Text style={styles.toggleSub}>
                    Keep blocked list active even outside timer sessions
                  </Text>
                </View>
                <Switch
                  value={alwaysGuard}
                  onValueChange={setAlwaysGuard}
                  trackColor={{ false: '#262938', true: '#38BDF8' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Clean List of Apps to Block */}
            <Text style={styles.sectionLabel}>Apps ({blockedCount} blocked)</Text>
            {blockedApps.map((app) => (
              <View key={app.packageName} style={styles.appRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.appLabel}>{app.label}</Text>
                  <Text style={styles.appPkg}>{app.packageName}</Text>
                </View>
                <Switch
                  value={!!app.blocked}
                  onValueChange={() => toggleAppBlock(app.packageName)}
                  trackColor={{ false: '#262938', true: '#F87171' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 90 }} />
      </Animated.ScrollView>

      {/* Mindful 5-Second Pause Modal */}
      <Modal
        visible={frictionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Mindful Pause</Text>
            <Text style={styles.modalDesc}>
              You {frictionReason}. Take {breathCountdown} seconds to breathe before deciding.
            </Text>

            <Text style={styles.modalCount}>{breathCountdown}</Text>

            <TouchableOpacity style={styles.stayBtn} onPress={handleStayFocused}>
              <Text style={styles.stayBtnText}>Stay Focused (+10 XP)</Text>
            </TouchableOpacity>

            {breathCountdown === 0 && (
              <TouchableOpacity style={styles.leaveBtn} onPress={handleGiveUp}>
                <Text style={styles.leaveBtnText}>End Focus Anyway</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
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
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  headerTitle: { color: '#F9FAFB', fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  headerMeta: { color: '#9CA3AF', fontSize: 12, flexShrink: 1 },

  tabsRow: { flexDirection: 'row', gap: 22 },
  tabItem: { paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#38BDF8' },
  tabText: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#F9FAFB' },

  scrollContent: { padding: 20 },

  durationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  durationTab: { paddingVertical: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  durationTabActive: { borderBottomColor: '#38BDF8' },
  durationText: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
  durationTextActive: { color: '#F9FAFB' },

  clockBlock: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
    marginBottom: 8,
  },
  phaseLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  clockDigits: {
    color: '#F9FAFB',
    fontSize: 64,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginVertical: 12,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: '#1D1F2C',
    marginBottom: 22,
  },
  progressFill: { height: '100%', backgroundColor: '#38BDF8' },
  timerControls: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  primaryBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  pauseBtn: { backgroundColor: '#FBBF24' },
  primaryBtnText: { color: '#0B0C10', fontSize: 15, fontWeight: '700' },
  resetBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  resetBtnText: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  toggleTitle: { color: '#F3F4F6', fontSize: 14, fontWeight: '600' },
  toggleSub: { color: '#6B7280', fontSize: 12, marginTop: 3, lineHeight: 17 },

  statsSummary: { paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#1D1F2C' },
  statsLine: { color: '#9CA3AF', fontSize: 12 },

  osStatusBlock: { marginBottom: 18 },
  osRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
    gap: 12,
  },
  actionText: { color: '#38BDF8', fontSize: 13, fontWeight: '700' },

  sectionLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1F2C',
  },
  appLabel: { color: '#F3F4F6', fontSize: 14, fontWeight: '600' },
  appPkg: { color: '#6B7280', fontSize: 11, marginTop: 2 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#14161F',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: { color: '#F9FAFB', fontSize: 18, fontWeight: '700' },
  modalDesc: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  modalCount: { color: '#38BDF8', fontSize: 44, fontWeight: '700', marginVertical: 18 },
  stayBtn: {
    backgroundColor: '#38BDF8',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  stayBtnText: { color: '#0B0C10', fontSize: 14, fontWeight: '700' },
  leaveBtn: { marginTop: 12, paddingVertical: 8 },
  leaveBtnText: { color: '#9CA3AF', fontSize: 13 },
});
