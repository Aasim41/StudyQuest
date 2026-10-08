import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
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

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Real initial JUET CampusLynx records for B31 (synced from portal)
// Real initial JUET CampusLynx records tailored dynamically for ALL batches
export function getInitialAttendanceForBatch(batchCode = 'B31') {
  const isAI = ['B21', 'B22', 'B23'].includes(batchCode);
  const isStats = batchCode === 'B31';
  // B1 to B9 are core CSE (Theory of Computation track)

  const records = {
    'Career Management and Development': {
      code: 'HS007',
      attendedL: 17, totalL: 19, percentL: 89.5,
      attendedT: 0, totalT: 0, percentT: 0,
      attendedP: 0, totalP: 0, percentP: 0,
      attended: 17, total: 19, missed: 2,
      overallPercent: 89.5,
      category: 'Theory',
      isLab: false,
      history: [
        { id: 'cmd-19', date: '3 Oct', time: '10:00 AM', slot: 'L', status: 'present' },
        { id: 'cmd-18', date: '1 Oct', time: '11:00 AM', slot: 'L', status: 'present' },
        { id: 'cmd-17', date: '26 Sep', time: '10:00 AM', slot: 'L', status: 'present' },
        { id: 'cmd-16', date: '24 Sep', time: '11:00 AM', slot: 'L', status: 'absent' },
        { id: 'cmd-15', date: '19 Sep', time: '10:00 AM', slot: 'L', status: 'present' },
      ]
    },
    'Techniques for Decision Making': {
      code: 'HS103',
      attendedL: 19, totalL: 22, percentL: 86.4,
      attendedT: 7, totalT: 10, percentT: 70.0,
      attendedP: 0, totalP: 0, percentP: 0,
      attended: 26, total: 32, missed: 6,
      overallPercent: 81.3,
      category: 'Theory',
      isLab: false,
      history: [
        { id: 'tdm-32', date: '3 Oct', time: '12:00 PM', slot: 'L', status: 'present' },
        { id: 'tdm-31', date: '1 Oct', time: '3:00 PM', slot: 'T', status: 'present' },
        { id: 'tdm-30', date: '29 Sep', time: '12:00 PM', slot: 'L', status: 'present' },
        { id: 'tdm-29', date: '25 Sep', time: '3:00 PM', slot: 'T', status: 'absent' },
      ]
    },
    'Environmental Science': {
      code: 'GE001',
      attendedL: 12, totalL: 16, percentL: 75.0,
      attendedT: 0, totalT: 0, percentT: 0,
      attendedP: 0, totalP: 0, percentP: 0,
      attended: 12, total: 16, missed: 4,
      overallPercent: 75.0,
      category: 'Theory',
      isLab: false,
      history: [
        { id: 'evs-16', date: '1 Oct', time: '2:00 PM', slot: 'L', status: 'present' },
        { id: 'evs-15', date: '25 Sep', time: '4:00 PM', slot: 'L', status: 'present' },
        { id: 'evs-14', date: '24 Sep', time: '2:00 PM', slot: 'L', status: 'present' },
        { id: 'evs-13', date: '18 Sep', time: '4:00 PM', slot: 'L', status: 'present' },
        { id: 'evs-12', date: '17 Sep', time: '2:00 PM', slot: 'L', status: 'present' },
        { id: 'evs-11', date: '11 Sep', time: '4:00 PM', slot: 'L', status: 'absent' },
        { id: 'evs-10', date: '10 Sep', time: '2:00 PM', slot: 'L', status: 'absent' },
        { id: 'evs-9', date: '4 Sep', time: '4:00 PM', slot: 'L', status: 'present' },
        { id: 'evs-8', date: '3 Sep', time: '2:00 PM', slot: 'L', status: 'absent' },
      ]
    },
    'Data Structures': {
      code: 'CS103',
      attendedL: 24, totalL: 28, percentL: 85.7,
      attendedT: 10, totalT: 10, percentT: 100.0,
      attendedP: 0, totalP: 0, percentP: 0,
      attended: 34, total: 38, missed: 4,
      overallPercent: 89.5,
      category: 'Theory',
      isLab: false,
      history: [
        { id: 'ds-38', date: '3 Oct', time: '9:00 AM', slot: 'L', status: 'present' },
        { id: 'ds-37', date: '2 Oct', time: '11:00 AM', slot: 'T', status: 'present' },
        { id: 'ds-36', date: '30 Sep', time: '9:00 AM', slot: 'L', status: 'present' },
        { id: 'ds-35', date: '26 Sep', time: '9:00 AM', slot: 'L', status: 'absent' },
      ]
    },
    'Data Structures Lab': {
      code: 'CS203',
      attendedL: 0, totalL: 0, percentL: 0,
      attendedT: 0, totalT: 0, percentT: 0,
      attendedP: 9, totalP: 9, percentP: 100.0,
      attended: 9, total: 9, missed: 0,
      overallPercent: 100.0,
      category: 'Lab',
      isLab: true,
      history: [
        { id: 'dslab-9', date: '2 Oct', time: '2:00 PM', slot: 'P', status: 'present' },
        { id: 'dslab-8', date: '25 Sep', time: '2:00 PM', slot: 'P', status: 'present' },
        { id: 'dslab-7', date: '18 Sep', time: '2:00 PM', slot: 'P', status: 'present' },
      ]
    },
    'Database Systems': {
      code: 'CS104',
      attendedL: 15, totalL: 19, percentL: 78.9,
      attendedT: 6, totalT: 8, percentT: 75.0,
      attendedP: 0, totalP: 0, percentP: 0,
      attended: 21, total: 27, missed: 6,
      overallPercent: 77.8,
      category: 'Theory',
      isLab: false,
      history: [
        { id: 'dbms-27', date: '3 Oct', time: '2:00 PM', slot: 'L', status: 'present' },
        { id: 'dbms-26', date: '1 Oct', time: '10:00 AM', slot: 'T', status: 'absent' },
        { id: 'dbms-25', date: '29 Sep', time: '2:00 PM', slot: 'L', status: 'present' },
      ]
    },
    'Database Systems Lab': {
      code: 'CS204',
      attendedL: 0, totalL: 0, percentL: 0,
      attendedT: 0, totalT: 0, percentT: 0,
      attendedP: 9, totalP: 11, percentP: 81.8,
      attended: 9, total: 11, missed: 2,
      overallPercent: 81.8,
      category: 'Lab',
      isLab: true,
      history: [
        { id: 'dbmslab-11', date: '1 Oct', time: '4:00 PM', slot: 'P', status: 'present' },
        { id: 'dbmslab-10', date: '24 Sep', time: '4:00 PM', slot: 'P', status: 'absent' },
      ]
    },
    'Advanced Programming Lab-1': {
      code: 'CS206',
      attendedL: 0, totalL: 0, percentL: 0,
      attendedT: 0, totalT: 0, percentT: 0,
      attendedP: 8, totalP: 10, percentP: 80.0,
      attended: 8, total: 10, missed: 2,
      overallPercent: 80.0,
      category: 'Lab',
      isLab: true,
      history: [
        { id: 'aplab-10', date: '2 Oct', time: '4:00 PM', slot: 'P', status: 'present' },
        { id: 'aplab-9', date: '25 Sep', time: '4:00 PM', slot: 'P', status: 'absent' },
      ]
    },
    'Unix Programming Lab': {
      code: 'CS219',
      attendedL: 0, totalL: 0, percentL: 0,
      attendedT: 0, totalT: 0, percentT: 0,
      attendedP: 7, totalP: 8, percentP: 87.5,
      attended: 7, total: 8, missed: 1,
      overallPercent: 87.5,
      category: 'Lab',
      isLab: true,
      history: [
        { id: 'unix-8', date: '29 Sep', time: '2:00 PM', slot: 'P', status: 'present' },
      ]
    },
    'Summer Internship': {
      code: 'CS002',
      attendedL: 0, totalL: 0, percentL: 0,
      attendedT: 0, totalT: 0, percentT: 0,
      attendedP: 0, totalP: 0, percentP: 0,
      attended: 0, total: 0, missed: 0,
      overallPercent: null,
      category: 'Project',
      isLab: false,
      history: []
    }
  };

  // Branch Specializations
  if (isAI) {
    records['Foundation of AI'] = {
      code: 'CS116',
      attendedL: 24, totalL: 28, percentL: 85.7,
      attendedT: 0, totalT: 0, percentT: 0,
      attendedP: 0, totalP: 0, percentP: 0,
      attended: 24, total: 28, missed: 4,
      overallPercent: 85.7,
      category: 'Theory',
      isLab: false,
      history: [
        { id: 'foai-28', date: '3 Oct', time: '3:00 PM', slot: 'L', status: 'present' },
        { id: 'foai-27', date: '1 Oct', time: '11:00 AM', slot: 'L', status: 'present' },
      ]
    };
    records['AI Lab'] = {
      code: 'CS222',
      attendedL: 0, totalL: 0, percentL: 0,
      attendedT: 0, totalT: 0, percentT: 0,
      attendedP: 8, totalP: 9, percentP: 88.9,
      attended: 8, total: 9, missed: 1,
      overallPercent: 88.9,
      category: 'Lab',
      isLab: true,
      history: [
        { id: 'ailab-9', date: '2 Oct', time: '2:00 PM', slot: 'P', status: 'present' },
      ]
    };
  } else if (isStats) {
    records['Statistical Methods'] = {
      code: 'CS115',
      attendedL: 28, totalL: 31, percentL: 90.3,
      attendedT: 0, totalT: 0, percentT: 0,
      attendedP: 0, totalP: 0, percentP: 0,
      attended: 28, total: 31, missed: 3,
      overallPercent: 90.3,
      category: 'Theory',
      isLab: false,
      history: [
        { id: 'sm-31', date: '3 Oct', time: '4:00 PM', slot: 'L', status: 'present' },
        { id: 'sm-30', date: '1 Oct', time: '9:00 AM', slot: 'L', status: 'present' },
      ]
    };
    records['Statistical Methods Lab'] = {
      code: 'CS221',
      attendedL: 0, totalL: 0, percentL: 0,
      attendedT: 0, totalT: 0, percentT: 0,
      attendedP: 9, totalP: 10, percentP: 90.0,
      attended: 9, total: 10, missed: 1,
      overallPercent: 90.0,
      category: 'Lab',
      isLab: true,
      history: [
        { id: 'smlab-10', date: '30 Sep', time: '2:00 PM', slot: 'P', status: 'present' },
      ]
    };
  } else {
    // Core CSE Track (B1, B2, B3, B4, B5, B6, B7, B8, B9)
    records['Theory of Computation'] = {
      code: 'CS110',
      attendedL: 25, totalL: 30, percentL: 83.3,
      attendedT: 0, totalT: 0, percentT: 0,
      attendedP: 0, totalP: 0, percentP: 0,
      attended: 25, total: 30, missed: 5,
      overallPercent: 83.3,
      category: 'Theory',
      isLab: false,
      history: [
        { id: 'toc-30', date: '3 Oct', time: '11:00 AM', slot: 'L', status: 'present' },
        { id: 'toc-29', date: '1 Oct', time: '12:00 PM', slot: 'L', status: 'present' },
        { id: 'toc-28', date: '29 Sep', time: '11:00 AM', slot: 'L', status: 'absent' },
      ]
    };
  }

  return records;
}

