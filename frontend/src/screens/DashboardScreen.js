import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../../firebaseConfig';
import { useUser } from '../context/UserContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS } from '../theme';
import { ModernButton, ModernCard, MinimalProgress, GSAPStagger } from '../components/ui';
import { ACADEMIC_CALENDAR } from '../config/academicCalendar';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { userStats, timetable, attendanceRecords, markClassAttendance } = useUser();
  const [greeting, setGreeting] = useState('');

  // Date and day calculations
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split('T')[0], [today]);
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayShort = daysShort[today.getDay()];

  // JUET Academic suspension & fest checks
  const suspensionInfo = useMemo(() => ACADEMIC_CALENDAR.isClassSuspended(todayStr), [todayStr]);
  const festInfo = useMemo(() => ACADEMIC_CALENDAR.isFestOrDicey(todayStr), [todayStr]);

  // Today's classes from timetable
  const todaysClasses = useMemo(() => {
    if (!timetable || !Array.isArray(timetable)) return [];
    return timetable.filter(item => item.day === currentDayShort);
  }, [timetable, currentDayShort]);

  // Overall attendance calculation
  const overallAttendancePercent = useMemo(() => {
    let attended = 0;
    let total = 0;
    if (attendanceRecords) {
      Object.values(attendanceRecords).forEach(rec => {
        attended += rec.attended || 0;
        total += rec.total || 0;
      });
    }
    return total > 0 ? (attended / total) * 100 : 0;
  }, [attendanceRecords]);

  // GSAP-like Hero & Gauge Spring animation
  const gaugeScale = useSharedValue(0.9);
  const gaugeOpacity = useSharedValue(0);
  const cardStagger = useSharedValue(20);

  useEffect(() => {
    const hour = today.getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Orchestrated GSAP entry
    gaugeOpacity.value = withTiming(1, { duration: 400 });
    gaugeScale.value = withSpring(1, { damping: 14, stiffness: 120 });
    cardStagger.value = withSpring(0, { damping: 16, stiffness: 100 });
  }, [userStats]);

  const gaugeAnimStyle = useAnimatedStyle(() => ({
    opacity: gaugeOpacity.value,
    transform: [{ scale: gaugeScale.value }],
  }));

  const getStatusColor = (percent) => {
    if (percent >= 75) return '#2ECC71';
    if (percent >= 70) return '#F1C40F';
    return '#E74C3C';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Subtle modern top glow */}
      <View style={styles.ambientTopGlow} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── SLEEK HEADER ──────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.institutionBadge}>
              <Text style={styles.institutionBadgeText}>JUET GUNA • ODD SEM 2026</Text>
            </View>
            <Text style={styles.greetingText}>{greeting},</Text>
            <Text style={styles.userNameText}>{auth.currentUser?.displayName || 'Student'}</Text>
          </View>

          <TouchableOpacity
            style={styles.avatarTouch}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AvatarSelection', { isEditing: true })}
          >
            {userStats?.avatarUrl ? (
              <Image
                source={{ uri: userStats.avatarUrl.replace('/svg?', '/png?') }}
                style={styles.avatarImg}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={26} color={COLORS.textSecondary} />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* ─── JUET SUSPENSION / FEST BANNER ─────────────────────────────────────── */}
        {suspensionInfo.suspended && (
          <Animated.View entering={FadeInDown.delay(100).duration(350)} style={styles.alertBanner}>
            <MaterialCommunityIcons name="information" size={18} color="#FF6B35" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Classes Suspended Today</Text>
              <Text style={styles.alertSub}>{suspensionInfo.reason} • No attendance counted</Text>
            </View>
          </Animated.View>
        )}

        {festInfo.isDicey && (
          <Animated.View entering={FadeInDown.delay(100).duration(350)} style={[styles.alertBanner, { borderColor: '#9B59B6' }]}>
            <MaterialCommunityIcons name="party-popper" size={18} color="#9B59B6" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: '#9B59B6' }]}>JYC Technical Fest</Text>
              <Text style={styles.alertSub}>Classes are dicey. Mark as Off if professors don't lecture.</Text>
            </View>
          </Animated.View>
        )}

        {/* ─── MODERN MINIMAL ATTENDANCE HERO CARD (GSAP animated) ────────────────── */}
        <Animated.View style={[styles.heroCardWrapper, gaugeAnimStyle]}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.heroCard}
            onPress={() => navigation.navigate('Planner')}
          >
            <View style={styles.heroCardTop}>
              <View>
                <Text style={styles.heroOverline}>TOTAL ATTENDANCE</Text>
                <Text style={[styles.heroBigPercent, { color: getStatusColor(overallAttendancePercent) }]}>
                  {overallAttendancePercent.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.criteriaTag}>
                <Text style={[styles.criteriaTagText, { color: getStatusColor(overallAttendancePercent) }]}>
                  {overallAttendancePercent >= 70 ? '70% TARGET MET' : 'CRITICAL DETENTION RISK'}
                </Text>
              </View>
            </View>

            <View style={styles.progressBox}>
              <MinimalProgress
                progress={overallAttendancePercent / 100}
                color={getStatusColor(overallAttendancePercent)}
                height={5}
              />
            </View>

            <View style={styles.heroFooter}>
              <Text style={styles.heroFooterText}>
                JUET Rule: Minimum 70% required to write T-3 exams.
              </Text>
              <View style={styles.hubLinkRow}>
                <Text style={styles.hubLinkText}>Open Calculator</Text>
                <MaterialCommunityIcons name="arrow-right" size={14} color={COLORS.accent} />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ─── STREAK & LEVEL STATS (Minimalist duo) ─────────────────────────────── */}
        <View style={styles.statsRow}>
          <ModernCard style={styles.statMiniCard}>
            <View style={styles.statIconCircle}>
              <MaterialCommunityIcons name="lightning-bolt" size={20} color="#00D2FF" />
            </View>
            <View>
              <Text style={styles.statMiniLabel}>LEVEL</Text>
              <Text style={styles.statMiniVal}>{userStats.level || 1} <Text style={styles.statMiniSub}>({userStats.xp || 0} XP)</Text></Text>
            </View>
          </ModernCard>

          <ModernCard style={styles.statMiniCard}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(255,107,53,0.15)' }]}>
              <MaterialCommunityIcons name="fire" size={20} color="#FF6B35" />
            </View>
            <View>
              <Text style={styles.statMiniLabel}>STREAK</Text>
              <Text style={styles.statMiniVal}>{userStats.streak || 0} <Text style={styles.statMiniSub}>Days</Text></Text>
            </View>
          </ModernCard>
        </View>

        {/* ─── TODAY'S CLASSES (GSAP Staggered Cards) ────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule ({currentDayShort})</Text>
          <Text style={styles.sectionCount}>{todaysClasses.length} Classes</Text>
        </View>

        {todaysClasses.length === 0 ? (
          <ModernCard style={styles.emptyScheduleCard}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={36} color={COLORS.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyScheduleTitle}>No Classes Scheduled Today</Text>
            <Text style={styles.emptyScheduleSub}>Enjoy your time off or simulate bunks in the Attendance Hub.</Text>
          </ModernCard>
        ) : (
          <GSAPStagger delay={150} stagger={70}>
            {todaysClasses.map((item, index) => {
              const currentStatus = attendanceRecords?.[item.subject]?.history?.[todayStr]?.[item.id];
              return (
                <View key={item.id || index} style={styles.classCard}>
                  <View style={styles.classTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.classSubject} numberOfLines={1}>{item.subject}</Text>
                      <Text style={styles.classSlot}>
                        {item.time} • <Text style={styles.classType}>{item.type || 'Lecture'}</Text>
                      </Text>
                    </View>

                    {currentStatus && (
                      <View style={[
                        styles.badgeStatus,
                        currentStatus === 'present' ? styles.badgePresent :
                        currentStatus === 'absent' ? styles.badgeAbsent : styles.badgeOff
                      ]}>
                        <Text style={styles.badgeStatusText}>
                          {currentStatus === 'present' ? 'PRESENT' : currentStatus === 'absent' ? 'BUNKED' : 'OFF'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* GSAP-like Instant Action buttons */}
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.btnAction, currentStatus === 'present' && styles.btnActionPresentActive]}
                      onPress={() => markClassAttendance(item.subject, todayStr, item.id, 'present')}
                    >
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color={currentStatus === 'present' ? '#FFF' : '#2ECC71'}
                      />
                      <Text style={[styles.btnActionText, currentStatus === 'present' && styles.btnActionTextActive]}>
                        Present (+25 XP)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.btnAction, currentStatus === 'absent' && styles.btnActionAbsentActive]}
                      onPress={() => markClassAttendance(item.subject, todayStr, item.id, 'absent')}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={16}
                        color={currentStatus === 'absent' ? '#FFF' : '#E74C3C'}
                      />
                      <Text style={[styles.btnActionText, currentStatus === 'absent' && styles.btnActionTextActive]}>
                        Absent
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.btnActionCompact, currentStatus === 'cancelled' && styles.btnActionOffActive]}
                      onPress={() => markClassAttendance(item.subject, todayStr, item.id, 'cancelled')}
                    >
                      <Text style={[styles.btnActionCompactText, currentStatus === 'cancelled' && styles.btnActionTextActive]}>
                        Off
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </GSAPStagger>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07070F',
  },
  ambientTopGlow: {
    position: 'absolute',
    top: 0,
    left: width * 0.2,
    width: width * 0.6,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 65,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  institutionBadge: {
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.2)',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  institutionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D2FF',
    letterSpacing: 0.5,
  },
  greetingText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  userNameText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  avatarTouch: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 2,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Alert
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.4)',
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    marginBottom: SPACING.md,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6B35',
  },
  alertSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Hero Card
  heroCardWrapper: {
    marginBottom: SPACING.md,
  },
  heroCard: {
    backgroundColor: '#0F0F1E',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  heroCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
  },
  heroBigPercent: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
    marginVertical: 2,
  },
  criteriaTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  criteriaTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  progressBox: {
    marginVertical: SPACING.md,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: SPACING.sm,
  },
  heroFooterText: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
  hubLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  hubLinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.accent,
    marginRight: 4,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statMiniCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0F0F1E',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statMiniLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  statMiniVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFF',
  },
  statMiniSub: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  // Empty Schedule
  emptyScheduleCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: '#0F0F1E',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyScheduleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptyScheduleSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },

  // Class Card
  classCard: {
    backgroundColor: '#0F0F1E',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  classTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  classSubject: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  classSlot: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  classType: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  badgeStatus: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePresent: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
  },
  badgeAbsent: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
  },
  badgeOff: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeStatusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },

  // Action Button Row
  actionBtnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  btnAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#16162A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  btnActionPresentActive: {
    backgroundColor: '#2ECC71',
    borderColor: '#2ECC71',
  },
  btnActionAbsentActive: {
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
  },
  btnActionCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#16162A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActionOffActive: {
    backgroundColor: '#444',
    borderColor: '#666',
  },
  btnActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  btnActionCompactText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  btnActionTextActive: {
    color: '#FFF',
    fontWeight: '900',
  },
});
