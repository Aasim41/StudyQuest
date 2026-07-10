import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS, ANIMATION } from '../theme';
import { GradientButton, FloatingParticle } from '../components/ui';

const { width, height } = Dimensions.get('window');

const USER_TYPES = [
  {
    id: 'college',
    emoji: '🏫',
    title: 'College Student',
    subtitle: 'BTech, BSc, BCA, MBA...',
    description: 'Complex schedule with lectures, labs & fests',
    gradient: ['#6C5CE7', '#A29BFE'],
    glowColor: '#6C5CE7',
  },
  {
    id: 'school',
    emoji: '📚',
    title: 'School Student',
    subtitle: 'Class 9 – 12',
    description: 'Standard school hours & board prep',
    gradient: ['#00D2FF', '#74B9FF'],
    glowColor: '#00D2FF',
  },
  {
    id: 'coaching',
    emoji: '🎯',
    title: 'Coaching / Competitive',
    subtitle: 'JEE, NEET, UPSC, CAT...',
    description: 'Intensive prep with target exam dates',
    gradient: ['#FF6B35', '#FFD93D'],
    glowColor: '#FF6B35',
  },
];

const TypeCard = ({ item, index, selected, onSelect }) => {
  const scale = useSharedValue(1);
  const isSelected = selected === item.id;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.95, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 12, stiffness: 150 })
    );
    onSelect(item.id);
  };

  return (
    <Animated.View entering={FadeInDown.delay(400 + index * 150).springify()} style={animStyle}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
        <LinearGradient
          colors={isSelected ? item.gradient : COLORS.gradientGlass}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.8 }}
          style={[
            styles.typeCard,
            isSelected && {
              borderColor: item.glowColor + '80',
              ...SHADOWS.glow,
              shadowColor: item.glowColor,
            },
          ]}
        >
          <View style={styles.cardRow}>
            <View style={[styles.emojiContainer, isSelected && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, isSelected && { color: '#FFF' }]}>
                {item.title}
              </Text>
              <Text style={[styles.cardSubtitle, isSelected && { color: 'rgba(255,255,255,0.85)' }]}>
                {item.subtitle}
              </Text>
              <Text style={[styles.cardDesc, isSelected && { color: 'rgba(255,255,255,0.7)' }]}>
                {item.description}
              </Text>
            </View>
            {isSelected && (
              <Animated.View entering={ZoomIn.springify()} style={[styles.radioOuter, { borderColor: '#FFF' }]}>
                <View style={[styles.radioInner, { backgroundColor: '#FFF' }]} />
              </Animated.View>
            )}
            {!isSelected && (
              <View style={styles.radioOuter} />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function UserTypeScreen({ navigation, route }) {
  const [selected, setSelected] = useState(null);
  const avatar = 'student1'; // Default fallback since we removed avatar selection

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);

  useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    headerTranslateY.value = withDelay(100, withSpring(0, ANIMATION.springSmooth));
  }, []);

  const headerAnimStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const handleContinue = () => {
    if (!selected) return;
    navigation.navigate('InstituteSearch', { avatar, userType: selected });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientOnboarding} style={StyleSheet.absoluteFill} />

      <FloatingParticle size={200} color={COLORS.primary} x={-70} y={height * 0.15} delay={200} />
      <FloatingParticle size={140} color={COLORS.streak} x={width * 0.75} y={height * 0.65} delay={600} />

      <Animated.View style={[styles.header, headerAnimStyle]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.stepLabel}>STEP 2 OF 3</Text>
        <Text style={styles.title}>I am a...</Text>
        <Text style={styles.subtitle}>This helps us tailor your schedule</Text>
      </Animated.View>

      <View style={styles.cardsContainer}>
        {USER_TYPES.map((item, index) => (
          <TypeCard
            key={item.id}
            item={item}
            index={index}
            selected={selected}
            onSelect={setSelected}
          />
        ))}
      </View>

      <Animated.View
        entering={FadeInDown.delay(1000).duration(600)}
        style={styles.bottomContainer}
      >
        <LinearGradient
          colors={['transparent', COLORS.background + 'E6', COLORS.background]}
          style={styles.bottomGradient}
        >
          <GradientButton
            title={selected ? 'Continue →' : 'Select Your Type'}
            onPress={handleContinue}
            disabled={!selected}
            colors={selected
              ? USER_TYPES.find(t => t.id === selected)?.gradient || COLORS.gradientAccent
              : ['#333', '#444']
            }
            style={styles.continueButton}
          />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: height * 0.06,
    marginBottom: SPACING.xl,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  backText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
  },
  stepLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONT_SIZES.bodyLarge,
    color: COLORS.textSecondary,
  },
  cardsContainer: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  typeCard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  emoji: {
    fontSize: 28,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '500',
    color: COLORS.textAccent,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMuted,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomGradient: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.xxl,
  },
  continueButton: { width: '100%' },
});
