import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const WORKFLOW_STEPS = [
  {
    icon: 'card-account-details-outline',
    title: '1. Enrollment No. & Password',
    desc: 'Sign in directly with your JUET Enrollment Number and CampusLynx password. Your credentials stay secure on your device.'
  },
  {
    icon: 'account-group-outline',
    title: '2. Select Your Batch (e.g. B31)',
    desc: 'Select your batch to automatically load your exact semester class timetable, including lectures, tutorials, and practicals.'
  },
  {
    icon: 'sync',
    title: '3. 1-Tap CampusLynx Sync',
    desc: 'Sync real-time attendance directly from the portal without having to repeatedly solve captchas or re-login.'
  },
  {
    icon: 'calculator-variant-outline',
    title: '4. Smart Bunk Calculator',
    desc: 'See exactly how many upcoming classes you can safely miss, or how many you must attend consecutively to hit 75% or 80%.'
  },
  {
    icon: 'flask-outline',
    title: '5. Strict Theory vs Lab Isolation',
    desc: 'Practicals and Labs are scored independently from theory so a low lab attendance is never hidden by lectures.'
  }
];

export default function HowItWorksScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How It Works</Text>
        <View style={{ width: 40 }} /> 
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={styles.subtitle}>CampusLynx Attendance Tracking</Text>
          <Text style={styles.description}>
            PocketLynx is built specifically for JUET students to eliminate attendance anxiety. Here is how your attendance and bunk calculations are managed:
          </Text>
        </Animated.View>

        <View style={styles.stepsContainer}>
          {WORKFLOW_STEPS.map((step, index) => (
            <Animated.View 
              key={index} 
              entering={FadeInDown.delay(250 + index * 80).springify()}
              style={styles.stepCard}
            >
              <LinearGradient colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']} style={styles.stepGradient}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name={step.icon} size={26} color="#00D2FF" />
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.footer}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
            <LinearGradient colors={['#6C5CE7', '#00D2FF']} style={styles.primaryBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.primaryBtnText}>Sign In Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: height * 0.06,
    paddingBottom: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  subtitle: {
    color: '#00D2FF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  stepsContainer: {
    gap: 14,
  },
  stepCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  stepDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  primaryBtn: {
    borderRadius: BORDER_RADIUS.pill,
    overflow: 'hidden',
  },
  primaryBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
