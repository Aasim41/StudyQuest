import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useSharedValue, withSpring, useAnimatedStyle, withTiming, Easing, withDelay } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, FONTS, BORDER_RADIUS, SHADOWS } from '../theme';
import { useUser } from '../context/UserContext';
import { GlassCard, ProgressBar } from '../components/ui';

const { width, height } = Dimensions.get('window');

const HeatmapSquare = ({ intensity, index }) => {
  const scale = useSharedValue(0);
  
  useEffect(() => {
    scale.value = withDelay(index * 20, withSpring(1));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  // intensity 0-4
  let bgColor = 'rgba(255,255,255,0.05)';
  if (intensity === 1) bgColor = '#0e4429';
  if (intensity === 2) bgColor = '#006d32';
  if (intensity === 3) bgColor = '#26a641';
  if (intensity >= 4) bgColor = '#39d353';

  return (
    <Animated.View style={[styles.heatmapSquare, animStyle, { backgroundColor: bgColor }]} />
  );
};

export default function AnalyticsScreen() {
  const { userStats } = useUser();
  const subjects = Object.keys(userStats.studyMinutesPerSubject || {});
  
  const chartData = subjects.length > 0 
    ? subjects.map(sub => userStats.studyMinutesPerSubject[sub])
    : [0, 0, 0, 0, 0];
    
  const totalStudyMins = chartData.reduce((a, b) => a + b, 0);
  const totalHours = Math.floor(totalStudyMins / 60);
  const avgSession = totalStudyMins > 0 ? Math.round(totalStudyMins / (userStats.level * 2 || 1)) : 0; // estimate

  // Generate 28 dummy days for heatmap
  const [heatmapData, setHeatmapData] = useState([]);
  useEffect(() => {
    const dummy = Array.from({ length: 28 }).map(() => Math.floor(Math.random() * 5));
    // Ensure the last day has activity
    dummy[27] = Math.max(1, Math.floor(Math.random() * 5));
    setHeatmapData(dummy);
  }, []);

  const cols = [];
  for (let i = 0; i < 28; i += 4) {
    cols.push(heatmapData.slice(i, i + 4));
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSub}>Your Learning Journey</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Stats */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.heroStatsContainer}>
          <GlassCard style={styles.heroStatCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 71, 87, 0.2)' }]}>
              <Text style={{fontSize: 20}}>⏱️</Text>
            </View>
            <View>
              <Text style={styles.heroStatValue}>{totalHours}<Text style={styles.heroStatUnit}>h</Text></Text>
              <Text style={styles.heroStatLabel}>Total Studied</Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.heroStatCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(46, 204, 113, 0.2)' }]}>
              <Text style={{fontSize: 20}}>📈</Text>
            </View>
            <View>
              <Text style={styles.heroStatValue}>{avgSession}<Text style={styles.heroStatUnit}>m</Text></Text>
              <Text style={styles.heroStatLabel}>Avg Session</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Heatmap */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Heatmap</Text>
          <GlassCard style={styles.heatmapCard}>
            <View style={styles.heatmapGrid}>
              {cols.map((col, cIndex) => (
                <View key={cIndex} style={styles.heatmapCol}>
                  {col.map((intensity, rIndex) => (
                    <HeatmapSquare key={rIndex} intensity={intensity} index={cIndex * 4 + rIndex} />
                  ))}
                </View>
              ))}
            </View>
            <View style={styles.heatmapLegend}>
              <Text style={styles.legendText}>Less</Text>
              <View style={[styles.legendBox, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
              <View style={[styles.legendBox, { backgroundColor: '#0e4429' }]} />
              <View style={[styles.legendBox, { backgroundColor: '#006d32' }]} />
              <View style={[styles.legendBox, { backgroundColor: '#26a641' }]} />
              <View style={[styles.legendBox, { backgroundColor: '#39d353' }]} />
              <Text style={styles.legendText}>More</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Subject Breakdown */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Subject Breakdown</Text>
          <GlassCard style={styles.breakdownCard}>
            {subjects.length > 0 ? (
              subjects.map((sub, idx) => {
                const mins = userStats.studyMinutesPerSubject[sub];
                const pct = (mins / totalStudyMins) * 100;
                const colors = [COLORS.primary, COLORS.accent, '#2ECC71', '#F39C12', '#E74C3C'];
                const color = colors[idx % colors.length];
                return (
                  <View key={sub} style={styles.breakdownRow}>
                    <View style={styles.breakdownInfo}>
                      <Text style={styles.breakdownSub}>{sub}</Text>
                      <Text style={styles.breakdownMins}>{Math.floor(mins/60)}h {mins%60}m</Text>
                    </View>
                    <ProgressBar progress={pct/100} height={8} gradient={[color, color]} style={{ width: '60%' }} />
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No subjects studied yet. Complete a focus session!</Text>
            )}
          </GlassCard>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xl, paddingTop: height * 0.08, paddingBottom: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.heading, fontFamily: FONTS.extraBold, color: '#FFF', letterSpacing: -0.5 },
  headerSub: { fontSize: FONT_SIZES.body, color: COLORS.accent, fontFamily: FONTS.semiBold, marginTop: 4 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 60, gap: SPACING.lg },
  
  heroStatsContainer: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  heroStatCard: { flex: 1, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  heroStatValue: { fontSize: 24, fontFamily: FONTS.extraBold, color: '#FFF' },
  heroStatUnit: { fontSize: 16, fontFamily: FONTS.semiBold, color: COLORS.textMuted },
  heroStatLabel: { fontSize: FONT_SIZES.caption, fontFamily: FONTS.semiBold, color: COLORS.textSecondary },

  section: { marginTop: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.subtitle, fontFamily: FONTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.md },
  
  heatmapCard: { padding: SPACING.lg },
  heatmapGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  heatmapCol: { gap: 6 },
  heatmapSquare: { width: 14, height: 14, borderRadius: 3 },
  heatmapLegend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: SPACING.lg, gap: 6 },
  legendBox: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 10, fontFamily: FONTS.semiBold, color: COLORS.textMuted, marginHorizontal: 4 },

  breakdownCard: { padding: SPACING.lg, gap: SPACING.lg },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  breakdownInfo: { flex: 1, marginRight: SPACING.md },
  breakdownSub: { fontSize: FONT_SIZES.body, fontFamily: FONTS.bold, color: COLORS.textPrimary },
  breakdownMins: { fontSize: FONT_SIZES.caption, fontFamily: FONTS.semiBold, color: COLORS.textSecondary, marginTop: 2 },
  emptyText: { fontSize: FONT_SIZES.body, fontFamily: FONTS.regular, color: COLORS.textMuted, textAlign: 'center', marginVertical: SPACING.md }
});
