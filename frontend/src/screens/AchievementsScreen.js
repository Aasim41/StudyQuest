import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, FONTS, BORDER_RADIUS } from '../theme';
import { useUser } from '../context/UserContext';
import { GlassCard } from '../components/ui';

const { width } = Dimensions.get('window');

// Dummy achievement data
const ACHIEVEMENTS = [
  { id: 1, title: 'First Step', desc: 'Complete 1 focus session', icon: '🌱', reqXP: 0 },
  { id: 2, title: 'On Fire', desc: 'Reach a 3-day streak', icon: '🔥', reqXP: 100 },
  { id: 3, title: 'Scholar', desc: 'Reach Level 5', icon: '🎓', reqXP: 500 },
  { id: 4, title: 'Deep Work', desc: 'Focus for 2 hours straight', icon: '🧠', reqXP: 800 },
  { id: 5, title: 'Master', desc: 'Reach Level 10', icon: '👑', reqXP: 1500 },
  { id: 6, title: 'Night Owl', desc: 'Study after midnight', icon: '🦉', reqXP: 2000 },
];

export default function AchievementsScreen() {
  const { userStats } = useUser();
  const currentXP = userStats.xp || 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements 🏆</Text>
        <Text style={styles.headerSub}>Unlock badges as you learn</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {ACHIEVEMENTS.map((item, index) => {
            const unlocked = currentXP >= item.reqXP;
            return (
              <Animated.View key={item.id} entering={FadeInDown.delay(index * 100).springify()} style={styles.cardContainer}>
                <GlassCard style={[styles.badgeCard, !unlocked && styles.lockedCard]}>
                  <View style={[styles.iconWrapper, !unlocked && styles.lockedIconWrapper]}>
                    <Text style={[styles.icon, !unlocked && { opacity: 0.3 }]}>
                      {unlocked ? item.icon : '🔒'}
                    </Text>
                  </View>
                  <Text style={[styles.title, !unlocked && styles.lockedText]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.desc, !unlocked && styles.lockedText]} numberOfLines={2}>{item.desc}</Text>
                </GlassCard>
              </Animated.View>
            );
          })}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xl, paddingTop: 60, paddingBottom: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.hero, fontFamily: FONTS.extraBold, color: '#FFF' },
  headerSub: { fontSize: FONT_SIZES.body, color: COLORS.accent, fontFamily: FONTS.semiBold, marginTop: 4 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardContainer: { width: (width - SPACING.lg * 2 - SPACING.md) / 2, marginBottom: SPACING.md },
  badgeCard: { padding: SPACING.lg, alignItems: 'center', height: 180 },
  lockedCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' },
  iconWrapper: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md,
    borderWidth: 1, borderColor: '#FFD700',
  },
  lockedIconWrapper: { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.1)' },
  icon: { fontSize: 32 },
  title: { fontSize: FONT_SIZES.body, fontFamily: FONTS.bold, color: '#FFF', textAlign: 'center', marginBottom: 4 },
  desc: { fontSize: 10, fontFamily: FONTS.semiBold, color: COLORS.textSecondary, textAlign: 'center' },
  lockedText: { color: COLORS.textMuted },
});
