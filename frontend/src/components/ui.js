import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES, ANIMATION, FONTS } from '../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * GSAP Deceleration and Easing Curves for React Native Reanimated
 */
export const GSAP_EASE = {
  power4Out: Easing.bezier(0.16, 1, 0.3, 1),
  power3Out: Easing.bezier(0.215, 0.61, 0.355, 1),
  power2Out: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  smoothBack: Easing.bezier(0.34, 1.56, 0.64, 1),
};

/**
 * GSAP-like Staggered Entry Container
 * Orchestrates child items to cascade with elastic spring & power4.out fade
 */
export const GSAPStagger = ({ children, delay = 0, stagger = 50, translateY = 22 }) => {
  return React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;
    return (
      <GSAPItem index={index} delay={delay + index * stagger} translateY={translateY}>
        {child}
      </GSAPItem>
    );
  });
};

const GSAPItem = ({ children, delay, translateY }) => {
  const opacity = useSharedValue(0);
  const transY = useSharedValue(translateY);
  const scale = useSharedValue(0.96);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 420, easing: GSAP_EASE.power4Out })
    );
    transY.value = withDelay(
      delay,
      withSpring(0, { damping: 16, stiffness: 130, mass: 0.9 })
    );
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 14, stiffness: 150 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: transY.value }, { scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

/**
 * Modern Sleek Button with GSAP-like Elastic Press & Micro-Glow
 */
export const ModernButton = ({
  onPress,
  title,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  style,
  textStyle,
  icon,
  disabled = false,
  loading = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 12, stiffness: 350 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 220 });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: '#141424',
          border: 'rgba(255, 255, 255, 0.08)',
          text: '#FFFFFF',
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: 'rgba(255, 255, 255, 0.14)',
          text: '#FFFFFF',
        };
      case 'danger':
        return {
          bg: 'rgba(231, 76, 60, 0.12)',
          border: 'rgba(231, 76, 60, 0.3)',
          text: '#FF6B6B',
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: 'rgba(255, 255, 255, 0.6)',
        };
      case 'primary':
      default:
        return {
          bg: COLORS.primary,
          border: 'rgba(162, 155, 254, 0.4)',
          text: '#FFFFFF',
        };
    }
  };

  const v = getVariantStyles();

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.88}
      disabled={disabled || loading}
      style={[
        styles.modernBtn,
        { backgroundColor: v.bg, borderColor: v.border },
        style,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <View style={styles.btnContent}>
          {icon && <View style={styles.btnIconBox}>{icon}</View>}
          <Text style={[styles.modernBtnText, { color: v.text }, textStyle]}>{title}</Text>
        </View>
      )}
    </AnimatedTouchable>
  );
};

// Aliased as GradientButton for backwards compatibility
export const GradientButton = ({ title, onPress, loading, style, textStyle }) => (
  <ModernButton title={title} onPress={onPress} loading={loading} style={style} textStyle={textStyle} />
);

/**
 * Modern Minimal Card (Sleek Border, Deep Surface, Micro-Interaction)
 */
export const ModernCard = ({ children, style, onPress }) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scale.value = withSpring(0.98, { damping: 14, stiffness: 280 });
  };

  const handlePressOut = () => {
    if (onPress) scale.value = withSpring(1, { damping: 14, stiffness: 220 });
  };

  if (!onPress) {
    return (
      <View style={[styles.modernCard, style]}>
        {children}
      </View>
    );
  }

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.92}
      style={[styles.modernCard, style, animStyle]}
    >
      {children}
    </AnimatedTouchable>
  );
};

// Aliased as GlassCard for backwards compatibility
export const GlassCard = ModernCard;

/**
 * Modern Minimal Floating Ambient Orb
 */
export const FloatingParticle = ({ size = 120, color = COLORS.accent, x = 0, y = 0, delay = 0 }) => {
  const opacity = useSharedValue(0.08);
  const transY = useSharedValue(0);

  useEffect(() => {
    transY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-16, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
          withTiming(16, { duration: 3200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: transY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

/**
 * Modern Minimal Progress Bar with GSAP-style Fluid Interpolated Deceleration
 */
export const MinimalProgress = ({ progress = 0, color = COLORS.accent, height = 4, animated = true }) => {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    const target = Math.min(Math.max(progress, 0), 1) * 100;
    if (animated) {
      animatedWidth.value = withTiming(target, {
        duration: 700,
        easing: GSAP_EASE.power4Out,
      });
    } else {
      animatedWidth.value = target;
    }
  }, [progress, animated]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View style={[styles.progressTrack, { height }]}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            backgroundColor: color,
            height,
          },
          fillStyle,
        ]}
      />
    </View>
  );
};

export const ProgressBar = ({ progress = 0, height = 4, gradient = [COLORS.accent, COLORS.primary], style }) => {
  const color = Array.isArray(gradient) ? gradient[0] : gradient;
  return (
    <View style={style}>
      <MinimalProgress progress={progress} color={color} height={height} />
    </View>
  );
};

/**
 * Sleek Minimal Pill for Tabs, Categories, and Tags with Elastic Press Physics
 */
export const SleekPill = ({ label, active, onPress, count, icon, style, activeColor = COLORS.primary }) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 14, stiffness: 320 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 220 });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.85}
      style={[
        styles.sleekPill,
        active && [styles.sleekPillActive, { borderColor: activeColor, backgroundColor: 'rgba(108, 92, 231, 0.16)' }],
        style,
        animStyle,
      ]}
    >
      {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
      <Text style={[styles.sleekPillText, active && styles.sleekPillTextActive]}>
        {label}
      </Text>
      {count !== undefined && (
        <View style={[styles.sleekPillBadge, active && { backgroundColor: activeColor }]}>
          <Text style={[styles.sleekPillBadgeText, active && { color: '#FFFFFF' }]}>
            {count}
          </Text>
        </View>
      )}
    </AnimatedTouchable>
  );
};

/**
 * Breathing Status Indicator (for Live, Tracking, and Portal Sync indicators)
 */
export const PulseIndicator = ({ size = 8, color = '#2ECC71' }) => {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          animStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modernBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnIconBox: {
    marginRight: 8,
  },
  modernBtnText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.2,
  },
  modernCard: {
    backgroundColor: '#0D0D19',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: SPACING.md,
  },
  progressTrack: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.pill,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: BORDER_RADIUS.pill,
  },
  sleekPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: '#111120',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sleekPillActive: {
    borderColor: COLORS.primary,
  },
  sleekPillText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.medium,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  sleekPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sleekPillBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sleekPillBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
