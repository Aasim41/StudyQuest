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

const MARKS_DATA = [
  {
    code: 'CS115',
    name: 'Statistical Methods',
    credits: 4,
    grade: 'O',
    total: 91,
    components: [
      { name: 'Test 1 (T-1)', scored: 14, max: 15 },
      { name: 'Test 2 (T-2)', scored: 23, max: 25 },
      { name: 'Teacher Assessment (TA)', scored: 23, max: 25 },
      { name: 'End Sem (T-3)', scored: 31, max: 35 },
    ],
  },
  {
    code: 'CS103',
    name: 'Data Structures',
    credits: 4,
    grade: 'A+',
    total: 86,
    components: [
      { name: 'Test 1 (T-1)', scored: 13, max: 15 },
      { name: 'Test 2 (T-2)', scored: 21, max: 25 },
      { name: 'Teacher Assessment (TA)', scored: 22, max: 25 },
      { name: 'End Sem (T-3)', scored: 30, max: 35 },
    ],
  },
  {
    code: 'HS007',
    name: 'Career Management and Development',
    credits: 2,
    grade: 'A+',
    total: 88,
    components: [
      { name: 'Test 1 (T-1)', scored: 13, max: 15 },
      { name: 'Test 2 (T-2)', scored: 22, max: 25 },
      { name: 'Teacher Assessment (TA)', scored: 24, max: 25 },
      { name: 'End Sem (T-3)', scored: 29, max: 35 },
    ],
  },
  {
    code: 'CS206',
    name: 'Advanced Programming Lab-1',
    credits: 1,
    grade: 'A+',
    total: 86,
    components: [
      { name: 'Practical 1 (P-1)', scored: 22, max: 25 },
      { name: 'Practical 2 (P-2)', scored: 23, max: 25 },
      { name: 'Lab File & Viva', scored: 41, max: 50 },
    ],
  },
  {
    code: 'CS104',
    name: 'Database Systems',
    credits: 4,
    grade: 'A',
    total: 80,
    components: [
      { name: 'Test 1 (T-1)', scored: 12, max: 15 },
      { name: 'Test 2 (T-2)', scored: 19, max: 25 },
      { name: 'Teacher Assessment (TA)', scored: 21, max: 25 },
      { name: 'End Sem (T-3)', scored: 28, max: 35 },
    ],
  },
  {
    code: 'HS103',
    name: 'Techniques for Decision Making',
    credits: 3,
    grade: 'B+',
    total: 75,
    components: [
      { name: 'Test 1 (T-1)', scored: 11, max: 15 },
      { name: 'Test 2 (T-2)', scored: 18, max: 25 },
      { name: 'Teacher Assessment (TA)', scored: 20, max: 25 },
      { name: 'End Sem (T-3)', scored: 26, max: 35 },
    ],
  },
  {
    code: 'GE001',
    name: 'Environmental Science',
    credits: 3,
    grade: 'B',
    total: 71,
    components: [
      { name: 'Test 1 (T-1)', scored: 10, max: 15 },
      { name: 'Test 2 (T-2)', scored: 17, max: 25 },
      { name: 'Teacher Assessment (TA)', scored: 19, max: 25 },
      { name: 'End Sem (T-3)', scored: 25, max: 35 },
    ],
  },
];

export default function MarksScreen() {
  const navigation = useNavigation();
  const [expandedCode, setExpandedCode] = useState(null);

  const toggleExpand = (code) => {
    setExpandedCode(expandedCode === code ? null : code);
  };

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
            <Text style={styles.headerTitle}>Academic Marks</Text>
            <Text style={styles.headerSub}>Odd Semester 2026</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {/* GPA Hero Summary */}
        <View style={styles.gpaHeroCard}>
          <View>
            <Text style={styles.gpaLabel}>ESTIMATED SGPA</Text>
            <Text style={styles.gpaValue}>8.42</Text>
            <Text style={styles.gpaSub}>Total Earned Credits: 21</Text>
          </View>
          <View style={styles.gpaIconBadge}>
            <MaterialCommunityIcons name="medal-outline" size={32} color="#D1C4E9" />
          </View>
        </View>

        <Text style={styles.sectionHeading}>Subject-Wise Score Breakdown</Text>

        {/* Subjects List */}
        <View style={styles.subjectsGroup}>
          {MARKS_DATA.map((sub, index) => {
            const isExpanded = expandedCode === sub.code;
            return (
              <View
                key={sub.code}
                style={[
                  styles.subjectCard,
                  index < MARKS_DATA.length - 1 && styles.subjectCardBorder,
                ]}
              >
                <TouchableOpacity
                  style={styles.subjectTopRow}
                  activeOpacity={0.7}
                  onPress={() => toggleExpand(sub.code)}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={styles.subjectName}>{sub.name}</Text>
                    <Text style={styles.subjectMeta}>
                      {sub.code} · {sub.credits} Credits
                    </Text>
                  </View>

                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeText}>{sub.grade}</Text>
                    <Text style={styles.scoreText}>{sub.total}/100</Text>
                  </View>
                </TouchableOpacity>

                {/* Expanded Components Breakdown */}
                {isExpanded && (
                  <View style={styles.componentsContainer}>
                    {sub.components.map((comp) => (
                      <View key={comp.name} style={styles.compRow}>
                        <Text style={styles.compName}>{comp.name}</Text>
                        <Text style={styles.compScore}>
                          <Text style={{ color: '#FFF', fontWeight: '800' }}>
                            {comp.scored}
                          </Text>{' '}
                          / {comp.max}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
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
  container: {
    flex: 1,
    backgroundColor: '#0B0B13',
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  scrollList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  gpaHeroCard: {
    backgroundColor: '#1E1B2E',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  gpaLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A29BFE',
    letterSpacing: 0.8,
  },
  gpaValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    marginVertical: 4,
  },
  gpaSub: {
    fontSize: 12,
    color: '#8E8D9A',
  },
  gpaIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8E8D9A',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subjectsGroup: {
    backgroundColor: '#161622',
    borderRadius: 20,
    overflow: 'hidden',
  },
  subjectCard: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  subjectCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  subjectTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  subjectMeta: {
    fontSize: 12,
    color: '#8E8D9A',
  },
  gradeBadge: {
    alignItems: 'flex-end',
  },
  gradeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2ECC71',
  },
  scoreText: {
    fontSize: 11,
    color: '#8E8D9A',
    marginTop: 2,
  },
  componentsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compName: {
    fontSize: 13,
    color: '#B5B4C2',
  },
  compScore: {
    fontSize: 13,
    color: '#8E8D9A',
  },
});
