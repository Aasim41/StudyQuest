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
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONTS, SHADOWS } from '../theme';
import { ModernButton, ModernCard, GSAPStagger } from '../components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../../firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
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

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning ☀️');
    else if (hour < 18) setGreeting('Good afternoon 🌤');
    else setGreeting('Good evening 🌙');

    // Wake up backend
    fetch(`${API_BASE}/api/health`).catch(() => {});
  }, []);

  // GSAP-like Timed Character Walk-in & Physics
  const mascotX = useSharedValue(-width * 0.7);
  const mascotBob = useSharedValue(0);
  const mascotScale = useSharedValue(0.7);
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(35);

  useEffect(() => {
    // 1. GSAP-style character walking in from left with bounce steps
    mascotX.value = withTiming(0, {
      duration: 1100,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
    mascotScale.value = withSpring(1, { damping: 12, stiffness: 120 });

    // Step bobs (6 fluid steps)
    mascotBob.value = withSequence(
      withTiming(-12, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 90, easing: Easing.in(Easing.quad) }),
      withTiming(-14, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 90, easing: Easing.in(Easing.quad) }),
      withTiming(-12, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 90, easing: Easing.in(Easing.quad) }),
      withTiming(-10, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 90, easing: Easing.in(Easing.quad) }),
      withTiming(-8, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 90, easing: Easing.in(Easing.quad) })
    );

    // 2. Idle floating breath after walking completes
    setTimeout(() => {
      mascotBob.value = withRepeat(
        withTiming(-8, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, 1200);

    // 3. Staggered card entrance: Character "delivers" the sleek login card
    cardOpacity.value = withDelay(700, withTiming(1, { duration: 450 }));
    cardTranslateY.value = withDelay(700, withSpring(0, { damping: 16, stiffness: 110 }));
    cardScale.value = withDelay(700, withSpring(1, { damping: 14, stiffness: 130 }));
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
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email.trim())) newErrors.email = 'Invalid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'At least 6 characters required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      let msg = 'Failed to sign in. Please check your credentials.';
      if (error.code === 'auth/user-not-found') msg = 'No account found with this email.';
      else if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
      else if (error.code === 'auth/invalid-credential') msg = 'Invalid credentials. Check email & password.';
      Alert.alert('Sign In Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Reset Password', 'Enter your email address above first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Check Your Inbox', 'Password reset instructions have been sent.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Modern Minimal Grid lines / Subtle ambient */}
      <View style={styles.gridOverlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── CHARACTER MASCOT HERO (GSAP-like fluid walk-in) ───────────────────── */}
          <View style={styles.heroSection}>
            <Animated.View style={[styles.mascotBox, mascotAnimStyle]}>
              <View style={styles.mascotCircle}>
                <MaterialCommunityIcons name="account-school" size={46} color="#00D2FF" />
              </View>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(900).duration(500)} style={styles.greetingBox}>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.heroSubText}>Sign in to your JUET Attendance Portal</Text>
            </Animated.View>
          </View>

          {/* ─── SLEEK MODERN LOGIN CARD ────────────────────────────────────────── */}
          <Animated.View style={[styles.cardWrapper, cardAnimStyle]}>
            <View style={styles.sleekCard}>
              {/* Email Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>COLLEGE EMAIL</Text>
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
                    color={focusedField === 'email' ? COLORS.accent : COLORS.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="student@juetguna.in"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={t => {
                      setEmail(t);
                      if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Password Input */}
              <View style={styles.fieldGroup}>
                <View style={styles.passwordHeaderRow}>
                  <Text style={styles.fieldLabel}>PASSWORD</Text>
                  <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={styles.forgotLink}>Forgot?</Text>
                  </TouchableOpacity>
                </View>
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
                    color={focusedField === 'password' ? COLORS.accent : COLORS.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={t => {
                      setPassword(t);
                      if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(prev => !prev)}
                    style={styles.eyeBtn}
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

              {/* Action Button */}
              <ModernButton
                title={loading ? 'Signing in...' : 'Sign In ➔'}
                onPress={handleLogin}
                loading={loading}
                style={styles.submitBtn}
              />

              {/* Sign up prompt */}
              <View style={styles.signupPromptRow}>
                <Text style={styles.promptText}>New student? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.signupLink}>Create account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Minimal footer */}
          <Text style={styles.footerNote}>JUET GUNA • ATTENDANCE PORTAL V2.0</Text>
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
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 80,
    paddingBottom: 40,
    minHeight: '100%',
    justifyContent: 'center',
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  mascotBox: {
    marginBottom: SPACING.md,
  },
  mascotCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#121226',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 210, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  greetingBox: {
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  heroSubText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },

  // Sleek Card
  cardWrapper: {
    width: '100%',
  },
  sleekCard: {
    backgroundColor: '#0F0F1E',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.xl,
    ...SHADOWS.card,
  },

  fieldGroup: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#080814',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    height: 52,
  },
  inputFocused: {
    borderColor: COLORS.accent,
    backgroundColor: '#0A0A1C',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },

  submitBtn: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
  },

  signupPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  promptText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  signupLink: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '800',
  },

  footerNote: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 1.5,
    marginTop: SPACING.xxl,
  },
});
