import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { gsapEntrance } from '../utils/gsapAnim';

const { height } = Dimensions.get('window');

export default function WelcomeLandingScreen() {
  const navigation = useNavigation();
  const { enterGuestMode } = useUser();

  const heroAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const killHero = gsapEntrance(heroAnim, { duration: 0.45, ease: 'power3.out' });
    const killCard = gsapEntrance(cardAnim, { duration: 0.5, delay: 0.12, ease: 'power3.out' });
    return () => {
      killHero();
      killCard();
    };
  }, []);

  const handleGuest = async () => {
    if (enterGuestMode) {
      await enterGuestMode();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Minimal Nav Header */}
        <View style={styles.navBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <MaterialCommunityIcons name="book-open-page-variant" size={18} color="#00E5FF" />
            </View>
            <Text style={styles.logoText}>StudyQuest</Text>
          </View>
          <TouchableOpacity
            style={styles.navSignInBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.navSignInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: heroAnim,
              transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
            },
          ]}
        >
          <Text style={styles.heroTitle}>
            Master Official Syllabi.{'\n'}
            <Text style={styles.heroTitleAccent}>Catch Every Blindspot.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Stream-exact syllabus chapters, examiner step-marking rubrics, Flow ad-free study lectures, and Regain focus blocking in one tactile workspace.
          </Text>

          {/* Primary Actions */}
          <View style={styles.actionsCol}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.primaryBtnText}>Create Account</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#0B0C12" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestBtn}
              activeOpacity={0.8}
              onPress={handleGuest}
            >
              <MaterialCommunityIcons name="account-arrow-right-outline" size={18} color="#00E5FF" />
              <Text style={styles.guestBtnText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Sample Examiner Card */}
        <Animated.View
          style={[
            styles.previewCard,
            {
              opacity: cardAnim,
              transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardSubject}>PHYSICS • CODE 042</Text>
            <Text style={styles.cardMarks}>3 MARKS</Text>
          </View>

          <Text style={styles.cardTopic}>Photoelectric Effect & Stopping Potential</Text>

          <View style={styles.trapBox}>
            <Text style={styles.trapLabel}>Examiner Deduction Check</Text>
            <Text style={styles.trapBody}>
              Equation eV₀ = hν − Φ₀ alone loses 2 marks unless you state threshold intercept ν₀ and universal graph slope h/e.
            </Text>
          </View>

          <View style={styles.rubricRow}>
            <MaterialCommunityIcons name="check-circle" size={15} color="#00E676" />
            <Text style={styles.rubricText}>
              1m Formula • 1m ν₀ Intercept • 1m Slope = h/e
            </Text>
          </View>
        </Animated.View>

        {/* How It Works Redirect */}
        <TouchableOpacity
          style={styles.howBtn}
          onPress={() => navigation.navigate('HowItWorks')}
          activeOpacity={0.8}
        >
          <Text style={styles.howBtnText}>How Exam Auditing Works →</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C12',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: height * 0.06,
    paddingBottom: 32,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  navSignInBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
  },
  navSignInText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '800',
  },
  heroSection: {
    marginBottom: 28,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 36,
    letterSpacing: -0.7,
    marginBottom: 12,
  },
  heroTitleAccent: {
    color: '#00E5FF',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#8E8EA8',
    lineHeight: 21,
    marginBottom: 24,
  },
  actionsCol: {
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00E5FF',
    paddingVertical: 14,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: '#0B0C12',
    fontSize: 14,
    fontWeight: '900',
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    paddingVertical: 13,
    borderRadius: 10,
  },
  guestBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  previewCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSubject: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00E5FF',
    letterSpacing: 0.6,
  },
  cardMarks: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00E676',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardTopic: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  trapBox: {
    backgroundColor: '#181A28',
    borderLeftWidth: 3,
    borderLeftColor: '#FF4757',
    padding: 10,
    borderRadius: 6,
    gap: 4,
  },
  trapLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF6B81',
  },
  trapBody: {
    fontSize: 12,
    color: '#D0D2E0',
    lineHeight: 17,
  },
  rubricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  rubricText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00E676',
  },
  howBtn: {
    alignItems: 'center',
    marginTop: 22,
    paddingVertical: 8,
  },
  howBtnText: {
    color: '#8E8EA8',
    fontSize: 12,
    fontWeight: '700',
  },
});
