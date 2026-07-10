import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS, ANIMATION } from '../theme';
import { GradientButton, FloatingParticle } from '../components/ui';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import API_BASE from '../config/apiConfig';

const { width, height } = Dimensions.get('window');

const EXAMS = ['JEE', 'NEET', 'UPSC', 'CAT', 'GATE', 'CLAT', 'NDA', 'CDS', 'SSC'];
const GRADES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

export default function InstituteSearchScreen({ navigation, route }) {
  const { avatar, userType } = route.params; // 'College Student', 'School Student', 'Coaching & Competitive Exams'
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null); // Full college object or { name, extra }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState(false);

  // For School/Coaching
  const [extraInfo, setExtraInfo] = useState('');

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);

  useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    headerTranslateY.value = withDelay(100, withSpring(0, ANIMATION.springSmooth));
  }, []);

  const headerAnimStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const isCollege = userType === 'College Student';
  const isSchool = userType === 'School Student';

  // Debounced search (College only)
  useEffect(() => {
    if (!isCollege) return;
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/colleges/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.warn('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, isCollege]);

  const handleSelectCollege = (item) => {
    setSelected(item);
    setQuery(item.name);
    setResults([]);
  };

  const handleFinish = async () => {
    let finalInstitute = null;

    if (isCollege) {
      if (!selected) return;
      finalInstitute = {
        id: selected.id,
        name: selected.name,
        state: selected.state,
        district: selected.district,
      };
    } else {
      if (query.trim().length === 0 || extraInfo.length === 0) return;
      finalInstitute = {
        name: query.trim(),
        extra: extraInfo // Grade or Exam
      };
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName || '',
          email: user.email,
          avatar,
          userType,
          institute: finalInstitute,
          xp: 0,
          level: 1,
          streak: 0,
          // onboardingComplete NOT set here yet!
          createdAt: new Date().toISOString(),
        });
      }
      
      // Navigate to next step
      if (isCollege) {
        navigation.navigate('CalendarUpload');
      } else {
        navigation.navigate('SyllabusUpload'); // skip calendar
      }

    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName || '',
          email: user.email,
          avatar,
          userType,
          institute: null,
          xp: 0,
          level: 1,
          streak: 0,
          createdAt: new Date().toISOString(),
        });
      }
      if (isCollege) {
        navigation.navigate('CalendarUpload');
      } else {
        navigation.navigate('SyllabusUpload');
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const renderResult = useCallback(({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => handleSelectCollege(item)}
        activeOpacity={0.7}
      >
        <View style={styles.resultIcon}>
          <Text style={{ fontSize: 20 }}>🏛️</Text>
        </View>
        <View style={styles.resultTextContainer}>
          <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.resultMeta}>
            {item.state}{item.district ? ` · ${item.district}` : ''}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  ), []);

  const isValid = isCollege ? !!selected : (query.trim().length > 0 && extraInfo.length > 0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientOnboarding} style={StyleSheet.absoluteFill} />

      <FloatingParticle size={180} color={COLORS.accent} x={width * 0.65} y={height * 0.1} delay={300} />
      <FloatingParticle size={120} color={COLORS.primary} x={-40} y={height * 0.5} delay={600} />

      <Animated.View style={[styles.header, headerAnimStyle]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.stepLabel}>STEP 3 OF 6</Text>
        <Text style={styles.title}>Your Institute</Text>
        <Text style={styles.subtitle}>
          {isCollege ? 'Search from 50,000+ institutions' : 'Enter your details manually'}
        </Text>
      </Animated.View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }} keyboardShouldPersistTaps="handled">
        {/* Search / Input */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.searchContainer}>
          <LinearGradient
            colors={COLORS.gradientGlass}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.searchGlass, focused && { borderColor: COLORS.primary }]}
          >
            <Text style={styles.searchIcon}>{isCollege ? '🔍' : '🏛️'}</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={isCollege ? "Type your college name..." : (isSchool ? "School name..." : "Coaching institute name...")}
              placeholderTextColor={COLORS.textMuted}
              value={query}
              onChangeText={(text) => { 
                setQuery(text); 
                if (isCollege) setSelected(null); 
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoCapitalize="words"
            />
            {loading && <ActivityIndicator size="small" color={COLORS.accent} />}
            {query.length > 0 && !loading && isCollege && (
              <TouchableOpacity onPress={() => { setQuery(''); setSelected(null); setResults([]); }}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Selected College Card */}
        {isCollege && selected && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.selectedCard}>
            <LinearGradient colors={COLORS.gradientAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.selectedGradient}>
              <Text style={styles.selectedEmoji}>✅</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedName}>{selected.name}</Text>
                <Text style={styles.selectedState}>{selected.state}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* College Search Results */}
        {isCollege && results.length > 0 && !selected && (
          <View style={styles.resultsContent}>
            {results.map((item, index) => renderResult({ item, index }))}
          </View>
        )}

        {/* Non-College Extra Selectors */}
        {!isCollege && (
          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.extraContainer}>
            <Text style={styles.extraTitle}>{isSchool ? 'Select your Grade' : 'Target Exam'}</Text>
            <View style={styles.pillContainer}>
              {(isSchool ? GRADES : EXAMS).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.pill, extraInfo === item && styles.pillSelected]}
                  onPress={() => setExtraInfo(item)}
                >
                  <Text style={[styles.pillText, extraInfo === item && styles.pillTextSelected]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottomContainer}>
        <LinearGradient colors={['transparent', COLORS.background + 'E6', COLORS.background]} style={styles.bottomGradient}>
          <GradientButton
            title={isValid ? "Continue 🚀" : 'Fill Details'}
            onPress={handleFinish}
            loading={saving}
            disabled={!isValid}
            colors={isValid ? COLORS.gradientAccent : ['#333', '#444']}
            style={styles.continueButton}
          />
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xl, paddingTop: height * 0.06, marginBottom: SPACING.lg },
  backButton: { marginBottom: SPACING.md },
  backText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.bodyLarge, fontWeight: '600' },
  stepLabel: { fontSize: FONT_SIZES.caption, fontWeight: '700', color: COLORS.accent, letterSpacing: 2, marginBottom: SPACING.sm },
  title: { fontSize: FONT_SIZES.heading, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs, letterSpacing: -0.5 },
  subtitle: { fontSize: FONT_SIZES.bodyLarge, color: COLORS.textSecondary },
  searchContainer: { paddingHorizontal: SPACING.xl, marginBottom: SPACING.md },
  searchGlass: { flexDirection: 'row', alignItems: 'center', borderRadius: BORDER_RADIUS.xl, borderWidth: 1.5, borderColor: COLORS.glassBorder, paddingHorizontal: SPACING.md, ...SHADOWS.card },
  searchIcon: { fontSize: 18, marginRight: SPACING.sm },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: FONT_SIZES.bodyLarge, paddingVertical: 16 },
  clearText: { color: COLORS.textMuted, fontSize: 16, padding: 4 },
  selectedCard: { marginHorizontal: SPACING.xl, marginBottom: SPACING.md },
  selectedGradient: { flexDirection: 'row', alignItems: 'center', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, ...SHADOWS.glow },
  selectedEmoji: { fontSize: 24, marginRight: SPACING.md },
  selectedName: { fontSize: FONT_SIZES.bodyLarge, fontWeight: '700', color: '#FFF' },
  selectedState: { fontSize: FONT_SIZES.caption, color: 'rgba(255,255,255,0.8)' },
  resultsContent: { paddingHorizontal: SPACING.xl, paddingBottom: 20 },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, marginBottom: SPACING.sm, backgroundColor: COLORS.glass, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  resultIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(108, 92, 231, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  resultTextContainer: { flex: 1 },
  resultName: { fontSize: FONT_SIZES.body, fontWeight: '600', color: COLORS.textPrimary },
  resultMeta: { fontSize: FONT_SIZES.caption, color: COLORS.textMuted, marginTop: 2 },
  extraContainer: { paddingHorizontal: SPACING.xl, marginTop: SPACING.md },
  extraTitle: { color: COLORS.textSecondary, fontSize: FONT_SIZES.bodyLarge, fontWeight: '600', marginBottom: SPACING.md },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  pill: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.pill, backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.glassBorder },
  pillSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.accent },
  pillText: { color: COLORS.textPrimary, fontWeight: '600' },
  pillTextSelected: { color: '#FFF' },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  bottomGradient: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxl, paddingTop: SPACING.xxl },
  continueButton: { width: '100%' },
  skipButton: { alignSelf: 'center', marginTop: SPACING.md, padding: SPACING.sm },
  skipText: { color: COLORS.textMuted, fontSize: FONT_SIZES.body, fontWeight: '500' },
});