export const JUET_REAL_PORTAL_ATTENDANCE = getInitialAttendanceForBatch('B31');

// Helper to match CampusLynx raw subject codes with StudyQuest subjects
// CRITICAL: Practical / Lab subjects are strictly treated as separate, distinct subjects!
export function matchCampusLynxSubject(rawString, targetSubjectName) {
  if (!rawString || !targetSubjectName) return false;
  const raw = rawString.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const target = targetSubjectName.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // 1. ABSOLUTE SEPARATION: Practical / Lab subjects are separate from Theory subjects!
  const labCodes = ['CS203', 'CS204', 'CS206', 'CS219', 'CS221', 'CS216', 'CS222'];
  const isRawLab = raw.includes('LAB') || labCodes.some(c => raw.includes(c));
  const isTargetLab = target.includes('LAB') || targetSubjectName.toUpperCase().includes('LAB') || labCodes.some(c => target.includes(c));

  // If one is a Lab and the other is NOT a Lab, they can NEVER match!
  if (isRawLab !== isTargetLab) return false;

  // 2. Exact JUET Course Code Match
  const courseCodePairs = [
    { code: 'HS103', lab: false },
    { code: 'CS103', lab: false },
    { code: 'CS104', lab: false },
    { code: 'CS110', lab: false },
    { code: 'CS115', lab: false },
    { code: 'CS116', lab: false },
    { code: 'HS007', lab: false },
    { code: 'GE001', lab: false },
    { code: 'CS002', lab: false },
    { code: 'CS203', lab: true }, // DS Lab
    { code: 'CS204', lab: true }, // DBMS Lab
    { code: 'CS206', lab: true }, // AP Lab-1
    { code: 'CS219', lab: true }, // UNIX Lab
    { code: 'CS221', lab: true }, // SM Lab
    { code: 'CS216', lab: true }, // AI Lab
    { code: 'CS222', lab: true }, // AI Lab
  ];

  for (const c of courseCodePairs) {
    if (raw.includes(c.code) && target.includes(c.code)) {
      return true;
    }
  }

  // 3. Name Match (Only within same Lab vs Theory category)
  if (raw.includes('STATISTICAL') && target.includes('STATISTICAL')) return true;
  if (raw.includes('DATASTRUCTURE') && target.includes('DATASTRUCTURE')) return true;
  if (raw.includes('DATABASESYSTEM') && target.includes('DATABASESYSTEM')) return true;
  if (raw.includes('ADVANCEDPROGRAMMING') && target.includes('ADVANCEDPROGRAMMING')) return true;
  if (raw.includes('UNIX') && target.includes('UNIX')) return true;
  if (raw.includes('AI') && target.includes('AI')) return true;
  if (raw.includes('DECISION') && target.includes('DECISION')) return true;
  if (raw.includes('CAREER') && target.includes('CAREER')) return true;
  if (raw.includes('ENVIRONMENT') && target.includes('ENVIRONMENT')) return true;
  if (raw.includes('COMPUTATION') && target.includes('COMPUTATION')) return true;
  if (raw.includes('INTERNSHIP') && target.includes('INTERNSHIP')) return true;

  if (raw.includes(target) || target.includes(raw)) return true;

  return false;
}

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [onboardingComplete, setOnboardingComplete] = useState(true);
  const [loading, setLoading] = useState(false);

  const [userStats, setUserStats] = useState({ 
    level: 1, xp: 0, nextLevelXp: 1000, streak: 0, 
    lastStudyDate: null, avatarUrl: null,
  });
  const [userBatch, setUserBatchState] = useState('B31');
  const [studyPlan, setStudyPlan] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});


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
    
    if (Platform.OS !== 'web') {
      const setupNotifications = async () => {
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            console.warn('Notification permissions not granted');
          }
          await setupNotificationCategories();
        } catch (err) {
          console.warn('Notification setup safely skipped:', err);
        }
      };
      setupNotifications();

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
    }
  }, []);



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
        const hasRealData = Object.values(parsed).some(r => (r.total || 0) > 0);
        if (!hasRealData) {
          const initRecords = getInitialAttendanceForBatch(activeBatch);
          setAttendanceRecords(initRecords);
          setScopedItem('@attendanceRecords', JSON.stringify(initRecords)).catch(() => {});
        } else {
          setAttendanceRecords(parsed);
        }
      } else {
        const initRecords = getInitialAttendanceForBatch(activeBatch);
        setAttendanceRecords(initRecords);
        setScopedItem('@attendanceRecords', JSON.stringify(initRecords)).catch(() => {});
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
          avatarUrl: data.avatarUrl || null,
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
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
