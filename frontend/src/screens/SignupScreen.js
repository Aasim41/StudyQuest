import React, { useState } from 'react';
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
  FadeIn,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import { ALL_BATCHES } from '../config/masterTimetable';

const { width } = Dimensions.get('window');

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('B31');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const { switchBatch, completeOnboarding } = useUser();

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    
    const cleanEnroll = enrollment.trim().toUpperCase();
    if (!cleanEnroll) {
      errs.enrollment = 'Enrollment number is required';
    } else if (cleanEnroll.length < 5) {
      errs.enrollment = 'Enter a valid JUET enrollment (e.g. 231B001)';
    }

    if (!password) {
      errs.password = 'CampusLynx portal password is required';
    } else if (password.length < 4) {
      errs.password = 'Password must be at least 4 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);

    const cleanEnroll = enrollment.trim().toUpperCase();
    const virtualEmail = `${cleanEnroll.toLowerCase()}@juet.ac.in`;

    try {
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, virtualEmail, password);
      } catch (createErr) {
        if (createErr.code === 'auth/email-already-in-use') {
          userCredential = await signInWithEmailAndPassword(auth, virtualEmail, password);
        } else {
          throw createErr;
        }
      }

      const uid = userCredential.user.uid;
      await updateProfile(userCredential.user, { displayName: fullName.trim() });

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

      // Update Firestore user record
      setDoc(
        doc(db, 'users', uid),
        {
          displayName: fullName.trim(),
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
      let msg = 'Registration failed. Please verify your details.';
      if (error.code === 'auth/weak-password') msg = 'Password is too weak.';
      Alert.alert('Sign Up Error', msg);
    } finally {
      setLoading(false);
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="account-plus-outline" size={36} color="#00D2FF" />
            </View>
            <Text style={styles.title}>Register for JUET Attendance</Text>
            <Text style={styles.subtitle}>Track classes, labs, and criteria with 0 manual math</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>FULL NAME</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'fullName' && styles.inputFocused,
                  errors.fullName && styles.inputError,
                ]}
              >
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color={focusedField === 'fullName' ? '#00D2FF' : COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor={COLORS.textMuted}
                  value={fullName}
                  onChangeText={(txt) => {
                    setFullName(txt);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
                  }}
                  autoCapitalize="words"
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            {/* Enrollment Number */}
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
              {errors.enrollment && <Text style={styles.errorText}>{errors.enrollment}</Text>}
            </View>

            {/* CampusLynx Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>CAMPUSLYNX PORTAL PASSWORD</Text>
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
                  placeholder="Your CampusLynx portal password"
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
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Batch Selector */}
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

            {/* Register Button */}
            <TouchableOpacity
              style={styles.registerButton}
              activeOpacity={0.85}
              onPress={handleRegister}
              disabled={loading}
            >
              <View style={styles.buttonGradient}>
                <MaterialCommunityIcons
                  name={loading ? 'loading' : 'check-circle-outline'}
                  size={22}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.registerButtonText}>
                  {loading ? 'Setting Up...' : 'Register & Start Tracking'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Already have an account */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
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
  keyboardView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'web' ? 40 : 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 210, 255, 0.3)',
    marginBottom: 14,
    ...SHADOWS.glowAccent,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
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
  fieldGroup: { marginBottom: 18 },
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
  inputError: { borderColor: '#FF4757' },
  inputIcon: { marginRight: 10 },
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
  batchPillTextActive: { color: '#00D2FF' },
  registerButton: {
    borderRadius: BORDER_RADIUS.pill,
    overflow: 'hidden',
    marginTop: 8,
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
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: '#00D2FF',
    fontSize: 14,
    fontWeight: '700',
  },
});
