import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
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

const { width, height } = Dimensions.get('window');
const TIMER_SIZE = width * 0.7;
const STROKE_WIDTH = 12;
const RADIUS = (TIMER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = RADIUS * 2 * Math.PI;

export default function FocusTimerScreen({ route, navigation }) {
  // Pass topic details via route params (or use mock data)
  const { topic = 'Calculus: Derivatives', subject = 'Mathematics', color = COLORS.primary } = route.params || {};

  const [mode, setMode] = useState('focus'); // 'focus', 'short_break', 'long_break'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

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
    const totalTime = mode === 'focus' ? 25 * 60 : (mode === 'short_break' ? 5 * 60 : 15 * 60);
    progress.value = withTiming(timeLeft / totalTime, { duration: 1000, easing: Easing.linear });
  }, [timeLeft]);

  useEffect(() => {
    if (isActive) {
      pulseScale.value = withRepeat(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [isActive]);

  const handleSessionComplete = () => {
    setIsActive(false);
    if (mode === 'focus') {
      const newSessions = completedSessions + 1;
      setCompletedSessions(newSessions);
      if (newSessions % 4 === 0) {
        setMode('long_break');
        setTimeLeft(15 * 60);
      } else {
        setMode('short_break');
        setTimeLeft(5 * 60);
      }
    } else {
      setMode('focus');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  const skipSession = () => handleSessionComplete();

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : (mode === 'short_break' ? 5 * 60 : 15 * 60));
  };

  const animatedProps = useAnimatedStyle(() => {
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <FloatingParticle size={120} color={activeColor} x={width * 0.8} y={-20} delay={200} />
      <FloatingParticle size={150} color={COLORS.accent} x={-40} y={height * 0.7} delay={500} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.modeText}>{mode === 'focus' ? 'Focus Time' : 'Break Time'}</Text>
        <View style={{ width: 60 }} />
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
          {/* Progress Circle (Animated via strokeDashoffset inline below natively but reanimated handles it via animatedProps) */}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: height * 0.08,
  },
  backBtn: {
    padding: SPACING.sm,
  },
  backBtnText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
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
});
