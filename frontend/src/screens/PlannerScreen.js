import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withSequence, Layout } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, ANIMATION } from '../theme';
import { FloatingParticle } from '../components/ui';
import { auth } from '../../firebaseConfig';
import { useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE from '../config/apiConfig';

const { width, height } = Dimensions.get('window');

const FILTERS = ['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TopicCard = ({ item, index, onToggle, onEditClick }) => {
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

  const getIntensityColor = (intensity) => {
    if (intensity === 'Intense') return '#FF4C4C';
    if (intensity === 'Moderate') return '#F39C12';
    return '#2ECC71'; 
  };

  const itemColor = item.color || COLORS.primary;

  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 100).springify()} style={styles.cardContainer}>
      <Animated.View style={animStyle}>
        <LinearGradient
          colors={item.completed ? [COLORS.glass, COLORS.glass] : COLORS.gradientGlass}
          style={[
            styles.topicCard,
            item.completed && styles.topicCardCompleted,
            { borderLeftColor: itemColor, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center' }
          ]}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={{ flex: 1 }}>
            <View style={styles.cardHeader}>
              <Text style={[styles.subjectName, { color: itemColor }]}>{item.subject}</Text>
              <View style={styles.headerRight}>
                <Text style={styles.timeText}>{item.time}</Text>
                {!item.completed && (
                  <TouchableOpacity onPress={() => onEditClick(item)} style={styles.editBtn}>
                    <Text style={styles.editIcon}>✏️</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <View style={[styles.intensityBadge, { backgroundColor: getIntensityColor(item.intensity) + '20', borderColor: getIntensityColor(item.intensity) }]}>
               <Text style={[styles.intensityText, { color: getIntensityColor(item.intensity) }]}>{item.intensity || 'Moderate'} Intensity</Text>
            </View>
          </TouchableOpacity>

          {!item.completed && (
            <TouchableOpacity 
              style={styles.startFocusBtn}
              onPress={() => navigation.navigate('FocusTimer', { 
                topic: item.subject, 
                subject: item.subject, 
                color: itemColor 
              })}
            >
              <Text style={styles.startFocusText}>Focus</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={[styles.checkbox, item.completed && { backgroundColor: itemColor, borderColor: itemColor }, { marginLeft: SPACING.md }]}>
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
  const [showLevelUp, setShowLevelUp] = useState(false);
  const { userStats, studyPlan, updateStudyPlan, saveStatsToFirestore, isGeneratingSchedule, generationError } = useUser();
  
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editIntensity, setEditIntensity] = useState('Moderate');

  useEffect(() => {
    if (studyPlan) {
      setTopics(studyPlan);
    }
    setLoading(false);
  }, [studyPlan]);

  const toggleComplete = async (id) => {
    const newTopics = topics.map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    setTopics(newTopics);

    const item = newTopics.find(t => t.id === id);
    if (!item) return;

    const isCompleting = item.completed;

    if (isCompleting) {
      const XP_REWARD = 50;
      let newXp = userStats.xp + XP_REWARD;
      let newLevel = userStats.level;
      let nextLevelXp = userStats.nextLevelXp;

      if (newXp >= nextLevelXp) {
        newLevel += 1;
        newXp = newXp - nextLevelXp;
        nextLevelXp = Math.floor(nextLevelXp * 1.5);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      const todayStr = new Date().toISOString().split('T')[0];
      let newStreak = userStats.streak || 0;
      
      if (userStats.lastStudyDate) {
        const today = new Date(todayStr);
        const lastDate = new Date(userStats.lastStudyDate);
        const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) newStreak += 1;
        else if (diffDays > 1) newStreak = 1;
      } else {
        newStreak = 1;
      }

      await saveStatsToFirestore({ 
        ...userStats, xp: newXp, level: newLevel, nextLevelXp, streak: newStreak, lastStudyDate: todayStr
      });
    }
    await updateStudyPlan(newTopics);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditSubject(item.subject);
    setEditTime(item.time);
    setEditIntensity(item.intensity || 'Moderate');
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    const newTopics = topics.map(t => {
      if (t.id === editingItem.id) {
        return { ...t, subject: editSubject, time: editTime, intensity: editIntensity };
      }
      return t;
    });
    setTopics(newTopics);
    await updateStudyPlan(newTopics);
    setEditModalVisible(false);
  };

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      setTopics([]);
      
      const timetableStr = await AsyncStorage.getItem('@onboarding_timetable');
      const calendarStr = await AsyncStorage.getItem('@onboarding_calendar');
      const syllabusStr = await AsyncStorage.getItem('@onboarding_syllabus');
      
      const payload = {
        timetable: timetableStr ? JSON.parse(timetableStr) : [],
        calendar: calendarStr ? JSON.parse(calendarStr) : [],
        syllabus: syllabusStr ? JSON.parse(syllabusStr) : []
      };

      const res = await fetch(`${API_BASE}/api/schedule/merge/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (result.success) {
        const plan = result.studyPlan.map((item, index) => ({
          ...item,
          id: item.id || `generated-${Date.now()}-${index}`,
          completed: item.completed || false,
          color: item.color || ['#FF6B35', '#4A90D9', '#2ECC71', '#A29BFE'][index % 4],
        }));
        await updateStudyPlan(plan);
      } else {
        alert(result.error || 'Failed to generate schedule');
      }
    } catch (e) {
      alert('Error regenerating schedule. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const completedCount = topics.filter(t => t.completed).length;
  const progressPercent = topics.length > 0 ? (completedCount / topics.length) * 100 : 0;
  
  const today = new Date();
  const dateString = `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]}, ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][today.getMonth()]} ${today.getDate()}`;

  const filteredTopics = activeFilter === 'All' 
    ? topics 
    : topics.filter(t => t.day && t.day.substring(0, 3) === activeFilter.substring(0, 3));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />
      <FloatingParticle size={200} color={COLORS.primary} x={-50} y={-50} delay={100} />
      <FloatingParticle size={150} color={COLORS.accent} x={width * 0.7} y={height * 0.4} delay={600} />

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
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} layout={Layout.springify()} />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {FILTERS.map((filter, index) => (
            <Animated.View key={filter} entering={FadeInDown.delay(200 + index * 50).springify()}>
              <TouchableOpacity style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]} onPress={() => setActiveFilter(filter)}>
                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredTopics.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: 20 }}>
            {isGeneratingSchedule ? (
              <>
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: 16 }} />
                <Text style={{ color: COLORS.accent, fontSize: 16, fontWeight: 'bold' }}>AI is building your master schedule...</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 8, textAlign: 'center' }}>This usually takes a few seconds.</Text>
              </>
            ) : generationError ? (
              <>
                <Text style={{ color: '#FF4C4C', fontSize: 32, marginBottom: 8 }}>⚠️</Text>
                <Text style={{ color: '#FF4C4C', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>AI Generation Failed</Text>
                <Text style={{ color: COLORS.textMuted, textAlign: 'center', fontSize: 14 }}>{generationError}</Text>
                <Text style={{ color: COLORS.textMuted, textAlign: 'center', fontSize: 14, marginTop: 16 }}>Tap the ✨ button below to try again.</Text>
              </>
            ) : (
              <Text style={{ color: COLORS.textMuted, textAlign: 'center', fontSize: 16 }}>
                {loading ? 'Loading your study plan...' : 'No study plan yet. Generate one below!'}
              </Text>
            )}
          </View>
        ) : (
          filteredTopics.map((item, index) => (
            <TopicCard key={item.id || `topic-${index}`} item={item} index={index} onToggle={toggleComplete} onEditClick={openEditModal} />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {showLevelUp && (
        <Animated.View entering={FadeInDown.springify()} style={styles.levelUpOverlay}>
          <Text style={styles.levelUpEmoji}>🎉</Text>
          <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
          <Text style={styles.levelUpSub}>You reached Level {userStats.level}</Text>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={handleRegenerate}>
          <LinearGradient colors={COLORS.gradientAccent} style={styles.fabGradient}>
            <Text style={styles.fabIcon}>✨</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Session</Text>
            
            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput
              style={styles.modalInput}
              value={editSubject}
              onChangeText={setEditSubject}
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.inputLabel}>Time (e.g. 18:00 - 19:30)</Text>
            <TextInput
              style={styles.modalInput}
              value={editTime}
              onChangeText={setEditTime}
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.inputLabel}>Intensity</Text>
            <View style={styles.intensityPicker}>
              {['Light', 'Moderate', 'Intense'].map(int => (
                <TouchableOpacity 
                  key={int} 
                  style={[styles.intBtn, editIntensity === int && styles.intBtnActive]}
                  onPress={() => setEditIntensity(int)}
                >
                  <Text style={[styles.intBtnText, editIntensity === int && {color: '#FFF'}]}>{int}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveEdit}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xl, paddingTop: height * 0.08, marginBottom: SPACING.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  dateText: { fontSize: FONT_SIZES.caption, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: FONT_SIZES.heading, fontWeight: '800', color: COLORS.textPrimary },
  progressCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.glass, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  progressText: { color: '#FFF', fontWeight: '700', fontSize: FONT_SIZES.caption },
  progressBarBg: { height: 6, backgroundColor: COLORS.glassBorder, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  filtersContainer: { marginBottom: SPACING.md },
  filtersScroll: { paddingHorizontal: SPACING.xl, gap: SPACING.sm },
  filterPill: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.pill, backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.glassBorder },
  filterPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: FONT_SIZES.body },
  filterTextActive: { color: '#FFF' },
  listContainer: { flex: 1 },
  listContent: { paddingHorizontal: SPACING.xl, gap: SPACING.md },
  cardContainer: { width: '100%' },
  topicCard: { padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.glassBorder },
  topicCardCompleted: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  subjectName: { fontSize: FONT_SIZES.bodyLarge, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  timeText: { fontSize: FONT_SIZES.caption, color: COLORS.textMuted, fontWeight: '600', marginRight: 10 },
  editBtn: { padding: 4 },
  editIcon: { fontSize: 14 },
  intensityBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, marginBottom: SPACING.sm },
  intensityText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.textMuted, alignItems: 'center', justifyContent: 'center' },
  checkIcon: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  startFocusBtn: { backgroundColor: COLORS.glass, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.pill, borderWidth: 1, borderColor: COLORS.glassBorder, marginLeft: SPACING.md },
  startFocusText: { color: '#FFF', fontSize: FONT_SIZES.caption, fontWeight: '700' },
  fabContainer: { position: 'absolute', bottom: SPACING.xl, right: SPACING.xl },
  fab: { borderRadius: 30, overflow: 'hidden' },
  fabGradient: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 24 },
  levelUpOverlay: { position: 'absolute', top: '30%', left: SPACING.xl, right: SPACING.xl, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: BORDER_RADIUS.xl, padding: SPACING.xxl, alignItems: 'center', borderWidth: 2, borderColor: COLORS.accent },
  levelUpEmoji: { fontSize: 64, marginBottom: SPACING.md },
  levelUpTitle: { fontSize: FONT_SIZES.hero, fontWeight: '900', color: COLORS.accent, marginBottom: SPACING.sm },
  levelUpSub: { fontSize: FONT_SIZES.subtitle, fontWeight: '700', color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.glassBorder },
  modalTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.subtitle, fontWeight: '800', marginBottom: SPACING.lg },
  inputLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.caption, marginBottom: 4, fontWeight: '600' },
  modalInput: { backgroundColor: COLORS.glass, color: COLORS.textPrimary, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.glassBorder },
  intensityPicker: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  intBtn: { flex: 1, padding: SPACING.sm, backgroundColor: COLORS.glass, borderRadius: BORDER_RADIUS.sm, alignItems: 'center', borderWidth: 1, borderColor: COLORS.glassBorder },
  intBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  intBtnText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: FONT_SIZES.caption },
  modalActions: { flexDirection: 'row', gap: SPACING.md },
  modalCancel: { flex: 1, padding: SPACING.md, alignItems: 'center', backgroundColor: COLORS.glass, borderRadius: BORDER_RADIUS.md },
  modalCancelText: { color: COLORS.textSecondary, fontWeight: '700' },
  modalSave: { flex: 1, padding: SPACING.md, alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md },
  modalSaveText: { color: '#FFF', fontWeight: '700' }
});
