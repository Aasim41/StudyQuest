import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { SvgUri } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { auth } from '../../firebaseConfig';
import { useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../theme';
import { FloatingParticle, GlassCard } from '../components/ui';

const { width, height } = Dimensions.get('window');

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it's done.",
  "Don't watch the clock; do what it does. Keep going.",
  "Success is the sum of small efforts, repeated day-in and day-out.",
  "The future belongs to those who believe in the beauty of their dreams."
];

export default function DashboardScreen() {
  const navigation = useNavigation();

  const [calendarData, setCalendarData] = useState([]);
  const [nextSession, setNextSession] = useState(null);
  const [todayProgress, setTodayProgress] = useState(0);
  const [quoteOfTheDay, setQuoteOfTheDay] = useState(QUOTES[0]);
  const { userStats, studyPlan, saveStatsToFirestore, isGeneratingSchedule, generationError, BADGE_DEFINITIONS } = useUser();
  
  // Profile Modal State
  const [isProfileVisible, setProfileVisible] = useState(false);

  const renderBadge = (badgeId, index) => {
    const badgeDef = BADGE_DEFINITIONS[badgeId];
    if (!badgeDef) return null;
    return (
      <View key={index} style={styles.badgeItem}>
        <Text style={styles.badgeIcon}>{badgeDef.icon}</Text>
        <Text style={styles.badgeName}>{badgeDef.name}</Text>
      </View>
    );
  };

  // Scroll Animation
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 100], [0, -20], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  useEffect(() => {
    // Random quote for the day
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuoteOfTheDay(randomQuote);

    const checkData = async () => {
      try {
        const calStr = await AsyncStorage.getItem('@onboarding_calendar');
        if (calStr) setCalendarData(JSON.parse(calStr));

        if (userStats.lastStudyDate) {
          const today = new Date();
          today.setHours(0,0,0,0);
          const lastDate = new Date(userStats.lastStudyDate);
          lastDate.setHours(0,0,0,0);
          
          const diffTime = Math.abs(today - lastDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 1 && userStats.streak > 0) {
            saveStatsToFirestore({ ...userStats, streak: 0 });
          }
        }

        if (studyPlan && studyPlan.length > 0) {
          const upcoming = studyPlan.find(item => !item.completed);
          if (upcoming) {
            setNextSession({
              subject: upcoming.subject,
              time: upcoming.time,
              color: upcoming.color || COLORS.primary,
              intensity: upcoming.intensity
            });
          } else {
            setNextSession(null);
          }

          // Calculate daily progress
          const todayStr = new Date().toISOString().split('T')[0];
          const todayTasks = studyPlan.filter(t => t.date === todayStr);
          if (todayTasks.length > 0) {
            const completed = todayTasks.filter(t => t.completed).length;
            setTodayProgress((completed / todayTasks.length) * 100);
          } else {
            setTodayProgress(0);
          }
        }
      } catch (err) {
        console.warn('Error dashboard data:', err);
      }
    };
    
    const unsubscribe = navigation.addListener('focus', () => {
      checkData();
    });

    checkData();
    return unsubscribe;
  }, [navigation, userStats, studyPlan]);

  const markedDates = {};
  calendarData.forEach(event => {
    if (!event.date) return;
    let dotColor = COLORS.accent; 
    if (event.type === 'Exam') dotColor = '#FF4C4C'; 
    else if (event.type === 'Holiday') dotColor = '#2ECC71'; 
    else if (event.type === 'Fest') dotColor = '#9B59B6'; 

    markedDates[event.date] = {
      marked: true,
      dotColor: dotColor,
      customStyles: {
        container: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 },
        text: { color: '#FFF', fontWeight: 'bold' }
      }
    };
  });

  const handleDayPress = (day) => {
    const eventsOnDay = calendarData.filter(e => e.date === day.dateString);
    if (eventsOnDay.length > 0) {
      const eventNames = eventsOnDay.map(e => `${e.type}: ${e.name}`).join('\n');
      Alert.alert(day.dateString, eventNames);
    }
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        // AppNavigator will handle auth state changes and re-render the Auth stack
      })
      .catch(error => {
        Alert.alert("Logout Error", error.message);
      });
  };

  const displayName = auth.currentUser?.displayName || 'Explorer';
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />
      <FloatingParticle size={180} color={COLORS.primary} x={width * 0.7} y={-40} delay={100} />
      <FloatingParticle size={120} color={COLORS.accent} x={-20} y={height * 0.4} delay={400} />
      <FloatingParticle size={80} color={COLORS.streak} x={width * 0.2} y={height * 0.8} delay={700} />

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        
        {/* Header Section */}
        <Animated.View style={[styles.header, headerAnimatedStyle]} entering={FadeInDown.delay(100).springify()}>
          <View>
            <Text style={styles.greeting}>Ready to level up,</Text>
            <Text style={styles.username}>{displayName.split(' ')[0]}! 🚀</Text>
          </View>
          <TouchableOpacity 
            style={styles.avatarButton} 
            onPress={() => setProfileVisible(true)}
          >
            {userStats.avatarUrl ? (
              <SvgUri width="100%" height="100%" uri={userStats.avatarUrl} />
            ) : (
              <Text style={styles.avatarLetter}>{initialLetter}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Quote of the Day */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteIcon}>💡</Text>
            <Text style={styles.quoteText}>"{quoteOfTheDay}"</Text>
          </View>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>Lvl {userStats.level}</Text>
            <Text style={styles.statLabel}>Current Level</Text>
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

        {/* Daily Progress */}
        <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.section}>
           <Text style={styles.sectionTitle}>Today's Progress</Text>
           <View style={styles.dailyProgressContainer}>
              <Text style={styles.progressLabel}>{Math.round(todayProgress)}% Completed</Text>
              <View style={styles.xpBarContainer}>
                <View style={[styles.xpBarFill, { width: `${todayProgress}%`, backgroundColor: COLORS.success || '#2ECC71' }]} />
              </View>
           </View>
        </Animated.View>

        {/* Next Up Session */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Up Next</Text>
          {isGeneratingSchedule ? (
            <GlassCard style={{ padding: SPACING.lg, alignItems: 'center' }}>
              <ActivityIndicator color={COLORS.primary} style={{ marginBottom: 8 }} />
              <Text style={{ color: COLORS.accent, fontSize: FONT_SIZES.body, fontWeight: '700' }}>AI is crafting your study plan...</Text>
            </GlassCard>
          ) : generationError && studyPlan.length === 0 ? (
            <GlassCard style={{ padding: SPACING.lg, alignItems: 'center' }}>
              <Text style={{ color: '#FF4C4C', fontSize: FONT_SIZES.body, fontWeight: '700', marginBottom: 4 }}>⚠️ AI Generation Failed</Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 12, textAlign: 'center' }}>{generationError}</Text>
            </GlassCard>
          ) : nextSession ? (
            <LinearGradient
              colors={COLORS.gradientGlass}
              style={[styles.nextSessionCard, { borderLeftColor: nextSession.color, borderLeftWidth: 4 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.subjectName, { color: nextSession.color }]}>{nextSession.subject}</Text>
                <Text style={styles.intensityText}>{nextSession.intensity || 'Moderate'} Intensity</Text>
                <Text style={styles.timeText}>{nextSession.time}</Text>
              </View>
              <TouchableOpacity 
                style={styles.startBtn}
                onPress={() => navigation.navigate('FocusTimer', {
                  subject: nextSession.subject,
                  color: nextSession.color
                })}
              >
                <Text style={styles.startBtnText}>Start</Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <GlassCard style={{ padding: SPACING.lg, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZES.body }}>No upcoming classes right now.</Text>
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
              onDayPress={handleDayPress}
            />
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#FF4C4C'}]} /><Text style={styles.legendText}>Exam</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#2ECC71'}]} /><Text style={styles.legendText}>Holiday</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#9B59B6'}]} /><Text style={styles.legendText}>Fest</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: COLORS.accent}]} /><Text style={styles.legendText}>Academic</Text></View>
            </View>
          </View>
        </Animated.View>

      </Animated.ScrollView>

      {/* Profile Modal */}
      <Modal visible={isProfileVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Profile</Text>
              <TouchableOpacity onPress={() => setProfileVisible(false)}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileDetailsContainer}>
               <View style={styles.largeAvatar}>
                 {userStats.avatarUrl ? (
                   <SvgUri width="100%" height="100%" uri={userStats.avatarUrl} />
                 ) : (
                   <Text style={styles.largeAvatarText}>{initialLetter}</Text>
                 )}
               </View>
               <TouchableOpacity 
                 style={styles.editAvatarBtn}
                 onPress={() => {
                   setProfileVisible(false);
                   navigation.navigate('AvatarSelection', { isEditing: true });
                 }}
               >
                 <Text style={styles.editAvatarText}>✎ Edit Avatar</Text>
               </TouchableOpacity>

               <Text style={styles.profileName}>{displayName}</Text>
               <Text style={styles.profileEmail}>{auth.currentUser?.email}</Text>
               
               {/* Educational Details */}
               {(userStats.userType || userStats.institute) && (
                 <View style={styles.educationBadge}>
                   <Text style={styles.educationText}>
                     {userStats.userType === 'college' ? '🎓 College Student' : (userStats.userType === 'school' ? '🎒 School Student' : '📚 Learner')}
                   </Text>
                   {userStats.institute?.name && (
                     <Text style={styles.instituteText}>{userStats.institute.name}</Text>
                   )}
                   {(userStats.institute?.degree || userStats.institute?.grade) && (
                     <Text style={styles.degreeText}>
                       {userStats.institute.degree || userStats.institute.grade}
                       {userStats.institute.branch ? ` • ${userStats.institute.branch}` : ''}
                     </Text>
                   )}
                 </View>
               )}
               <View style={styles.profileInfoContainer}>
                <View style={styles.profileInfoItem}>
                  <Text style={styles.profileInfoLabel}>Role</Text>
                  <Text style={styles.profileInfoValue}>{userStats.userType || 'Student'}</Text>
                </View>
                <View style={styles.profileInfoItem}>
                  <Text style={styles.profileInfoLabel}>Institute</Text>
                  <Text style={styles.profileInfoValue}>{userStats.institute || "Not Set"}</Text>
                </View>
                <View style={styles.profileInfoItem}>
                  <Text style={styles.profileInfoLabel}>Level</Text>
                  <Text style={styles.profileInfoValue}>{userStats.level}</Text>
                </View>
                <View style={styles.profileInfoItem}>
                  <Text style={styles.profileInfoLabel}>Total XP</Text>
                  <Text style={styles.profileInfoValue}>{userStats.xp}</Text>
                </View>
              </View>

              {/* Badges Section */}
              <View style={styles.badgesSection}>
                <Text style={styles.sectionTitle}>Unlocked Badges</Text>
                <View style={styles.badgesContainer}>
                  {userStats.unlockedBadges && userStats.unlockedBadges.length > 0 ? (
                    userStats.unlockedBadges.map((badgeId, idx) => renderBadge(badgeId, idx))
                  ) : (
                    <Text style={styles.noBadgesText}>No badges unlocked yet. Keep studying!</Text>
                  )}
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingTop: height * 0.08, paddingBottom: SPACING.xxl * 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  greeting: { color: COLORS.textSecondary, fontSize: FONT_SIZES.bodyLarge, fontWeight: '500' },
  username: { color: COLORS.textPrimary, fontSize: FONT_SIZES.heading, fontWeight: '800' },
  avatarButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, borderWidth: 2, borderColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarLetter: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  quoteContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.glass, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.xxl, borderWidth: 1, borderColor: COLORS.glassBorder },
  quoteIcon: { fontSize: 20, marginRight: SPACING.sm },
  quoteText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.caption, fontWeight: '500', flex: 1, fontStyle: 'italic' },
  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xxl },
  statCard: { flex: 1, padding: SPACING.md, alignItems: 'center' },
  statValue: { color: COLORS.textPrimary, fontSize: FONT_SIZES.subtitle, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.caption, fontWeight: '600', marginBottom: SPACING.sm },
  statEmoji: { fontSize: 28, marginBottom: 8 },
  xpBarContainer: { width: '100%', height: 6, backgroundColor: COLORS.glassBorder, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  xpBarFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 3 },
  xpText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700' },
  section: { marginBottom: SPACING.xxl },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.subtitle, fontWeight: '800', marginBottom: SPACING.md },
  dailyProgressContainer: { backgroundColor: COLORS.glass, padding: SPACING.lg, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.glassBorder },
  progressLabel: { color: COLORS.textPrimary, fontWeight: '700', marginBottom: SPACING.sm },
  nextSessionCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.glassBorder, ...SHADOWS.glow },
  subjectName: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  intensityText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.bodyLarge, fontWeight: '700', marginBottom: 6 },
  timeText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.caption, fontWeight: '600' },
  startBtn: { backgroundColor: COLORS.glass, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.pill, borderWidth: 1, borderColor: COLORS.glassBorder, marginLeft: SPACING.md },
  startBtnText: { color: '#FFF', fontSize: FONT_SIZES.body, fontWeight: '700' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  actionCard: { width: (width - SPACING.xl * 2 - SPACING.md) / 2, backgroundColor: COLORS.glass, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: 'center', justifyContent: 'center', ...SHADOWS.card },
  actionEmoji: { fontSize: 32, marginBottom: SPACING.sm },
  actionText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, fontWeight: '700', textAlign: 'center' },
  calendarContainer: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.glassBorder, padding: SPACING.md, ...SHADOWS.card },
  calendar: { marginBottom: SPACING.md },
  legendContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.glassBorder },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.caption, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  modalContent: { width: '100%', backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.glassBorder },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  modalTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.heading, fontWeight: '800' },
  closeModalText: { color: COLORS.textSecondary, fontSize: 24, fontWeight: 'bold' },
  profileDetailsContainer: { alignItems: 'center', marginBottom: SPACING.xl },
  largeAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, borderWidth: 3, borderColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md, overflow: 'hidden' },
  largeAvatarText: { color: '#FFF', fontSize: 36, fontWeight: '800' },
  editAvatarBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: BORDER_RADIUS.pill, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.glassBorder },
  editAvatarText: { color: COLORS.accent, fontSize: FONT_SIZES.caption, fontWeight: '700' },
  profileName: { color: COLORS.textPrimary, fontSize: FONT_SIZES.subtitle, fontWeight: '700', marginBottom: 4 },
  profileEmail: { color: COLORS.textMuted, fontSize: FONT_SIZES.body, marginBottom: SPACING.md },
  educationBadge: { backgroundColor: COLORS.glass, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: 'center', width: '100%' },
  educationText: { color: COLORS.accent, fontWeight: '700', fontSize: FONT_SIZES.body, marginBottom: 4 },
  instituteText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.caption, textAlign: 'center', fontWeight: '600' },
  degreeText: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 2 },
  profileStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.xl },
  profileStat: { padding: SPACING.md, backgroundColor: COLORS.glass, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: 'center', flex: 1, marginHorizontal: 4 },
  profileStatVal: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONT_SIZES.body },
  logoutBtn: { backgroundColor: '#FF4C4C', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center', marginTop: SPACING.xl },
  logoutBtnText: { color: '#FFF', fontWeight: '800', fontSize: FONT_SIZES.body },
  badgesSection: { width: '100%', marginTop: SPACING.xl },
  badgesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center' },
  badgeItem: { backgroundColor: 'rgba(255,255,255,0.05)', padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, alignItems: 'center', width: 80, borderWidth: 1, borderColor: COLORS.glassBorder },
  badgeIcon: { fontSize: 28, marginBottom: 4 },
  badgeName: { color: COLORS.textPrimary, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  noBadgesText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.caption, fontStyle: 'italic', textAlign: 'center' }
});
