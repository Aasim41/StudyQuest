import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import API_BASE from '../config/apiConfig';
import {
  filterTimetableForBatch,
  getDistinctSubjectsForBatch,
  ALL_BATCHES,
  BATCH_GROUPS,
} from '../config/masterTimetable';
import {
  setupNotificationCategories,
  NOTIFICATION_ACTIONS,
  scheduleSmartEngagementNotifications,
  testTriggerClassEndNotification,
} from '../services/notificationService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Real initial JUET CampusLynx records for B31 (synced from portal)
export const JUET_REAL_PORTAL_ATTENDANCE = {
  'Techniques for Decision Making (TDM)': {
    attendedL: 17, totalL: 20, percentL: 85.0,
    attendedT: 7, totalT: 10, percentT: 70.0,
    attendedP: 0, totalP: 0, percentP: 0,
    attended: 24, total: 30, missed: 6,
    overallPercent: 80.0,
    history: {}
  },
  'Data Structures (DS)': {
    attendedL: 23, totalL: 27, percentL: 85.2,
    attendedT: 10, totalT: 10, percentT: 100.0,
    attendedP: 0, totalP: 0, percentP: 0,
    attended: 33, total: 37, missed: 4,
    overallPercent: 89.2,
    history: {}
  },
  'Database Systems (DBMS)': {
    attendedL: 14, totalL: 17, percentL: 82.4,
    attendedT: 6, totalT: 8, percentT: 75.0,
    attendedP: 0, totalP: 0, percentP: 0,
    attended: 20, total: 25, missed: 5,
    overallPercent: 80.0,
    history: {}
  },
  'Career Management & Development (CMD)': {
    attendedL: 16, totalL: 18, percentL: 88.9,
    attendedT: 0, totalT: 0, percentT: 0,
    attendedP: 0, totalP: 0, percentP: 0,
    attended: 16, total: 18, missed: 2,
    overallPercent: 88.9,
    history: {}
  },
  'Environmental Science (EVS)': {
    attendedL: 12, totalL: 16, percentL: 75.0,
    attendedT: 0, totalT: 0, percentT: 0,
    attendedP: 0, totalP: 0, percentP: 0,
    attended: 12, total: 16, missed: 4,
    overallPercent: 75.0,
    history: {}
  },
  'Statistical Methods (SM)': {
    attendedL: 26, totalL: 29, percentL: 89.7,
    attendedT: 0, totalT: 0, percentT: 0,
    attendedP: 0, totalP: 0, percentP: 0,
    attended: 26, total: 29, missed: 3,
    overallPercent: 89.7,
    history: {}
  },
  'Data Structures Lab (DS Lab)': {
    attendedL: 0, totalL: 0, percentL: 0,
    attendedT: 0, totalT: 0, percentT: 0,
    attendedP: 9, totalP: 9, percentP: 100.0,
    attended: 9, total: 9, missed: 0,
    overallPercent: 100.0,
    history: {}
  },
  'Database Systems Lab (DBMS Lab)': {
    attendedL: 0, totalL: 0, percentL: 0,
    attendedT: 0, totalT: 0, percentT: 0,
    attendedP: 7, totalP: 9, percentP: 77.8,
    attended: 7, total: 9, missed: 2,
    overallPercent: 77.8,
    history: {}
  },
  'Advanced Programming Lab-1 (AP Lab-1)': {
    attendedL: 0, totalL: 0, percentL: 0,
    attendedT: 0, totalT: 0, percentT: 0,
    attendedP: 7, totalP: 9, percentP: 77.8,
    attended: 7, total: 9, missed: 2,
    overallPercent: 77.8,
    history: {}
  },
  'Statistical Methods Lab (SM Lab)': {
    attendedL: 0, totalL: 0, percentL: 0,
    attendedT: 0, totalT: 0, percentT: 0,
    attendedP: 8, totalP: 9, percentP: 88.9,
    attended: 8, total: 9, missed: 1,
    overallPercent: 88.9,
    history: {}
  },
  'Unix Programming Lab (UNIX Lab)': {
    attendedL: 0, totalL: 0, percentL: 0,
    attendedT: 0, totalT: 0, percentT: 0,
    attendedP: 8, totalP: 9, percentP: 88.9,
    attended: 8, total: 9, missed: 1,
    overallPercent: 88.9,
    history: {}
  }
};

