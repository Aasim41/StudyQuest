import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
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

// Setup & Profile Screens
import AvatarSelectionScreen from '../screens/AvatarSelectionScreen';

// Core Study Guide & Exam Helper Screens
import DashboardScreen from '../screens/DashboardScreen';
import FlowScreen from '../screens/FlowScreen';
import RegainFocusScreen from '../screens/RegainFocusScreen';
import AIGapAuditorScreen from '../screens/AIGapAuditorScreen';
import ExamTargetsScreen from '../screens/ExamTargetsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import StudyGuideDetailScreen from '../screens/StudyGuideDetailScreen';
import FlashcardsScreen from '../screens/FlashcardsScreen';
import PredictorScreen from '../screens/PredictorScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import AchievementsScreen from '../screens/AchievementsScreen';

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
    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
  </Stack.Navigator>
);

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 24 : 14,
        left: 16,
        right: 16,
        height: 62,
        borderRadius: 14,
        backgroundColor: '#10111A',
        borderWidth: 1.5,
        borderColor: '#24263A',
        elevation: 10,
        paddingBottom: 6,
        paddingTop: 6,
      },
      tabBarBackground: () => (
        <View 
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: '#10111A',
              borderRadius: 14,
            }
          ]} 
        />
      ),
      tabBarShowLabel: true,
      tabBarActiveTintColor: '#00E5FF',
      tabBarInactiveTintColor: '#6E7187',
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.2,
        marginTop: 2,
      },
      tabBarIcon: ({ color, size, focused }) => {
        let iconName = 'book-open-outline';
        if (route.name === 'Dashboard') {
          iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
        } else if (route.name === 'Flow') {
          iconName = focused ? 'play-circle' : 'play-circle-outline';
        } else if (route.name === 'Regain') {
          iconName = focused ? 'shield-lock' : 'shield-lock-outline';
        } else if (route.name === 'AIGapAuditor') {
          iconName = focused ? 'file-search' : 'file-search-outline';
        }

        return (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {focused && (
              <View style={{
                position: 'absolute',
                width: 38,
                height: 30,
                backgroundColor: 'rgba(0, 229, 255, 0.12)',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: 'rgba(0, 229, 255, 0.3)',
              }} />
            )}
            <MaterialCommunityIcons 
              name={iconName} 
              size={22} 
              color={focused ? '#00E5FF' : color} 
            />
          </View>
        );
      },
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen} 
      options={{ tabBarLabel: 'Guides' }}
    />
    <Tab.Screen 
      name="Flow" 
      component={FlowScreen} 
      options={{ tabBarLabel: 'Flow' }}
    />
    <Tab.Screen 
      name="Regain" 
      component={RegainFocusScreen} 
      options={{ tabBarLabel: 'Regain' }}
    />
    <Tab.Screen 
      name="AIGapAuditor" 
      component={AIGapAuditorScreen} 
      options={{ tabBarLabel: 'Auditor' }}
    />
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
      name="Flow" 
      component={FlowScreen} 
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen 
      name="Regain" 
      component={RegainFocusScreen} 
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen 
      name="RegainFocus" 
      component={RegainFocusScreen} 
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen 
      name="StudyGuideDetail" 
      component={StudyGuideDetailScreen} 
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen 
      name="AIGapAuditor" 
      component={AIGapAuditorScreen} 
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen 
      name="Flashcards" 
      component={FlashcardsScreen} 
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen 
      name="Predictor" 
      component={PredictorScreen} 
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen 
      name="ExamTargets" 
      component={ExamTargetsScreen} 
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen 
      name="Analytics" 
      component={AnalyticsScreen} 
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen 
      name="AvatarSelection" 
      component={AvatarSelectionScreen} 
      options={{ presentation: 'fullScreenModal' }}
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
  const { onboardingComplete, isGuest, loading: contextLoading, loadFirestoreStats } = useUser();

  useEffect(() => {
    fetch(`${API_BASE}/api/health`).catch(() => {});

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadFirestoreStats();
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    const safetyTimer = setTimeout(() => {
      setAuthLoading(false);
    }, 1500);

    return () => {
      clearTimeout(safetyTimer);
      unsubscribeAuth();
    };
  }, []);

  if (authLoading || contextLoading) return <LoadingScreen />;

  const isAuthenticated = !!user || isGuest;

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
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
    backgroundColor: '#07070F',
    height: Platform.OS === 'web' ? '100vh' : '100%',
  },
});
