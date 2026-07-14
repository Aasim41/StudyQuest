import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../theme';
import { GradientButton, FloatingParticle } from '../components/ui';
import API_BASE from '../config/apiConfig';

const { width, height } = Dimensions.get('window');

export default function CalendarUploadScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const pickAndUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const file = result.assets[0];
      
      setLoading(true);
      setUploadStatus('Scanning calendar events...');

      const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
      
      const res = await fetch(`${API_BASE}/api/parse/calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: base64,
          mimeType: file.mimeType || 'application/octet-stream'
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        Alert.alert('Parse Error', 'Server returned invalid data. Is the server awake?');
        setLoading(false);
        setUploadStatus('');
        return;
      }

      if (data.success) {
        navigation.navigate('CalendarCorrection', { parsedCalendar: data.calendar });
      } else {
        Alert.alert('Upload Failed', data.error || 'Something went wrong.');
      }
    } catch (err) {
      console.warn('Upload error:', err);
      Alert.alert('Raw Error', String(err));
    } finally {
      setLoading(false);
      setUploadStatus('');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientOnboarding} style={StyleSheet.absoluteFill} />
      
      <FloatingParticle size={180} color={COLORS.primary} x={-50} y={height * 0.1} delay={200} />
      <FloatingParticle size={120} color={COLORS.accent} x={width * 0.6} y={height * 0.5} delay={500} />

      <Animated.View style={styles.header} entering={FadeInDown.delay(100).duration(600)}>
        <Text style={styles.stepLabel}>STEP 4 OF 6</Text>
        <Text style={styles.title}>Academic Calendar</Text>
        <Text style={styles.subtitle}>Upload your college's academic calendar to automatically track holidays, fests, and exams.</Text>
      </Animated.View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <TouchableOpacity 
            style={styles.uploadCard} 
            activeOpacity={0.8}
            onPress={pickAndUpload}
            disabled={loading}
          >
            <LinearGradient
              colors={COLORS.gradientGlass}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.accent} />
                  <Text style={styles.loadingText}>{uploadStatus}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.cardEmoji}>📅</Text>
                  <Text style={styles.cardTitle}>Upload Calendar</Text>
                  <Text style={styles.cardSubtitle}>Tap to browse (PDF or Image)</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('SyllabusUpload')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xl, paddingTop: height * 0.1, marginBottom: SPACING.xxl },
  stepLabel: { fontSize: FONT_SIZES.caption, fontWeight: '700', color: COLORS.accent, letterSpacing: 2, marginBottom: SPACING.sm },
  title: { fontSize: FONT_SIZES.hero, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZES.bodyLarge, color: COLORS.textSecondary, lineHeight: 24 },
  content: { flex: 1, paddingHorizontal: SPACING.xl, justifyContent: 'center' },
  uploadCard: { borderRadius: BORDER_RADIUS.xl, overflow: 'hidden', ...SHADOWS.glow, marginBottom: SPACING.xl },
  cardGradient: { padding: SPACING.xl, alignItems: 'center', justifyContent: 'center', minHeight: 250, borderWidth: 1, borderColor: COLORS.glassBorder },
  cardEmoji: { fontSize: 64, marginBottom: SPACING.md },
  cardTitle: { fontSize: FONT_SIZES.title, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  cardSubtitle: { fontSize: FONT_SIZES.body, color: COLORS.textMuted },
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.textPrimary, marginTop: SPACING.md, fontSize: FONT_SIZES.body, fontWeight: '600' },
  footer: { padding: SPACING.xl, paddingBottom: SPACING.xxl * 2, alignItems: 'center' },
  skipButton: { padding: SPACING.md },
  skipText: { color: COLORS.textMuted, fontSize: FONT_SIZES.bodyLarge, fontWeight: '600' },
});
