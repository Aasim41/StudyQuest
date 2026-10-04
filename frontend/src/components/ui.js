import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES, ANIMATION, FONTS } from '../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * GSAP-like Staggered Entry Container
 * Orchestrates child items to cascade with elastic spring & fade
 */
export const GSAPStagger = ({ children, delay = 0, stagger = 60, translateY = 30 }) => {
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
    opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    transY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 120 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 140 }));
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
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
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
    scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: COLORS.surfaceElevated,
          border: COLORS.border,
          text: COLORS.textPrimary,
        };
      case 'danger':
        return {
          bg: 'rgba(231,76,60,0.15)',
          border: 'rgba(231,76,60,0.3)',
          text: '#FF6B6B',
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: COLORS.textMuted,
        };
      case 'primary':
      default:
        return {
          bg: COLORS.primary,
          border: COLORS.primary,
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
      activeOpacity={0.85}
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
    if (onPress) scale.value = withSpring(0.98, { damping: 12, stiffness: 250 });
  };

  const handlePressOut = () => {
    if (onPress) scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={onPress ? 0.9 : 1}
      disabled={!onPress}
      style={[styles.modernCard, style, animStyle]}
    >
      {children}
    </AnimatedTouchable>
  );
};

// Aliased as GlassCard for backwards compatibility
export const GlassCard = ModernCard;

/**
 * Modern Minimal Floating Dot / Particle (Subtle background ambient)
 */
export const FloatingParticle = ({ size = 100, color = COLORS.accent, x = 0, y = 0, delay = 0 }) => {
  const opacity = useSharedValue(0.12);
  const transY = useSharedValue(0);

  useEffect(() => {
    transY.value = withDelay(
      delay,
      withSequence(
        withTiming(-15, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(15, { duration: 3000, easing: Easing.inOut(Easing.ease) })
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
 * Modern Minimal Progress Bar
 */
export const MinimalProgress = ({ progress = 0, color = COLORS.accent, height = 4 }) => {
  const widthVal = Math.min(Math.max(progress, 0), 1) * 100;
  return (
    <View style={[styles.progressTrack, { height }]}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${widthVal}%`,
            backgroundColor: color,
            height,
          },
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

const styles = StyleSheet.create({
  modernBtn: {
    paddingVertical: 13,
    paddingHorizontal: 20,
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
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  progressTrack: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BORDER_RADIUS.pill,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: BORDER_RADIUS.pill,
  },
});
