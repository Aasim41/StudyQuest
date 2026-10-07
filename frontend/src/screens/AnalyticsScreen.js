import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../theme';
import { useUser } from '../context/UserContext';
import { GlassCard } from '../components/ui';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen({ navigation }) {
  const { attendanceRecords, userBatch } = useUser();

  const analytics = useMemo(() => {
    const subjects = Object.keys(attendanceRecords || {});
    if (subjects.length === 0) {
      return {
        overallPercent: 0,
        totalAttended: 0,
        totalClasses: 0,
        totalMissed: 0,
        safeCount: 0,
        warningCount: 0,
        criticalCount: 0,
        subjectStats: [],
      };
    }

    let sumAttended = 0;
    let sumTotal = 0;
    let safeCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    const subjectStats = subjects.map((subName) => {
      const rec = attendanceRecords[subName] || {};
      const attended = Number(rec.attended || 0);
      const total = Number(rec.total || 0);
      const percent = total > 0 ? (attended / total) * 100 : 0;
      const missed = total - attended;

      sumAttended += attended;
      sumTotal += total;

      // Safe bunks calculation (75% threshold)
      const safeBunks = Math.max(0, Math.floor((attended - 0.75 * total) / 0.75));
      const neededFor75 = percent < 75 ? Math.ceil((0.75 * total - attended) / 0.25) : 0;

      let status = 'SAFE';
      let statusColor = '#2ECC71';
      if (percent < 75) {
        status = 'DETENTION RISK';
        statusColor = '#FF4757';
        criticalCount++;
      } else if (percent < 80) {
        status = 'NEAR CRITERIA';
        statusColor = '#FFA502';
        warningCount++;
      } else {
        safeCount++;
      }

      const isLab = subName.toUpperCase().includes('LAB');

      return {
        name: subName,
        attended,
        total,
        missed,
        percent: parseFloat(percent.toFixed(1)),
        safeBunks,
        neededFor75,
        status,
        statusColor,
        isLab,
      };
    });

    const overallPercent = sumTotal > 0 ? (sumAttended / sumTotal) * 100 : 0;

    return {
      overallPercent: parseFloat(overallPercent.toFixed(1)),
      totalAttended: sumAttended,
      totalClasses: sumTotal,
      totalMissed: sumTotal - sumAttended,
      safeCount,
      warningCount,
      criticalCount,
      subjectStats,
    };
  }, [attendanceRecords]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Attendance Analytics</Text>
          <Text style={styles.headerSub}>JUET B.Tech III Sem • Batch {userBatch || 'B31'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: analytics.overallPercent >= 75 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(255, 71, 87, 0.15)' }]}>
          <Text style={[styles.statusBadgeText, { color: analytics.overallPercent >= 75 ? '#2ECC71' : '#FF4757' }]}>
            {analytics.overallPercent >= 75 ? 'Criteria Met' : 'Shortage'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GlassCard style={styles.heroCard}>
            <View style={styles.heroRow}>
              <View>
                <Text style={styles.heroLabel}>AGGREGATE ATTENDANCE</Text>
                <Text style={styles.heroValue}>{analytics.overallPercent}%</Text>
                <Text style={styles.heroSubText}>
                  {analytics.overallPercent >= 75
                    ? `+${(analytics.overallPercent - 75).toFixed(1)}% above 75% threshold`
                    : `${(75 - analytics.overallPercent).toFixed(1)}% below criteria`}
                </Text>
              </View>
              <View style={styles.metricRingBox}>
                <View style={[styles.metricCircle, { borderColor: analytics.overallPercent >= 75 ? '#2ECC71' : '#FF4757' }]}>
                  <Text style={[styles.metricCircleText, { color: analytics.overallPercent >= 75 ? '#2ECC71' : '#FF4757' }]}>
                    {analytics.totalAttended}/{analytics.totalClasses}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Stat Tiles */}
            <View style={styles.statsGrid}>
              <View style={styles.statTile}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#2ECC71" />
                <Text style={styles.statTileVal}>{analytics.totalAttended}</Text>
                <Text style={styles.statTileLbl}>Attended</Text>
              </View>
              <View style={styles.statTile}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#FF4757" />
                <Text style={styles.statTileVal}>{analytics.totalMissed}</Text>
                <Text style={styles.statTileLbl}>Missed</Text>
              </View>
              <View style={styles.statTile}>
                <MaterialCommunityIcons name="shield-check" size={18} color="#00D2FF" />
                <Text style={styles.statTileVal}>{analytics.safeCount}</Text>
                <Text style={styles.statTileLbl}>Safe Courses</Text>
              </View>
              <View style={styles.statTile}>
                <MaterialCommunityIcons name="alert" size={18} color="#FFA502" />
                <Text style={styles.statTileVal}>{analytics.warningCount + analytics.criticalCount}</Text>
                <Text style={styles.statTileLbl}>Watchlist</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Section Header */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Course Breakdown</Text>
          <Text style={styles.sectionSubtitle}>Labs and lectures tracked strictly independently</Text>
        </Animated.View>

        {/* Subject Cards */}
        {analytics.subjectStats.map((item, index) => {
          const barColor = item.percent >= 85 ? '#2ECC71' : item.percent >= 75 ? '#FFA502' : '#FF4757';
          return (
            <Animated.View key={item.name} entering={FadeInDown.delay(250 + index * 40).springify()}>
              <GlassCard style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.courseTagRow}>
                      <View style={[styles.typeTag, { backgroundColor: item.isLab ? 'rgba(0, 210, 255, 0.15)' : 'rgba(108, 92, 231, 0.15)' }]}>
                        <Text style={[styles.typeTagText, { color: item.isLab ? '#00D2FF' : '#A29BFE' }]}>
                          {item.isLab ? 'LAB (2 HRS)' : 'THEORY'}
                        </Text>
                      </View>
                      <Text style={[styles.courseStatusText, { color: item.statusColor }]}>
                        {item.status}
                      </Text>
                    </View>
                    <Text style={styles.courseName}>{item.name}</Text>
                  </View>
                  <Text style={[styles.coursePercent, { color: barColor }]}>
                    {item.percent}%
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${Math.min(100, item.percent)}%`, backgroundColor: barColor }]} />
                </View>

                {/* Course Details Footer */}
                <View style={styles.courseFooter}>
                  <Text style={styles.footerClasses}>
                    Classes: <Text style={styles.boldText}>{item.attended}</Text> / {item.total}
                  </Text>
                  <Text style={styles.footerBunk}>
                    {item.percent >= 75 ? (
                      <Text style={{ color: '#2ECC71' }}>Safe to bunk: +{item.safeBunks}</Text>
                    ) : (
                      <Text style={{ color: '#FF4757' }}>Attend next {item.neededFor75} to reach 75%</Text>
                    )}
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 54,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: '#00D2FF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.pill,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  heroCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heroLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroValue: {
    color: COLORS.textPrimary,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginVertical: 2,
  },
  heroSubText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  metricRingBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  metricCircleText: {
    fontSize: 13,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: SPACING.md,
    gap: 8,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 8,
    borderRadius: 12,
  },
  statTileVal: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  statTileLbl: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  courseCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  courseTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  courseStatusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  courseName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  coursePercent: {
    fontSize: 20,
    fontWeight: '900',
    marginLeft: 8,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerClasses: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  boldText: {
    color: '#FFF',
    fontWeight: '700',
  },
  footerBunk: {
    fontSize: 12,
    fontWeight: '700',
  },
});
