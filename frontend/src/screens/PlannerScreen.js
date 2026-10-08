import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PlannerScreen() {
  const { timetable, attendanceRecords, markClassAttendance, userBatch } = useUser();

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split('T')[0], [today]);
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayIndex = today.getDay();
  const defaultDay = currentDayIndex === 0 ? 'Mon' : daysShort[currentDayIndex];

  const [selectedDay, setSelectedDay] = useState(defaultDay);

  const dayClasses = useMemo(() => {
    if (!timetable || !Array.isArray(timetable)) return [];
    return timetable.filter((item) => item.day === selectedDay);
  }, [timetable, selectedDay]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B13" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Class Schedule</Text>
          <Text style={styles.headerSub}>Batch {userBatch || 'B31'} • JUET Timetable</Text>
        </View>
      </View>

      {/* Day Selector Pills */}
      <View style={styles.daysRow}>
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = daysShort[currentDayIndex] === day;

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayPill,
                isSelected && styles.dayPillActive,
                isToday && !isSelected && styles.dayPillToday,
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedDay(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.dayTextActive,
                  isToday && !isSelected && styles.dayTextToday,
                ]}
              >
                {day}
              </Text>
              {isToday && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Schedule List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {dayClasses.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={36} color="#686777" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>No classes scheduled</Text>
            <Text style={styles.emptySub}>Enjoy your day off!</Text>
          </View>
        ) : (
          <View style={styles.cardGroup}>
            {dayClasses.map((item, index) => {
              const isLab = item.isLab || item.sessionType === 'P';
              const currentStatus = attendanceRecords?.[item.subject]?.history?.[todayStr]?.[item.id];

              return (
                <View
                  key={item.id || index}
                  style={[
                    styles.classCard,
                    index < dayClasses.length - 1 && styles.classCardBorder,
                  ]}
                >
                  <View style={styles.classTopRow}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <View style={styles.badgeRow}>
                        <View style={[styles.typeBadge, isLab ? styles.labBadge : styles.theoryBadge]}>
                          <Text style={[styles.typeBadgeText, isLab ? styles.labBadgeText : styles.theoryBadgeText]}>
                            {isLab ? 'PRACTICAL • 2 HRS' : item.sessionType === 'T' ? 'TUTORIAL' : 'LECTURE'}
                          </Text>
                        </View>
                        {item.room ? (
                          <Text style={styles.roomText}>{item.room}</Text>
                        ) : null}
                      </View>

                      <Text style={styles.subjectTitle}>{item.subject}</Text>
                      <Text style={styles.timeText}>{item.time}</Text>
                    </View>

                    {currentStatus && (
                      <View
                        style={[
                          styles.statusBadge,
                          currentStatus === 'present' ? styles.statusBadgePresent : styles.statusBadgeAbsent,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            currentStatus === 'present' ? styles.statusBadgeTextPresent : styles.statusBadgeTextAbsent,
                          ]}
                        >
                          {currentStatus === 'present' ? 'Present' : 'Absent'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Minimal Marking Controls */}
                  <View style={styles.markingControlsRow}>
                    <TouchableOpacity
                      style={[
                        styles.markBtn,
                        currentStatus === 'present' && styles.markBtnPresentActive,
                      ]}
                      activeOpacity={0.8}
                      onPress={() =>
                        markClassAttendance(item.subject, todayStr, item.id, 'present', item.sessionType)
                      }
                    >
                      <MaterialCommunityIcons
                        name="check"
                        size={15}
                        color={currentStatus === 'present' ? '#FFF' : '#38D39F'}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.markBtnText,
                          currentStatus === 'present' && styles.markBtnTextActive,
                        ]}
                      >
                        Present
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.markBtn,
                        currentStatus === 'absent' && styles.markBtnAbsentActive,
                      ]}
                      activeOpacity={0.8}
                      onPress={() =>
                        markClassAttendance(item.subject, todayStr, item.id, 'absent', item.sessionType)
                      }
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={15}
                        color={currentStatus === 'absent' ? '#FFF' : '#FF5C5C'}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.markBtnText,
                          currentStatus === 'absent' && styles.markBtnTextActive,
                        ]}
                      >
                        Absent
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.markBtnCompact,
                        currentStatus === 'cancelled' && styles.markBtnOffActive,
                      ]}
                      activeOpacity={0.8}
                      onPress={() =>
                        markClassAttendance(item.subject, todayStr, item.id, 'cancelled', item.sessionType)
                      }
                    >
                      <Text
                        style={[
                          styles.markBtnCompactText,
                          currentStatus === 'cancelled' && styles.markBtnTextActive,
                        ]}
                      >
                        Off
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

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
    marginTop: 2,
  },
  daysRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  dayPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillActive: {
    backgroundColor: '#C5BBED',
  },
  dayPillToday: {
    borderWidth: 1,
    borderColor: 'rgba(197, 187, 237, 0.4)',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8D9A',
  },
  dayTextActive: {
    color: '#13111C',
    fontWeight: '900',
  },
  dayTextToday: {
    color: '#C5BBED',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C5BBED',
    marginTop: 3,
  },
  scrollList: {
    paddingHorizontal: 16,
  },
  cardGroup: {
    backgroundColor: '#161622',
    borderRadius: 20,
    overflow: 'hidden',
  },
  classCard: {
    padding: 16,
  },
  classCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  classTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  theoryBadge: {
    backgroundColor: 'rgba(197, 187, 237, 0.12)',
  },
  labBadge: {
    backgroundColor: 'rgba(56, 211, 159, 0.12)',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  theoryBadgeText: {
    color: '#C5BBED',
  },
  labBadgeText: {
    color: '#38D39F',
  },
  roomText: {
    fontSize: 11,
    color: '#8E8D9A',
    fontWeight: '600',
  },
  subjectTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#8E8D9A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgePresent: {
    backgroundColor: 'rgba(56, 211, 159, 0.16)',
  },
  statusBadgeAbsent: {
    backgroundColor: 'rgba(255, 92, 92, 0.16)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusBadgeTextPresent: {
    color: '#38D39F',
  },
  statusBadgeTextAbsent: {
    color: '#FF5C5C',
  },
  markingControlsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  markBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    borderRadius: 10,
  },
  markBtnPresentActive: {
    backgroundColor: '#38D39F',
  },
  markBtnAbsentActive: {
    backgroundColor: '#FF5C5C',
  },
  markBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D1D0D8',
  },
  markBtnTextActive: {
    color: '#FFF',
    fontWeight: '800',
  },
  markBtnCompact: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markBtnOffActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  markBtnCompactText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8D9A',
  },
  emptyCard: {
    backgroundColor: '#161622',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  emptySub: {
    fontSize: 12,
    color: '#8E8D9A',
    marginTop: 2,
  },
});
