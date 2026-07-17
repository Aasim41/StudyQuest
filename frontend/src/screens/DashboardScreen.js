import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring, interpolateColor, useAnimatedProps } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, FONTS, SHADOWS, BORDER_RADIUS, ANIMATION } from '../theme';
import { FloatingParticle, GlassCard, ProgressBar, GradientButton } from '../components/ui';

const { width, height } = Dimensions.get('window');
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
  const { userStats, studyPlan, isGeneratingSchedule, generationError } = useUser();
  const [calendarData, setCalendarData] = useState([]);
  const [nextSession, setNextSession] = useState(null);
  const [greeting, setGreeting] = useState('');

  // XP Ring Animation
  const progress = useSharedValue(0);
  const CIRCLE_RADIUS = 45;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning ☀️');
    else if (hour < 18) setGreeting('Good Afternoon 🌤');
    else setGreeting('Good Evening 🌙');

    const checkData = async () => {
      try {
        const calStr = await AsyncStorage.getItem('@onboarding_calendar');
        if (calStr) setCalendarData(JSON.parse(calStr));

        if (studyPlan && studyPlan.length > 0) {
          const upcoming = studyPlan.find(item => !item.completed);
          setNextSession(upcoming || null);
        }
      } catch (err) {
        console.warn('Dashboard data error:', err);
      }
    };
    
    const unsubscribe = navigation.addListener('focus', () => {
      checkData();
      const targetProgress = userStats.xp / userStats.nextLevelXp;
      progress.value = withSpring(targetProgress, ANIMATION.springSmooth);
    });

    checkData();
    const targetProgress = userStats.xp / userStats.nextLevelXp;
    progress.value = withSpring(targetProgress, ANIMATION.springSmooth);
    
    return unsubscribe;
  }, [navigation, userStats, studyPlan]);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_CIRCUMFERENCE * (1 - progress.value)
  }));

  const markedDates = {};
  calendarData.forEach(event => {
    if (!event.date) return;
    let dotColor = COLORS.accent; 
    if (event.type === 'Exam') dotColor = '#FF4C4C'; 
    else if (event.type === 'Holiday') dotColor = '#2ECC71'; 
    else if (event.type === 'Fest') dotColor = COLORS.fest; 

    markedDates[event.date] = {
      marked: true,
      dotColor: dotColor,
      customStyles: {
        container: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
        text: { color: '#FFF', fontFamily: FONTS.bold }
      }
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />
      
      {/* Ambient Orbs */}
      <FloatingParticle size={300} color={COLORS.primary} x={-100} y={-100} delay={0} />
      <FloatingParticle size={250} color={COLORS.accent} x={width * 0.6} y={height * 0.2} delay={1000} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>Aasim</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn}>
            <MaterialCommunityIcons name="cog" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* XP Ring Card */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.statBox, { flex: 1.2 }]}>
            <GlassCard style={styles.xpCard}>
              <View style={styles.xpRingContainer}>
                <Svg width={110} height={110} viewBox="0 0 110 110">
                  <Defs>
                    <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0" stopColor={COLORS.accent} stopOpacity="1" />
                      <Stop offset="1" stopColor={COLORS.primary} stopOpacity="1" />
                    </SvgLinearGradient>
                  </Defs>
                  <Circle cx="55" cy="55" r={CIRCLE_RADIUS} stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                  <AnimatedCircle
                    cx="55" cy="55" r={CIRCLE_RADIUS}
                    stroke="url(#grad)" strokeWidth="8" fill="none"
                    strokeLinecap="round"
                    strokeDasharray={CIRCLE_CIRCUMFERENCE}
                    animatedProps={animatedCircleProps}
                    transform="rotate(-90 55 55)"
                  />
                </Svg>
                <View style={styles.levelCenter}>
                  <Text style={styles.levelNumber}>{userStats.level}</Text>
                  <Text style={styles.levelText}>LEVEL</Text>
                </View>
              </View>
              <Text style={styles.xpLabel}>{userStats.xp} / {userStats.nextLevelXp} XP</Text>
            </GlassCard>
          </Animated.View>

          {/* Streak Card */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.statBox, { flex: 1 }]}>
            <GlassCard style={styles.streakCard}>
              <Text style={styles.fireEmoji}>🔥</Text>
              <Text style={styles.streakNumber}>{userStats.streak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
              
              <View style={styles.dotsRow}>
                {[1,2,3,4,5,6,7].map((i) => (
                  <View key={i} style={[styles.streakDot, i <= 4 ? styles.streakDotActive : null]} />
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        </View>

        {/* Up Next Card */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Up Next</Text>
          {isGeneratingSchedule ? (
            <GlassCard style={{ padding: SPACING.xl, alignItems: 'center' }}>
              <ProgressBar progress={100} height={4} gradient={COLORS.gradientAccent} style={{ marginBottom: 16, width: '80%' }} />
              <Text style={styles.aiGenText}>AI is crafting your study plan...</Text>
            </GlassCard>
          ) : nextSession ? (
            <GlassCard style={[styles.upNextCard, { borderLeftColor: nextSession.color || COLORS.primary }]}>
              <View style={styles.upNextHeader}>
                <View style={[styles.iconBox, { backgroundColor: (nextSession.color || COLORS.primary) + '22' }]}>
                  <MaterialCommunityIcons name="book-open-variant" size={24} color={nextSession.color || COLORS.primary} />
                </View>
                <View style={styles.upNextInfo}>
                  <Text style={styles.upNextSubject}>{nextSession.subject}</Text>
                  <Text style={styles.upNextTime}>{nextSession.time} • {nextSession.intensity || 'Moderate'}</Text>
                </View>
              </View>
              <GradientButton 
                title="Start Session" 
                colors={COLORS.gradientAccent} 
                onPress={() => navigation.navigate('FocusTimer', { subject: nextSession.subject, color: nextSession.color })}
                style={{ marginTop: SPACING.md }}
              />
            </GlassCard>
          ) : (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>All done for today! 🎉</Text>
            </GlassCard>
          )}
        </Animated.View>

        {/* Daily Challenges */}
        <Animated.View entering={FadeInDown.delay(450).springify()} style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Daily Quests</Text>
            <Text style={styles.sectionSubtitle}>Reset in 12h</Text>
          </View>
          <GlassCard style={styles.questsCard}>
            <View style={styles.questRow}>
              <View style={[styles.questCheckbox, styles.questCheckboxDone]}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <View style={styles.questInfo}>
                <Text style={styles.questTitleDone}>Complete 2 Focus Sessions</Text>
                <Text style={styles.questRewardDone}>+50 XP</Text>
              </View>
            </View>
            <View style={styles.questRow}>
              <View style={styles.questCheckbox} />
              <View style={styles.questInfo}>
                <Text style={styles.questTitle}>Score 80%+ in a Quiz</Text>
                <Text style={styles.questReward}>+100 XP</Text>
              </View>
            </View>
            <View style={[styles.questRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <View style={styles.questCheckbox} />
              <View style={styles.questInfo}>
                <Text style={styles.questTitle}>Study for 2 hours</Text>
                <Text style={styles.questReward}>+150 XP</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Quick Actions Grid */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.grid}>
            <QuickActionCard title="Focus Timer" icon="timer" color={COLORS.primary} delay={500} onPress={() => navigation.navigate('FocusTimer')} />
            <QuickActionCard title="AI Tutor" icon="robot" color={COLORS.accent} delay={600} onPress={() => navigation.navigate('ChatTutor')} />
            <QuickActionCard title="StudyTube" icon="play-circle" color="#FF4757" delay={700} onPress={() => navigation.navigate('StudyTube')} />
            <QuickActionCard title="Leaderboard" icon="trophy" color={COLORS.xp} delay={800} onPress={() => navigation.navigate('Leaderboard')} />
            <QuickActionCard title="Badges" icon="medal" color="#FFD700" delay={900} onPress={() => navigation.navigate('Achievements')} />
          </View>
        </Animated.View>

        {/* Calendar */}
        <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <GlassCard style={styles.calendarCard}>
            <Calendar
              style={styles.calendar}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: COLORS.textMuted,
                selectedDayBackgroundColor: COLORS.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: COLORS.accent,
                dayTextColor: COLORS.textPrimary,
                textDisabledColor: 'rgba(255,255,255,0.2)',
                arrowColor: COLORS.primary,
                monthTextColor: COLORS.textPrimary,
                indicatorColor: COLORS.primary,
                textDayFontFamily: FONTS.regular,
                textMonthFontFamily: FONTS.bold,
                textDayHeaderFontFamily: FONTS.semiBold,
              }}
              markedDates={markedDates}
              markingType={'custom'}
            />
          </GlassCard>
        </Animated.View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: height * 0.08,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.bodyLarge,
    color: COLORS.textAccent,
    marginBottom: 4,
  },
  userName: {
    fontFamily: FONTS.extraBold,
    fontSize: 42,
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  settingsBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statBox: {
    // container flex
  },
  xpCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  xpRingContainer: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    color: COLORS.textPrimary,
    lineHeight: 36,
  },
  levelText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
  xpLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    letterSpacing: 1,
  },
  streakCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    paddingVertical: SPACING.xl,
    justifyContent: 'center',
    height: '100%',
  },
  fireEmoji: {
    fontSize: 36,
    marginBottom: SPACING.xs,
  },
  streakNumber: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    color: COLORS.textPrimary,
  },
  streakLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  streakDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  streakDotActive: {
    backgroundColor: COLORS.streak,
    shadowColor: COLORS.streak,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontFamily: FONTS.extraBold,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.semiBold,
    color: COLORS.accent,
  },
  questsCard: {
    padding: SPACING.lg,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  questCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questCheckboxDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkIcon: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONTS.extraBold,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.body,
  },
  questTitleDone: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.body,
    textDecorationLine: 'line-through',
  },
  questReward: {
    color: COLORS.xp,
    fontFamily: FONTS.extraBold,
    fontSize: 10,
    marginTop: 2,
  },
  questRewardDone: {
    color: COLORS.textMuted,
    fontFamily: FONTS.extraBold,
    fontSize: 10,
    marginTop: 2,
  },
  upNextCard: {
    padding: SPACING.lg,
    borderLeftWidth: 4,
  },
  upNextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.glow,
  },
  upNextInfo: {
    flex: 1,
  },
  upNextSubject: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.bodyLarge,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  upNextTime: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.caption,
    color: COLORS.textSecondary,
  },
  aiGenText: {
    color: COLORS.accent, 
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyCardText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.bodyLarge,
    color: COLORS.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickActionContainer: {
    flexBasis: '47%',
  },
  quickActionCard: {
    padding: SPACING.lg,
    alignItems: 'flex-start',
    minHeight: 120,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  quickActionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  calendarCard: {
    padding: SPACING.sm,
  },
  calendar: {
    borderRadius: BORDER_RADIUS.md,
  }
});
