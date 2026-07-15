import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';
import { auth } from '../../firebaseConfig';
import { useUser } from '../context/UserContext';
import API_BASE from '../config/apiConfig';

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
import SavedVideosScreen from '../screens/SavedVideosScreen';
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

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#0A0A1A',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        height: 65,
        paddingBottom: 10,
        paddingTop: 10,
      },
      tabBarActiveTintColor: COLORS.accent,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarIcon: ({ color, size, focused }) => {
        let icon = '';
        if (route.name === 'Dashboard') icon = '🏠';
        else if (route.name === 'Planner') icon = '📅';
        else if (route.name === 'StudyTube') icon = '▶️';
        else if (route.name === 'Saved') icon = '💾';
        return <View style={focused ? {
          shadowColor: COLORS.accent,
          shadowOffset: {width: 0, height: 0},
          shadowOpacity: 0.8,
          shadowRadius: 10,
        } : null}><Text style={{ fontSize: size }}>{icon}</Text></View>;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Planner" component={PlannerScreen} />
    <Tab.Screen name="StudyTube" component={YouTubeFeedScreen} />
    <Tab.Screen name="Saved" component={SavedVideosScreen} />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'fade',
    }}
  >
    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    <Stack.Screen 
      name="FocusTimer" 
      component={FocusTimerScreen} 
      options={{ presentation: 'fullScreenModal' }}
    />
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
  const [authLoading, setAuthLoading] = useState(true);
  const { onboardingComplete, loading: contextLoading, loadFirestoreStats, loadLocalStudyPlan } = useUser();

  useEffect(() => {
    // Wake up Render server globally on app boot
    fetch(`${API_BASE}/api/health`).catch(() => {});

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        loadFirestoreStats();
        loadLocalStudyPlan();
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  if (authLoading || contextLoading) return <LoadingScreen />;

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
