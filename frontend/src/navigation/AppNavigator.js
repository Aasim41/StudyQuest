import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { auth } from '../../firebaseConfig';
import { useUser } from '../context/UserContext';
import API_BASE from '../config/apiConfig';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import WelcomeLandingScreen from '../screens/WelcomeLandingScreen';
import HowItWorksScreen from '../screens/HowItWorksScreen';

// Core Screens
import DashboardScreen from '../screens/DashboardScreen';
import AttendanceListScreen from '../screens/AttendanceListScreen';
import PlannerScreen from '../screens/PlannerScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import MarksScreen from '../screens/MarksScreen';
import ExamScheduleScreen from '../screens/ExamScheduleScreen';
import FacultyScreen from '../screens/FacultyScreen';
import RegisteredSubjectsScreen from '../screens/RegisteredSubjectsScreen';
import AvatarSelectionScreen from '../screens/AvatarSelectionScreen';
import TimetableCorrectionScreen from '../screens/TimetableCorrectionScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'fade_from_bottom',
      animationDuration: 300,
    }}
  >
    <Stack.Screen name="Welcome" component={WelcomeLandingScreen} />
    <Stack.Screen name="HowItWorks" component={HowItWorksScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        height: 62,
        borderRadius: 22,
        backgroundColor: 'rgba(18, 17, 26, 0.96)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.07)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
      },
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#C5BBED',
      tabBarInactiveTintColor: '#686777',
      tabBarIcon: ({ color, size, focused }) => {
        let iconName = 'home-variant-outline';
        if (route.name === 'Dashboard') {
          iconName = focused ? 'home-variant' : 'home-variant-outline';
        } else if (route.name === 'Attendance') {
          iconName = focused ? 'checkbox-marked-circle' : 'checkbox-marked-circle-outline';
        } else if (route.name === 'Schedule') {
          iconName = focused ? 'calendar-clock' : 'calendar-clock-outline';
        } else if (route.name === 'Analytics') {
          iconName = focused ? 'chart-box' : 'chart-box-outline';
        }

        return (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {focused && (
              <View
                style={{
                  position: 'absolute',
                  width: 38,
                  height: 38,
                  backgroundColor: 'rgba(197, 187, 237, 0.14)',
                  borderRadius: 19,
                }}
              />
            )}
            <MaterialCommunityIcons name={iconName} size={24} color={color} />
          </View>
        );
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Attendance" component={AttendanceListScreen} />
    <Tab.Screen name="Schedule" component={PlannerScreen} />
    <Tab.Screen name="Analytics" component={AnalyticsScreen} />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      animationDuration: 280,
    }}
  >
    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    <Stack.Screen name="AttendanceList" component={AttendanceListScreen} />
    <Stack.Screen name="Marks" component={MarksScreen} />
    <Stack.Screen name="ExamSchedule" component={ExamScheduleScreen} />
    <Stack.Screen name="Faculty" component={FacultyScreen} />
    <Stack.Screen name="RegisteredSubjects" component={RegisteredSubjectsScreen} />
    <Stack.Screen
      name="AvatarSelection"
      component={AvatarSelectionScreen}
      options={{ presentation: 'fullScreenModal' }}
    />
    <Stack.Screen name="TimetableCorrection" component={TimetableCorrectionScreen} />
  </Stack.Navigator>
);

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#C5BBED" />
  </View>
);

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { loadFirestoreStats, loadLocalStudyPlan } = useUser();

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

  if (authLoading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      {!user ? <AuthStack /> : <MainStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0B13',
    height: Platform.OS === 'web' ? '100vh' : '100%',
  },
});
