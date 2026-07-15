import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import YoutubePlayer from 'react-native-youtube-iframe';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../theme';
import { GlassCard } from '../components/ui';
import { useUser } from '../context/UserContext';
import API_BASE from '../config/apiConfig';

const { width, height } = Dimensions.get('window');

export default function YouTubePlayerScreen({ route, navigation }) {
  const { videoId, title, channelTitle } = route.params;

  const [playing, setPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const { savedVideos, saveVideo, removeVideo } = useUser();
  const isSaved = savedVideos.some(v => v.videoId === videoId);

  const handleSummarize = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSummaryData(null);
    setPlaying(false); // Pause video when summarizing

    try {
      const response = await fetch(`${API_BASE}/api/youtube/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: `https://youtube.com/watch?v=${videoId}` })
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

  const handleDownload = () => {
    if (!summaryData) {
      Alert.alert("Notice", "Please generate the AI Study Notes first. The download feature will save this video and its notes offline.");
      return;
    }
    // Mock save logic
    Alert.alert("Saved!", "This video and its study notes have been saved to your Offline Downloads.");
  };

  const handleToggleSave = () => {
    if (isSaved) {
      removeVideo(videoId);
    } else {
      saveVideo({ videoId, title, channelTitle, summaryData });
      Alert.alert("Saved to Library", "You can access this video in your Saved Videos tab.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Video Player */}
        <View style={styles.playerWrapper}>
          <YoutubePlayer
            height={width * (9 / 16)}
            play={playing}
            videoId={videoId}
            onChangeState={(state) => {
              if (state === 'ended') setPlaying(false);
            }}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.videoTitle}>{title}</Text>
          <Text style={styles.channelName}>{channelTitle}</Text>

          {/* Action Bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionBar}>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionIcon}>👍</Text>
              <Text style={styles.actionText}>Like</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionIcon}>↪️</Text>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
              <Text style={styles.actionIcon}>⬇️</Text>
              <Text style={styles.actionText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleToggleSave}>
              <Text style={styles.actionIcon}>{isSaved ? '✅' : '➕'}</Text>
              <Text style={styles.actionText}>{isSaved ? 'Saved' : 'Save'}</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Summarize Button */}
          <TouchableOpacity 
            style={styles.summarizeBtn} 
            onPress={handleSummarize}
            disabled={isLoading}
          >
            <LinearGradient colors={['#3498DB', '#2980B9']} style={styles.gradientBg}>
              {isLoading ? (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <ActivityIndicator color="#FFF" style={{marginRight: 10}} />
                  <Text style={styles.summarizeBtnText}>Groq is analyzing...</Text>
                </View>
              ) : (
                <Text style={styles.summarizeBtnText}>✨ Generate AI Study Notes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Error / Guardrail Message */}
        {errorMsg && (
          <Animated.View entering={FadeInUp.springify()} style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </Animated.View>
        )}

        {/* AI Summary Results */}
        {summaryData && (
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.resultsContainer}>
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
          </Animated.View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  backBtn: { 
    padding: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backBtnText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  scrollContent: { paddingBottom: SPACING.xxl * 3 },
  playerWrapper: {
    width: '100%',
    backgroundColor: '#000',
    marginTop: 0, // No margin so it touches the top (or below absolute header)
  },
  infoSection: {
    padding: SPACING.lg,
  },
  videoTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '800',
    marginBottom: 4,
    lineHeight: 26,
  },
  channelName: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
    marginBottom: SPACING.xl,
  },
  actionBar: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
  },
  actionBtn: {
    backgroundColor: COLORS.glass,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.pill,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  actionText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  summarizeBtn: {
    height: 55,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.glow,
    marginBottom: SPACING.lg,
  },
  gradientBg: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summarizeBtnText: { color: '#FFF', fontSize: FONT_SIZES.bodyLarge, fontWeight: '800' },
  errorContainer: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderWidth: 1,
    borderColor: '#E74C3C',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.lg,
  },
  errorText: { color: '#FFF', fontSize: FONT_SIZES.body, fontWeight: '600', textAlign: 'center' },
  resultsContainer: { paddingHorizontal: SPACING.lg },
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
});
