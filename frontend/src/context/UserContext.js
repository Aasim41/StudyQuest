import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  // Firestore stats
  const [userStats, setUserStats] = useState({ level: 1, xp: 0, nextLevelXp: 1000, streak: 0, lastStudyDate: null });
  const [studyPlan, setStudyPlan] = useState([]);

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
      await AsyncStorage.setItem('@onboardingComplete', 'true');
      setOnboardingComplete(true);
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
    } catch (e) {
      console.warn('Failed to load local study plan', e);
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
      await AsyncStorage.setItem('@studyPlan', JSON.stringify(newPlan));
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
      updateStudyPlan
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
