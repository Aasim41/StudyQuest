import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import { gsapEntrance } from '../utils/gsapAnim';

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const { enterGuestMode } = useUser();
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return gsapEntrance(cardAnim, { duration: 0.4, ease: 'power3.out' });
  }, []);

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
      await AsyncStorage.setItem('@userName', fullName.trim()).catch(() => {});

      setDoc(
        doc(db, 'users', uid),
        {
          displayName: fullName.trim(),
          email: cleanEmail,
          level: 1,
          xp: 100,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
      // Firebase onAuthStateChanged in AppNavigator automatically mounts OnboardingStack -> AvatarSelection!
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
          {/* Minimal Back Row */}
          <View style={styles.topRow}>
            {navigation.canGoBack() && (
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Step 1 of 2 • Account credentials</Text>
          </View>

          {/* Form Card */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardAnim,
                transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
              },
            ]}
          >
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
                  size={18}
                  color={focusedField === 'fullName' ? '#00E5FF' : '#777799'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Aarav Sharma"
                  placeholderTextColor="#5A5D75"
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
                  size={18}
                  color={focusedField === 'email' ? '#00E5FF' : '#777799'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="student@example.com"
                  placeholderTextColor="#5A5D75"
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
                  size={18}
                  color={focusedField === 'password' ? '#00E5FF' : '#777799'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#5A5D75"
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
                    size={18}
                    color="#777799"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              activeOpacity={0.85}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Creating Account...' : 'Continue to Exam & Avatar →'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              activeOpacity={0.8}
              onPress={handleGuestEntry}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already registered? </Text>
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
  container: { flex: 1, backgroundColor: '#0B0C12' },
  keyboardView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 32 : 52,
    paddingBottom: 40,
    alignItems: 'center',
  },
  topRow: { width: '100%', maxWidth: 420, marginBottom: 12 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { width: '100%', maxWidth: 420, marginBottom: 18 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.4 },
  subtitle: { color: '#8E8EA8', fontSize: 12, marginTop: 4 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#12141F',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#222436',
  },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: {
    color: '#8E8EA8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0C12',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  inputFocused: { borderColor: '#00E5FF' },
  inputError: { borderColor: '#FF4757' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  errorText: { color: '#FF4757', fontSize: 11, marginTop: 4 },
  registerButton: {
    backgroundColor: '#00E5FF',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  registerButtonText: { color: '#0B0C12', fontSize: 13, fontWeight: '900' },
  guestButton: {
    backgroundColor: '#161824',
    borderWidth: 1.5,
    borderColor: '#2A2D40',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  guestButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  footerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  footerText: { color: '#8E8EA8', fontSize: 12 },
  footerLink: { color: '#00E5FF', fontSize: 12, fontWeight: '800' },
});
