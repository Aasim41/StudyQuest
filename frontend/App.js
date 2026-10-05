import React, { useEffect, Component } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';

try {
  if (Platform.OS !== 'web') {
    SplashScreen.preventAutoHideAsync().catch(() => {});
  }
} catch (e) {}

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('StudyQuest caught root error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>StudyQuest</Text>
          <Text style={styles.errorSub}>Loading your workspace...</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (Platform.OS !== 'web') {
      if (fontsLoaded || fontError) {
        SplashScreen.hideAsync().catch(() => {});
      }
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#07070F' }}>
      <SafeAreaProvider>
        <PaperProvider>
          <ErrorBoundary>
            <UserProvider>
              <AppNavigator />
            </UserProvider>
          </ErrorBoundary>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#07070F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorSub: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
});
