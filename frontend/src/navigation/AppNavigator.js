import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
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
import TimetableCorrectionScreen from '../screens/TimetableCorrectionScreen';

// Core Attendance Screens
import DashboardScreen from '../screens/DashboardScreen';
import PlannerScreen from '../screens/PlannerScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
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
    <Stack.Screen name="TimetableCorrection" component={TimetableCorrectionScreen} />
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
        left: 24,
        right: 24,
        height: 64,
        borderRadius: 24,
        backgroundColor: 'rgba(12, 12, 24, 0.94)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
      },
      tabBarBackground: () => (
        <View 
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(12, 12, 24, 0.96)',
              borderRadius: 24,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.08)',
            }
          ]} 
        />
      ),
      tabBarShowLabel: false,
      tabBarActiveTintColor: COLORS.accent,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarIcon: ({ color, size, focused }) => {
        let iconName = '';
        if (route.name === 'Dashboard') {
          iconName = focused ? 'checkbox-marked-circle' : 'checkbox-marked-circle-outline';
        } else if (route.name === 'Planner') {
          iconName = focused ? 'calculator' : 'calculator-variant-outline';
        } else if (route.name === 'Analytics') {
          iconName = focused ? 'chart-box' : 'chart-box-outline';
        }

        return (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {focused && (
              <View style={{
                position: 'absolute',
                width: 42,
                height: 42,
                backgroundColor: 'rgba(108, 92, 231, 0.22)',
                borderRadius: 21,
              }} />
            )}
            <MaterialCommunityIcons 
              name={iconName} 
              size={26} 
              color={color} 
              style={focused ? {
                textShadowColor: COLORS.accentGlow,
                textShadowOffset: { width: 0, height: 0 },
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
    <Tab.Screen name="Analytics" component={AnalyticsScreen} />
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
    <Stack.Screen 
      name="TimetableCorrection" 
      component={TimetableCorrectionScreen} 
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
  const { onboardingComplete, loading: contextLoading, loadFirestoreStats, loadLocalStudyPlan } = useUser();

  useEffect(() => {
    fetch(`${API_BASE}/api/health`).catch(() => {});

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadFirestoreStats();
        if (loadLocalStudyPlan) await loadLocalStudyPlan();
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
    backgroundColor: '#07070F',
    height: Platform.OS === 'web' ? '100vh' : '100%',
  },
});
