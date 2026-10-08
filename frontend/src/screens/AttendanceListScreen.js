import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';
import SubjectDetailModal from '../components/SubjectDetailModal';

export default function AttendanceListScreen() {
  const navigation = useNavigation();
  const { attendanceRecords, updateManualAttendance } = useUser();
  const [selectedSubjectData, setSelectedSubjectData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const subjectsList = useMemo(() => {
    if (!attendanceRecords) return [];
    return Object.entries(attendanceRecords).map(([name, rec]) => {
      const attended = Number(rec.attended || 0);
      const total = Number(rec.total || 0);
      const missed = Number(rec.missed || (total - attended) || 0);
      const percent = total > 0 ? (attended / total) * 100 : null;
      const isLab = name.toLowerCase().includes('lab') || rec.isLab;

      return {
        name,
        code: rec.code || (isLab ? 'LAB' : 'THEORY'),
        attended,
        total,
        missed,
        percent,
        isLab,
        history: rec.history || [],
      };
    });
  }, [attendanceRecords]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const getPercentColor = (percent) => {
    if (percent === null) return '#7B7A8A';
    if (percent === 100) return '#4EBA86';
    if (percent >= 85) return '#4EBA86';
    if (percent >= 75) return '#E5A93C'; // Amber warning
    return '#E74C3C'; // Red critical
  };

  const openSubjectModal = (item) => {
    setSelectedSubjectData(item);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B13" />

      {/* Top Bar Header */}
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
            <Text style={styles.headerTitle}>Attendance</Text>
            <Text style={styles.headerSub}>Synced today</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.refreshCircleBtn}
          activeOpacity={0.8}
          onPress={onRefresh}
        >
          <MaterialCommunityIcons name="refresh" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Subjects Attendance List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
          />
        }
      >
        <View style={styles.cardGroup}>
          {subjectsList.map((item, index) => {
            const hasClasses = item.total > 0;
            const percentColor = getPercentColor(item.percent);

            return (
              <TouchableOpacity
                key={item.name + index}
                style={[
                  styles.subjectRow,
                  index < subjectsList.length - 1 && styles.subjectRowBorder,
                ]}
                activeOpacity={0.7}
                onPress={() => openSubjectModal(item)}
              >
                <View style={styles.subjectLeft}>
                  <Text style={styles.subjectName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.subjectMeta}>
                    {item.code} · {hasClasses ? `${item.attended}/${item.total} classes` : 'No classes yet'}
                  </Text>
                </View>

                <View style={styles.subjectRight}>
                  <Text style={[styles.percentText, { color: percentColor }]}>
                    {hasClasses ? `${item.percent.toFixed(1)}%` : '--'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Subject Detail Bottom Sheet Modal */}
      <SubjectDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        subjectData={selectedSubjectData}
        onUpdateAttendance={updateManualAttendance}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B13',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshCircleBtn: {
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
  cardGroup: {
    backgroundColor: '#161622',
    borderRadius: 20,
    overflow: 'hidden',
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  subjectRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  subjectLeft: {
    flex: 1,
    paddingRight: 14,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  subjectMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8D9A',
  },
  subjectRight: {
    alignItems: 'flex-end',
  },
  percentText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
