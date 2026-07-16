import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useSharedValue, withSpring, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../theme';
import { useUser } from '../context/UserContext';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

const { width, height } = Dimensions.get('window');

const BarChartItem = ({ label, value, maxValue, index }) => {
  const heightAnim = useSharedValue(0);

  useEffect(() => {
    const targetHeight = (value / maxValue) * 150;
    heightAnim.value = withTiming(targetHeight, { duration: 1000, easing: Easing.out(Easing.exp) });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    height: heightAnim.value,
  }));

  return (
    <View style={styles.barColumn}>
      <View style={styles.barContainer}>
        <Animated.View style={[styles.barFill, animStyle]} />
      </View>
      <Text style={styles.barLabel}>{label}</Text>
    </View>
  );
};

export default function AnalyticsScreen() {
  const { userStats } = useUser();
  const subjects = Object.keys(userStats.studyMinutesPerSubject || {});
  
  const chartData = subjects.length > 0 
    ? subjects.map(sub => userStats.studyMinutesPerSubject[sub])
    : [0, 0, 0, 0, 0]; // Empty state
    
  const chartLabels = subjects.length > 0 
    ? subjects.map(sub => sub.length > 4 ? sub.substring(0, 4) + '.' : sub)
    : ['Math', 'Sci', 'Eng', 'Hist', 'Art'];

  const maxStudyTime = Math.max(...chartData, 60);
  const totalStudyTime = chartData.reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSub}>Your Performance Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Stats Cards */}
        <View style={styles.statsRow}>
          <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.statCard, { marginRight: SPACING.sm }]}>
            <LinearGradient colors={COLORS.gradientGlass} style={styles.statGradient}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>{userStats.streak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </LinearGradient>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.statCard, { marginLeft: SPACING.sm }]}>
            <LinearGradient colors={COLORS.gradientGlass} style={styles.statGradient}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statValue}>{userStats.xp || 0}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Weekly Chart */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.chartCard}>
          <LinearGradient colors={COLORS.gradientGlass} style={styles.chartGradient}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Study Time (Subjects)</Text>
              <Text style={styles.chartTotal}>{Math.floor(totalStudyTime/60)}h {totalStudyTime%60}m</Text>
            </View>
            
            <View style={styles.barsWrapper}>
              {chartData.map((val, i) => (
                <BarChartItem key={i} label={chartLabels[i]} value={val} maxValue={maxStudyTime} index={i} />
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Level Progress */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.progressCard}>
          <LinearGradient colors={COLORS.gradientGlass} style={styles.progressGradient}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Level {userStats.level || 1}</Text>
              <Text style={styles.progressDetail}>{userStats.xp} / {userStats.nextLevelXp} XP</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(((userStats.xp || 0) / (userStats.nextLevelXp || 100)) * 100, 100)}%` }]} />
            </View>
            <Text style={styles.progressHint}>Keep studying to reach Level {(userStats.level || 1) + 1}!</Text>
          </LinearGradient>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xl, paddingTop: height * 0.08, paddingBottom: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.heading, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: FONT_SIZES.body, color: COLORS.accent, fontWeight: '600', marginTop: 4 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 60, gap: SPACING.lg },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { flex: 1, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glassBorder },
  statGradient: { padding: SPACING.lg, alignItems: 'center' },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: FONT_SIZES.title, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  statLabel: { fontSize: FONT_SIZES.caption, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase' },

  chartCard: { borderRadius: BORDER_RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glassBorder },
  chartGradient: { padding: SPACING.lg },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  chartTitle: { fontSize: FONT_SIZES.bodyLarge, fontWeight: '700', color: '#FFF' },
  chartTotal: { fontSize: FONT_SIZES.bodyLarge, fontWeight: '800', color: COLORS.primary },
  barsWrapper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 150, paddingTop: 20 },
  barColumn: { alignItems: 'center', flex: 1 },
  barContainer: { height: 130, width: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: COLORS.primary, borderRadius: 6 },
  barLabel: { marginTop: 8, fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },

  progressCard: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glassBorder },
  progressGradient: { padding: SPACING.lg },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  progressTitle: { fontSize: FONT_SIZES.subtitle, fontWeight: '800', color: '#FFF' },
  progressDetail: { fontSize: FONT_SIZES.caption, color: COLORS.accent, fontWeight: '700' },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: SPACING.md },
  progressBarFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 4 },
  progressHint: { fontSize: FONT_SIZES.caption, color: COLORS.textMuted, textAlign: 'center' }
});
