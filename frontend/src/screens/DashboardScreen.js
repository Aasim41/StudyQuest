import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../theme';
import { FloatingParticle, GlassCard, GradientButton } from '../components/ui';

const { width, height } = Dimensions.get('window');

export default function DashboardScreen() {
  const navigation = useNavigation();

  const [calendarData, setCalendarData] = React.useState([]);
  const [nextSession, setNextSession] = React.useState(null);
  const [userStats, setUserStats] = React.useState({
    level: 1, xp: 0, nextLevelXp: 1000, streak: 0,
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          
          if (data.calendarData) setCalendarData(data.calendarData);
          if (data.xp !== undefined) {
            let currentStreak = data.streak || 0;
            const lastStudyDate = data.lastStudyDate;
            
            if (lastStudyDate) {
              const today = new Date();
              today.setHours(0,0,0,0);
              const lastDate = new Date(lastStudyDate);
              lastDate.setHours(0,0,0,0);
              
              const diffTime = Math.abs(today - lastDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays > 1) {
                // Streak broken
                currentStreak = 0;
                updateDoc(doc(db, 'users', user.uid), { streak: 0 }).catch(e => console.log(e));
              } else if (diffDays === 1) {
                // Studied yesterday, they should study today to keep it.
                // It hasn't broken yet, but it will if they don't study today.
                // We keep it as is, or we increment if they just studied today in PlannerScreen.
                // Wait, PlannerScreen doesn't increment streak, it only sets lastStudyDate.
                // Let's just track it properly: If diffDays === 1, they are safe. If diffDays === 0, they studied today.
                // We should increment streak here if diffDays === 1 and they study today?
                // Actually, the easiest streak logic is: Planner increments it if lastDate was yesterday.
                // But for now, we just reset it if diffDays > 1.
              }
            }

            setUserStats({
              level: data.level || 1,
              xp: data.xp || 0,
              nextLevelXp: data.nextLevelXp || 1000,
              streak: currentStreak,
            });
          }
          if (data.studyPlan && data.studyPlan.length > 0) {
            // Just grab the first uncompleted session
            const upcoming = data.studyPlan.find(item => !item.completed);
            if (upcoming) {
              setNextSession({
                subject: upcoming.subject,
                topic: upcoming.topic,
                time: upcoming.time,
                color: upcoming.color || COLORS.primary,
              });
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching dashboard data:', err);
      }
    };
    
    // Fetch on mount and when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });

    fetchData();
    return unsubscribe;
  }, [navigation]);

  // Map our AI parsed calendar into react-native-calendars format
  const markedDates = {};
  calendarData.forEach(event => {
    if (!event.date) return;
    let dotColor = COLORS.accent; // Default for Academic Event
    if (event.type === 'Exam') dotColor = '#FF4C4C'; // Red
    else if (event.type === 'Holiday') dotColor = '#2ECC71'; // Green
    else if (event.type === 'Fest') dotColor = '#9B59B6'; // Purple

    markedDates[event.date] = {
      marked: true,
      dotColor: dotColor,
      customStyles: {
        container: {
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 4
        },
        text: {
          color: '#FFF',
          fontWeight: 'bold'
        }
      }
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <FloatingParticle size={180} color={COLORS.primary} x={width * 0.7} y={-40} delay={100} />
      <FloatingParticle size={120} color={COLORS.accent} x={-20} y={height * 0.4} delay={400} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Ready to level up,</Text>
            <Text style={styles.username}>{auth.currentUser?.displayName?.split(' ')[0] || 'Explorer'}! 🚀</Text>
          </View>
          {/* Placeholder for Avatar */}
          <View style={styles.avatarPlaceholder} />
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>Lvl {userStats.level}</Text>
            <Text style={styles.statLabel}>Current Level</Text>
            {/* XP Bar */}
            <View style={styles.xpBarContainer}>
              <View style={[styles.xpBarFill, { width: `${(userStats.xp / userStats.nextLevelXp) * 100}%` }]} />
            </View>
            <Text style={styles.xpText}>{userStats.xp} / {userStats.nextLevelXp} XP</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{userStats.streak} Days</Text>
            <Text style={styles.statLabel}>Study Streak</Text>
          </GlassCard>
        </Animated.View>

        {/* Next Up Session */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Up Next</Text>
          {nextSession ? (
            <LinearGradient
              colors={COLORS.gradientGlass}
              style={[styles.nextSessionCard, { borderLeftColor: nextSession.color, borderLeftWidth: 4 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.subjectName, { color: nextSession.color }]}>{nextSession.subject}</Text>
                <Text style={styles.topicName}>{nextSession.topic}</Text>
                <Text style={styles.timeText}>{nextSession.time}</Text>
              </View>
              <TouchableOpacity 
                style={styles.startBtn}
                onPress={() => navigation.navigate('FocusTimer', {
                  topic: nextSession.topic,
                  subject: nextSession.subject,
                  color: nextSession.color
                })}
              >
                <Text style={styles.startBtnText}>Start</Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <GlassCard style={{ padding: SPACING.lg, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZES.body }}>No upcoming classes found. Upload a timetable to populate this.</Text>
            </GlassCard>
          )}
        </Animated.View>

        {/* Academic Calendar Section */}
        <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Calendar</Text>
          <View style={styles.calendarContainer}>
            <Calendar
              style={styles.calendar}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: COLORS.textSecondary,
                selectedDayBackgroundColor: COLORS.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: COLORS.accent,
                dayTextColor: COLORS.textPrimary,
                textDisabledColor: COLORS.textMuted,
                dotColor: COLORS.accent,
                selectedDotColor: '#ffffff',
                arrowColor: COLORS.accent,
                monthTextColor: COLORS.textPrimary,
                indicatorColor: COLORS.accent,
              }}
              markingType={'custom'}
              markedDates={markedDates}
            />
            {/* Legend */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#FF4C4C'}]} /><Text style={styles.legendText}>Exam</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#2ECC71'}]} /><Text style={styles.legendText}>Holiday</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#9B59B6'}]} /><Text style={styles.legendText}>Fest</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: COLORS.accent}]} /><Text style={styles.legendText}>Academic</Text></View>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Planner')}>
              <Text style={styles.actionEmoji}>📅</Text>
              <Text style={styles.actionText}>Study Planner</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('CalendarUpload')}>
              <Text style={styles.actionEmoji}>📄</Text>
              <Text style={styles.actionText}>Upload Docs</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('YouTubeFeed')}>
              <Text style={styles.actionEmoji}>▶️</Text>
              <Text style={styles.actionText}>YouTube Hub</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <Text style={styles.actionEmoji}>🏆</Text>
              <Text style={styles.actionText}>Leaderboard</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

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
    paddingHorizontal: SPACING.xl,
    paddingTop: height * 0.08,
    paddingBottom: SPACING.xxl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '500',
  },
  username: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  xpBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.glassBorder,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  xpText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  nextSessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.glow,
  },
  subjectName: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  topicName: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
    marginBottom: 6,
  },
  timeText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
  },
  startBtn: {
    backgroundColor: COLORS.glass,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginLeft: SPACING.md,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.glass,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  actionText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
  calendar: {
    marginBottom: SPACING.md,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
  },
});
