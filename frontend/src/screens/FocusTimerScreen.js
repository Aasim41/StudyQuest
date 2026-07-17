import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../theme';
import { FloatingParticle } from '../components/ui';
import LevelUpModal from '../components/ui/LevelUpModal';
import { useUser } from '../context/UserContext';

const { width, height } = Dimensions.get('window');
const TIMER_SIZE = width * 0.7;
const STROKE_WIDTH = 12;
const RADIUS = (TIMER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = RADIUS * 2 * Math.PI;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function FocusTimerScreen({ route, navigation }) {
  const { topic = 'Calculus: Derivatives', subject = 'Mathematics', color = COLORS.primary } = route.params || {};
  const { logStudySession } = useUser();

  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);

  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [timeLeft, setTimeLeft] = useState(focusDuration);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Gamification State
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);

  // Animations
  const progress = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    // Update SVG progress ring
    const totalTime = mode === 'focus' ? focusDuration : breakDuration;
    progress.value = withTiming(timeLeft / totalTime, { duration: 1000, easing: Easing.linear });
  }, [timeLeft]);

  const handleSessionComplete = () => {
    setIsActive(false);
    
    if (mode === 'focus') {
      const durationMins = Math.floor(focusDuration / 60);
      setCompletedSessions((prev) => prev + 1);
      
      // Log session and check level up
      logStudySession(subject, durationMins).then((res) => {
        if (res && res.leveledUp) {
          setNewLevel(res.newLevel);
          setShowLevelUp(true);
        }
      });

      setMode('break');
      setTimeLeft(breakDuration);
    } else {
      setMode('focus');
      setTimeLeft(focusDuration);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (!isActive) {
      pulseScale.value = withRepeat(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  };

  const skipSession = () => handleSessionComplete();

  const resetTimer = () => {
    setIsActive(false);
    pulseScale.value = 1;
    progress.value = 1;
    setTimeLeft(mode === 'focus' ? focusDuration : breakDuration);
  };

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const activeColor = mode === 'focus' ? color : COLORS.secondary;

  const applySettings = (focusMins, breakMins) => {
    setFocusDuration(focusMins * 60);
    setBreakDuration(breakMins * 60);
    if (mode === 'focus') setTimeLeft(focusMins * 60);
    else setTimeLeft(breakMins * 60);
    setShowSettings(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <FloatingParticle size={120} color={activeColor} x={width * 0.8} y={-20} delay={200} />
      <FloatingParticle size={150} color={COLORS.accent} x={-40} y={height * 0.7} delay={500} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.settingsBtn}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.headerInfo}>
          <Text style={styles.modeText}>{mode === 'focus' ? 'Focus Time' : 'Break Time'}</Text>
        </Animated.View>
      </View>

      {/* Topic Info */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.topicContainer}>
        <Text style={[styles.subjectText, { color: activeColor }]}>{subject}</Text>
        <Text style={styles.topicTitle}>{topic}</Text>
      </Animated.View>

      {/* Timer SVG */}
      <Animated.View entering={FadeInDown.delay(400).springify()} style={[styles.timerContainer, pulseStyle]}>
        <Svg width={TIMER_SIZE} height={TIMER_SIZE} viewBox={`0 0 ${TIMER_SIZE} ${TIMER_SIZE}`}>
          {/* Background Circle */}
          <Circle
            cx={TIMER_SIZE / 2}
            cy={TIMER_SIZE / 2}
            r={RADIUS}
            stroke={COLORS.glassBorder}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          {/* Progress Circle */}
          <AnimatedCircle
            cx={TIMER_SIZE / 2}
            cy={TIMER_SIZE / 2}
            r={RADIUS}
            stroke={activeColor}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            strokeLinecap="round"
            animatedProps={animatedProps}
            style={{ transform: [{ rotate: '-90deg' }], transformOrigin: 'center' }}
          />
        </Svg>
        <View style={styles.timeTextContainer}>
          <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
        </View>
      </Animated.View>

      {/* Controls */}
      <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.controlsContainer}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={resetTimer}>
          <Text style={styles.secondaryBtnText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.playPauseBtn} onPress={toggleTimer}>
          <LinearGradient colors={isActive ? ['#E74C3C', '#C0392B'] : [activeColor, activeColor]} style={styles.playPauseGradient}>
            <Text style={styles.playPauseIcon}>{isActive ? '⏸' : '▶'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={skipSession}>
          <Text style={styles.secondaryBtnText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Session Dots */}
      <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.sessionsContainer}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.sessionDot,
              completedSessions >= i ? { backgroundColor: activeColor, borderColor: activeColor } : null
            ]}
          />
        ))}
      </Animated.View>

      <LevelUpModal 
        visible={showLevelUp} 
        newLevel={newLevel} 
        onClose={() => setShowLevelUp(false)} 
      />

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="slide">
        <View style={styles.settingsOverlay}>
          <View style={styles.settingsCard}>
            <Text style={styles.settingsTitle}>Timer Settings</Text>
            
            <Text style={styles.settingsLabel}>Focus Duration (Minutes)</Text>
            <View style={styles.durationRow}>
              {[25, 45, 50, 90].map(min => (
                <TouchableOpacity key={min} onPress={() => applySettings(min, breakDuration/60)} style={[styles.durationBtn, focusDuration/60 === min && styles.durationBtnActive]}>
                  <Text style={[styles.durationText, focusDuration/60 === min && styles.durationTextActive]}>{min}m</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.settingsLabel}>Break Duration (Minutes)</Text>
            <View style={styles.durationRow}>
              {[5, 10, 15, 20].map(min => (
                <TouchableOpacity key={min} onPress={() => applySettings(focusDuration/60, min)} style={[styles.durationBtn, breakDuration/60 === min && styles.durationBtnActive]}>
                  <Text style={[styles.durationText, breakDuration/60 === min && styles.durationTextActive]}>{min}m</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.closeSettingsBtn} onPress={() => setShowSettings(false)}>
              <Text style={styles.closeSettingsTxt}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Wrap Circle for Reanimated
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: height * 0.08,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  backBtn: {
    paddingVertical: SPACING.sm,
  },
  backTxt: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
  settingsBtn: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  settingsIcon: {
    fontSize: 16,
  },
  headerInfo: {
    alignItems: 'center',
  },
  modeText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '700',
  },
  topicContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  subjectText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  topicTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.08,
    position: 'relative',
  },
  timeTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFF',
    fontVariant: ['tabular-nums'],
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.08,
    gap: SPACING.xxl,
  },
  playPauseBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  playPauseGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseIcon: {
    fontSize: 32,
    color: '#FFF',
  },
  secondaryBtn: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  secondaryBtnText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
  sessionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  sessionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
  },
  settingsOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  settingsCard: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    borderTopWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  settingsTitle: {
    fontSize: FONT_SIZES.title,
    color: '#FFF',
    fontWeight: '800',
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  settingsLabel: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  durationBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  durationBtnActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  durationText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  durationTextActive: {
    color: '#FFF',
  },
  closeSettingsBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: 40, // iPhone bottom safe area
  },
  closeSettingsTxt: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: FONT_SIZES.bodyLarge,
  }
});
