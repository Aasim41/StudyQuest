import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { SvgUri } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../theme';

const { width } = Dimensions.get('window');

const PRESETS = {
  male: ['Felix', 'Max', 'Sam', 'Oliver', 'Leo', 'Alex'],
  female: ['Mia', 'Sophie', 'Lily', 'Chloe', 'Zoe', 'Emma'],
};

export default function AvatarSelectionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userStats, saveStatsToFirestore } = useUser();
  const isEditing = route.params?.isEditing || false;

  const [seed, setSeed] = useState('Felix');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && userStats?.avatarUrl) {
      // Extract seed from URL if exists
      const match = userStats.avatarUrl.match(/seed=([^&]*)/);
      if (match) {
        setSeed(match[1]);
      }
    } else {
      randomizeAvatar('male');
    }
  }, []);

  const randomizeAvatar = (gender = null) => {
    setLoading(true);
    let arr = [...PRESETS.male, ...PRESETS.female];
    if (gender === 'male') arr = PRESETS.male;
    if (gender === 'female') arr = PRESETS.female;
    
    // Pick random but ensure it changes
    let nextSeed = seed;
    while (nextSeed === seed) {
      nextSeed = arr[Math.floor(Math.random() * arr.length)];
    }
    
    // Add random number to make it completely unique each time
    const uniqueSeed = `${nextSeed}${Math.floor(Math.random() * 1000)}`;
    setSeed(uniqueSeed);
    
    // simulate loading so user sees a flash
    setTimeout(() => setLoading(false), 400);
  };

  const currentAvatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  const handleSave = async () => {
    setSaving(true);
    await saveStatsToFirestore({ ...userStats, avatarUrl: currentAvatarUrl });
    setSaving(false);
    
    if (isEditing) {
      navigation.goBack();
    } else {
      navigation.navigate('UserType');
    }
  };

  const handleSkip = () => {
    navigation.navigate('UserType');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Avatar' : 'Create Avatar'}</Text>
        <Text style={styles.headerSub}>
          Customize your academic persona.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.avatarContainer}>
        <LinearGradient colors={COLORS.gradientGlass} style={styles.avatarCard}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <SvgUri
              width="200"
              height="200"
              uri={currentAvatarUrl}
            />
          )}
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.controlsContainer}>
        <Text style={styles.controlLabel}>Generate Random</Text>
        <View style={styles.presetsRow}>
          <TouchableOpacity style={styles.presetBtn} onPress={() => randomizeAvatar('male')}>
            <Text style={styles.presetEmoji}>👨</Text>
            <Text style={styles.presetText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.presetBtn} onPress={() => randomizeAvatar('female')}>
            <Text style={styles.presetEmoji}>👩</Text>
            <Text style={styles.presetText}>Female</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.presetBtn} onPress={() => randomizeAvatar()}>
            <Text style={styles.presetEmoji}>🎲</Text>
            <Text style={styles.presetText}>Any</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSave} disabled={saving}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.primaryBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryBtnText}>{isEditing ? 'Save Avatar' : 'Looking Good!'}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {!isEditing && (
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipBtnText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: Dimensions.get('window').height * 0.1,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerTitle: { fontSize: FONT_SIZES.heading, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  headerSub: { fontSize: FONT_SIZES.bodyLarge, color: COLORS.textSecondary, textAlign: 'center' },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  avatarCard: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    borderWidth: 3,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  loadingContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  controlLabel: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  presetEmoji: { fontSize: 24, marginBottom: 4 },
  presetText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.caption, fontWeight: '600' },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl * 2,
    marginTop: 'auto',
  },
  primaryBtn: {
    width: '100%',
    borderRadius: BORDER_RADIUS.pill,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  primaryBtnGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '800',
    letterSpacing: 1,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  skipBtnText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  }
});
