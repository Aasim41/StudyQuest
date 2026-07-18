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
  FadeInUp,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS, ANIMATION } from '../theme';
import { GradientButton, FloatingParticle } from '../components/ui';
import { auth } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // Password strength
  const passwordStrength = React.useMemo(() => {
    if (!password) return { level: 0, label: '', color: COLORS.textMuted };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: score, label: 'Weak', color: COLORS.error };
    if (score <= 3) return { level: score, label: 'Medium', color: COLORS.warning };
    return { level: score, label: 'Strong', color: COLORS.success };
  }, [password]);

  // Animations
  const logoScale = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(40);
  const orbPulse = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    formOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));
    formTranslateY.value = withDelay(500, withSpring(0, ANIMATION.springSmooth));
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
    transform: [{ scale: logoScale.value }],
  }));

  const formAnimStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const orbAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(orbPulse.value, [0, 1], [1, 1.3]) }],
    opacity: interpolate(orbPulse.value, [0, 1], [0.15, 0.3]),
  }));

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'At least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords don\'t match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(userCredential.user, { displayName: name.trim() });
      // Navigation handled by auth state listener → goes to onboarding
    } catch (error) {
      let message = 'Signup failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') message = 'This email is already registered.';
      else if (error.code === 'auth/invalid-email') message = 'Invalid email address.';
      else if (error.code === 'auth/weak-password') message = 'Password is too weak.';
      Alert.alert('Signup Error', message);
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
      <LinearGradient colors={COLORS.gradientOnboarding} style={StyleSheet.absoluteFill} />

      {/* Floating orbs */}
      <Animated.View style={[styles.orb, styles.orbBottomLeft, orbAnimStyle]} />
      <FloatingParticle size={160} color={COLORS.accent} x={width * 0.6} y={-40} delay={300} />
      <FloatingParticle size={100} color={COLORS.streak} x={-30} y={height * 0.4} delay={700} />

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
              colors={['#FF6B35', '#FFD93D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <MaterialCommunityIcons name="rocket-launch" size={38} color="#FFF" />
            </LinearGradient>
          </Animated.View>

          <Animated.View style={logoAnimStyle}>
            <Text style={styles.titleText}>Join the Quest</Text>
            <Text style={styles.subtitleText}>Your journey to mastery begins here</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.formContainer, formAnimStyle]}>
            <LinearGradient
              colors={COLORS.gradientGlass}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.formGlass}
            >
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>👤  Full Name</Text>
                <TextInput
                  style={getInputStyle('name')}
                  placeholder="John Doe"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={(text) => { setName(text); setErrors(prev => ({ ...prev, name: null })); }}
                  autoCapitalize="words"
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Email */}
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

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🔒  Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1, borderWidth: 0, backgroundColor: 'transparent' }]}
                    placeholder="Create a strong password"
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
                {/* Password Strength Bar */}
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBarBg}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <View
                          key={i}
                          style={[
                            styles.strengthSegment,
                            {
                              backgroundColor: i <= passwordStrength.level
                                ? passwordStrength.color
                                : 'rgba(255,255,255,0.1)',
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                      {passwordStrength.label}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🔐  Confirm Password</Text>
                <TextInput
                  style={getInputStyle('confirmPassword')}
                  placeholder="Re-enter password"
                  placeholderTextColor={COLORS.textMuted}
                  value={confirmPassword}
                  onChangeText={(text) => { setConfirmPassword(text); setErrors(prev => ({ ...prev, confirmPassword: null })); }}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              {/* Signup Button */}
              <GradientButton
                title="Create Account"
                onPress={handleSignup}
                loading={loading}
                colors={['#FF6B35', '#FFD93D']}
                style={styles.signupButton}
              />
            </LinearGradient>
          </Animated.View>

          {/* Login Link */}
          <Animated.View entering={FadeInUp.delay(1000).duration(600)} style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: height * 0.05,
    paddingBottom: SPACING.xxl,
  },
  orb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.streak,
  },
  orbBottomLeft: { bottom: -100, left: -80 },
  logoContainer: { alignSelf: 'center', marginBottom: SPACING.lg },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow,
  },
  titleText: {
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
  formContainer: { marginBottom: SPACING.lg },
  formGlass: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  inputGroup: { marginBottom: SPACING.md },
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
    borderColor: COLORS.streak,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  inputError: { borderColor: COLORS.error },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  eyeButton: { position: 'absolute', right: 12, padding: 8 },
  eyeText: { fontSize: 18 },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.caption,
    marginTop: 4,
    marginLeft: 4,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  strengthBarBg: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    width: 55,
    textAlign: 'right',
  },
  signupButton: { marginTop: SPACING.lg },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body },
  loginLink: { color: COLORS.streak, fontSize: FONT_SIZES.body, fontWeight: '700' },
});
