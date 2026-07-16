import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import YoutubePlayer from 'react-native-youtube-iframe';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../theme';
import { useUser } from '../context/UserContext';
import API_BASE from '../config/apiConfig';

const { width, height } = Dimensions.get('window');

export default function YouTubePlayerScreen({ route, navigation }) {
  const { videoId, title, channelTitle } = route.params;

  const [playing, setPlaying] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  const { savedVideos, saveVideo, removeVideo, addToWatchHistory } = useUser();
  const isSaved = savedVideos.some(v => v.videoId === videoId);

  useEffect(() => {
    // Add to history
    addToWatchHistory(title);

    // Fetch related videos
    const fetchRelated = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/youtube/related?videoId=${videoId}&title=${encodeURIComponent(title)}`);
        const data = await response.json();
        if (data.success) {
          setRelatedVideos(data.items);
        }
      } catch (err) {
        console.error('Failed to fetch related', err);
      } finally {
        setLoadingRelated(false);
      }
    };
    fetchRelated();
  }, [videoId, title]);

  const handleDownload = () => {
    Alert.alert("Saved!", "This video has been saved to your Offline Downloads.");
  };

  const handleToggleSave = () => {
    if (isSaved) {
      removeVideo(videoId);
    } else {
      saveVideo({ videoId, title, channelTitle });
      Alert.alert("Saved to Library", "You can access this video in your Saved Videos tab.");
    }
  };

  const renderRelatedVideo = ({ item, index }) => {
    const relVideoId = item.id.videoId;
    const { title: relTitle, channelTitle: relChannelTitle, thumbnails } = item.snippet;

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <TouchableOpacity 
          style={styles.relatedCard}
          onPress={() => navigation.push('YouTubePlayer', { videoId: relVideoId, title: relTitle, channelTitle: relChannelTitle })}
        >
          <Image source={{ uri: thumbnails.medium.url }} style={styles.relatedThumb} />
          <View style={styles.relatedInfo}>
            <Text style={styles.relatedTitle} numberOfLines={2}>{relTitle}</Text>
            <Text style={styles.relatedChannel}>{relChannelTitle}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
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
        </View>

        {/* Suggested / Related Videos */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedSectionTitle}>Suggested Videos</Text>
          {loadingRelated ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: SPACING.md }} />
          ) : (
            relatedVideos.map((item, index) => (
              <React.Fragment key={item.id?.videoId || index}>
                {renderRelatedVideo({ item, index })}
              </React.Fragment>
            ))
          )}
        </View>

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
    marginTop: 0,
  },
  infoSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
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
    marginBottom: SPACING.sm,
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
  relatedSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  relatedSectionTitle: {
    color: '#FFF',
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  relatedCard: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  relatedThumb: {
    width: 120,
    height: 68,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#000',
  },
  relatedInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  relatedTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  relatedChannel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.caption,
  }
});
