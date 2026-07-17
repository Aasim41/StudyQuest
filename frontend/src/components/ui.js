import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES, ANIMATION } from '../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

/**
 * GradientButton — Primary CTA with glow, press animation, and shimmer
 */
export const GradientButton = ({
  onPress,
  title,
  colors = COLORS.gradientAccent,
  style,
  textStyle,
  loading = false,
  disabled = false,
  icon,
}) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0.4, 0.8], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(glow.value, [0, 1], [1, 1.15], Extrapolation.CLAMP) }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, ANIMATION.springBouncy);
    glow.value = withTiming(1, { duration: ANIMATION.fast });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, ANIMATION.springBouncy);
    glow.value = withTiming(0, { duration: ANIMATION.normal });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      disabled={disabled || loading}
      style={[animatedStyle, style]}
    >
      {/* Glow layer behind button */}
      <AnimatedLinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.buttonGlow, glowStyle]}
      />
      {/* Button surface */}
      <LinearGradient
        colors={disabled ? ['#333', '#444'] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientButton}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <View style={styles.buttonContent}>
            {icon && <View style={styles.buttonIcon}>{icon}</View>}
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
};

/**
 * GlassCard — Frosted glass card with border glow
 */
export const GlassCard = ({ children, style, intensity = 40, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scale.value = withSpring(0.97, ANIMATION.springSmooth);
  };
  const handlePressOut = () => {
    if (onPress) scale.value = withSpring(1, ANIMATION.springSmooth);
  };

  const content = (
    <Animated.View style={[styles.glassCard, style, animatedStyle]}>
      <LinearGradient
        colors={COLORS.gradientGlass}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glassGradient}
      >
        {children}
      </LinearGradient>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

/**
 * GlassInput — Frosted glass text input
 */
export const GlassInput = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  icon,
  style,
  error,
}) => {
  const borderOpacity = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? COLORS.error
      : `rgba(108, 92, 231, ${interpolate(borderOpacity.value, [0, 1], [0.15, 0.6], Extrapolation.CLAMP)})`,
  }));

  return (
    <Animated.View style={[styles.inputContainer, borderStyle, style]}>
      <LinearGradient
        colors={COLORS.gradientGlass}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inputGradient}
      >
        {icon && <View style={styles.inputIcon}>{icon}</View>}
        <Animated.View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ display: 'none' }}>{/* Spacer */}</Text>
          </View>
        </Animated.View>
      </LinearGradient>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </Animated.View>
  );
};

/**
 * AnimatedText — Text that fades/slides in on mount
 */
export const AnimatedText = ({ children, style, delay = 0 }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 600 });
      translateY.value = withSpring(0, ANIMATION.springSmooth);
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.Text style={[style, animatedStyle]}>{children}</Animated.Text>;
};

/**
 * FloatingParticle — Decorative floating orb for backgrounds
 */
export const FloatingParticle = ({ size = 100, color = COLORS.primary, x, y, delay = 0 }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0.15, { duration: 1500 });
      translateY.value = withTiming(-30, { duration: 4000 });
      scale.value = withTiming(1.1, { duration: 3000 });
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: x,
          top: y,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonGlow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: BORDER_RADIUS.xl,
    zIndex: -1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  buttonIcon: {
    marginRight: SPACING.xs,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  glassCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  glassGradient: {
    padding: SPACING.lg,
  },
  inputContainer: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  inputInner: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.caption,
    marginTop: SPACING.xs,
    marginLeft: SPACING.md,
    marginBottom: SPACING.xs,
  },
  progressContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    overflow: 'hidden',
    width: '100%',
  },
});

/**
 * ProgressBar - Animated gradient progress bar
 */
export const ProgressBar = ({ progress = 0, height = 8, gradient = COLORS.gradientSuccess, style }) => {
  const widthAnim = useSharedValue(0);

  React.useEffect(() => {
    widthAnim.value = withSpring(progress * 100, ANIMATION.springSmooth);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value}%`,
  }));

  return (
    <View style={[styles.progressContainer, { height }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle, { borderRadius: height / 2, overflow: 'hidden' }]}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};
