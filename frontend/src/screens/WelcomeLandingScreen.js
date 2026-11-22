import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, withRepeat, withTiming, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, FONTS, BORDER_RADIUS, SHADOWS } from '../theme';
import { FloatingParticle, GlassCard } from '../components/ui';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const { width, height } = Dimensions.get('window');

export default function WelcomeLandingScreen() {
  const navigation = useNavigation();
  const { enterGuestMode } = useUser();

  // Subtle floating animation for preview card
  const floatValue = useSharedValue(0);
  React.useEffect(() => {
    floatValue.value = withRepeat(
      withTiming(1, { duration: 3200 }),
      -1,
      true
    );
  }, []);

  const floatingCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(floatValue.value, [0, 1], [0, -10], Extrapolation.CLAMP) }]
  }));

  const handleGuest = async () => {
    if (enterGuestMode) {
      await enterGuestMode();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      {/* Ambient background glow orbs */}
      <FloatingParticle size={280} color={COLORS.primary} x={-100} y={-40} delay={100} />
      <FloatingParticle size={200} color={COLORS.accent} x={width * 0.6} y={height * 0.35} delay={400} />
      <FloatingParticle size={160} color="#2ECC71" x={width * 0.15} y={height * 0.75} delay={800} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.navBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <MaterialCommunityIcons name="book-open-page-variant" size={20} color="#00D2FF" />
            </View>
            <Text style={styles.logoText}>StudyQuest</Text>
          </View>
          <TouchableOpacity
            style={styles.navLoginBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="shield-search" size={14} color="#00D2FF" style={{ marginRight: 6 }} />
              <Text style={styles.badgeText}>AI Exam Blindspot Auditor • All Exams</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text style={styles.heroTitle}>
              Never Miss Exam Points.{'\n'}
              <Text style={styles.heroTitleAccent}>Uncover What AI Misses.</Text>
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Text style={styles.heroSubtitle}>
              Generic LLMs give textbook summaries but omit official marking criteria. StudyQuest audits syllabus blindspots, examiner traps, 5-year question trends, and 60-second morning recap flashcards.
            </Text>
          </Animated.View>

          {/* Action Row */}
          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Signup')}
            >
              <LinearGradient
                colors={['#6C5CE7', '#00D2FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGradient}
              >
                <MaterialCommunityIcons name="rocket-launch-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Get Started Free</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestBtn}
              activeOpacity={0.8}
              onPress={handleGuest}
            >
              <MaterialCommunityIcons name="account-eye-outline" size={18} color="#00D2FF" style={{ marginRight: 6 }} />
              <Text style={styles.guestBtnText}>Explore as Guest</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Live Auditor Preview Graphic */}
        <Animated.View entering={FadeInUp.delay(700).springify()} style={styles.graphicSection}>
          <Animated.View style={[styles.mockCardWrapper, floatingCardStyle]}>
            <GlassCard style={styles.mockCard}>
              <View style={styles.mockCardHeader}>
                <View>
                  <Text style={styles.mockCardTitle}>AI BLINDSPOT AUDIT • PHYSICS</Text>
                  <Text style={styles.mockCardSubtitle}>Photoelectric Effect & Photons</Text>
                </View>
                <View style={styles.masteryBadge}>
                  <Text style={styles.masteryText}>94% High Yield</Text>
                </View>
              </View>

              {/* Blindspot Callout */}
              <View style={styles.blindspotBox}>
                <View style={styles.blindspotHeader}>
                  <MaterialCommunityIcons name="alert-decagram" size={16} color="#FF6B6B" style={{ marginRight: 6 }} />
                  <Text style={styles.blindspotTitle}>Standard AI Blindspot Detected</Text>
                </View>
                <Text style={styles.blindspotDesc}>
                  Generic AI explains \(E = h\nu - \Phi\), but misses stating that the graph intercept gives threshold frequency \(\nu_0\) and slope equals \(h\).
                </Text>
              </View>

              {/* Examiner Criteria Pill */}
              <View style={styles.rubricPreview}>
                <MaterialCommunityIcons name="check-all" size={16} color="#2ECC71" style={{ marginRight: 6 }} />
                <Text style={styles.rubricText}>
                  Examiner Step Marking: 1 mark for threshold definition, 1 mark for work function formula, 1 mark for stopping potential graph.
                </Text>
              </View>

              <View style={styles.mockStatsRow}>
                <View style={[styles.mockStatBox, { backgroundColor: 'rgba(0, 210, 255, 0.1)' }]}>
                  <Text style={styles.mockStatLabel}>5-Yr Recurrence</Text>
                  <Text style={[styles.mockStatValue, { color: '#00D2FF' }]}>4 of 5 Years</Text>
                </View>
                <View style={[styles.mockStatBox, { backgroundColor: 'rgba(108, 92, 231, 0.15)' }]}>
                  <Text style={styles.mockStatLabel}>Cheat Sheet</Text>
                  <Text style={[styles.mockStatValue, { color: '#A29BFE' }]}>1-Page PDF Ready</Text>
                </View>
              </View>
            </GlassCard>

            <View style={styles.floatingAiBadge}>
              <MaterialCommunityIcons name="shield-check" size={14} color="#00F5FF" style={{ marginRight: 4 }} />
              <Text style={styles.floatingAiText}>Blindspot Guard</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Feature Badges Row */}
        <Animated.View entering={FadeInDown.delay(850).springify()} style={styles.featureRow}>
          <View style={styles.featurePill}>
            <MaterialCommunityIcons name="shield-search" size={14} color="#00D2FF" />
            <Text style={styles.featurePillText}>AI Gap Auditor</Text>
          </View>
          <View style={styles.featurePill}>
            <MaterialCommunityIcons name="radar" size={14} color="#A29BFE" />
            <Text style={styles.featurePillText}>5-Yr Question Radar</Text>
          </View>
          <View style={styles.featurePill}>
            <MaterialCommunityIcons name="cards-playing-outline" size={14} color="#FF6B35" />
            <Text style={styles.featurePillText}>60s Flashcards</Text>
          </View>
        </Animated.View>

        {/* How It Works Link */}
        <TouchableOpacity
          style={styles.howItWorksLink}
          onPress={() => navigation.navigate('HowItWorks')}
          activeOpacity={0.7}
        >
          <Text style={styles.howItWorksLinkText}>How does StudyQuest audit blindspots? →</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingTop: height * 0.06, paddingBottom: SPACING.xxl },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
  },
  logoText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: FONTS.extraBold,
    letterSpacing: 0.5,
  },
  navLoginBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  loginText: {
    color: '#00D2FF',
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  heroSection: {
    marginBottom: SPACING.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.pill,
    marginBottom: SPACING.sm,
  },
  badgeText: {
    color: '#00D2FF',
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: FONTS.extraBold,
    color: '#FFF',
    lineHeight: 36,
    marginBottom: 10,
  },
  heroTitleAccent: {
    color: '#00D2FF',
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: BORDER_RADIUS.pill,
    overflow: 'hidden',
    ...SHADOWS.glowAccent,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: FONTS.bold,
    letterSpacing: 0.3,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  guestBtnText: {
    color: '#00D2FF',
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  graphicSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  mockCardWrapper: {
    width: '100%',
  },
  mockCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 16, 36, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  mockCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mockCardTitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontFamily: FONTS.extraBold,
    letterSpacing: 0.8,
  },
  mockCardSubtitle: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  masteryBadge: {
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
  },
  masteryText: {
    color: '#00D2FF',
    fontSize: 10,
    fontFamily: FONTS.extraBold,
  },
  blindspotBox: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.25)',
    marginBottom: 10,
  },
  blindspotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  blindspotTitle: {
    color: '#FF6B6B',
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  blindspotDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    lineHeight: 16,
    fontFamily: FONTS.regular,
  },
  rubricPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(46, 204, 113, 0.08)',
    borderRadius: 10,
    padding: 9,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.2)',
    marginBottom: 10,
  },
  rubricText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    lineHeight: 15,
    flex: 1,
    fontFamily: FONTS.regular,
  },
  mockStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mockStatBox: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  mockStatLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 9,
    fontFamily: FONTS.semiBold,
    marginBottom: 2,
  },
  mockStatValue: {
    fontSize: 11,
    fontFamily: FONTS.extraBold,
  },
  floatingAiBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E0E24',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
    borderColor: '#00F5FF',
    ...SHADOWS.glowAccent,
  },
  floatingAiText: {
    color: '#00F5FF',
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  featurePillText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontFamily: FONTS.medium,
  },
  howItWorksLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  howItWorksLinkText: {
    color: '#00D2FF',
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
});
