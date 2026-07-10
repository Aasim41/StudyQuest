import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';
import { auth, db } from '../../firebaseConfig';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
// import AvatarSelectionScreen from '../screens/AvatarSelectionScreen';
import UserTypeScreen from '../screens/UserTypeScreen';
import InstituteSearchScreen from '../screens/InstituteSearchScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CalendarUploadScreen from '../screens/CalendarUploadScreen';
import CalendarCorrectionScreen from '../screens/CalendarCorrectionScreen';
import SyllabusUploadScreen from '../screens/SyllabusUploadScreen';
import SyllabusCorrectionScreen from '../screens/SyllabusCorrectionScreen';
import TimetableUploadScreen from '../screens/TimetableUploadScreen';
import TimetableCorrectionScreen from '../screens/TimetableCorrectionScreen';
import ScheduleGenerationScreen from '../screens/ScheduleGenerationScreen';
import PlannerScreen from '../screens/PlannerScreen';
import FocusTimerScreen from '../screens/FocusTimerScreen';
import YouTubeFeedScreen from '../screens/YouTubeFeedScreen';
import YouTubePlayerScreen from '../screens/YouTubePlayerScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'fade_from_bottom',
      animationDuration: 350,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

const OnboardingStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      animationDuration: 350,
    }}
  >
    <Stack.Screen name="UserType" component={UserTypeScreen} />
    <Stack.Screen name="InstituteSearch" component={InstituteSearchScreen} />
    <Stack.Screen name="CalendarUpload" component={CalendarUploadScreen} />
    <Stack.Screen name="CalendarCorrection" component={CalendarCorrectionScreen} />
    <Stack.Screen name="SyllabusUpload" component={SyllabusUploadScreen} />
    <Stack.Screen name="SyllabusCorrection" component={SyllabusCorrectionScreen} />
    <Stack.Screen name="TimetableUpload" component={TimetableUploadScreen} />
    <Stack.Screen name="TimetableCorrection" component={TimetableCorrectionScreen} />
    <Stack.Screen name="ScheduleGeneration" component={ScheduleGenerationScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'fade',
    }}
  >
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="Planner" component={PlannerScreen} />
    <Stack.Screen 
      name="FocusTimer" 
      component={FocusTimerScreen} 
      options={{ presentation: 'fullScreenModal' }}
    />
    <Stack.Screen name="YouTubeFeed" component={YouTubeFeedScreen} />
    <Stack.Screen name="YouTubePlayer" component={YouTubePlayerScreen} />
    <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    
    {/* Upload Screens available from Dashboard too */}
    <Stack.Screen name="CalendarUpload" component={CalendarUploadScreen} />
    <Stack.Screen name="CalendarCorrection" component={CalendarCorrectionScreen} />
    <Stack.Screen name="SyllabusUpload" component={SyllabusUploadScreen} />
    <Stack.Screen name="SyllabusCorrection" component={SyllabusCorrectionScreen} />
    <Stack.Screen name="TimetableUpload" component={TimetableUploadScreen} />
    <Stack.Screen name="TimetableCorrection" component={TimetableCorrectionScreen} />
    <Stack.Screen name="ScheduleGeneration" component={ScheduleGenerationScreen} />
  </Stack.Navigator>
);

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <LinearGradient colors={COLORS.gradientOnboarding} style={StyleSheet.absoluteFill} />
    <ActivityIndicator size="large" color={COLORS.accent} />
  </View>
);

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubsribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Listen to user document for realtime onboardingComplete updates
        unsubsribeSnapshot = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
          if (docSnap.exists() && docSnap.data().onboardingComplete) {
            setOnboardingComplete(true);
          } else {
            setOnboardingComplete(false);
          }
          setLoading(false);
        }, (err) => {
          console.warn('Error listening to onboarding status:', err);
          setOnboardingComplete(false);
          setLoading(false);
        });

      } else {
        setUser(null);
        setOnboardingComplete(false);
        setLoading(false);
        if (unsubsribeSnapshot) {
          unsubsribeSnapshot();
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubsribeSnapshot) unsubsribeSnapshot();
    };
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : !onboardingComplete ? (
        <OnboardingStack />
      ) : (
        <MainStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
