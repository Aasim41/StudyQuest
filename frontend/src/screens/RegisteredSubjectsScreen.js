import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';

const REGISTERED_COURSES = [
  {
    code: 'HS007',
    name: 'Career Management and Development',
    category: 'Theory',
    credits: 2,
    ltp: '2-0-0',
    type: 'Humanities & Social Sciences',
    isLab: false,
  },
  {
    code: 'HS103',
    name: 'Techniques for Decision Making',
    category: 'Theory',
    credits: 3,
    ltp: '3-1-0',
    type: 'Humanities & Social Sciences',
    isLab: false,
  },
  {
    code: 'GE001',
    name: 'Environmental Science',
    category: 'Theory',
    credits: 3,
    ltp: '3-0-0',
    type: 'General Engineering',
    isLab: false,
  },
  {
    code: 'CS103',
    name: 'Data Structures',
    category: 'Core Theory',
    credits: 4,
    ltp: '3-1-0',
    type: 'Computer Science & Engineering',
    isLab: false,
  },
  {
    code: 'CS203',
    name: 'Data Structures Lab',
    category: 'Practical Lab',
    credits: 1,
    ltp: '0-0-2',
    type: 'Computer Science & Engineering',
    isLab: true,
  },
  {
    code: 'CS104',
    name: 'Database Systems',
    category: 'Core Theory',
    credits: 4,
    ltp: '3-1-0',
    type: 'Computer Science & Engineering',
    isLab: false,
  },
  {
    code: 'CS204',
    name: 'Database Systems Lab',
    category: 'Practical Lab',
    credits: 1,
    ltp: '0-0-2',
    type: 'Computer Science & Engineering',
    isLab: true,
  },
  {
    code: 'CS206',
    name: 'Advanced Programming Lab-1',
    category: 'Practical Lab',
    credits: 1,
    ltp: '0-0-2',
    type: 'Computer Science & Engineering',
    isLab: true,
  },
  {
    code: 'CS115',
    name: 'Statistical Methods',
    category: 'Core Theory',
    credits: 4,
    ltp: '3-1-0',
    type: 'Mathematics & Computing',
    isLab: false,
  },
  {
    code: 'CS221',
    name: 'Statistical Methods Lab',
    category: 'Practical Lab',
    credits: 1,
    ltp: '0-0-2',
    type: 'Mathematics & Computing',
    isLab: true,
  },
  {
    code: 'CS219',
    name: 'Unix Programming Lab',
    category: 'Practical Lab',
    credits: 1,
    ltp: '0-0-2',
    type: 'Computer Science & Engineering',
    isLab: true,
  },
  {
    code: 'CS002',
    name: 'Summer Internship',
    category: 'Institutional Training',
    credits: 2,
    ltp: '0-0-0',
    type: 'Industry Training',
    isLab: false,
  },
];

export default function RegisteredSubjectsScreen() {
  const navigation = useNavigation();
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'THEORY' | 'LAB'

  const filteredCourses = REGISTERED_COURSES.filter((c) => {
    if (filter === 'THEORY') return !c.isLab;
    if (filter === 'LAB') return c.isLab;
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B13" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeftRow}>
          <TouchableOpacity
            style={styles.backCircleBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Registered Subjects</Text>
            <Text style={styles.headerSub}>B.Tech III Sem • 23 Total Credits</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'ALL' && styles.filterPillActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterPillText, filter === 'ALL' && styles.filterPillTextActive]}>
            All ({REGISTERED_COURSES.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'THEORY' && styles.filterPillActive]}
          onPress={() => setFilter('THEORY')}
        >
          <Text style={[styles.filterPillText, filter === 'THEORY' && styles.filterPillTextActive]}>
            Theory (7)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'LAB' && styles.filterPillActive]}
          onPress={() => setFilter('LAB')}
        >
          <Text style={[styles.filterPillText, filter === 'LAB' && styles.filterPillTextActive]}>
            Labs (5)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        <View style={styles.cardGroup}>
          {filteredCourses.map((item, index) => (
            <View
              key={item.code}
              style={[
                styles.courseRow,
                index < filteredCourses.length - 1 && styles.courseRowBorder,
              ]}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <View style={styles.badgeRow}>
                  <Text style={styles.codeBadgeText}>{item.code}</Text>
                  <View style={styles.dot} />
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>

                <Text style={styles.courseName}>{item.name}</Text>
                <Text style={styles.courseDept}>{item.type}</Text>
              </View>

              <View style={styles.creditsBox}>
                <Text style={styles.creditsNum}>{item.credits}</Text>
                <Text style={styles.creditsLabel}>Credits</Text>
                <Text style={styles.ltpText}>L-T-P {item.ltp}</Text>
              </View>
            </View>
          ))}
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
    paddingBottom: 12,
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 1,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  filterPillActive: {
    backgroundColor: '#C5BBED',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8D9A',
  },
  filterPillTextActive: {
    color: '#13111C',
    fontWeight: '900',
  },
  scrollList: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  cardGroup: {
    backgroundColor: '#161622',
    borderRadius: 20,
    overflow: 'hidden',
  },
  courseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  courseRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  codeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A29BFE',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#8E8D9A',
    marginHorizontal: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#8E8D9A',
    fontWeight: '600',
  },
  courseName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 3,
  },
  courseDept: {
    fontSize: 11,
    color: '#686777',
  },
  creditsBox: {
    alignItems: 'flex-end',
  },
  creditsNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
  },
  creditsLabel: {
    fontSize: 11,
    color: '#8E8D9A',
  },
  ltpText: {
    fontSize: 10,
    color: '#686777',
    marginTop: 2,
  },
});
