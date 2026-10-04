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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring, useAnimatedProps } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../../firebaseConfig';
import { useUser } from '../context/UserContext';
import { COLORS, SPACING, FONT_SIZES, FONTS, SHADOWS, BORDER_RADIUS, ANIMATION } from '../theme';
import { FloatingParticle, GlassCard, ProgressBar } from '../components/ui';
import { ACADEMIC_CALENDAR } from '../config/academicCalendar';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const QuickActionCard = ({ title, icon, color, onPress, delay }) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.quickActionContainer}>
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <GlassCard style={styles.quickActionCard}>
        <LinearGradient
          colors={[color + '33', color + '00']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.iconBox, { backgroundColor: color + '33', shadowColor: color }]}>
          <MaterialCommunityIcons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.quickActionTitle}>{title}</Text>
      </GlassCard>
    </TouchableOpacity>
  </Animated.View>
);

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { userStats, timetable, attendanceRecords, markClassAttendance } = useUser();
  const [greeting, setGreeting] = useState('');

  // XP Ring Animation
  const progress = useSharedValue(0);
  const CIRCLE_RADIUS = 45;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  // Get current date details
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split('T')[0], [today]);
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayShort = daysShort[today.getDay()];

  // Check JUET academic calendar status for today
  const suspensionInfo = useMemo(() => ACADEMIC_CALENDAR.isClassSuspended(todayStr), [todayStr]);
  const festInfo = useMemo(() => ACADEMIC_CALENDAR.isFestOrDicey(todayStr), [todayStr]);

  // Classes scheduled for today
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

  useEffect(() => {
    const hour = today.getHours();
    if (hour < 12) setGreeting('Good Morning ☀️');
    else if (hour < 18) setGreeting('Good Afternoon 🌤');
    else setGreeting('Good Evening 🌙');

    const targetProgress = (userStats.xp || 0) / (userStats.nextLevelXp || 1000);
    progress.value = withSpring(targetProgress, ANIMATION.springSmooth);
  }, [userStats]);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_CIRCUMFERENCE * (1 - progress.value)
  }));

  // Marked dates on Calendar for JUET
  const markedDates = useMemo(() => {
    const map = {};

    // Holidays
    ACADEMIC_CALENDAR.holidays.forEach(h => {
      map[h.date] = {
        marked: true,
        dotColor: '#2ECC71',
        customStyles: {
          container: { backgroundColor: 'rgba(46, 204, 113, 0.15)', borderRadius: 8 },
          text: { color: '#2ECC71', fontWeight: '800' }
        }
      };
    });

    // Exams
    ACADEMIC_CALENDAR.events.forEach(e => {
      if (e.isExam) {
        map[e.startDate] = {
          marked: true,
          dotColor: '#FF4C4C',
          customStyles: {
            container: { backgroundColor: 'rgba(255, 76, 76, 0.2)', borderRadius: 8 },
            text: { color: '#FF4C4C', fontWeight: '800' }
          }
        };
      }
    });

    // Today highlighted
    map[todayStr] = {
      ...(map[todayStr] || {}),
      selected: true,
      selectedColor: COLORS.accent,
    };

    return map;
  }, [todayStr]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <FloatingParticle size={300} color={COLORS.primary} x={-100} y={-100} delay={0} />
      <FloatingParticle size={250} color={COLORS.accent} x={width * 0.6} y={height * 0.2} delay={1000} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.institutionChip}>
              <Text style={styles.institutionChipText}>JUET GUNA • ODD SEM 2026</Text>
            </View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{auth.currentUser?.displayName || 'Student'}</Text>
          </View>

          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('AvatarSelection', { isEditing: true })}
          >
            {userStats?.avatarUrl ? (
              <Image
                source={{ uri: userStats.avatarUrl.replace('/svg?', '/png?') }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
            ) : (
              <MaterialCommunityIcons name="account" size={32} color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* JUET Suspension Alert Banner if applicable */}
        {suspensionInfo.suspended && (
          <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.suspensionBanner}>
            <MaterialCommunityIcons name="information" size={20} color="#FF6B35" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.suspensionTitle}>Classes Suspended Today</Text>
              <Text style={styles.suspensionSub}>{suspensionInfo.reason} • No regular classes scheduled</Text>
            </View>
          </Animated.View>
        )}

        {festInfo.isDicey && (
          <Animated.View entering={FadeInDown.delay(150).springify()} style={[styles.suspensionBanner, { borderColor: COLORS.fest, backgroundColor: 'rgba(255, 107, 129, 0.1)' }]}>
            <MaterialCommunityIcons name="party-popper" size={20} color={COLORS.fest} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.suspensionTitle, { color: COLORS.fest }]}>JYC Technical Fest</Text>
              <Text style={styles.suspensionSub}>Classes are dicey today! Use the Cancelled button if professors take off.</Text>
            </View>
          </Animated.View>
        )}

        {/* Attendance Summary Banner (Tappable to go to Attendance Hub) */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.attendanceSummaryCard}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Planner')}>
            <LinearGradient colors={['rgba(0, 210, 255, 0.15)', 'rgba(108, 92, 231, 0.15)']} style={styles.summaryGradient}>
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryLabel}>OVERALL ATTENDANCE</Text>
                <Text style={[styles.summaryPercent, { color: overallAttendancePercent >= 70 ? '#2ECC71' : '#E74C3C' }]}>
                  {overallAttendancePercent.toFixed(1)}%
                </Text>
                <Text style={styles.summaryCriteria}>
                  {overallAttendancePercent >= 70 ? '✅ Above JUET 70% Criteria' : '⚠️ Below 70% Criteria!'}
                </Text>
              </View>

              <View style={styles.summaryRight}>
                <View style={styles.hubBtn}>
                  <Text style={styles.hubBtnText}>Open Hub 🧮</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Row: XP Ring & Streak */}
        <View style={styles.statsRow}>
          <Animated.View entering={FadeInDown.delay(250).springify()} style={[styles.statBox, { flex: 1.2 }]}>
            <GlassCard style={styles.xpCard}>
              <View style={styles.circleContainer}>
                <Svg width={CIRCLE_RADIUS * 2} height={CIRCLE_RADIUS * 2}>
                  <Defs>
                    <SvgLinearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor={COLORS.accent} />
                      <Stop offset="100%" stopColor={COLORS.primary} />
                    </SvgLinearGradient>
                  </Defs>
                  <Circle
                    cx={CIRCLE_RADIUS}
                    cy={CIRCLE_RADIUS}
                    r={CIRCLE_RADIUS - 6}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={8}
                    fill="transparent"
                  />
                  <AnimatedCircle
                    cx={CIRCLE_RADIUS}
                    cy={CIRCLE_RADIUS}
                    r={CIRCLE_RADIUS - 6}
                    stroke="url(#progressGrad)"
                    strokeWidth={8}
                    fill="transparent"
                    strokeDasharray={CIRCLE_CIRCUMFERENCE}
                    strokeLinecap="round"
                    animatedProps={animatedCircleProps}
                    transform={`rotate(-90 ${CIRCLE_RADIUS} ${CIRCLE_RADIUS})`}
                  />
                </Svg>
                <View style={styles.circleInner}>
                  <Text style={styles.levelText}>LVL</Text>
                  <Text style={styles.levelNumber}>{userStats.level || 1}</Text>
                </View>
              </View>
              <View style={styles.xpInfo}>
                <Text style={styles.xpLabel}>TOTAL XP</Text>
                <Text style={styles.xpValue}>{userStats.xp || 0} / {userStats.nextLevelXp || 1000}</Text>
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.statBox, { flex: 0.8 }]}>
            <GlassCard style={styles.streakCard}>
              <View style={styles.streakIconBox}>
                <MaterialCommunityIcons name="fire" size={32} color={COLORS.streak} />
              </View>
              <Text style={styles.streakCount}>{userStats.streak || 0}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </GlassCard>
          </Animated.View>
        </View>

        {/* ─── TODAY'S JUET CLASSES SECTION ────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today's Classes ({currentDayShort})</Text>
            <Text style={styles.sectionSubCount}>{todaysClasses.length} Scheduled</Text>
          </View>

          {todaysClasses.length === 0 ? (
            <GlassCard style={styles.noClassesCard}>
              <MaterialCommunityIcons name="party-popper" size={40} color={COLORS.accent} style={{ marginBottom: 8 }} />
              <Text style={styles.noClassesTitle}>No classes scheduled today!</Text>
              <Text style={styles.noClassesSub}>Enjoy your day off or review your subject attendance in the Hub.</Text>
            </GlassCard>
          ) : (
            todaysClasses.map((item, index) => {
              const currentStatus = attendanceRecords?.[item.subject]?.history?.[todayStr]?.[item.id];
              return (
                <GlassCard key={item.id || index} style={styles.classCard}>
                  <View style={styles.classCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.classSubject} numberOfLines={1}>{item.subject}</Text>
                      <Text style={styles.classTime}>
                        {item.time} • <Text style={styles.classType}>{item.type || 'Lecture'}</Text>
                      </Text>
                    </View>
                    {currentStatus && (
                      <View style={[
                        styles.statusBadge,
                        currentStatus === 'present' ? styles.statusBadgePresent :
                        currentStatus === 'absent' ? styles.statusBadgeAbsent : styles.statusBadgeCancelled
                      ]}>
                        <Text style={styles.statusBadgeText}>
                          {currentStatus.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons: Present, Absent, Cancelled */}
                  <View style={styles.attendanceActionButtons}>
                    <TouchableOpacity
                      style={[styles.attBtn, currentStatus === 'present' && styles.attBtnPresentActive]}
                      onPress={() => markClassAttendance(item.subject, todayStr, item.id, 'present')}
                    >
                      <MaterialCommunityIcons name="check-circle" size={18} color={currentStatus === 'present' ? '#FFF' : '#2ECC71'} />
                      <Text style={[styles.attBtnText, currentStatus === 'present' && styles.attBtnTextActive]}>
                        Present (+25 XP)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.attBtn, currentStatus === 'absent' && styles.attBtnAbsentActive]}
                      onPress={() => markClassAttendance(item.subject, todayStr, item.id, 'absent')}
                    >
                      <MaterialCommunityIcons name="close-circle" size={18} color={currentStatus === 'absent' ? '#FFF' : '#E74C3C'} />
                      <Text style={[styles.attBtnText, currentStatus === 'absent' && styles.attBtnTextActive]}>
                        Absent / Bunk
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.attBtnSmall, currentStatus === 'cancelled' && styles.attBtnCancelledActive]}
                      onPress={() => markClassAttendance(item.subject, todayStr, item.id, 'cancelled')}
                    >
                      <MaterialCommunityIcons name="cancel" size={16} color={currentStatus === 'cancelled' ? '#FFF' : COLORS.textMuted} />
                      <Text style={[styles.attBtnSmallText, currentStatus === 'cancelled' && styles.attBtnTextActive]}>
                        Off
                      </Text>
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              );
            })
          )}
        </Animated.View>

        {/* Quick Actions Grid */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.grid}>
            <QuickActionCard title="Attendance Hub" icon="calculator" color={COLORS.accent} delay={400} onPress={() => navigation.navigate('Planner')} />
            <QuickActionCard title="Focus Timer" icon="timer" color={COLORS.primary} delay={500} onPress={() => navigation.navigate('FocusTimer')} />
            <QuickActionCard title="AI Tutor" icon="robot" color="#FF6B35" delay={600} onPress={() => navigation.navigate('ChatTutor')} />
            <QuickActionCard title="Achievements" icon="medal" color="#FFD700" delay={700} onPress={() => navigation.navigate('Achievements')} />
          </View>
        </Animated.View>

        {/* JUET Academic Calendar */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>JUET Academic Calendar (Odd Sem 2026)</Text>
          <GlassCard style={styles.calendarCard}>
            <Calendar
              style={styles.calendar}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: COLORS.textMuted,
                selectedDayBackgroundColor: COLORS.accent,
                selectedDayTextColor: '#000',
                todayTextColor: COLORS.accent,
                dayTextColor: COLORS.textPrimary,
                textDisabledColor: 'rgba(255,255,255,0.2)',
                arrowColor: COLORS.accent,
                monthTextColor: COLORS.textPrimary,
                indicatorColor: COLORS.accent,
                textDayFontFamily: FONTS.regular,
                textMonthFontFamily: FONTS.bold,
                textDayHeaderFontFamily: FONTS.semiBold,
              }}
              markedDates={markedDates}
              markingType={'custom'}
            />
            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#2ECC71' }]} />
                <Text style={styles.legendText}>Holiday</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF4C4C' }]} />
                <Text style={styles.legendText}>Exam / T-1 / T-2 / T-3</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
                <Text style={styles.legendText}>Today</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  institutionChip: { backgroundColor: 'rgba(0,210,255,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.pill, alignSelf: 'flex-start', marginBottom: 4, borderWidth: 1, borderColor: 'rgba(0,210,255,0.25)' },
  institutionChipText: { color: '#00D2FF', fontSize: 10, fontWeight: '800' },
  greeting: { fontSize: FONT_SIZES.body, color: COLORS.textMuted },
  userName: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary },
  profileBtn: { padding: 4, borderRadius: 28, borderWidth: 2, borderColor: COLORS.accent },

  suspensionBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,107,53,0.12)', borderWidth: 1, borderColor: '#FF6B35', borderRadius: BORDER_RADIUS.md, padding: 12, marginBottom: SPACING.md },
  suspensionTitle: { color: '#FF6B35', fontSize: 13, fontWeight: '800' },
  suspensionSub: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },

  // Attendance summary card
  attendanceSummaryCard: { borderRadius: BORDER_RADIUS.xl, overflow: 'hidden', ...SHADOWS.glow, marginBottom: SPACING.lg },
  summaryGradient: { padding: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: BORDER_RADIUS.xl },
  summaryLeft: { flex: 1 },
  summaryLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.5 },
  summaryPercent: { fontSize: 36, fontWeight: '900', marginVertical: 2 },
  summaryCriteria: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  summaryRight: { marginLeft: 12 },
  hubBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 14, paddingVertical: 10, borderRadius: BORDER_RADIUS.pill },
  hubBtnText: { color: '#000', fontSize: 13, fontWeight: '900' },

  // Stats Row
  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  statBox: { minHeight: 110 },
  xpCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  circleContainer: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
  circleInner: { position: 'absolute', alignItems: 'center' },
  levelText: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted },
  levelNumber: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  xpInfo: { marginLeft: 12, flex: 1 },
  xpLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  xpValue: { fontSize: 14, fontWeight: '800', color: COLORS.accent, marginTop: 2 },

  streakCard: { alignItems: 'center', justifyContent: 'center', padding: SPACING.md },
  streakIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,107,53,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  streakCount: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  streakLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted },

  // Section
  section: { marginBottom: SPACING.xl },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  sectionSubCount: { fontSize: 12, fontWeight: '700', color: COLORS.accent },

  // Classes list
  noClassesCard: { padding: SPACING.xl, alignItems: 'center', justifyContent: 'center' },
  noClassesTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  noClassesSub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },

  classCard: { padding: SPACING.md, marginBottom: SPACING.md },
  classCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  classSubject: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  classTime: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  classType: { color: COLORS.accent, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm },
  statusBadgePresent: { backgroundColor: 'rgba(46,204,113,0.2)' },
  statusBadgeAbsent: { backgroundColor: 'rgba(231,76,60,0.2)' },
  statusBadgeCancelled: { backgroundColor: 'rgba(255,255,255,0.1)' },
  statusBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF' },

  attendanceActionButtons: { flexDirection: 'row', gap: 6, marginTop: 4 },
  attBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 6, borderRadius: BORDER_RADIUS.sm, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  attBtnPresentActive: { backgroundColor: '#2ECC71', borderColor: '#2ECC71' },
  attBtnAbsentActive: { backgroundColor: '#E74C3C', borderColor: '#E74C3C' },
  attBtnSmall: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: BORDER_RADIUS.sm, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center' },
  attBtnCancelledActive: { backgroundColor: '#555', borderColor: '#777' },
  attBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, marginLeft: 4 },
  attBtnSmallText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginLeft: 2 },
  attBtnTextActive: { color: '#FFF', fontWeight: '800' },

  // Quick Action Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  quickActionContainer: { width: (width - SPACING.lg * 2 - SPACING.md) / 2 },
  quickActionCard: { padding: SPACING.md, alignItems: 'center', justifyContent: 'center', height: 95 },
  iconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  quickActionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },

  // Calendar Card
  calendarCard: { padding: SPACING.md, borderRadius: BORDER_RADIUS.xl },
  calendar: { borderRadius: BORDER_RADIUS.lg },
  calendarLegend: { flexDirection: 'row', justifyContent: 'space-around', marginTop: SPACING.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: SPACING.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
});
