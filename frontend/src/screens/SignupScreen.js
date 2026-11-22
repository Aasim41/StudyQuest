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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES, FONTS } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import { EXAM_TARGETS } from '../config/studyGuideData';

const { width } = Dimensions.get('window');

const EXAM_OPTIONS = [
  { id: 'CBSE Class 12 Boards', label: 'CBSE 12th Boards', icon: 'school-outline' },
  { id: 'JEE Main & Advanced', label: 'JEE Main & Adv', icon: 'rocket-launch-outline' },
  { id: 'NEET UG Medical', label: 'NEET UG', icon: 'hospital-box-outline' },
  { id: 'College Semester Exams', label: 'College Semesters', icon: 'domain' },
  { id: 'GATE Engineering', label: 'GATE Exam', icon: 'cog-outline' },
  { id: 'UPSC Civil Services', label: 'UPSC CSE', icon: 'scale-balance' },
  { id: 'Custom / Other Exam', label: 'Custom Exam', icon: 'notebook-edit-outline' },
];

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedExam, setSelectedExam] = useState('CBSE Class 12 Boards');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const { setTargetExam, enterGuestMode } = useUser();

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';

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

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      } catch (createErr) {
        if (createErr.code === 'auth/email-already-in-use') {
          userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        } else {
          throw createErr;
        }
      }

      const uid = userCredential.user.uid;
      await updateProfile(userCredential.user, { displayName: fullName.trim() }).catch(() => {});

      if (setTargetExam) {
        setTargetExam(selectedExam);
      }
      await AsyncStorage.setItem('@targetExam', selectedExam);
      await AsyncStorage.setItem('@userName', fullName.trim());

      // Save initial student profile
      setDoc(
        doc(db, 'users', uid),
        {
          displayName: fullName.trim(),
          email: cleanEmail,
          targetExam: selectedExam,
          level: 1,
          xp: 100,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});

      // Proceed to Avatar Customization
      navigation.navigate('AvatarSelection');
    } catch (error) {
      let msg = error.message || 'Registration failed. Please check your credentials.';
      if (error.code === 'auth/invalid-email') msg = 'Please enter a valid email format.';
      if (error.code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
      Alert.alert('Sign Up Error', msg);
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
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="shield-star-outline" size={36} color="#00D2FF" />
            </View>
            <Text style={styles.title}>Join StudyQuest</Text>
            <Text style={styles.subtitle}>Audit exam blindspots, rubrics & high-yield topics</Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.card}>
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
                  placeholder="e.g. Aarav Sharma"
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

            {/* Email Address */}
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

            {/* Password */}
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
                  placeholder="At least 6 characters"
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
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Target Exam Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>TARGET EXAM</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examScroll}>
                {EXAM_OPTIONS.map((exam) => {
                  const isSel = selectedExam === exam.id;
                  return (
                    <TouchableOpacity
                      key={exam.id}
                      onPress={() => setSelectedExam(exam.id)}
                      style={[styles.examPill, isSel && styles.examPillActive]}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={exam.icon}
                        size={15}
                        color={isSel ? '#00D2FF' : COLORS.textMuted}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.examPillText, isSel && styles.examPillTextActive]}>
                        {exam.label}
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
              <LinearGradient
                colors={['#6C5CE7', '#00D2FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <MaterialCommunityIcons
                  name={loading ? 'loading' : 'check-circle-outline'}
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.registerButtonText}>
                  {loading ? 'Creating Account...' : 'Create Account & Continue'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Quick Guest Bypass Button */}
            <TouchableOpacity
              style={styles.guestButton}
              activeOpacity={0.75}
              onPress={handleGuestEntry}
            >
              <MaterialCommunityIcons name="account-eye-outline" size={18} color="#00D2FF" style={{ marginRight: 8 }} />
              <Text style={styles.guestButtonText}>Explore Instantly as Guest</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Already have an account link */}
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
    paddingTop: Platform.OS === 'web' ? 40 : 54,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 210, 255, 0.3)',
    marginBottom: 12,
    ...SHADOWS.glowAccent,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
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
  examScroll: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  examPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  examPillActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.18)',
    borderColor: '#00D2FF',
  },
  examPillText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    fontWeight: '700',
  },
  examPillTextActive: {
    color: '#00D2FF',
    fontWeight: '800',
  },
  registerButton: {
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
  registerButtonText: {
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
