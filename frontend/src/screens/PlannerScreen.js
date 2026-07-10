import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, ANIMATION } from '../theme';
import { FloatingParticle } from '../components/ui';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

// No mock data - read from Firestore
const FILTERS = ['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TopicCard = ({ item, index, onToggle }) => {
  const navigation = useNavigation();
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.95, ANIMATION.springBouncy),
      withSpring(1, ANIMATION.springBouncy)
    );
    onToggle(item.id);
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  // Render difficulty dots
  const renderDifficulty = () => {
    let dots = [];
    for (let i = 0; i < 5; i++) {
      dots.push(
        <View 
          key={i} 
          style={[
            styles.diffDot, 
            { backgroundColor: i < item.difficulty ? item.color : COLORS.glassBorder }
          ]} 
        />
      );
    }
    return <View style={styles.diffContainer}>{dots}</View>;
  };

  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 100).springify()} style={styles.cardContainer}>
      <Animated.View style={animStyle}>
        <LinearGradient
          colors={item.completed ? [COLORS.glass, COLORS.glass] : COLORS.gradientGlass}
          style={[
            styles.topicCard,
            item.completed && styles.topicCardCompleted,
            { borderLeftColor: item.color, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center' }
          ]}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={{ flex: 1 }}>
            <View style={styles.cardHeader}>
              <Text style={[styles.subjectName, { color: item.color }]}>{item.subject}</Text>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            
            <Text style={[styles.topicName, item.completed && styles.textStrike]}>
              {item.topic}
            </Text>

            {renderDifficulty()}
          </TouchableOpacity>

          {!item.completed && (
            <TouchableOpacity 
              style={styles.startFocusBtn}
              onPress={() => navigation.navigate('FocusTimer', { 
                topic: item.topic, 
                subject: item.subject, 
                color: item.color 
              })}
            >
              <Text style={styles.startFocusText}>Focus</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={[styles.checkbox, item.completed && { backgroundColor: item.color, borderColor: item.color }, { marginLeft: SPACING.md }]}>
            {item.completed && <Text style={styles.checkIcon}>✓</Text>}
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
};

export default function PlannerScreen() {
  const navigation = useNavigation();
  const [topics, setTopics] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ level: 1, xp: 0, nextLevelXp: 1000 });
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Load study plan from Firestore on mount
  useEffect(() => {
    const loadPlan = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.studyPlan) {
              const plan = data.studyPlan.map((item, index) => ({
                ...item,
                completed: item.completed || false,
                difficulty: item.difficulty || 3,
                color: item.color || ['#FF6B35', '#4A90D9', '#2ECC71', '#A29BFE'][index % 4],
              }));
              setTopics(plan);
            }
            setUserStats({
              level: data.level || 1,
              xp: data.xp || 0,
              nextLevelXp: data.nextLevelXp || 1000,
              streak: data.streak || 0,
              lastStudyDate: data.lastStudyDate || null,
            });
          }
        }
      } catch (e) {
        console.warn('Error loading study plan:', e);
      } finally {
        setLoading(false);
      }
    };
    loadPlan();
  }, []);

  const toggleComplete = async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    let newTopics = [];
    let isCompleting = false;

    setTopics(prev => {
      newTopics = prev.map(t => {
        if (t.id === id) {
          isCompleting = !t.completed;
          return { ...t, completed: isCompleting };
        }
        return t;
      });
      return newTopics;
    });

    if (isCompleting) {
      // Award XP
      const XP_REWARD = 50;
      let newXp = userStats.xp + XP_REWARD;
      let newLevel = userStats.level;
      let nextLevelXp = userStats.nextLevelXp;
      let leveledUp = false;

      if (newXp >= nextLevelXp) {
        newLevel += 1;
        newXp = newXp - nextLevelXp; // carry over
        nextLevelXp = Math.floor(nextLevelXp * 1.5);
        leveledUp = true;
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      const todayStr = new Date().toISOString().split('T')[0];
      let newStreak = userStats.streak || 0;
      
      if (userStats.lastStudyDate) {
        const today = new Date(todayStr);
        const lastDate = new Date(userStats.lastStudyDate);
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1; // Restart streak
        }
        // if diffDays === 0, they already studied today, keep current streak
      } else {
        newStreak = 1; // First time studying
      }

      const newStats = { 
        ...userStats, 
        xp: newXp, 
        level: newLevel, 
        nextLevelXp,
        streak: newStreak,
        lastStudyDate: todayStr
      };
      setUserStats(newStats);

      try {
        await updateDoc(doc(db, 'users', user.uid), {
          studyPlan: newTopics,
          xp: newXp,
          level: newLevel,
          nextLevelXp: nextLevelXp,
          streak: newStreak,
          lastStudyDate: todayStr
        });
      } catch (err) {
        console.warn('Error saving XP:', err);
      }
    } else {
      // Just save uncompletion
      try {
        await updateDoc(doc(db, 'users', user.uid), { studyPlan: newTopics });
      } catch (err) {
        console.warn('Error saving completion:', err);
      }
    }
  };

  const completedCount = topics.filter(t => t.completed).length;
  const progressPercent = topics.length > 0 ? (completedCount / topics.length) * 100 : 0;

  // Dynamic date
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateString = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`;

  // Filter topics
  const filteredTopics = activeFilter === 'All' 
    ? topics 
    : topics.filter(t => t.day && t.day.substring(0, 3) === activeFilter.substring(0, 3));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <FloatingParticle size={200} color={COLORS.primary} x={-50} y={-50} delay={100} />
      <FloatingParticle size={150} color={COLORS.accent} x={width * 0.7} y={height * 0.4} delay={600} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.dateText}>{dateString}</Text>
            <Text style={styles.title}>Your Study Plan</Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{Math.round(progressPercent)}%</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <Animated.View 
            style={[styles.progressBarFill, { width: `${progressPercent}%` }]} 
          />
        </View>
      </View>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{Math.round(progressPercent)}%</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <Animated.View 
            style={[styles.progressBarFill, { width: `${progressPercent}%` }]} 
            layout={withSpring}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {FILTERS.map((filter, index) => (
            <Animated.View key={filter} entering={FadeInDown.delay(200 + index * 50).springify()}>
              <TouchableOpacity 
                style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      {/* Topics List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredTopics.length === 0 ? (
          <Text style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 40, fontSize: 16 }}>
            {loading ? 'Loading your study plan...' : 'No study plan yet. Complete onboarding to generate one.'}
          </Text>
        ) : (
          filteredTopics.map((item, index) => (
            <TopicCard key={item.id} item={item} index={index} onToggle={toggleComplete} />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Level Up Celebration Overlay */}
      {showLevelUp && (
        <Animated.View entering={FadeInDown.springify()} style={styles.levelUpOverlay}>
          <Text style={styles.levelUpEmoji}>🎉</Text>
          <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
          <Text style={styles.levelUpSub}>You reached Level {userStats.level}</Text>
        </Animated.View>
      )}

      {/* FAB - Replan */}
      <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
          <LinearGradient colors={COLORS.gradientAccent} style={styles.fabGradient}>
            <Text style={styles.fabIcon}>✨</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: height * 0.08,
    marginBottom: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dateText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.glass,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: FONT_SIZES.caption,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.glassBorder,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  filtersContainer: {
    marginBottom: SPACING.md,
  },
  filtersScroll: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.glow,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: FONT_SIZES.body,
  },
  filterTextActive: {
    color: '#FFF',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  cardContainer: {
    width: '100%',
  },
  topicCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.card,
  },
  topicCardCompleted: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  subjectName: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  topicName: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  textStrike: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diffContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  diffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    ...SHADOWS.glow,
  },
  fab: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  fabGradient: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 24,
  },
  levelUpOverlay: {
    position: 'absolute',
    top: '30%',
    left: SPACING.xl,
    right: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
    ...SHADOWS.glow,
  },
  levelUpEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  levelUpTitle: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '900',
    color: COLORS.accent,
    marginBottom: SPACING.sm,
  },
  levelUpSub: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '700',
    color: '#FFF',
  },
});
