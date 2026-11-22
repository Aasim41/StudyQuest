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
        bottom: 22,
        left: 28,
        right: 28,
        height: 64,
        borderRadius: 22,
        backgroundColor: '#0E0E20',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 18,
        elevation: 10,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarBackground: () => (
        <View 
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: '#0E0E20',
              borderRadius: 22,
            }
          ]} 
        />
      ),
      tabBarShowLabel: true,
      tabBarActiveTintColor: '#00D2FF',
      tabBarInactiveTintColor: '#777799',
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '700',
        marginTop: 2,
      },
      tabBarIcon: ({ color, size, focused }) => {
        let iconName = 'book-open-page-variant';
        if (route.name === 'Dashboard') {
          iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
        } else if (route.name === 'AIGapAuditor') {
          iconName = focused ? 'shield-search' : 'shield-search';
        } else if (route.name === 'Analytics') {
          iconName = focused ? 'chart-line' : 'chart-line-variant';
        }

        return (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {focused && (
              <View style={{
                position: 'absolute',
                width: 36,
                height: 36,
                backgroundColor: 'rgba(0, 210, 255, 0.15)',
                borderRadius: 18,
              }} />
            )}
            <MaterialCommunityIcons 
              name={iconName} 
              size={24} 
              color={color} 
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
      name="AIGapAuditor" 
      component={AIGapAuditorScreen} 
      options={{ tabBarLabel: 'AI Auditor' }}
    />
    <Tab.Screen 
      name="Analytics" 
      component={AnalyticsScreen} 
      options={{ tabBarLabel: 'Mastery' }}
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
