import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';
import { useUser } from '../context/UserContext';

export default function AnalyticsScreen() {
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

      // Safe bunks calculation (70% JUET threshold)
      const safeBunks = Math.max(0, Math.floor((attended - 0.70 * total) / 0.70));
      const neededFor70 = percent < 70 ? Math.ceil((0.70 * total - attended) / 0.30) : 0;

      let status = 'SAFE';
      let statusColor = '#38D39F';
      if (percent < 70) {
        status = 'DETENTION RISK';
        statusColor = '#FF5C5C';
        criticalCount++;
      } else if (percent < 75) {
        status = 'NEAR CRITERIA';
        statusColor = '#E5A93C';
        warningCount++;
      } else {
        safeCount++;
      }

      const isLab = subName.toUpperCase().includes('LAB');

      return {
        name: subName,
        code: rec.code || (isLab ? 'LAB' : 'THEORY'),
        attended,
        total,
        missed,
        percent: parseFloat(percent.toFixed(1)),
        safeBunks,
        neededFor70,
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
      <StatusBar barStyle="light-content" backgroundColor="#0B0B13" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Attendance Analytics</Text>
          <Text style={styles.headerSub}>Batch {userBatch || 'B31'} • JUET 70% Criteria</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                analytics.overallPercent >= 70
                  ? 'rgba(56, 211, 159, 0.12)'
                  : 'rgba(255, 92, 92, 0.12)',
            },
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              { color: analytics.overallPercent >= 70 ? '#38D39F' : '#FF5C5C' },
            ]}
          >
            {analytics.overallPercent >= 70 ? 'Criteria Met' : 'Shortage'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>AGGREGATE ATTENDANCE</Text>
              <Text style={styles.heroValue}>{analytics.overallPercent}%</Text>
              <Text style={styles.heroSubText}>
                {analytics.overallPercent >= 70
                  ? `+${(analytics.overallPercent - 70).toFixed(1)}% above 70% threshold`
                  : `${(70 - analytics.overallPercent).toFixed(1)}% below 70% criteria`}
              </Text>
            </View>

            <View style={styles.metricRingBox}>
              <View
                style={[
                  styles.metricCircle,
                  { borderColor: analytics.overallPercent >= 70 ? '#38D39F' : '#FF5C5C' },
                ]}
              >
                <Text
                  style={[
                    styles.metricCircleText,
                    { color: analytics.overallPercent >= 70 ? '#38D39F' : '#FF5C5C' },
                  ]}
                >
                  {analytics.totalAttended}/{analytics.totalClasses}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Stat Tiles */}
          <View style={styles.statsGrid}>
            <View style={styles.statTile}>
              <MaterialCommunityIcons name="check-circle-outline" size={16} color="#38D39F" />
              <Text style={styles.statTileVal}>{analytics.totalAttended}</Text>
              <Text style={styles.statTileLbl}>Attended</Text>
            </View>
            <View style={styles.statTile}>
              <MaterialCommunityIcons name="close-circle-outline" size={16} color="#FF5C5C" />
              <Text style={styles.statTileVal}>{analytics.totalMissed}</Text>
              <Text style={styles.statTileLbl}>Missed</Text>
            </View>
            <View style={styles.statTile}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color="#C5BBED" />
              <Text style={styles.statTileVal}>{analytics.safeCount}</Text>
              <Text style={styles.statTileLbl}>Safe Courses</Text>
            </View>
            <View style={styles.statTile}>
              <MaterialCommunityIcons name="alert-outline" size={16} color="#E5A93C" />
              <Text style={styles.statTileVal}>{analytics.warningCount + analytics.criticalCount}</Text>
              <Text style={styles.statTileLbl}>Watchlist</Text>
            </View>
          </View>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionHeading}>Course Breakdown</Text>

        {/* Subject Cards */}
        <View style={styles.cardGroup}>
          {analytics.subjectStats.map((item, index) => {
            const barColor =
              item.percent >= 80 ? '#38D39F' : item.percent >= 70 ? '#E5A93C' : '#FF5C5C';

            return (
              <View
                key={item.name}
                style={[
                  styles.courseRow,
                  index < analytics.subjectStats.length - 1 && styles.courseRowBorder,
                ]}
              >
                <View style={styles.courseHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View style={styles.tagRow}>
                      <Text style={styles.codeText}>{item.code}</Text>
                      <View style={styles.dot} />
                      <Text style={[styles.statusText, { color: item.statusColor }]}>
                        {item.status}
                      </Text>
                    </View>
                    <Text style={styles.courseName}>{item.name}</Text>
                  </View>
                  <Text style={[styles.coursePercent, { color: barColor }]}>
                    {item.total > 0 ? `${item.percent}%` : '--'}
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(100, item.percent)}%`, backgroundColor: barColor },
                    ]}
                  />
                </View>

                {/* Course Details Footer */}
                <View style={styles.courseFooter}>
                  <Text style={styles.footerClasses}>
                    Classes: <Text style={{ color: '#FFF', fontWeight: '700' }}>{item.attended}</Text> / {item.total}
                  </Text>
                  <Text style={styles.footerBunk}>
                    {item.percent >= 70 ? (
                      <Text style={{ color: '#38D39F' }}>Can bunk: +{item.safeBunks}</Text>
                    ) : (
                      <Text style={{ color: '#FF5C5C' }}>Need next {item.neededFor70} classes</Text>
                    )}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B13',
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8D9A',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heroCard: {
    backgroundColor: '#1E1B2E',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A29BFE',
    letterSpacing: 0.8,
  },
  heroValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    marginVertical: 4,
  },
  heroSubText: {
    fontSize: 12,
    color: '#8E8D9A',
  },
  metricRingBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  metricCircleText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 12,
    gap: 8,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 8,
    borderRadius: 12,
  },
  statTileVal: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
  },
  statTileLbl: {
    color: '#8E8D9A',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8E8D9A',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  cardGroup: {
    backgroundColor: '#161622',
    borderRadius: 20,
    overflow: 'hidden',
  },
  courseRow: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  courseRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A29BFE',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#686777',
    marginHorizontal: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  courseName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  coursePercent: {
    fontSize: 18,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerClasses: {
    fontSize: 11,
    color: '#8E8D9A',
  },
  footerBunk: {
    fontSize: 11,
    fontWeight: '700',
  },
});
