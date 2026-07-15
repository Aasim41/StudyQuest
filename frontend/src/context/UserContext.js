import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userStats, setUserStats] = useState({ level: 1, xp: 0, nextLevelXp: 1000, streak: 0, lastStudyDate: null });
  const [studyPlan, setStudyPlan] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);

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
  }, []);

  const completeOnboarding = async () => {
    try {
      // Set UI state IMMEDIATELY so navigation happens instantly
      setOnboardingComplete(true);
      // Fire-and-forget storage so it doesn't block the UI
      AsyncStorage.setItem('@onboardingComplete', 'true').catch(e => console.warn('Failed to save onboarding complete', e));
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
      
      const videosStr = await AsyncStorage.getItem('@savedVideos');
      if (videosStr) {
        setSavedVideos(JSON.parse(videosStr));
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
        setUserStats({
          level: data.level || 1,
          xp: data.xp || 0,
          nextLevelXp: data.nextLevelXp || 1000,
          streak: data.streak || 0,
          lastStudyDate: data.lastStudyDate || null,
          userType: data.userType || null,
          institute: data.institute || null,
        });
      }
    } catch (e) {
      console.warn('Failed to load firestore stats', e);
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

  const saveStatsToFirestore = async (newStats) => {
    setUserStats(newStats);
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), newStats);
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

  return (
    <UserContext.Provider value={{
      onboardingComplete,
      completeOnboarding,
      loading,
      userStats,
      loadFirestoreStats,
      saveStatsToFirestore,
      studyPlan,
      loadLocalStudyPlan,
      updateStudyPlan,
      savedVideos,
      saveVideo,
      removeVideo
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
