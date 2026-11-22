import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useUser } from '../context/UserContext';
import API_BASE from '../config/apiConfig';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [greeting, setGreeting] = useState('Welcome back');

  const { enterGuestMode, completeOnboarding } = useUser();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning ☀️');
    else if (hour < 18) setGreeting('Good afternoon 🌤');
    else setGreeting('Good evening 🌙');

    // Wake up backend
    fetch(`${API_BASE}/api/health`).catch(() => {});
  }, []);

  // Timed Character Walk-in & Physics
  const mascotX = useSharedValue(-width * 0.7);
  const mascotBob = useSharedValue(0);
  const mascotScale = useSharedValue(0.7);
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(35);

  useEffect(() => {
    mascotX.value = withTiming(0, {
      duration: 1000,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
    mascotScale.value = withSpring(1, { damping: 12, stiffness: 120 });

    mascotBob.value = withSequence(
      withTiming(-10, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 90, easing: Easing.in(Easing.quad) }),
      withTiming(-12, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 90, easing: Easing.in(Easing.quad) })
    );

    setTimeout(() => {
      mascotBob.value = withRepeat(
        withTiming(-6, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, 1100);

    cardOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    cardTranslateY.value = withDelay(500, withSpring(0, { damping: 16, stiffness: 110 }));
    cardScale.value = withDelay(500, withSpring(1, { damping: 14, stiffness: 130 }));
  }, []);

  const mascotAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: mascotX.value },
      { translateY: mascotBob.value },
      { scale: mascotScale.value },
    ],
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { translateY: cardTranslateY.value },
      { scale: cardScale.value },
    ],
  }));

  const validate = () => {
    const errs = {};
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      errs.email = 'Email address is required';
    } else if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      errs.email = 'Enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      await AsyncStorage.setItem('@onboardingComplete', 'true');
      if (completeOnboarding) {
        await completeOnboarding();
      }
    } catch (error) {
      let msg = 'Failed to sign in. Please verify your email and password.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        msg = 'No account found with this email, or password incorrect.';
      } else if (error.code === 'auth/wrong-password') {
        msg = 'Incorrect password.';
      }
      Alert.alert('Sign In', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = async () => {
    if (enterGuestMode) {
      await enterGuestMode();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Animated.View style={[styles.mascotBox, mascotAnimStyle]}>
              <View style={styles.mascotCircle}>
                <MaterialCommunityIcons name="book-open-page-variant" size={40} color="#00D2FF" />
              </View>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(600).duration(400)} style={styles.greetingBox}>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.heroSubText}>StudyQuest • AI Exam Blindspot Auditor</Text>
            </Animated.View>
          </View>

          {/* Sleek Modern Login Card */}
          <Animated.View style={[styles.cardWrapper, cardAnimStyle]}>
            <View style={styles.sleekCard}>
              {/* Email Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'email' && styles.inputFocused,
                    errors.email && styles.inputError,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color={focusedField === 'email' ? '#00D2FF' : COLORS.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. student@gmail.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={(txt) => {
                      setEmail(txt);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Password Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'password' && styles.inputFocused,
                    errors.password && styles.inputError,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={20}
                    color={focusedField === 'password' ? '#00D2FF' : COLORS.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={(txt) => {
                      setPassword(txt);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                    }}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={styles.loginButton}
                activeOpacity={0.85}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#6C5CE7', '#00D2FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <MaterialCommunityIcons
                    name={loading ? 'loading' : 'login'}
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.loginButtonText}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Guest Access Button */}
              <TouchableOpacity
                style={styles.guestButton}
                activeOpacity={0.75}
                onPress={handleGuestEntry}
              >
                <MaterialCommunityIcons name="account-eye-outline" size={18} color="#00D2FF" style={{ marginRight: 8 }} />
                <Text style={styles.guestButtonText}>Explore Instantly as Guest</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Switch to Signup */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07070F',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'web' ? 40 : 54,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  mascotBox: {
    marginBottom: 10,
  },
  mascotCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 210, 255, 0.3)',
    ...SHADOWS.glowAccent,
  },
  greetingBox: {
    alignItems: 'center',
  },
  greetingText: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 3,
  },
  heroSubText: {
    color: '#00D2FF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  sleekCard: {
    backgroundColor: 'rgba(16, 16, 36, 0.94)',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputFocused: {
    borderColor: '#00D2FF',
    backgroundColor: 'rgba(0, 210, 255, 0.04)',
  },
  inputError: {
    borderColor: '#FF4757',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF4757',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
  loginButton: {
    borderRadius: BORDER_RADIUS.pill,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 10,
    ...SHADOWS.glowAccent,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.pill,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: 'rgba(0, 210, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
  },
  guestButtonText: {
    color: '#00D2FF',
    fontSize: 13,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  footerLink: {
    color: '#00D2FF',
    fontSize: 13,
    fontWeight: '800',
  },
});
