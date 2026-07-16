import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../theme';

const { width, height } = Dimensions.get('window');

const WORKFLOW_STEPS = [
  {
    icon: '📚',
    title: 'Upload Data',
    desc: 'Enter your timetable, academic calendar, and syllabus to give the AI context about your studies.'
  },
  {
    icon: '🧠',
    title: 'AI Processing',
    desc: 'Our advanced Llama AI analyzes your inputs and generates a smart, optimized daily study schedule.'
  },
  {
    icon: '📅',
    title: 'Study Plan',
    desc: 'View your personalized schedule. The AI automatically allocates more time to tougher subjects.'
  },
  {
    icon: '⏱️',
    title: 'Focus Timer',
    desc: 'Use the built-in Pomodoro timer to focus on your sessions, earn XP, and level up your academic journey!'
  },
  {
    icon: '🎥',
    title: 'AI Video Summarizer',
    desc: 'Paste any YouTube educational video link, and the AI will extract the transcript and summarize it instantly.'
  }
];

export default function HowItWorksScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How It Works</Text>
        <View style={{ width: 40 }} /> 
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.subtitle}>Supercharge your learning with AI</Text>
          <Text style={styles.description}>
            StudyQuest uses advanced Artificial Intelligence to analyze your academic life and create the perfect study routine. 
            Here is how you can get the most out of it:
          </Text>
        </Animated.View>

        <View style={styles.stepsContainer}>
          {WORKFLOW_STEPS.map((step, index) => (
            <Animated.View 
              key={index} 
              entering={FadeInDown.delay(400 + index * 100).springify()}
              style={styles.stepCard}
            >
              <LinearGradient colors={COLORS.gradientGlass} style={styles.stepGradient}>
                <View style={styles.iconContainer}>
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(1000).springify()} style={styles.footer}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.primaryBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.primaryBtnText}>Got it! Let's Go</Text>
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
    paddingTop: height * 0.07,
    paddingBottom: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder
  },
  backIcon: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  headerTitle: { fontSize: FONT_SIZES.title, fontWeight: '800', color: '#FFF' },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 60, paddingTop: SPACING.lg },
  subtitle: { fontSize: FONT_SIZES.heading, fontWeight: '800', color: COLORS.accent, marginBottom: SPACING.md },
  description: { fontSize: FONT_SIZES.bodyLarge, color: COLORS.textSecondary, lineHeight: 24, marginBottom: SPACING.xl },
  stepsContainer: { gap: SPACING.md },
  stepCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  stepGradient: {
    flexDirection: 'row',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  stepIcon: { fontSize: 24 },
  stepTextContainer: { flex: 1 },
  stepTitle: { fontSize: FONT_SIZES.subtitle, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  stepDesc: { fontSize: FONT_SIZES.body, color: COLORS.textMuted, lineHeight: 20 },
  footer: { marginTop: SPACING.xxl, alignItems: 'center' },
  primaryBtn: { width: '100%', borderRadius: BORDER_RADIUS.pill, overflow: 'hidden' },
  primaryBtnGradient: { paddingVertical: SPACING.lg, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: FONT_SIZES.bodyLarge, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
});
