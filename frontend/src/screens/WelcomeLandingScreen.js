import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, withRepeat, withTiming, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../theme';
import { FloatingParticle, GlassCard, GradientButton } from '../components/ui';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function WelcomeLandingScreen() {
  const navigation = useNavigation();

  // Simple floating animation for the mock card
  const floatValue = useSharedValue(0);
  React.useEffect(() => {
    floatValue.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const floatingCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(floatValue.value, [0, 1], [0, -15], Extrapolation.CLAMP) }]
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />
      
      {/* Background Particles */}
      <FloatingParticle size={300} color={COLORS.primary} x={-100} y={-50} delay={100} />
      <FloatingParticle size={200} color={COLORS.accent} x={width * 0.5} y={height * 0.4} delay={500} />
      <FloatingParticle size={150} color={COLORS.streak} x={width * 0.2} y={height * 0.8} delay={900} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header (Nav bar) */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.navBar}>
          <Text style={styles.logoText}>StudyQuest</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✨ AI-Powered Personalized Learning</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text style={styles.heroTitle}>
              Unlocking the future with {'\n'}
              <Text style={styles.heroTitleAccent}>Intelligent Learning.</Text>
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Text style={styles.heroSubtitle}>
              StudyQuest is a premier learning platform dedicated to equipping students with AI-powered, personalized education that adapts to your unique learning style.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.ctaRow}>
            <GradientButton 
              title="Start Learning Free" 
              onPress={() => navigation.navigate('Signup')}
              style={{ flex: 1, marginRight: SPACING.md }}
            />
            <TouchableOpacity style={styles.howItWorksBtn}>
              <Text style={styles.howItWorksText}>How it Works</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Mock Graphic Section */}
        <Animated.View entering={FadeInUp.delay(700).springify()} style={styles.graphicSection}>
          <Animated.View style={[styles.mockCardWrapper, floatingCardStyle]}>
            <GlassCard style={styles.mockCard}>
              <View style={styles.mockCardHeader}>
                <View>
                  <Text style={styles.mockCardTitle}>LIVE PROGRESS</Text>
                  <Text style={styles.mockCardSubtitle}>Your Learning Path</Text>
                </View>
                <View style={styles.masteryBadge}>
                  <Text style={styles.masteryText}>85% Mastered</Text>
                </View>
              </View>

              <Text style={styles.mockTopic}>DSA Mastery</Text>
              <View style={styles.mockProgressBarBg}>
                <View style={[styles.mockProgressBarFill, { width: '85%' }]} />
              </View>

              <View style={styles.mockStatsRow}>
                <View style={[styles.mockStatBox, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                  <Text style={styles.mockStatLabel}>Concepts Mastered</Text>
                  <Text style={[styles.mockStatValue, { color: '#2ECC71' }]}>18 / 24</Text>
                </View>
                <View style={[styles.mockStatBox, { backgroundColor: 'rgba(243, 156, 18, 0.1)' }]}>
                  <Text style={styles.mockStatLabel}>Current Focus</Text>
                  <Text style={[styles.mockStatValue, { color: '#F39C12' }]}>Two Pointers</Text>
                </View>
              </View>

              <View style={styles.mockAiComment}>
                <Text style={styles.mockAiText}>✨ "You've improved 15% in Data Structures this week. Keep going!"</Text>
              </View>
            </GlassCard>
            <View style={styles.floatingAiBadge}>
               <Text style={styles.floatingAiText}>AI-Powered</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Social Proof */}
        <Animated.View entering={FadeInDown.delay(900).springify()} style={styles.socialProof}>
          <View style={styles.avatars}>
            <View style={[styles.avatarCircle, { backgroundColor: '#FF6B35', zIndex: 3 }]} />
            <View style={[styles.avatarCircle, { backgroundColor: '#4A90D9', zIndex: 2, marginLeft: -15 }]} />
            <View style={[styles.avatarCircle, { backgroundColor: '#2ECC71', zIndex: 1, marginLeft: -15 }]} />
          </View>
          <View style={styles.socialTextContainer}>
            <Text style={styles.socialNumber}>10,000+ Students</Text>
            <Text style={styles.socialSub}>joined this month</Text>
          </View>
        </Animated.View>
        
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingTop: height * 0.08, paddingBottom: SPACING.xxl },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xxl },
  logoText: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  loginText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, fontWeight: '700' },
  heroSection: { marginTop: SPACING.lg, marginBottom: SPACING.xxl },
  badge: { backgroundColor: 'rgba(46, 204, 113, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.pill, alignSelf: 'flex-start', marginBottom: SPACING.lg, borderWidth: 1, borderColor: 'rgba(46, 204, 113, 0.3)' },
  badgeText: { color: '#2ECC71', fontSize: 12, fontWeight: '800' },
  heroTitle: { color: COLORS.textPrimary, fontSize: 38, fontWeight: '900', lineHeight: 46, marginBottom: SPACING.lg },
  heroTitleAccent: { color: COLORS.primary },
  heroSubtitle: { color: COLORS.textSecondary, fontSize: 16, lineHeight: 24, marginBottom: SPACING.xxl },
  ctaRow: { flexDirection: 'row', alignItems: 'center' },
  howItWorksBtn: { paddingVertical: 16, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  howItWorksText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, fontWeight: '700' },
  graphicSection: { alignItems: 'center', marginVertical: SPACING.xl },
  mockCardWrapper: { width: '100%', position: 'relative' },
  mockCard: { padding: SPACING.xl, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: BORDER_RADIUS.xl },
  mockCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  mockCardTitle: { color: COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  mockCardSubtitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  masteryBadge: { backgroundColor: '#2ECC71', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  masteryText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  mockTopic: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  mockProgressBarBg: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: SPACING.xl },
  mockProgressBarFill: { height: '100%', backgroundColor: '#2ECC71', borderRadius: 3 },
  mockStatsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.md, marginBottom: SPACING.lg },
  mockStatBox: { flex: 1, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  mockStatLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '600', marginBottom: 4 },
  mockStatValue: { fontSize: 16, fontWeight: '800' },
  mockAiComment: { backgroundColor: 'rgba(255,255,255,0.03)', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  mockAiText: { color: COLORS.textSecondary, fontSize: 12, fontStyle: 'italic', fontWeight: '500' },
  floatingAiBadge: { position: 'absolute', top: -15, right: -10, backgroundColor: '#F39C12', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, ...SHADOWS.glow },
  floatingAiText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  socialProof: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xl },
  avatars: { flexDirection: 'row' },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: COLORS.background },
  socialTextContainer: { marginLeft: SPACING.md },
  socialNumber: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '800' },
  socialSub: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' }
});
