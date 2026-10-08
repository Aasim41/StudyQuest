import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const NOTIFICATION_CATEGORIES = {
  CLASS_END: 'CLASS_END_ATTENDANCE',
  SMART_NUDGE: 'SMART_ENGAGEMENT_NUDGE',
};

export const NOTIFICATION_ACTIONS = {
  PRESENT: 'ACTION_PRESENT',
  ABSENT: 'ACTION_ABSENT',
  CANCELLED: 'ACTION_CANCELLED',
};

/**
 * Configure interactive notification categories with inline action buttons
 */
export async function setupNotificationCategories() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Class Attendance & Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00D2FF',
      });
    }

    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.CLASS_END, [
        {
          identifier: NOTIFICATION_ACTIONS.PRESENT,
          buttonTitle: '✅ Present (+25 XP)',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: NOTIFICATION_ACTIONS.ABSENT,
          buttonTitle: '❌ Absent',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: NOTIFICATION_ACTIONS.CANCELLED,
          buttonTitle: '🚫 Off',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
    }
  } catch (error) {
    console.warn('Failed to set notification categories:', error);
  }
}

/**
 * Parses end time string like '9:00 - 9:55 AM' or '11:00 - 12:55 PM' into { hour, minute } (24-hour)
 */
export function parseEndTime(timeStr) {
  try {
    if (!timeStr) return null;
    const parts = timeStr.split('-');
    if (parts.length < 2) return null;

    const endPart = parts[1].trim(); // e.g. "9:55 AM" or "12:55 PM"
    const isPM = endPart.toUpperCase().includes('PM');
    const isAM = endPart.toUpperCase().includes('AM');
    const cleanTime = endPart.replace(/[APMapm\s]/g, '');
    const [hStr, mStr] = cleanTime.split(':');
    let hour = parseInt(hStr, 10);
    const minute = parseInt(mStr, 10) || 0;

    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;

    return { hour, minute };
  } catch (e) {
    console.warn('Failed to parse end time:', timeStr, e);
    return null;
  }
}

/**
 * Schedule instant or timed notification as soon as each of today's classes concludes
 */
export async function scheduleClassEndNotifications(todaysClasses = [], todayStr) {
  try {
    // Cancel existing class end reminders
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content?.data?.type === 'class_end') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    const now = new Date();

    for (const item of todaysClasses) {
      const endTime = parseEndTime(item.time);
      if (!endTime) continue;

      const triggerDate = new Date();
      triggerDate.setHours(endTime.hour, endTime.minute, 0, 0);

      // Only schedule if class ends in the future today
      if (triggerDate.getTime() > now.getTime()) {
        const isLab = item.isLab || item.sessionType === 'P';
        const title = isLab
          ? `🧪 Lab Ended: ${item.subject}`
          : `🔔 Class Ended: ${item.subject}`;

        const body = `Room: ${item.room || 'Campus'} • Tap an option below to mark attendance directly.`;

        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            categoryIdentifier: NOTIFICATION_CATEGORIES.CLASS_END,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: {
              type: 'class_end',
              subject: item.subject,
              dateStr: todayStr,
              classId: item.id,
              room: item.room,
              isLab,
            },
          },
          trigger: triggerDate,
        });
      }
    }
  } catch (error) {
    console.warn('Error scheduling class end notifications:', error);
  }
}

/**
 * Smart periodic engagement & attendance safety notification system
 * Keeps the user active, aware of detention risks, and protects their streak
 */
export async function scheduleSmartEngagementNotifications({
  timetable = [],
  attendanceRecords = {},
  userStats = {},
  userBatch = 'B31',
}) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content?.data?.type === 'smart_engagement') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    // 1. Morning Routine Brief (Daily at 8:15 AM)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `☀️ Morning JUET Briefing • Batch ${userBatch}`,
        body: `Ready for today's classes? Track your lectures & labs to maintain your safe 75% threshold.`,
        sound: true,
        data: { type: 'smart_engagement', subType: 'morning_brief' },
      },
      trigger: {
        hour: 8,
        minute: 15,
        repeats: true,
      },
    });

    // 2. Evening Streak Protector & Attendance Audit (Daily at 7:30 PM)
    const streak = userStats.streak || 0;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔥 Don't Break Your ${streak}-Day Streak!`,
        body: `Make sure all today's attendance is logged. Every marked present gives +25 XP!`,
        sound: true,
        data: { type: 'smart_engagement', subType: 'evening_streak' },
      },
      trigger: {
        hour: 19,
        minute: 30,
        repeats: true,
      },
    });

    // 3. Critical Detention Risk Scan (Daily at 2:00 PM)
    // Check if any subject has attendance < 75% or within 1 bunk of falling below
    let criticalSubject = null;
    let criticalPercent = 100;

    Object.entries(attendanceRecords).forEach(([subj, rec]) => {
      if (rec.total > 0) {
        const pct = (rec.attended / rec.total) * 100;
        if (pct < 75 && pct < criticalPercent) {
          criticalPercent = pct;
          criticalSubject = subj;
        }
      }
    });

    if (criticalSubject) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⚠️ Safe Threshold Watch: ${criticalSubject}`,
          body: `Current attendance is ${criticalPercent.toFixed(0)}%. Avoid bunks in this subject to stay safe from T-3 detention.`,
          sound: true,
          data: { type: 'smart_engagement', subType: 'detention_warning' },
        },
        trigger: {
          hour: 14,
          minute: 0,
          repeats: true,
        },
      });
    }

    // 4. Sunday Night Preview (Sunday at 7:00 PM)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `📅 Week Ahead Starting Tomorrow!`,
        body: `Classes start at 9:00 AM on Monday. Check your schedule and safe bunk margins in StudyQuest.`,
        sound: true,
        data: { type: 'smart_engagement', subType: 'sunday_preview' },
      },
      trigger: {
        weekday: 1, // Sunday in expo-notifications
        hour: 19,
        minute: 0,
        repeats: true,
      },
    });
  } catch (error) {
    console.warn('Error scheduling smart engagement notifications:', error);
  }
}

/**
 * Test trigger an immediate sample class-end notification with actionable buttons
 */
export async function testTriggerClassEndNotification(subject = 'Database Systems (DBMS)', room = 'LT1') {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔔 Class Ended: ${subject}`,
        body: `Session in ${room} just concluded. Tap an action below to mark your attendance!`,
        categoryIdentifier: NOTIFICATION_CATEGORIES.CLASS_END,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: {
          type: 'class_end',
          subject,
          dateStr: new Date().toISOString().split('T')[0],
          classId: `test-${Date.now()}`,
          room,
        },
      },
      trigger: null, // triggers immediately
    });
  } catch (e) {
    console.warn('Failed to test trigger notification', e);
  }
}
