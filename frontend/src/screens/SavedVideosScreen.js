import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../theme';
import { FloatingParticle } from '../components/ui';
import { useUser } from '../context/UserContext';

const { width, height } = Dimensions.get('window');

export default function SavedVideosScreen() {
  const navigation = useNavigation();
  const { savedVideos } = useUser();

  // Scroll Animation
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 100], [0, -20], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const renderVideo = ({ item, index }) => {
    const { videoId, title, channelTitle } = item;
    // Construct standard YouTube thumbnail
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <TouchableOpacity 
          style={styles.videoCard}
          onPress={() => navigation.navigate('YouTubePlayer', { videoId, title, channelTitle })}
        >
          <Image 
            source={{ uri: thumbnailUrl }} 
            style={styles.thumbnail} 
          />
          <View style={styles.videoInfo}>
            <Image 
              source={{ uri: 'https://ui-avatars.com/api/?name=' + channelTitle + '&background=random' }} 
              style={styles.channelAvatar} 
            />
            <View style={styles.textInfo}>
              <Text style={styles.videoTitle} numberOfLines={2}>{title}</Text>
              <Text style={styles.channelName}>{channelTitle}</Text>
              {item.summaryData && (
                <View style={styles.notesBadge}>
                  <Text style={styles.notesText}>📝 AI Notes Included</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />
      <FloatingParticle size={150} color={COLORS.primary} x={width * 0.8} y={-20} delay={100} />
      <FloatingParticle size={100} color={COLORS.accent} x={-30} y={height * 0.5} delay={400} />

      <Animated.View style={[styles.header, headerAnimatedStyle]} entering={FadeInDown.delay(100).springify()}>
        <Text style={styles.headerTitle}>Your Library</Text>
        <Text style={styles.headerSubtitle}>{savedVideos.length} Saved Videos</Text>
      </Animated.View>

      {savedVideos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📂</Text>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptySubtitle}>Save videos from StudyTube to access them anytime.</Text>
        </View>
      ) : (
        <Animated.FlatList
          data={savedVideos}
          keyExtractor={(item) => item.videoId}
          renderItem={renderVideo}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: height * 0.08,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    zIndex: 10,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.hero, fontWeight: '800' },
  headerSubtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZES.bodyLarge, fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyEmoji: { fontSize: 64, marginBottom: SPACING.md },
  emptyTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.title, fontWeight: '800', marginBottom: SPACING.sm },
  emptySubtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, textAlign: 'center', lineHeight: 22 },
  feedContent: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  videoCard: {
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.glass,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    ...SHADOWS.card
  },
  thumbnail: {
    width: '100%',
    height: width * (9 / 16),
    backgroundColor: '#000',
  },
  videoInfo: {
    flexDirection: 'row',
    padding: SPACING.lg,
    alignItems: 'flex-start',
  },
  channelAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.md,
  },
  textInfo: { flex: 1 },
  videoTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 22,
  },
  channelName: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.caption,
    marginBottom: 8,
  },
  notesBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  notesText: {
    color: '#2ECC71',
    fontSize: 10,
    fontWeight: '700',
  }
});
