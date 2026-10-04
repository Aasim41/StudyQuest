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

  const loadLocalStudyPlan = async () => {
    try {
      const planStr = await AsyncStorage.getItem('@studyPlan');
      if (planStr) {
        setStudyPlan(JSON.parse(planStr));
      }

      const batchStr = await AsyncStorage.getItem('@userBatch');
      const activeBatch = batchStr || 'B31';
      setUserBatchState(activeBatch);

      const timetableStr = await AsyncStorage.getItem('@timetable');
      if (timetableStr) {
        setTimetable(JSON.parse(timetableStr));
      } else {
        const initialTt = filterTimetableForBatch(activeBatch);
        setTimetable(initialTt);
        AsyncStorage.setItem('@timetable', JSON.stringify(initialTt)).catch(() => {});
      }

      const attendanceStr = await AsyncStorage.getItem('@attendanceRecords');
      if (attendanceStr) {
        setAttendanceRecords(JSON.parse(attendanceStr));
      } else {
        const initialTt = filterTimetableForBatch(activeBatch);
        const initialRecords = {};
        initialTt.forEach(item => {
          if (item.subject && !initialRecords[item.subject]) {
            initialRecords[item.subject] = { attended: 0, missed: 0, total: 0, history: {} };
          }
        });
        setAttendanceRecords(initialRecords);
        AsyncStorage.setItem('@attendanceRecords', JSON.stringify(initialRecords)).catch(() => {});
      }
      
      const videosStr = await AsyncStorage.getItem('@savedVideos');
      if (videosStr) {
        setSavedVideos(JSON.parse(videosStr));
      }

      const historyStr = await AsyncStorage.getItem('@watchHistory');
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
          AsyncStorage.setItem('@userBatch', data.userBatch).catch(() => {});
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
          AsyncStorage.setItem('@timetable', JSON.stringify(data.timetable)).catch(() => {});
        } else {
          const initialTt = filterTimetableForBatch(data.userBatch || 'B31');
          setTimetable(initialTt);
        }

        if (data.attendanceRecords && typeof data.attendanceRecords === 'object') {
          setAttendanceRecords(data.attendanceRecords);
          AsyncStorage.setItem('@attendanceRecords', JSON.stringify(data.attendanceRecords)).catch(() => {});
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
      await AsyncStorage.setItem('@userBatch', newBatch);
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
      AsyncStorage.setItem('@studyPlan', JSON.stringify(newPlan)).catch(e => console.warn('Failed to save study plan locally', e));
    } catch (e) {
      console.warn('Failed to save study plan locally', e);
    }
  };

  const saveTimetable = async (newTimetable) => {
    setTimetable(newTimetable);
    try {
      await AsyncStorage.setItem('@timetable', JSON.stringify(newTimetable));
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
        await AsyncStorage.setItem('@attendanceRecords', JSON.stringify(currentRecords));
        if (auth.currentUser) {
          await setDoc(doc(db, 'users', auth.currentUser.uid), { attendanceRecords: currentRecords }, { merge: true });
        }
      }
    } catch (e) {
      console.warn('Failed to save timetable', e);
    }
  };

  const markClassAttendance = async (subject, dateStr, classId, status) => {
    const currentRecords = { ...attendanceRecords };
    const subRecord = currentRecords[subject] || { attended: 0, missed: 0, total: 0, history: {} };
    const history = { ...(subRecord.history || {}) };
    const prevStatus = history[dateStr]?.[classId];

    if (prevStatus === status) return;

    let attended = subRecord.attended || 0;
    let missed = subRecord.missed || 0;
    let total = subRecord.total || 0;

    if (prevStatus === 'present') {
      attended = Math.max(0, attended - 1);
      total = Math.max(0, total - 1);
    } else if (prevStatus === 'absent') {
      missed = Math.max(0, missed - 1);
      total = Math.max(0, total - 1);
    }

    if (status === 'present') {
      attended += 1;
      total += 1;
    } else if (status === 'absent') {
      missed += 1;
      total += 1;
    }

    if (!history[dateStr]) history[dateStr] = {};
    if (status === 'unmarked') {
      delete history[dateStr][classId];
    } else {
      history[dateStr][classId] = status;
    }

    currentRecords[subject] = {
      ...subRecord,
      attended,
      missed,
      total,
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
      await AsyncStorage.setItem('@attendanceRecords', JSON.stringify(currentRecords));
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
      await AsyncStorage.setItem('@attendanceRecords', JSON.stringify(currentRecords));
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { attendanceRecords: currentRecords }, { merge: true });
      }
    } catch (e) {
      console.warn('Failed to update manual attendance', e);
    }
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
      await AsyncStorage.setItem('@savedVideos', JSON.stringify(newVideos));
    } catch (e) {
      console.warn('Failed to save video locally', e);
    }
  };

  const removeVideo = async (videoId) => {
    const newVideos = savedVideos.filter(v => v.videoId !== videoId);
    setSavedVideos(newVideos);
    try {
      await AsyncStorage.setItem('@savedVideos', JSON.stringify(newVideos));
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
      await AsyncStorage.setItem('@watchHistory', JSON.stringify(newHistory));
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
