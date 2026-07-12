import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
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
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInDown,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS, ANIMATION } from '../theme';
import { GradientButton, FloatingParticle } from '../components/ui';
import { auth, db } from '../../firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const { width, height } = Dimensions.get('window');

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Initialize Google Sign-In with Web Client ID from Firebase
GoogleSignin.configure({
  webClientId: '780918043284-qpdr7guvs2g5smil4fpis4isik7uh9qe.apps.googleusercontent.com', // User provided client ID
});

import API_BASE from '../config/apiConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // Wake up Render backend
  useEffect(() => {
    fetch(`${API_BASE}/api/health`).catch(() => {});
  }, []);

  // Animation values
  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const orbPulse = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance animations
    logoScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    logoRotate.value = withDelay(200, withSpring(360, { damping: 20, stiffness: 60 }));

    titleOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    titleTranslateY.value = withDelay(600, withSpring(0, ANIMATION.springSmooth));

    formOpacity.value = withDelay(900, withTiming(1, { duration: 800 }));
    formTranslateY.value = withDelay(900, withSpring(0, ANIMATION.springSmooth));

    // Continuous orb pulse
    orbPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const logoAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const titleAnimStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const formAnimStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const orbAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(orbPulse.value, [0, 1], [1, 1.3]) },
    ],
    opacity: interpolate(orbPulse.value, [0, 1], [0.15, 0.3]),
  }));

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Navigation handled by auth state listener
    } catch (error) {
      let message = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') message = 'No account found with this email.';
      else if (error.code === 'auth/wrong-password') message = 'Incorrect password.';
      else if (error.code === 'auth/invalid-email') message = 'Invalid email address.';
      else if (error.code === 'auth/too-many-requests') message = 'Too many attempts. Try again later.';
      Alert.alert('Login Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Forgot Password', 'Please enter a valid email address first to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Password Reset', 'A password reset link has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Check if your device supports Google Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Get the users ID token
      const signInResult = await GoogleSignin.signIn();
      let idToken = signInResult.data?.idToken;
      if (!idToken) {
        idToken = signInResult.idToken;
      }
      
      if (!idToken) {
        throw new Error('No ID token found');
      }

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);
      
      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Initialize new user
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date().toISOString(),
          onboardingComplete: false
        });
      }
      // AppNavigator onSnapshot will handle redirect based on onboardingComplete
    } catch (error) {
      console.warn('Google Sign-In Error:', error);
      Alert.alert('Google Login Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (field) => [
    styles.input,
    focusedField === field && styles.inputFocused,
    errors[field] && styles.inputError,
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Animated background gradient */}
      <LinearGradient
        colors={COLORS.gradientOnboarding}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs */}
      <Animated.View style={[styles.orb, styles.orbTopRight, orbAnimStyle]} />
      <FloatingParticle size={180} color={COLORS.accent} x={-50} y={height * 0.6} delay={500} />
      <FloatingParticle size={120} color={COLORS.primary} x={width * 0.7} y={height * 0.15} delay={800} />
      <FloatingParticle size={80} color={COLORS.streak} x={width * 0.5} y={height * 0.75} delay={1200} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Animated.View style={[styles.logoContainer, logoAnimStyle]}>
            <LinearGradient
              colors={COLORS.gradientAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Text style={styles.logoEmoji}>🎯</Text>
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Animated.View style={titleAnimStyle}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Continue your quest to mastery</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.formContainer, formAnimStyle]}>
            {/* Glass card form */}
            <LinearGradient
              colors={COLORS.gradientGlass}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.formGlass}
            >
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>📧  Email</Text>
                <TextInput
                  style={getInputStyle('email')}
                  placeholder="your@email.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={(text) => { setEmail(text); setErrors(prev => ({ ...prev, email: null })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🔒  Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[...getInputStyle('password'), { flex: 1, borderWidth: 0, backgroundColor: 'transparent', paddingRight: 50 }]}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={(text) => { setPassword(text); setErrors(prev => ({ ...prev, password: null })); }}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <GradientButton
                title="Log In"
                onPress={handleLogin}
                loading={loading}
                colors={COLORS.gradientAccent}
                style={styles.loginButton}
              />

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              {/* Google Sign In */}
              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.googleGradient}
                >
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleText}>Continue with Google</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Sign Up Link */}
          <Animated.View
            entering={FadeInUp.delay(1200).duration(600)}
            style={styles.signUpContainer}
          >
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: height * 0.08,
    paddingBottom: SPACING.xxl,
  },
  orb: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.primary,
  },
  orbTopRight: {
    top: -80,
    right: -60,
  },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: SPACING.xl,
  },
  logoGradient: {
    width: 90,
    height: 90,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow,
  },
  logoEmoji: {
    fontSize: 42,
  },
  welcomeText: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: FONT_SIZES.bodyLarge,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  formContainer: {
    marginBottom: SPACING.lg,
  },
  formGlass: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: FONT_SIZES.body,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  eyeText: {
    fontSize: 18,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.caption,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotText: {
    color: COLORS.textAccent,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: SPACING.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    marginHorizontal: SPACING.md,
    fontSize: FONT_SIZES.body,
  },
  googleButton: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  googleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  googleText: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  signUpText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
  },
  signUpLink: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
  },
});
