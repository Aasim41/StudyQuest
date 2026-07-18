import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';
import { auth } from '../../firebaseConfig';
import { useUser } from '../context/UserContext';
import API_BASE from '../config/apiConfig';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import WelcomeLandingScreen from '../screens/WelcomeLandingScreen';
import HowItWorksScreen from '../screens/HowItWorksScreen';
import AvatarSelectionScreen from '../screens/AvatarSelectionScreen';
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
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ChatTutorScreen from '../screens/ChatTutorScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import FloatingTutor from '../components/FloatingTutor';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'fade_from_bottom',
      animationDuration: 350,
    }}
  >
    <Stack.Screen name="Welcome" component={WelcomeLandingScreen} />
    <Stack.Screen name="HowItWorks" component={HowItWorksScreen} />
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
    <Stack.Screen name="AvatarSelection" component={AvatarSelectionScreen} />
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
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
        height: 65,
        borderRadius: 24,
        backgroundColor: 'rgba(20, 20, 50, 0.75)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
      },
      tabBarBackground: () => (
        <BlurView 
          tint="dark" 
          intensity={80} 
          style={StyleSheet.absoluteFill} 
          pointerEvents="none"
          experimentalBlurMethod="dimezisBlurView"
        />
      ),
      tabBarShowLabel: false,
      tabBarActiveTintColor: COLORS.accent,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarIcon: ({ color, size, focused }) => {
        let iconName = '';
        if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Planner') iconName = focused ? 'calendar-month' : 'calendar-month-outline';
        else if (route.name === 'StudyTube') iconName = focused ? 'play-circle' : 'play-circle-outline';
        else if (route.name === 'Saved') iconName = focused ? 'bookmark' : 'bookmark-outline';
        else if (route.name === 'Analytics') iconName = focused ? 'chart-bar' : 'chart-bar-stacked';

        return (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {focused && (
              <View style={{
                position: 'absolute',
                width: 40,
                height: 40,
                backgroundColor: 'rgba(108, 92, 231, 0.25)',
                borderRadius: 20,
              }} />
            )}
            <MaterialCommunityIcons 
              name={iconName} 
              size={28} 
              color={color} 
              style={focused ? {
                textShadowColor: COLORS.accentGlow,
                textShadowOffset: {width: 0, height: 0},
                textShadowRadius: 10,
              } : null}
            />
          </View>
        );
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Planner" component={PlannerScreen} />
    <Tab.Screen name="StudyTube" component={YouTubeFeedScreen} />
    <Tab.Screen name="Saved" component={SavedVideosScreen} />
    <Tab.Screen name="Analytics" component={AnalyticsScreen} />
  </Tab.Navigator>
);

const MainStack = () => (
  <>
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
      <Stack.Screen 
        name="AvatarSelection" 
        component={AvatarSelectionScreen} 
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen 
        name="ChatTutor" 
        component={ChatTutorScreen} 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen} 
      />
      <Stack.Screen 
        name="Achievements" 
        component={AchievementsScreen} 
      />
    </Stack.Navigator>
    <FloatingTutor />
  </>
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
        // MUST await these so onboardingComplete is set from Firestore
        // BEFORE the loading screen goes away
        await loadFirestoreStats();
        await loadLocalStudyPlan();
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
