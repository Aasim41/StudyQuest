import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, withRepeat, withTiming, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, FONTS, BORDER_RADIUS, SHADOWS } from '../theme';
import { FloatingParticle, GlassCard } from '../components/ui';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function WelcomeLandingScreen() {
  const navigation = useNavigation();

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
    transform: [{ translateY: interpolate(floatValue.value, [0, 1], [0, -12], Extrapolation.CLAMP) }]
  }));

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
              <MaterialCommunityIcons name="check-decagram" size={20} color="#00D2FF" />
            </View>
            <Text style={styles.logoText}>PocketLynx</Text>
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
              <MaterialCommunityIcons name="school" size={14} color="#00D2FF" style={{ marginRight: 6 }} />
              <Text style={styles.badgeText}>JUET CampusLynx Attendance Tracker</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text style={styles.heroTitle}>
              Never Get Detained.{'\n'}
              <Text style={styles.heroTitleAccent}>Track Every Bunk.</Text>
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Text style={styles.heroSubtitle}>
              Direct 1-tap CampusLynx sync with your Enrollment Number. Real-time calculations for safe bunks, live detention warnings, and strict Theory vs Lab separation.
            </Text>
          </Animated.View>

          {/* Action Row */}
          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.primaryBtn} 
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Login')}
            >
              <LinearGradient
                colors={['#6C5CE7', '#00D2FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGradient}
              >
                <MaterialCommunityIcons name="login" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Sign In with Enrollment No.</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryBtn} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('HowItWorks')}
            >
              <Text style={styles.secondaryBtnText}>How it Works</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Live Attendance Preview Graphic */}
        <Animated.View entering={FadeInUp.delay(700).springify()} style={styles.graphicSection}>
          <Animated.View style={[styles.mockCardWrapper, floatingCardStyle]}>
            <GlassCard style={styles.mockCard}>
              <View style={styles.mockCardHeader}>
                <View>
                  <Text style={styles.mockCardTitle}>CAMPUSLYNX PORTAL • BATCH B31</Text>
                  <Text style={styles.mockCardSubtitle}>Live Attendance Status</Text>
                </View>
                <View style={styles.masteryBadge}>
                  <Text style={styles.masteryText}>84.8% Safe</Text>
                </View>
              </View>

              {/* Subject Breakdown preview */}
              <View style={styles.previewSubjectRow}>
                <Text style={styles.previewSubjectName}>Data Structures (DS)</Text>
                <Text style={styles.previewSubjectPercent}>89.2%</Text>
              </View>
              <View style={styles.mockProgressBarBg}>
                <View style={[styles.mockProgressBarFill, { width: '89.2%' }]} />
              </View>

              <View style={styles.mockStatsRow}>
                <View style={[styles.mockStatBox, { backgroundColor: 'rgba(46, 204, 113, 0.12)' }]}>
                  <Text style={styles.mockStatLabel}>Safe to Bunk</Text>
                  <Text style={[styles.mockStatValue, { color: '#2ECC71' }]}>+4 Lectures</Text>
                </View>
                <View style={[styles.mockStatBox, { backgroundColor: 'rgba(0, 210, 255, 0.12)' }]}>
                  <Text style={styles.mockStatLabel}>Labs (Isolated)</Text>
                  <Text style={[styles.mockStatValue, { color: '#00D2FF' }]}>100% Attended</Text>
                </View>
              </View>

              <View style={styles.mockAiComment}>
                <MaterialCommunityIcons name="shield-check" size={16} color="#2ECC71" style={{ marginRight: 6 }} />
                <Text style={styles.mockAiText}>You are safely 9.8% above the 75% criteria threshold.</Text>
              </View>
            </GlassCard>
            
            <View style={styles.floatingAiBadge}>
              <MaterialCommunityIcons name="lightning-bolt" size={14} color="#00F5FF" style={{ marginRight: 4 }} />
              <Text style={styles.floatingAiText}>CampusLynx Sync</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Feature Badges Row */}
        <Animated.View entering={FadeInDown.delay(850).springify()} style={styles.featureRow}>
          <View style={styles.featurePill}>
            <MaterialCommunityIcons name="flask-outline" size={15} color="#00D2FF" />
            <Text style={styles.featurePillText}>Strict Lab Isolation</Text>
          </View>
          <View style={styles.featurePill}>
            <MaterialCommunityIcons name="calculator-variant-outline" size={15} color="#A29BFE" />
            <Text style={styles.featurePillText}>Live Bunk Calc</Text>
          </View>
          <View style={styles.featurePill}>
            <MaterialCommunityIcons name="bell-ring-outline" size={15} color="#FF6B35" />
            <Text style={styles.featurePillText}>Detention Alerts</Text>
          </View>
        </Animated.View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingTop: height * 0.07, paddingBottom: SPACING.xxl },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xxl },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(0, 210, 255, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 210, 255, 0.3)' },
  logoText: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  navLoginBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: BORDER_RADIUS.pill, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)' },
  loginText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, fontWeight: '700' },
  heroSection: { marginTop: SPACING.md, marginBottom: SPACING.xxl },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 210, 255, 0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.pill, alignSelf: 'flex-start', marginBottom: SPACING.lg, borderWidth: 1, borderColor: 'rgba(0, 210, 255, 0.3)' },
  badgeText: { color: '#00D2FF', fontSize: 12, fontWeight: '800' },
  heroTitle: { color: COLORS.textPrimary, fontSize: 36, fontWeight: '900', lineHeight: 44, marginBottom: SPACING.md },
  heroTitleAccent: { color: COLORS.accent },
  heroSubtitle: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: SPACING.xl },
  actionContainer: { flexDirection: 'column', gap: 12 },
  primaryBtn: { borderRadius: BORDER_RADIUS.pill, overflow: 'hidden', ...SHADOWS.glow },
  primaryBtnGradient: { flexDirection: 'row', paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: FONT_SIZES.bodyLarge, fontWeight: '800' },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderRadius: BORDER_RADIUS.pill, backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.glassBorder },
  secondaryBtnText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, fontWeight: '700' },
  graphicSection: { alignItems: 'center', marginVertical: SPACING.xl },
  mockCardWrapper: { width: '100%', position: 'relative' },
  mockCard: { padding: SPACING.xl, backgroundColor: 'rgba(16, 16, 36, 0.85)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: BORDER_RADIUS.xl },
  mockCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  mockCardTitle: { color: COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  mockCardSubtitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '800' },
  masteryBadge: { backgroundColor: 'rgba(46, 204, 113, 0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(46, 204, 113, 0.4)' },
  masteryText: { color: '#2ECC71', fontSize: 12, fontWeight: '800' },
  previewSubjectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 6 },
  previewSubjectName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  previewSubjectPercent: { color: '#00D2FF', fontSize: 14, fontWeight: '800' },
  mockProgressBarBg: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: SPACING.lg },
  mockProgressBarFill: { height: '100%', backgroundColor: '#00D2FF', borderRadius: 3 },
  mockStatsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  mockStatBox: { flex: 1, padding: 12, borderRadius: 14, alignItems: 'center' },
  mockStatLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  mockStatValue: { fontSize: 16, fontWeight: '900' },
  mockAiComment: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(46, 204, 113, 0.08)', padding: 10, borderRadius: 10 },
  mockAiText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600', flex: 1 },
  floatingAiBadge: { position: 'absolute', top: -12, right: 16, backgroundColor: '#0A0A1A', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,210,255,0.4)', ...SHADOWS.glowAccent },
  floatingAiText: { color: '#00F5FF', fontSize: 11, fontWeight: '800' },
  featureRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', gap: 8, marginTop: 8 },
  featurePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: BORDER_RADIUS.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  featurePillText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
});
