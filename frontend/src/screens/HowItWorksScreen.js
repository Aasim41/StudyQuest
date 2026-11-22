import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, FONTS } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const WORKFLOW_STEPS = [
  {
    icon: 'school-outline',
    title: '1. Select Your Target Exam',
    desc: 'Choose from CBSE 10th/12th Boards, JEE Main/Advanced, NEET UG, College Semesters, GATE, UPSC, or define a Custom exam target.'
  },
  {
    icon: 'shield-search',
    title: '2. Audit Blindspots That Standard AI Misses',
    desc: 'Paste a syllabus topic or upload question notes. StudyQuest pinpoints exact omission areas—definitions, edge cases, and graph intercepts that generic LLMs fail to mention.'
  },
  {
    icon: 'format-list-checks',
    title: '3. Examiner Marking Scheme Rubrics',
    desc: 'Access official step-marking rubrics. Know exactly how many marks examiners allocate for intermediate formulas, units, labeled diagrams, and concluding remarks.'
  },
  {
    icon: 'radar',
    title: '4. 5-Year Question Probability Radar',
    desc: 'Review questions ranked by recurring patterns and examiner likelihood over the past 5 years so you prioritize high-probability topics first.'
  },
  {
    icon: 'file-pdf-box',
    title: '5. 60s Flashcards & 1-Page Cheat Sheet PDF',
    desc: 'Flip interactive 3D flashcards on exam morning for rapid retention, or export a formatted 1-page printable cheat sheet PDF with one tap.'
  }
];

export default function HowItWorksScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How It Works</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.subtitle}>The AI Exam Blindspot Workflow</Text>
          <Text style={styles.description}>
            StudyQuest is built to eliminate mark loss from overlooked syllabus points and unstandardized answers. Here is how your preparation is secured:
          </Text>
        </Animated.View>

        <View style={styles.stepsContainer}>
          {WORKFLOW_STEPS.map((step, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(150 + index * 70).springify()}
              style={styles.stepCard}
            >
              <LinearGradient colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']} style={styles.stepGradient}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name={step.icon} size={24} color="#00D2FF" />
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.footer}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Signup')}>
            <LinearGradient colors={['#6C5CE7', '#00D2FF']} style={styles.primaryBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.primaryBtnText}>Start Free Exam Audit</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 40,
  },
  subtitle: {
    color: '#00D2FF',
    fontSize: 18,
    fontFamily: FONTS.extraBold,
    marginBottom: 6,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.lg,
  },
  stepsContainer: {
    gap: 12,
  },
  stepCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  stepGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  stepDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: FONTS.regular,
  },
  footer: {
    marginTop: 24,
  },
  primaryBtn: {
    borderRadius: BORDER_RADIUS.pill,
    overflow: 'hidden',
  },
  primaryBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
    letterSpacing: 0.3,
  },
});
