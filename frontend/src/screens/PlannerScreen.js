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
  const { timetable, attendanceRecords, userBatch } = useUser();

  const today = useMemo(() => new Date(), []);
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
      <StatusBar barStyle="light-content" backgroundColor="#08080C" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Class Schedule</Text>
          <Text style={styles.headerSub}>Batch {userBatch || 'B31'} • JUET Timetable</Text>
        </View>
        <View style={styles.autoTag}>
          <MaterialCommunityIcons name="cloud-check-outline" size={14} color="#38D39F" style={{ marginRight: 4 }} />
          <Text style={styles.autoTagText}>Auto-Tracked</Text>
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
              const subjectRecord = attendanceRecords?.[item.subject];
              const pct = subjectRecord?.overallPercent != null
                ? subjectRecord.overallPercent
                : (subjectRecord?.total > 0 ? (subjectRecord.attended / subjectRecord.total) * 100 : null);

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
                          <View style={styles.roomBadge}>
                            <MaterialCommunityIcons name="map-marker-outline" size={11} color="#A29BFE" style={{ marginRight: 2 }} />
                            <Text style={styles.roomText}>{item.room}</Text>
                          </View>
                        ) : null}
                      </View>

                      <Text style={styles.subjectTitle}>{item.subject}</Text>
                      <View style={styles.timeRow}>
                        <MaterialCommunityIcons name="clock-outline" size={13} color="#8E8D9A" style={{ marginRight: 4 }} />
                        <Text style={styles.timeText}>{item.time}</Text>
                      </View>
                    </View>

                    {pct !== null && (
                      <View style={styles.percentBox}>
                        <Text style={[styles.percentValue, { color: pct >= 75 ? '#38D39F' : '#E5A93C' }]}>
                          {pct.toFixed(0)}%
                        </Text>
                        <Text style={styles.percentLabel}>standing</Text>
                      </View>
                    )}
                  </View>

                  {/* Automated Sync Status Bar */}
                  <View style={styles.autoStatusBar}>
                    <View style={styles.syncStatusLeft}>
                      <View style={styles.livePulseDot} />
                      <Text style={styles.syncStatusText}>
                        Portal Synced • {subjectRecord?.attended || 0}/{subjectRecord?.total || 0} classes
                      </Text>
                    </View>
                    <Text style={[styles.marginTag, { color: pct >= 75 ? '#38D39F' : '#FF5C5C' }]}>
                      {pct >= 75 ? 'Safe standing' : 'Low attendance'}
                    </Text>
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
    backgroundColor: '#08080C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 14,
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
  autoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 211, 159, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  autoTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38D39F',
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
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
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
    color: '#08080C',
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
    marginTop: 4,
  },
  scrollList: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  emptyCard: {
    backgroundColor: '#101016',
    borderRadius: 20,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#8E8D9A',
  },
  cardGroup: {
    backgroundColor: '#101017',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  theoryBadge: {
    backgroundColor: 'rgba(197, 187, 237, 0.12)',
  },
  labBadge: {
    backgroundColor: 'rgba(255, 142, 83, 0.14)',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  theoryBadgeText: {
    color: '#C5BBED',
  },
  labBadgeText: {
    color: '#FF8E53',
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roomText: {
    fontSize: 10,
    color: '#A29BFE',
    fontWeight: '700',
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8D9A',
  },
  percentBox: {
    alignItems: 'center',
    backgroundColor: '#161622',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  percentValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  percentLabel: {
    fontSize: 9,
    color: '#8E8D9A',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  autoStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  syncStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38D39F',
    marginRight: 6,
  },
  syncStatusText: {
    fontSize: 11,
    color: '#8E8D9A',
    fontWeight: '500',
  },
  marginTag: {
    fontSize: 11,
    fontWeight: '700',
  },
});
