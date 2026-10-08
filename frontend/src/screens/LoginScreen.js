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
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import { ALL_BATCHES } from '../config/masterTimetable';
import API_BASE from '../config/apiConfig';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [enrollment, setEnrollment] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('B31');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [greeting, setGreeting] = useState('Welcome back');

  const { switchBatch, completeOnboarding } = useUser();

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
    mascotX.value = withTiming(0, {
      duration: 1100,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
    mascotScale.value = withSpring(1, { damping: 12, stiffness: 120 });

    mascotBob.value = withSequence(
      withTiming(-12, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 90, easing: Easing.in(Easing.quad) }),
      withTiming(-14, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 90, easing: Easing.in(Easing.quad) }),
      withTiming(-12, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 90, easing: Easing.in(Easing.quad) })
    );

    setTimeout(() => {
      mascotBob.value = withRepeat(
        withTiming(-8, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, 1200);

    cardOpacity.value = withDelay(650, withTiming(1, { duration: 450 }));
    cardTranslateY.value = withDelay(650, withSpring(0, { damping: 16, stiffness: 110 }));
    cardScale.value = withDelay(650, withSpring(1, { damping: 14, stiffness: 130 }));
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
    const cleanEnroll = enrollment.trim().toUpperCase();
    if (!cleanEnroll) {
      errs.enrollment = 'Enrollment number is required';
    } else if (cleanEnroll.length < 5) {
      errs.enrollment = 'Enter a valid enrollment number (e.g. 231B001)';
    }

    if (!password) {
      errs.password = 'CampusLynx password is required';
    } else if (password.length < 4) {
      errs.password = 'Password too short';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);

    const cleanEnroll = enrollment.trim().toUpperCase();
    const virtualEmail = `${cleanEnroll.toLowerCase()}@juet.ac.in`;

    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, virtualEmail, password);
      } catch (signInErr) {
        // Auto-register first time student seamlessly
        if (
          signInErr.code === 'auth/user-not-found' ||
          signInErr.code === 'auth/invalid-credential' ||
          signInErr.code === 'auth/invalid-email'
        ) {
          userCredential = await createUserWithEmailAndPassword(auth, virtualEmail, password);
        } else {
          throw signInErr;
        }
      }

      const uid = userCredential.user.uid;

      // Save credentials for automated 1-tap CampusLynx Sync
      await AsyncStorage.setItem(
        `@campuslynx_creds_${uid}`,
        JSON.stringify({ username: cleanEnroll, password: password })
      );

      // Save selected batch
      if (switchBatch) {
        await switchBatch(selectedBatch);
      }
      await AsyncStorage.setItem(`@userBatch_${uid}`, selectedBatch);
      await AsyncStorage.setItem('@onboardingComplete', 'true');

      // Update Firestore user record in background
      setDoc(
        doc(db, 'users', uid),
        {
          enrollmentNumber: cleanEnroll,
          userBatch: selectedBatch,
          onboardingComplete: true,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});

      if (completeOnboarding) {
        await completeOnboarding();
      }

    } catch (error) {
      let msg = 'Failed to sign in. Please verify your Enrollment Number and Password.';
      if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
      Alert.alert('CampusLynx Sign In', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
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
          {/* Mascot Hero Section */}
          <View style={styles.heroSection}>
            <Animated.View style={[styles.mascotBox, mascotAnimStyle]}>
              <View style={styles.mascotCircle}>
                <MaterialCommunityIcons name="card-account-details-star-outline" size={44} color="#00D2FF" />
              </View>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(800).duration(500)} style={styles.greetingBox}>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.heroSubText}>PocketLynx • JUET Attendance Tracker</Text>
            </Animated.View>
          </View>

          {/* Sleek Modern Login Card */}
          <Animated.View style={[styles.cardWrapper, cardAnimStyle]}>
            <View style={styles.sleekCard}>
              
              {/* Enrollment Number Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>ENROLLMENT NUMBER</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'enrollment' && styles.inputFocused,
                    errors.enrollment && styles.inputError,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="card-account-details-outline"
                    size={20}
                    color={focusedField === 'enrollment' ? '#00D2FF' : COLORS.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 231B001"
                    placeholderTextColor={COLORS.textMuted}
                    value={enrollment}
                    onChangeText={(txt) => {
                      setEnrollment(txt.toUpperCase());
                      if (errors.enrollment) setErrors((prev) => ({ ...prev, enrollment: null }));
                    }}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    onFocus={() => setFocusedField('enrollment')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                {errors.enrollment && (
                  <Text style={styles.errorText}>{errors.enrollment}</Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>CAMPUSLYNX PASSWORD</Text>
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
                    placeholder="Enter your portal password"
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
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Batch Selector Row */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>SELECT YOUR BATCH</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.batchScroll}>
                  {ALL_BATCHES.map((b) => {
                    const isSel = selectedBatch === b;
                    return (
                      <TouchableOpacity
                        key={b}
                        onPress={() => setSelectedBatch(b)}
                        style={[styles.batchPill, isSel && styles.batchPillActive]}
                      >
                        <Text style={[styles.batchPillText, isSel && styles.batchPillTextActive]}>
                          {b}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={styles.loginButton}
                activeOpacity={0.85}
                onPress={handleLogin}
                disabled={loading}
              >
                <View style={styles.buttonGradient}>
                  <MaterialCommunityIcons
                    name={loading ? 'loading' : 'shield-sync-outline'}
                    size={22}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.loginButtonText}>
                    {loading ? 'Authenticating...' : 'Sign In & Sync Attendance'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Info text */}
              <View style={styles.infoBadge}>
                <MaterialCommunityIcons name="shield-check" size={15} color="#2ECC71" />
                <Text style={styles.infoBadgeText}>
                  Credentials are used solely to fetch your attendance from CampusLynx.
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Quick link to How it works */}
          <TouchableOpacity
            style={styles.howItWorksLink}
            onPress={() => navigation.navigate('HowItWorks')}
            activeOpacity={0.7}
          >
            <Text style={styles.howItWorksLinkText}>How does CampusLynx sync work?</Text>
          </TouchableOpacity>
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
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'web' ? 40 : 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  mascotBox: {
    marginBottom: 12,
  },
  mascotCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroSubText: {
    color: '#00D2FF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  sleekCard: {
    backgroundColor: 'rgba(16, 16, 36, 0.92)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
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
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF4757',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  batchScroll: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  batchPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  batchPillActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.2)',
    borderColor: '#00D2FF',
  },
  batchPillText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    fontWeight: '800',
  },
  batchPillTextActive: {
    color: '#00D2FF',
  },
  loginButton: {
    borderRadius: BORDER_RADIUS.pill,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
    ...SHADOWS.glowAccent,
  },
  buttonGradient: {
    flexDirection: 'row',
    backgroundColor: '#6C5CE7',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.pill,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.08)',
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  infoBadgeText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  howItWorksLink: {
    marginTop: 20,
    padding: 10,
  },
  howItWorksLinkText: {
    color: '#00D2FF',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
