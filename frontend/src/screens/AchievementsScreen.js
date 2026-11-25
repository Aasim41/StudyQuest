import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Dummy achievement data
const ACHIEVEMENTS = [
  { id: 1, title: 'First Step', desc: 'Complete 1 focus session', icon: 'sprout', reqXP: 0 },
  { id: 2, title: 'On Fire', desc: 'Reach a 3-day streak', icon: 'fire', reqXP: 100 },
  { id: 3, title: 'Scholar', desc: 'Reach Level 5', icon: 'school', reqXP: 500 },
  { id: 4, title: 'Deep Work', desc: 'Focus for 2 hours straight', icon: 'head-lightbulb', reqXP: 800 },
  { id: 5, title: 'Master', desc: 'Reach Level 10', icon: 'crown', reqXP: 1500 },
  { id: 6, title: 'Night Owl', desc: 'Study after midnight', icon: 'owl', reqXP: 2000 },
];

export default function AchievementsScreen() {
  const navigation = useNavigation();
  const { userStats } = useUser();
  const currentXP = userStats?.xp || 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Achievements</Text>
          <Text style={styles.headerSub}>{currentXP} XP earned</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {ACHIEVEMENTS.map((item) => {
            const unlocked = currentXP >= item.reqXP;
            return (
              <View key={item.id} style={styles.cardContainer}>
                <View style={[styles.badgeCard, !unlocked && styles.lockedCard]}>
                  <View style={[styles.iconWrapper, !unlocked && styles.lockedIconWrapper]}>
                    <MaterialCommunityIcons
                      name={unlocked ? item.icon : 'lock'}
                      size={28}
                      color={unlocked ? '#00E5FF' : '#555577'}
                    />
                  </View>
                  <Text style={[styles.title, !unlocked && styles.lockedText]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.desc, !unlocked && styles.lockedText]} numberOfLines={2}>
                    {item.desc}
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
  container: { flex: 1, backgroundColor: '#0B0C12' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingBottom: 14,
    backgroundColor: '#12141F',
    borderBottomWidth: 1,
    borderBottomColor: '#222436',
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#0B0C12',
    borderWidth: 1,
    borderColor: '#222436',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 11, color: '#00E5FF', fontWeight: '700', marginTop: 1 },
  scrollContent: { padding: 18, paddingBottom: 60 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardContainer: { width: (width - 48) / 2, marginBottom: 12 },
  badgeCard: {
    backgroundColor: '#12141F',
    borderWidth: 1,
    borderColor: '#00E5FF44',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    height: 164,
    justifyContent: 'center',
  },
  lockedCard: { borderColor: '#222436', opacity: 0.7 },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#00E5FF14',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#00E5FF44',
  },
  lockedIconWrapper: { backgroundColor: '#0B0C12', borderColor: '#222436' },
  title: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 4 },
  desc: { fontSize: 11, fontWeight: '600', color: '#8E8EA8', textAlign: 'center' },
  lockedText: { color: '#666688' },
});
