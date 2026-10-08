import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useUser } from '../context/UserContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';
import CampusLynxSyncModal from '../components/CampusLynxSyncModal';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const {
    attendanceRecords,
    syncCampusLynxData,
  } = useUser();
  const [campusLynxModalVisible, setCampusLynxModalVisible] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Overall attendance status
  const { overallPercent, allClear, lowSubjectCount } = useMemo(() => {
    let attended = 0;
    let total = 0;
    let lowCount = 0;

    if (attendanceRecords) {
      Object.values(attendanceRecords).forEach((rec) => {
        const att = rec.attended || 0;
        const tot = rec.total || 0;
        attended += att;
        total += tot;
        if (tot > 0 && (att / tot) * 100 < 70) {
          lowCount++;
        }
      });
    }

    const pct = total > 0 ? (attended / total) * 100 : 0;
    return {
      overallPercent: pct,
      allClear: lowCount === 0,
      lowSubjectCount: lowCount,
    };
  }, [attendanceRecords]);

  const handleRefresh = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 700);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => signOut(auth).catch(() => {}),
      },
    ]);
  };

  const openGitHub = () => {
    Linking.openURL('https://github.com').catch(() => {});
  };

  const studentName = auth.currentUser?.displayName || 'Mohd Aasim Ansari';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B13" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ─── HEADER ──────────────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.studentNameText}>{studentName}</Text>
            <Text style={styles.syncedText}>Synced today</Text>
          </View>

          <TouchableOpacity
            style={styles.refreshCircleBtn}
            activeOpacity={0.8}
            onPress={handleRefresh}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={syncing ? COLORS.accent : '#9E9CAE'}
            />
          </TouchableOpacity>
        </View>

        {/* ─── HERO ATTENDANCE CARD ────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.heroAttendanceCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AttendanceList')}
        >
          <View style={styles.heroCardLeft}>
            <Text style={styles.heroAttendanceTitle}>Attendance</Text>
            <Text style={styles.heroAttendanceStatus}>
              {allClear ? 'All clear' : `${lowSubjectCount} subject${lowSubjectCount !== 1 ? 's' : ''} below 70%`}
            </Text>
          </View>

          <View style={styles.heroCardRight}>
            <View style={[styles.checkCircle, !allClear && styles.alertCircle]}>
              <MaterialCommunityIcons
                name={allClear ? 'check' : 'alert'}
                size={22}
                color={allClear ? '#C5BBED' : '#FFA502'}
              />
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#686777"
              style={{ marginLeft: 6 }}
            />
          </View>
        </TouchableOpacity>

        {/* ─── NAVIGATION CATEGORY CARDS STACK ─────────────────────────────── */}
        <View style={styles.navGroupCard}>
          {/* 1. Marks */}
          <TouchableOpacity
            style={styles.navRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Marks')}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="medal-outline" size={22} color="#A29BFE" />
            </View>
            <View style={styles.navRowTextContainer}>
              <Text style={styles.navRowTitle}>Marks</Text>
              <Text style={styles.navRowSubtitle}>7 subjects</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#555464" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 2. Exam Schedules */}
          <TouchableOpacity
            style={styles.navRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ExamSchedule')}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="calendar-month-outline" size={22} color="#A29BFE" />
            </View>
            <View style={styles.navRowTextContainer}>
              <Text style={styles.navRowTitle}>Exam schedules</Text>
              <Text style={styles.navRowSubtitle}>6 scheduled</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#555464" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 3. Faculty */}
          <TouchableOpacity
            style={styles.navRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Faculty')}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="account-group-outline" size={22} color="#A29BFE" />
            </View>
            <View style={styles.navRowTextContainer}>
              <Text style={styles.navRowTitle}>Faculty</Text>
              <Text style={styles.navRowSubtitle}>15 faculty</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#555464" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 4. Registered Subjects */}
          <TouchableOpacity
            style={styles.navRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('RegisteredSubjects')}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="book-open-outline" size={22} color="#A29BFE" />
            </View>
            <View style={styles.navRowTextContainer}>
              <Text style={styles.navRowTitle}>Registered subjects</Text>
              <Text style={styles.navRowSubtitle}>12 subjects</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#555464" />
          </TouchableOpacity>
        </View>

        {/* ─── FAST CAMPUSLYNX LIVE SYNC BUTTON ────────────────────────────── */}
        <TouchableOpacity
          style={styles.portalSyncPillBtn}
          activeOpacity={0.8}
          onPress={() => setCampusLynxModalVisible(true)}
        >
          <MaterialCommunityIcons name="cloud-sync-outline" size={16} color="#C5BBED" style={{ marginRight: 6 }} />
          <Text style={styles.portalSyncPillText}>Sync with CampusLynx Live</Text>
        </TouchableOpacity>

        {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerTagline}>free and open source, always</Text>

          <View style={styles.footerButtonsRow}>
            <TouchableOpacity
              style={styles.footerBtn}
              activeOpacity={0.8}
              onPress={openGitHub}
            >
              <MaterialCommunityIcons name="github" size={16} color="#D1D0D8" style={{ marginRight: 6 }} />
              <Text style={styles.footerBtnText}>GitHub</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerBtn}
              activeOpacity={0.8}
              onPress={handleLogout}
            >
              <MaterialCommunityIcons name="logout" size={16} color="#D1D0D8" style={{ marginRight: 6 }} />
              <Text style={styles.footerBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* CampusLynx Modal */}
      <CampusLynxSyncModal
        visible={campusLynxModalVisible}
        onClose={() => setCampusLynxModalVisible(false)}
        userUid={auth.currentUser?.uid}
        onSyncComplete={async (records) => {
          await syncCampusLynxData(records);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B13',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },
  studentNameText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.4,
  },
  syncedText: {
    fontSize: 13,
    color: '#7A7987',
    fontWeight: '500',
    marginTop: 3,
  },
  refreshCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero Card
  heroAttendanceCard: {
    backgroundColor: '#201F2B',
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroCardLeft: {
    flex: 1,
  },
  heroAttendanceTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  heroAttendanceStatus: {
    fontSize: 14,
    color: '#9E9CAE',
    fontWeight: '500',
  },
  heroCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2F2E3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertCircle: {
    backgroundColor: 'rgba(255, 165, 2, 0.15)',
  },

  // Nav Group Card
  navGroupCard: {
    backgroundColor: '#161622',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 20,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#252433',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  navRowTextContainer: {
    flex: 1,
  },
  navRowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  navRowSubtitle: {
    fontSize: 13,
    color: '#7E7D8E',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginLeft: 76,
  },

  // Portal Sync Pill
  portalSyncPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(197, 187, 237, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(197, 187, 237, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 40,
  },
  portalSyncPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C5BBED',
  },

  // Footer
  footerContainer: {
    alignItems: 'center',
  },
  footerTagline: {
    fontSize: 12,
    color: '#656475',
    fontWeight: '500',
    marginBottom: 16,
  },
  footerButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1924',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  footerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D1D0D8',
  },
});
