import React from 'react';
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

const EXAMS_DATA = [
  {
    id: 't2',
    name: 'Test 2 (T-2)',
    dates: '12 Oct – 17 Oct 2026',
    type: 'Mid-Sem Examination',
    status: 'Upcoming',
    statusColor: '#E5A93C',
    daysLeft: '4 days',
    suspended: true,
    desc: 'Classes remain suspended during T-2 exams. Syllabus includes Modules 1–3.',
  },
  {
    id: 'fest',
    name: 'Technical Fest (JYC)',
    dates: '29 Oct – 31 Oct 2026',
    type: 'College Event',
    status: 'Scheduled',
    statusColor: '#C5BBED',
    daysLeft: '21 days',
    suspended: false,
    desc: 'Campus cultural & technical fest. Attendance is flexible/optional.',
  },
  {
    id: 'p2',
    name: 'Makeup Test & P-2',
    dates: '30 Nov – 05 Dec 2026',
    type: 'Lab & Makeup Examination',
    status: 'Scheduled',
    statusColor: '#8E8D9A',
    daysLeft: '53 days',
    suspended: false,
    desc: 'Practical exams and makeup evaluation. Regular lectures continue.',
  },
  {
    id: 't3',
    name: 'End Semester Examinations (T-3)',
    dates: '07 Dec – 12 Dec 2026',
    type: 'Final Semester Examinations',
    status: 'Mandatory',
    statusColor: '#FF6B6B',
    daysLeft: '60 days',
    suspended: true,
    desc: 'Mandatory 70% aggregate attendance required to obtain admit card and sit for exams.',
  },
  {
    id: 't1',
    name: 'Test 1 (T-1)',
    dates: '24 Aug – 29 Aug 2026',
    type: 'First Assessment',
    status: 'Completed',
    statusColor: '#4EBA86',
    daysLeft: 'Done',
    suspended: false,
    desc: '15 marks assessment completed.',
  },
  {
    id: 'p1',
    name: 'Practical Examinations 1 (P-1)',
    dates: '21 Sep – 26 Sep 2026',
    type: 'Lab Assessment 1',
    status: 'Completed',
    statusColor: '#4EBA86',
    daysLeft: 'Done',
    suspended: false,
    desc: 'Lab code execution and viva evaluation completed.',
  },
];

export default function ExamScheduleScreen() {
  const navigation = useNavigation();

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
            <Text style={styles.headerTitle}>Exam Schedules</Text>
            <Text style={styles.headerSub}>JUET Academic Calendar 2026</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        <View style={styles.noticeCard}>
          <MaterialCommunityIcons name="information-outline" size={20} color="#C5BBED" style={{ marginRight: 10 }} />
          <Text style={styles.noticeText}>
            JUET Ordinance: A student must maintain at least <Text style={{ color: '#FFF', fontWeight: '800' }}>70% attendance</Text> in each registered course to appear in T-3 End-Sem.
          </Text>
        </View>

        <View style={styles.cardGroup}>
          {EXAMS_DATA.map((exam, index) => (
            <View
              key={exam.id}
              style={[
                styles.examRow,
                index < EXAMS_DATA.length - 1 && styles.examRowBorder,
              ]}
            >
              <View style={styles.examTopRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.examName}>{exam.name}</Text>
                  <Text style={styles.examDates}>{exam.dates}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 255, 255, 0.06)' }]}>
                  <Text style={[styles.statusText, { color: exam.statusColor }]}>
                    {exam.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.examDesc}>{exam.desc}</Text>

              {exam.suspended && (
                <View style={styles.suspendedTag}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color="#E5A93C" style={{ marginRight: 4 }} />
                  <Text style={styles.suspendedText}>Regular classes suspended</Text>
                </View>
              )}
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
  noticeCard: {
    backgroundColor: '#1E1B2E',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#D1D0D8',
    lineHeight: 18,
  },
  cardGroup: {
    backgroundColor: '#161622',
    borderRadius: 20,
    overflow: 'hidden',
  },
  examRow: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  examRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  examTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  examName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 3,
  },
  examDates: {
    fontSize: 13,
    color: '#C5BBED',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  examDesc: {
    fontSize: 12,
    color: '#8E8D9A',
    lineHeight: 17,
    marginTop: 2,
  },
  suspendedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(229, 169, 60, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  suspendedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E5A93C',
  },
});
