import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../theme';
import { FloatingParticle, GlassCard } from '../components/ui';
// WebView is commonly used for rendering the YT player, but for simplicity in Expo, we'll just show the thumbnail or use a native player.
// We will mock the iframe/player UI for now.

const { width, height } = Dimensions.get('window');

export default function YouTubeHubScreen({ navigation }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const extractVideoId = (link) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = link.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSummarize = async () => {
    if (!url) return;
    const vidId = extractVideoId(url);
    if (!vidId) {
      Alert.alert("Invalid URL", "Please enter a valid YouTube link.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSummaryData(null);

    try {
      // API call to our backend (mocked delay for now if backend isn't up, but we'll use standard fetch)
      // For local testing on emulator, use 10.0.2.2:3000
      const response = await fetch('http://10.0.2.2:3000/api/youtube/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setErrorMsg(data.error || "Failed to parse video.");
      } else if (!data.educational) {
        setErrorMsg(`❌ Rejected by Guardrails: ${data.reason}`);
      } else {
        setSummaryData(data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Make sure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <FloatingParticle size={150} color={'#FF0000'} x={width * 0.7} y={-20} delay={100} />
      <FloatingParticle size={120} color={COLORS.primary} x={-40} y={height * 0.6} delay={400} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>YouTube Hub</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Paste a Video Link</Text>
          <Text style={styles.sectionSubtitle}>We'll extract the transcript and generate AI study notes.</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="https://youtube.com/watch?v=..."
              placeholderTextColor={COLORS.textSecondary}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.summarizeBtn, !url && styles.summarizeBtnDisabled]} 
            onPress={handleSummarize}
            disabled={!url || isLoading}
          >
            <LinearGradient colors={['#FF0000', '#CC0000']} style={styles.gradientBg}>
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.summarizeBtnText}>Generate Study Notes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Error / Guardrail Message */}
        {errorMsg && (
          <Animated.View entering={FadeInUp.springify()} style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </Animated.View>
        )}

        {/* Summary Results */}
        {summaryData && (
          <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.resultsContainer}>
            
            {/* Mock Player Area */}
            <View style={styles.playerPlaceholder}>
              <Text style={styles.playerText}>▶️ Video Attached</Text>
            </View>

            <Text style={styles.resultTitle}>{summaryData.title}</Text>
            
            <GlassCard style={styles.resultCard}>
              <Text style={styles.cardHeader}>📝 Detailed Summary</Text>
              <Text style={styles.cardText}>{summaryData.summary}</Text>
            </GlassCard>

            <GlassCard style={styles.resultCard}>
              <Text style={styles.cardHeader}>🔑 Key Takeaways</Text>
              {summaryData.keyTakeaways?.map((point, index) => (
                <View key={index} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.cardText}>{point}</Text>
                </View>
              ))}
            </GlassCard>

            <GlassCard style={styles.resultCard}>
              <Text style={styles.cardHeader}>❓ Self-Quiz</Text>
              {summaryData.quizQuestions?.map((q, index) => (
                <View key={index} style={styles.quizItem}>
                  <Text style={styles.quizQ}>Q: {q.question}</Text>
                  <Text style={styles.quizA}>A: {q.answer}</Text>
                </View>
              ))}
            </GlassCard>

            <TouchableOpacity style={styles.saveNotesBtn}>
              <Text style={styles.saveNotesText}>Save to Notebook</Text>
            </TouchableOpacity>
            
          </Animated.View>
        )}
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
    paddingTop: height * 0.08,
    marginBottom: SPACING.lg,
  },
  backBtn: { padding: SPACING.sm },
  backBtnText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, fontWeight: '600' },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.subtitle, fontWeight: '700' },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxl * 3 },
  inputSection: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.heading, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  sectionSubtitle: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  inputContainer: {
    backgroundColor: COLORS.glass,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.glow,
  },
  input: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    paddingVertical: SPACING.md,
  },
  summarizeBtn: {
    height: 55,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  summarizeBtnDisabled: { opacity: 0.5 },
  gradientBg: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summarizeBtnText: { color: '#FFF', fontSize: FONT_SIZES.bodyLarge, fontWeight: '700' },
  errorContainer: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderWidth: 1,
    borderColor: '#E74C3C',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  errorText: { color: '#FFF', fontSize: FONT_SIZES.body, fontWeight: '600', textAlign: 'center' },
  resultsContainer: { marginTop: SPACING.sm },
  playerPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  playerText: { color: '#FFF', fontSize: FONT_SIZES.subtitle, fontWeight: '700' },
  resultTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  resultCard: { padding: SPACING.lg, marginBottom: SPACING.md, width: '100%' },
  cardHeader: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  cardText: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, lineHeight: 24 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: { color: COLORS.primary, fontSize: 18, marginRight: 8, lineHeight: 24 },
  quizItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  quizQ: { color: COLORS.textPrimary, fontWeight: '700', marginBottom: 4 },
  quizA: { color: COLORS.textSecondary, fontStyle: 'italic' },
  saveNotesBtn: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.pill,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  saveNotesText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.bodyLarge },
});
