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
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS, ANIMATION } from '../theme';
import { GradientButton, FloatingParticle } from '../components/ui';
import { auth } from '../../firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import API_BASE from '../config/apiConfig';

const { width, height } = Dimensions.get('window');

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [greeting, setGreeting] = useState('');

  // Wake up Render backend & set greeting
  useEffect(() => {
    const wakeServer = async () => {
      try {
        await fetch(`${API_BASE}/api/health`);
        setServerReady(true);
      } catch (err) {
        setTimeout(wakeServer, 5000);
      }
    };
    wakeServer();

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning ☀️');
    else if (hour < 18) setGreeting('Good Afternoon 🌤');
    else setGreeting('Good Evening 🌙');
  }, []);

  // Animation values
  const mascotTranslateX = useSharedValue(-width);
  const mascotTranslateY = useSharedValue(0);
  const haloOpacity = useSharedValue(0);
  
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(height * 0.3);
  
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // 1. Mascot slides in
    mascotTranslateX.value = withSpring(0, { damping: 14, stiffness: 80 });
    
    // Mascot idle breathing
    setTimeout(() => {
      mascotTranslateY.value = withRepeat(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, 1000);

    // Halo pulse
    haloOpacity.value = withDelay(400, withRepeat(
      withSequence(
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));

    // 2. Form slides up
    formOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(800, withSpring(0, ANIMATION.springSmooth));

    // Button pulse
    buttonScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: mascotTranslateX.value },
      { translateY: mascotTranslateY.value }
    ]
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
    transform: [{ scale: interpolate(haloOpacity.value, [0.1, 0.4], [0.9, 1.1]) }]
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }]
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Invalid email format';
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
    } catch (error) {
      let message = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') message = 'Invalid email or password.';
      else if (error.code === 'auth/invalid-email') message = 'Invalid email address.';
      else if (error.code === 'auth/too-many-requests') message = 'Too many attempts. Try again later.';
      Alert.alert('Login Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Forgot Password', 'Please enter a valid email address in the email field to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Password Reset', 'A password reset link has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', error.message);
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

      {/* Background Gradient */}
      <LinearGradient
        colors={COLORS.gradientOnboarding}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Particles */}
      <FloatingParticle size={150} color={COLORS.accent} x={-30} y={height * 0.2} delay={200} />
      <FloatingParticle size={100} color={COLORS.primary} x={width * 0.7} y={height * 0.6} delay={800} />
      <FloatingParticle size={60} color={COLORS.streak} x={width * 0.2} y={height * 0.8} delay={1200} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {/* Animated Mascot Section */}
          <View style={styles.mascotSection}>
            <Animated.View style={[styles.halo, haloStyle]}>
              <LinearGradient
                colors={['rgba(108, 92, 231, 0.4)', 'rgba(108, 92, 231, 0)']}
                style={StyleSheet.absoluteFill}
                borderRadii={150}
              />
            </Animated.View>
            <Animated.View style={[styles.mascotContainer, mascotStyle]}>
              <Text style={styles.mascotEmoji}>🧑‍🎓</Text>
            </Animated.View>
            <Animated.Text entering={FadeIn.delay(1200).duration(800)} style={styles.greetingText}>
              {greeting}
            </Animated.Text>
            <Animated.Text entering={FadeIn.delay(1600).duration(800)} style={styles.typingText}>
              Let's get you signed in!
            </Animated.Text>
          </View>

          {/* Login Form */}
          <Animated.View style={[styles.formContainer, formStyle]}>
            <LinearGradient
              colors={COLORS.gradientGlass}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.formGlass}
            >
              {/* Email Input */}
              <Animated.View entering={FadeInDown.delay(1000).springify()} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
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
              </Animated.View>

              {/* Password Input */}
              <Animated.View entering={FadeInDown.delay(1100).springify()} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.passwordContainer, focusedField === 'password' && styles.inputFocused, errors.password && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={(text) => { setPassword(text); setErrors(prev => ({ ...prev, password: null })); }}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                    <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </Animated.View>

              {/* Forgot Password */}
              <Animated.View entering={FadeInDown.delay(1200).springify()}>
                <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Login Button */}
              <Animated.View entering={FadeInDown.delay(1300).springify()} style={buttonStyle}>
                <GradientButton 
                  title={!serverReady ? "Waking Server..." : "Login to Quest"}
                  onPress={handleLogin}
                  loading={loading}
                  disabled={!serverReady || loading}
                  colors={COLORS.gradientAccent}
                  style={styles.loginButton}
                />
              </Animated.View>
            </LinearGradient>

            {/* Sign Up Link */}
            <Animated.View entering={FadeIn.delay(1800).duration(600)} style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>

      <Text style={styles.versionBadge}>v2.0</Text>
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
    paddingTop: height * 0.1,
    paddingBottom: SPACING.xxl,
    justifyContent: 'center',
  },
  mascotSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    minHeight: 180,
    justifyContent: 'flex-end',
  },
  halo: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 20,
    alignSelf: 'center',
  },
  mascotContainer: {
    marginBottom: SPACING.md,
  },
  mascotEmoji: {
    fontSize: 80,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 15,
  },
  greetingText: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  typingText: {
    fontSize: FONT_SIZES.bodyLarge,
    color: COLORS.accent,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
  },
  formGlass: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: SPACING.xl,
    ...SHADOWS.glow,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: FONT_SIZES.body,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: FONT_SIZES.body,
    color: COLORS.textPrimary,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  eyeButton: {
    padding: SPACING.sm,
    marginRight: 4,
  },
  eyeText: {
    fontSize: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.caption,
    marginTop: 4,
    fontWeight: '500',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
  },
  loginButton: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  signUpText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
  },
  signUpLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
  },
  versionBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.xl,
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  }
});
