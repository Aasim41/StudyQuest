import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../theme';

const { width } = Dimensions.get('window');

export default function YouTubeFeedScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      // 10.0.2.2 for Android emulator local dev
      const response = await fetch('http://10.0.2.2:3000/api/youtube/feed');
      const data = await response.json();
      if (data.success) {
        setVideos(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      fetchFeed();
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`http://10.0.2.2:3000/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.success) {
        setVideos(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderVideo = ({ item, index }) => {
    const videoId = item.id.videoId;
    const { title, channelTitle, thumbnails } = item.snippet;

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <TouchableOpacity 
          style={styles.videoCard}
          onPress={() => navigation.navigate('YouTubePlayer', { videoId, title, channelTitle })}
        >
          <Image 
            source={{ uri: thumbnails.high.url }} 
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

      {/* Header & Search */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>StudyTube</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search educational videos..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchIconBtn} onPress={handleSearch}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item, index) => item.id?.videoId || index.toString()}
          renderItem={renderVideo}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: 'rgba(10, 10, 15, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  backBtn: { padding: SPACING.sm },
  backBtnText: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '700' },
  headerTitle: { color: COLORS.primary, fontSize: FONT_SIZES.subtitle, fontWeight: '800' },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.glass,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
  },
  searchIconBtn: { padding: SPACING.sm },
  searchIcon: { fontSize: 20 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  feedContent: { paddingBottom: 100 },
  videoCard: {
    marginBottom: SPACING.lg,
  },
  thumbnail: {
    width: '100%',
    height: width * (9 / 16), // 16:9 ratio
    backgroundColor: '#000',
  },
  videoInfo: {
    flexDirection: 'row',
    padding: SPACING.md,
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
  },
});