// Helper to match CampusLynx raw subject codes with StudyQuest subjects
export function matchCampusLynxSubject(rawString, targetSubjectName) {
  if (!rawString || !targetSubjectName) return false;
  const raw = rawString.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const target = targetSubjectName.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (raw.includes(target) || target.includes(raw)) return true;

  const codes = ['HS103', 'CS103', 'CS104', 'CS203', 'CS204', 'CS206', 'CS115', 'CS221', 'HS007', 'GE001', 'CS110', 'CS116', 'CS216'];
  for (const c of codes) {
    if (raw.includes(c) && target.includes(c)) return true;
  }

  if (raw.includes('DECISION') && target.includes('DECISION')) return true;
  if (raw.includes('CAREER') && target.includes('CAREER')) return true;
  if (raw.includes('ENVIRONMENT') && target.includes('ENVIRONMENT')) return true;
  if (raw.includes('STATISTICAL') && target.includes('STATISTICAL')) {
    const isRawLab = raw.includes('LAB') || raw.includes('CS221');
    const isTargetLab = target.includes('LAB');
    return isRawLab === isTargetLab;
  }
  if (raw.includes('DATASTRUCTURE') && target.includes('DATASTRUCTURE')) {
    const isRawLab = raw.includes('LAB') || raw.includes('CS203');
    const isTargetLab = target.includes('LAB');
    return isRawLab === isTargetLab;
  }
  if (raw.includes('DATABASESYSTEM') && target.includes('DATABASESYSTEM')) {
    const isRawLab = raw.includes('LAB') || raw.includes('CS204');
    const isTargetLab = target.includes('LAB');
    return isRawLab === isTargetLab;
  }
  if (raw.includes('COMPUTATION') && target.includes('COMPUTATION')) return true;
  if (raw.includes('ADVANCEDPROGRAMMING') && target.includes('ADVANCEDPROGRAMMING')) return true;
  if (raw.includes('UNIX') && target.includes('UNIX')) return true;
  if (raw.includes('AI') && target.includes('AI')) {
    const isRawLab = raw.includes('LAB');
    const isTargetLab = target.includes('LAB');
    return isRawLab === isTargetLab;
  }

  return false;
}

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userStats, setUserStats] = useState({ 
    level: 1, xp: 0, nextLevelXp: 1000, streak: 0, 
    lastStudyDate: null, avatarUrl: null, unlockedBadges: [], studyMinutesPerSubject: {} 
  });
  const [userBatch, setUserBatchState] = useState('B31');
  const [studyPlan, setStudyPlan] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [savedVideos, setSavedVideos] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  const generateScheduleInBackground = async () => {
    setIsGeneratingSchedule(true);
    setGenerationError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const calendarStr = await AsyncStorage.getItem('@onboarding_calendar');
      const syllabusStr = await AsyncStorage.getItem('@onboarding_syllabus');
      const timetableStr = await AsyncStorage.getItem('@onboarding_timetable');
      
      const payload = {
        timetable: timetableStr ? JSON.parse(timetableStr) : [],
        calendar: calendarStr ? JSON.parse(calendarStr) : [],
        syllabus: syllabusStr ? JSON.parse(syllabusStr) : []
      };

      const res = await fetch(`${API_BASE}/api/schedule/merge/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (result.success && result.studyPlan && result.studyPlan.length > 0) {
        const plan = result.studyPlan.map((item, index) => ({
          ...item,
          id: item.id || `bg-gen-${Date.now()}-${index}`,
          completed: item.completed || false,
          color: item.color || ['#FF6B35', '#4A90D9', '#2ECC71', '#A29BFE'][index % 4],
        }));
        await updateStudyPlan(plan);
        
        // Schedule background notifications for the sessions
        scheduleStudyNotifications(plan);
      } else {
        setGenerationError(result.error || 'The AI returned an empty schedule. Please try regenerating.');
        console.warn('Background generation failed', result.error);
      }
    } catch (err) {
      setGenerationError(err.message || 'Network error while generating schedule.');
      console.warn('Background generation error:', err);
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const complete = await AsyncStorage.getItem('@onboardingComplete');
        if (complete === 'true') {
          setOnboardingComplete(true);
        }
      } catch (e) {
        console.warn('Error reading onboarding status', e);
      } finally {
        setLoading(false);
      }
    };
    init();
    
    // Request notification permissions and register interactive categories
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }
      await setupNotificationCategories();
    };
    setupNotifications();

    // Listen for direct interactive actions tapped on notification shade (Present / Absent / Off)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      try {
        const actionId = response.actionIdentifier;
        const data = response.notification?.request?.content?.data;
        if (!data || data.type !== 'class_end') return;

        const { subject, dateStr, classId } = data;
        if (!subject || !classId) return;

        if (actionId === NOTIFICATION_ACTIONS.PRESENT) {
          markClassAttendance(subject, dateStr, classId, 'present');
        } else if (actionId === NOTIFICATION_ACTIONS.ABSENT) {
          markClassAttendance(subject, dateStr, classId, 'absent');
        } else if (actionId === NOTIFICATION_ACTIONS.CANCELLED) {
          markClassAttendance(subject, dateStr, classId, 'cancelled');
        }
      } catch (err) {
        console.warn('Error processing notification response action:', err);
      }
    });

    return () => {
      responseSubscription.remove();
    };
  }, []);

  const scheduleStudyNotifications = async (plan) => {
    // Cancel all previously scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    plan.forEach((session, index) => {
      // In a real app we'd parse the session.date / session.time correctly.
      // For this demo, we'll just stagger them by a few seconds for testing 
      // or assume they are hours away.
      // Here we schedule a dummy notification 10 seconds from now for the first session, 
      // just to prove it works in the background.
      Notifications.scheduleNotificationAsync({
        content: {
          title: `Time to study: ${session.subject} 📚`,
          body: session.topic || "Open StudyQuest to begin your focus timer!",
          sound: true,
        },
        trigger: { seconds: 10 + (index * 5) },
      });
    });
  };

  const completeOnboarding = async () => {
    try {
      // Set UI state IMMEDIATELY so navigation happens instantly
      setOnboardingComplete(true);
      // Fire-and-forget storage so it doesn't block the UI
      AsyncStorage.setItem('@onboardingComplete', 'true').catch(e => console.warn('Failed to save onboarding complete', e));
      // Also persist to Firestore so it survives reinstalls
      if (auth.currentUser) {
        setDoc(doc(db, 'users', auth.currentUser.uid), { onboardingComplete: true }, { merge: true }).catch(e => console.warn('Failed to save onboarding to Firestore', e));
      }
    } catch (e) {
      console.warn('Failed to set onboarding complete', e);
    }
  };

  // Student Data Isolation: Partition local storage keys by Firebase User UID
  const getScopedItem = async (baseKey) => {
    try {
      const uid = auth.currentUser?.uid;
      if (uid) {
        const val = await AsyncStorage.getItem(`${baseKey}_${uid}`);
        if (val !== null) return val;
      }
      return await AsyncStorage.getItem(baseKey);
    } catch (e) {
      return null;
    }
  };

  const setScopedItem = async (baseKey, value) => {
    try {
      const uid = auth.currentUser?.uid;
      if (uid) {
        await AsyncStorage.setItem(`${baseKey}_${uid}`, value);
      } else {
        await AsyncStorage.setItem(baseKey, value);
      }
    } catch (e) {
      console.warn(`Failed to set scoped item ${baseKey}`, e);
    }
  };

  const loadLocalStudyPlan = async () => {
    try {
      const planStr = await getScopedItem('@studyPlan');
      if (planStr) {
        setStudyPlan(JSON.parse(planStr));
      }

      const batchStr = await getScopedItem('@userBatch');
      const activeBatch = batchStr || 'B31';
      setUserBatchState(activeBatch);

      const timetableStr = await getScopedItem('@timetable');
      if (timetableStr) {
        setTimetable(JSON.parse(timetableStr));
      } else {
        const initialTt = filterTimetableForBatch(activeBatch);
        setTimetable(initialTt);
        setScopedItem('@timetable', JSON.stringify(initialTt)).catch(() => {});
      }

      const attendanceStr = await getScopedItem('@attendanceRecords');
      if (attendanceStr) {
        const parsed = JSON.parse(attendanceStr);
        // If B31 and not initialized with real LTP data, merge real portal data
        if (activeBatch === 'B31') {
          const hasRealData = Object.values(parsed).some(r => (r.total || 0) > 0);
          if (!hasRealData) {
            setAttendanceRecords(JUET_REAL_PORTAL_ATTENDANCE);
            setScopedItem('@attendanceRecords', JSON.stringify(JUET_REAL_PORTAL_ATTENDANCE)).catch(() => {});
          } else {
            setAttendanceRecords(parsed);
          }
        } else {
          setAttendanceRecords(parsed);
        }
      } else {
        const initialTt = filterTimetableForBatch(activeBatch);
        const initialRecords = activeBatch === 'B31' ? { ...JUET_REAL_PORTAL_ATTENDANCE } : {};
        initialTt.forEach(item => {
          if (item.subject && !initialRecords[item.subject]) {
            initialRecords[item.subject] = {
              attended: 0, missed: 0, total: 0,
              attendedL: 0, totalL: 0,
              attendedT: 0, totalT: 0,
              attendedP: 0, totalP: 0,
              percentL: 0, percentT: 0, percentP: 0, overallPercent: 0,
              history: {}
            };
          }
        });
        setAttendanceRecords(initialRecords);
        setScopedItem('@attendanceRecords', JSON.stringify(initialRecords)).catch(() => {});
      }
      
      const videosStr = await getScopedItem('@savedVideos');
      if (videosStr) {
        setSavedVideos(JSON.parse(videosStr));
      }

      const historyStr = await getScopedItem('@watchHistory');
      if (historyStr) {
        setWatchHistory(JSON.parse(historyStr));
      }
    } catch (e) {
      console.warn('Failed to load local data', e);
    }
  };

  const loadFirestoreStats = async () => {
    if (!auth.currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.userBatch) {
          setUserBatchState(data.userBatch);
          setScopedItem('@userBatch', data.userBatch).catch(() => {});
        }

        setUserStats({
          level: data.level || 1,
          xp: data.xp || 0,
          nextLevelXp: data.nextLevelXp || 1000,
          streak: data.streak || 0,
          lastStudyDate: data.lastStudyDate || null,
          userType: data.userType || null,
          institute: data.institute || null,
          avatarUrl: data.avatarUrl || null,
          unlockedBadges: data.unlockedBadges || [],
          studyMinutesPerSubject: data.studyMinutesPerSubject || {},
        });

        if (data.timetable && Array.isArray(data.timetable)) {
          setTimetable(data.timetable);
          setScopedItem('@timetable', JSON.stringify(data.timetable)).catch(() => {});
        } else {
          const initialTt = filterTimetableForBatch(data.userBatch || 'B31');
          setTimetable(initialTt);
        }

        if (data.attendanceRecords && typeof data.attendanceRecords === 'object') {
          setAttendanceRecords(data.attendanceRecords);
          setScopedItem('@attendanceRecords', JSON.stringify(data.attendanceRecords)).catch(() => {});
        }

        // Sync onboarding flag from Firestore (survives reinstalls)
        // Also treat having an avatarUrl as proof that onboarding was completed
        // (covers the case where the flag wasn't saved due to a crash)
        if (data.onboardingComplete || data.avatarUrl) {
          setOnboardingComplete(true);
          AsyncStorage.setItem('@onboardingComplete', 'true').catch(() => {});
          // Also persist the flag to Firestore if it was missing
          if (!data.onboardingComplete && data.avatarUrl) {
            setDoc(doc(db, 'users', auth.currentUser.uid), { onboardingComplete: true }, { merge: true }).catch(() => {});
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load firestore stats', e);
    }
  };

  const switchBatch = async (newBatch) => {
    try {
      setUserBatchState(newBatch);
      await setScopedItem('@userBatch', newBatch);
      if (auth.currentUser) {
        setDoc(doc(db, 'users', auth.currentUser.uid), { userBatch: newBatch }, { merge: true }).catch(() => {});
      }
      const newTimetable = filterTimetableForBatch(newBatch);
      await saveTimetable(newTimetable);
    } catch (e) {
      console.warn('Failed to switch batch', e);
    }
  };

  const updateStudyPlan = async (newPlan) => {
    setStudyPlan(newPlan);
    try {
      setScopedItem('@studyPlan', JSON.stringify(newPlan)).catch(e => console.warn('Failed to save study plan locally', e));
    } catch (e) {
      console.warn('Failed to save study plan locally', e);
    }
  };

  const saveTimetable = async (newTimetable) => {
    setTimetable(newTimetable);
    try {
      await setScopedItem('@timetable', JSON.stringify(newTimetable));
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { timetable: newTimetable }, { merge: true });
      }

      // Auto-initialize subjects in attendanceRecords if not present
      const currentRecords = { ...attendanceRecords };
      const uniqueSubjects = [...new Set(newTimetable.map(item => item.subject).filter(Boolean))];
      let updated = false;
      uniqueSubjects.forEach(sub => {
        if (!currentRecords[sub]) {
          currentRecords[sub] = { attended: 0, missed: 0, total: 0, history: {} };
          updated = true;
        }
      });
      if (updated) {
        setAttendanceRecords(currentRecords);
        await setScopedItem('@attendanceRecords', JSON.stringify(currentRecords));
        if (auth.currentUser) {
          await setDoc(doc(db, 'users', auth.currentUser.uid), { attendanceRecords: currentRecords }, { merge: true });
        }
      }
    } catch (e) {
      console.warn('Failed to save timetable', e);
    }
  };

  const markClassAttendance = async (subject, dateStr, classId, status, sessionType) => {
    const currentRecords = { ...attendanceRecords };
    const subRecord = currentRecords[subject] || {
      attended: 0, missed: 0, total: 0,
      attendedL: 0, totalL: 0,
      attendedT: 0, totalT: 0,
      attendedP: 0, totalP: 0,
      history: {}
    };
    const history = { ...(subRecord.history || {}) };
    const prevStatus = history[dateStr]?.[classId];

    if (prevStatus === status) return;

    // Detect session type (L, T, P)
    let stype = sessionType;
    if (!stype) {
      if (classId?.includes('-T-') || classId?.includes('-tutorial-')) stype = 'T';
      else if (classId?.includes('-P-') || classId?.includes('-practical-') || subject.toLowerCase().includes('lab')) stype = 'P';
      else stype = 'L';
    }

    let attended = subRecord.attended || 0;
    let missed = subRecord.missed || 0;
    let total = subRecord.total || 0;

    let attendedL = subRecord.attendedL || 0;
    let totalL = subRecord.totalL || 0;
    let attendedT = subRecord.attendedT || 0;
    let totalT = subRecord.totalT || 0;
    let attendedP = subRecord.attendedP || 0;
    let totalP = subRecord.totalP || 0;

    if (prevStatus === 'present') {
      attended = Math.max(0, attended - 1);
      total = Math.max(0, total - 1);
      if (stype === 'T') { attendedT = Math.max(0, attendedT - 1); totalT = Math.max(0, totalT - 1); }
      else if (stype === 'P') { attendedP = Math.max(0, attendedP - 1); totalP = Math.max(0, totalP - 1); }
      else { attendedL = Math.max(0, attendedL - 1); totalL = Math.max(0, totalL - 1); }
    } else if (prevStatus === 'absent') {
      missed = Math.max(0, missed - 1);
      total = Math.max(0, total - 1);
      if (stype === 'T') { totalT = Math.max(0, totalT - 1); }
      else if (stype === 'P') { totalP = Math.max(0, totalP - 1); }
      else { totalL = Math.max(0, totalL - 1); }
    }

    if (status === 'present') {
      attended += 1;
      total += 1;
      if (stype === 'T') { attendedT += 1; totalT += 1; }
      else if (stype === 'P') { attendedP += 1; totalP += 1; }
      else { attendedL += 1; totalL += 1; }
    } else if (status === 'absent') {
      missed += 1;
      total += 1;
      if (stype === 'T') { totalT += 1; }
      else if (stype === 'P') { totalP += 1; }
      else { totalL += 1; }
    }

    if (!history[dateStr]) history[dateStr] = {};
    if (status === 'unmarked') {
      delete history[dateStr][classId];
    } else {
      history[dateStr][classId] = status;
    }

    const percentL = totalL > 0 ? (attendedL / totalL) * 100 : 0;
    const percentT = totalT > 0 ? (attendedT / totalT) * 100 : 0;
    const percentP = totalP > 0 ? (attendedP / totalP) * 100 : 0;
    const overallPercent = total > 0 ? (attended / total) * 100 : 0;

    currentRecords[subject] = {
      ...subRecord,
      attended,
      missed,
      total,
      attendedL,
      totalL,
      attendedT,
      totalT,
      attendedP,
      totalP,
      percentL,
      percentT,
      percentP,
      overallPercent,
      history
    };

    setAttendanceRecords(currentRecords);

    // XP Reward for attending
    if (status === 'present') {
      let newXp = (userStats.xp || 0) + 25;
      let newLevel = userStats.level || 1;
      let nextLevelXp = userStats.nextLevelXp || 1000;
      if (newXp >= nextLevelXp) {
        newLevel += 1;
        newXp = newXp - nextLevelXp;
        nextLevelXp = Math.floor(nextLevelXp * 1.5);
      }
      const newStats = { ...userStats, xp: newXp, level: newLevel, nextLevelXp };
      saveStatsToFirestore(newStats);
    }

    try {
      await setScopedItem('@attendanceRecords', JSON.stringify(currentRecords));
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { attendanceRecords: currentRecords }, { merge: true });
      }
    } catch (e) {
      console.warn('Failed to save attendance records', e);
    }
  };

  const updateManualAttendance = async (subject, manualAttended, manualTotal) => {
    const currentRecords = { ...attendanceRecords };
    const subRecord = currentRecords[subject] || { history: {} };
    const attended = Math.max(0, parseInt(manualAttended) || 0);
    const total = Math.max(attended, parseInt(manualTotal) || 0);
    const missed = total - attended;

    currentRecords[subject] = {
      ...subRecord,
      attended,
      missed,
      total,
      history: subRecord.history || {}
    };

    setAttendanceRecords(currentRecords);
    try {
      await setScopedItem('@attendanceRecords', JSON.stringify(currentRecords));
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { attendanceRecords: currentRecords }, { merge: true });
      }
    } catch (e) {
      console.warn('Failed to update manual attendance', e);
    }
  };

  const syncCampusLynxData = async (scrapedRecords) => {
    if (!scrapedRecords || !Array.isArray(scrapedRecords) || scrapedRecords.length === 0) return 0;

    const currentRecords = { ...attendanceRecords };
    let matchedCount = 0;
    const currentSubjects = Object.keys(currentRecords);

    scrapedRecords.forEach(item => {
      const raw = item.rawSubject || '';
      const matchedSubj = currentSubjects.find(subj => matchCampusLynxSubject(raw, subj));

      if (matchedSubj) {
        matchedCount++;
        const prev = currentRecords[matchedSubj] || {};
        const isLab = matchedSubj.toLowerCase().includes('lab');

        let totalL = prev.totalL || 0;
        let attendedL = prev.attendedL || 0;
        let totalT = prev.totalT || 0;
        let attendedT = prev.attendedT || 0;
        let totalP = prev.totalP || 0;
        let attendedP = prev.attendedP || 0;

        if (isLab) {
          totalP = prev.totalP || 9;
          attendedP = item.currentP != null ? Math.round((totalP * item.currentP) / 100) : (prev.attendedP || 7);
        } else {
          if (item.currentL != null) {
            totalL = prev.totalL || 20;
            attendedL = Math.round((totalL * item.currentL) / 100);
          }
          if (item.currentT != null) {
            totalT = prev.totalT || 10;
            attendedT = Math.round((totalT * item.currentT) / 100);
          }
        }

        const attended = isLab ? attendedP : (attendedL + attendedT);
        const total = isLab ? totalP : (totalL + totalT);
        const missed = Math.max(0, total - attended);

        currentRecords[matchedSubj] = {
          ...prev,
          attended,
          total,
          missed,
          attendedL,
          totalL,
          attendedT,
          totalT,
          attendedP,
          totalP,
          percentL: item.currentL,
          percentT: item.currentT,
          percentP: item.currentP,
          overallPercent: item.overallLTP != null ? item.overallLTP : (total > 0 ? (attended / total) * 100 : 0),
          lastSyncedAt: new Date().toISOString(),
        };
      }
    });

    setAttendanceRecords(currentRecords);

    // Award +50 XP bonus for syncing portal attendance
    let newXp = (userStats.xp || 0) + 50;
    let newLevel = userStats.level || 1;
    let nextLevelXp = userStats.nextLevelXp || 1000;
    if (newXp >= nextLevelXp) {
      newLevel += 1;
      newXp = newXp - nextLevelXp;
      nextLevelXp = Math.floor(nextLevelXp * 1.5);
    }
    const newStats = { ...userStats, xp: newXp, level: newLevel, nextLevelXp };
    saveStatsToFirestore(newStats);

    try {
      await setScopedItem('@attendanceRecords', JSON.stringify(currentRecords));
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { attendanceRecords: currentRecords }, { merge: true });
      }
    } catch (e) {
      console.warn('Failed to save synced attendance records', e);
    }

    return matchedCount;
  };

  const saveStatsToFirestore = async (newStats) => {
    setUserStats(newStats);
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), newStats, { merge: true });
    } catch (e) {
      console.warn('Failed to sync stats to firestore', e);
    }
  };

  const saveVideo = async (video) => {
    const newVideos = [...savedVideos, video];
    setSavedVideos(newVideos);
    try {
      await setScopedItem('@savedVideos', JSON.stringify(newVideos));
    } catch (e) {
      console.warn('Failed to save video locally', e);
    }
  };

  const removeVideo = async (videoId) => {
    const newVideos = savedVideos.filter(v => v.videoId !== videoId);
    setSavedVideos(newVideos);
    try {
      await setScopedItem('@savedVideos', JSON.stringify(newVideos));
    } catch (e) {
      console.warn('Failed to remove video locally', e);
    }
  };

  const addToWatchHistory = async (title) => {
    if (!title) return;
    // Keep last 15 items, prevent immediate duplicates
    const newHistory = [title, ...watchHistory.filter(t => t !== title)].slice(0, 15);
    setWatchHistory(newHistory);
    try {
      await setScopedItem('@watchHistory', JSON.stringify(newHistory));
    } catch (e) {
      console.warn('Failed to save watch history locally', e);
    }
  };

  const BADGE_DEFINITIONS = {
    first_focus: { id: 'first_focus', name: 'Focus Novice', icon: '🎯', description: 'Complete your first Focus Session' },
    marathon: { id: 'marathon', name: 'Marathoner', icon: '🏃', description: 'Study for 2 hours in a row' },
    night_owl: { id: 'night_owl', name: 'Night Owl', icon: '🦉', description: 'Study past 10 PM' },
    streak_3: { id: 'streak_3', name: 'Hot Streak', icon: '🔥', description: 'Achieve a 3-day streak' },
    early_bird: { id: 'early_bird', name: 'Early Bird', icon: '🌅', description: 'Study before 8 AM' }
  };

  const unlockBadge = async (badgeId) => {
    const currentBadges = userStats.unlockedBadges || [];
    if (!currentBadges.includes(badgeId) && BADGE_DEFINITIONS[badgeId]) {
      const newBadges = [...currentBadges, badgeId];
      const newStats = { ...userStats, unlockedBadges: newBadges };
      setUserStats(newStats);
      
      // Update Firestore
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'users', auth.currentUser.uid), { unlockedBadges: newBadges }, { merge: true });
        } catch (e) {
          console.warn('Failed to unlock badge', e);
        }
      }
      return BADGE_DEFINITIONS[badgeId]; // Return badge so UI can show a toast
    }
    return null;
  };

  const logStudySession = async (subject, durationMinutes) => {
    const xpGained = durationMinutes * 10;
    const newXp = userStats.xp + xpGained;
    let newLevel = userStats.level;
    let nextLevelXp = userStats.nextLevelXp;
    let leveledUp = false;

    if (newXp >= nextLevelXp) {
      newLevel += 1;
      nextLevelXp = Math.floor(nextLevelXp * 1.5);
      leveledUp = true;
    }

    const currentSubjectMinutes = userStats.studyMinutesPerSubject?.[subject] || 0;
    
    const newStats = {
      ...userStats,
      xp: newXp,
      level: newLevel,
      nextLevelXp: nextLevelXp,
      studyMinutesPerSubject: {
        ...(userStats.studyMinutesPerSubject || {}),
        [subject]: currentSubjectMinutes + durationMinutes
      }
    };

    setUserStats(newStats);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), newStats, { merge: true });
      } catch (e) {
        console.warn('Failed to save study session stats', e);
      }
    }

    // Check Badges
    const unlocked = [];
    if (!userStats.unlockedBadges?.includes('first_focus')) {
      const b = await unlockBadge('first_focus');
      if (b) unlocked.push(b);
    }
    if (durationMinutes >= 120 && !userStats.unlockedBadges?.includes('marathon')) {
      const b = await unlockBadge('marathon');
      if (b) unlocked.push(b);
    }
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 3) {
      if (!userStats.unlockedBadges?.includes('night_owl')) {
        const b = await unlockBadge('night_owl');
        if (b) unlocked.push(b);
      }
    }
    if (hour >= 5 && hour <= 8) {
      if (!userStats.unlockedBadges?.includes('early_bird')) {
        const b = await unlockBadge('early_bird');
        if (b) unlocked.push(b);
      }
    }

    return { leveledUp, newLevel, unlockedBadges: unlocked, xpGained };
  };

  return (
    <UserContext.Provider value={{
      onboardingComplete,
      completeOnboarding,
      loading,
      userStats,
      loadFirestoreStats,
      saveStatsToFirestore,
      userBatch,
      switchBatch,
      ALL_BATCHES,
      BATCH_GROUPS,
      getDistinctSubjectsForBatch,
      filterTimetableForBatch,
      testTriggerClassEndNotification,
      studyPlan,
      loadLocalStudyPlan,
      updateStudyPlan,
      timetable,
      attendanceRecords,
      saveTimetable,
      markClassAttendance,
      updateManualAttendance,
      syncCampusLynxData,
      savedVideos,
      saveVideo,
      removeVideo,
      watchHistory,
      addToWatchHistory,
      isGeneratingSchedule,
      generationError,
      generateScheduleInBackground,
      BADGE_DEFINITIONS,
      unlockBadge,
      logStudySession
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
