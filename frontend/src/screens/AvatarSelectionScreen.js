import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { SvgUri } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { COLORS, SPACING, FONT_SIZES, FONTS, BORDER_RADIUS, SHADOWS } from '../theme';

const { width } = Dimensions.get('window');

// ─── CUSTOMIZATION OPTIONS ───────────────────────────────────────────────────

const SKIN_COLORS = [
  { value: 'ffdbb4', label: 'Light' },
  { value: 'edb98a', label: 'Fair' },
  { value: 'd08b5b', label: 'Medium' },
  { value: 'ae5d29', label: 'Tan' },
  { value: '614335', label: 'Brown' },
  { value: 'f8d25c', label: 'Golden' },
];

const HAIR_STYLES = [
  { value: 'shortFlat', label: 'Short Flat' },
  { value: 'shortRound', label: 'Short Round' },
  { value: 'shortWaved', label: 'Short Waved' },
  { value: 'shortCurly', label: 'Short Curly' },
  { value: 'sides', label: 'Sides' },
  { value: 'theCaesar', label: 'Caesar' },
  { value: 'theCaesarAndSidePart', label: 'Caesar Side' },
  { value: 'bob', label: 'Bob' },
  { value: 'bun', label: 'Bun' },
  { value: 'curly', label: 'Curly' },
  { value: 'curvy', label: 'Curvy' },
  { value: 'dreads', label: 'Dreads' },
  { value: 'longButNotTooLong', label: 'Long' },
  { value: 'straight01', label: 'Straight' },
  { value: 'straight02', label: 'Straight 2' },
  { value: 'straightAndStrand', label: 'Strand' },
  { value: 'shavedSides', label: 'Shaved' },
  { value: 'froBand', label: 'Fro Band' },
  { value: 'fro', label: 'Fro' },
  { value: 'bigHair', label: 'Big Hair' },
  { value: 'turban', label: 'Turban' },
  { value: 'winterHat01', label: 'Beanie' },
];

const HAIR_COLORS = [
  { value: '2c1b18', label: 'Black' },
  { value: '4a312c', label: 'Dark Brown' },
  { value: '724133', label: 'Brown' },
  { value: 'a55728', label: 'Auburn' },
  { value: 'b58143', label: 'Caramel' },
  { value: 'd6b370', label: 'Blonde' },
  { value: 'e8e1e1', label: 'Platinum' },
  { value: 'c93305', label: 'Red' },
  { value: '6C5CE7', label: 'Purple' },
  { value: '00b4d8', label: 'Blue' },
];

const EYE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'happy', label: 'Happy' },
  { value: 'wink', label: 'Wink' },
  { value: 'hearts', label: 'Hearts' },
  { value: 'surprised', label: 'Surprised' },
  { value: 'side', label: 'Side' },
  { value: 'squint', label: 'Squint' },
  { value: 'dizzy', label: 'Dizzy' },
  { value: 'eyeRoll', label: 'Eye Roll' },
  { value: 'winkWacky', label: 'Wink Wacky' },
];

const EYEBROW_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'defaultNatural', label: 'Natural' },
  { value: 'raisedExcited', label: 'Raised' },
  { value: 'raisedExcitedNatural', label: 'Raised Alt' },
  { value: 'flatNatural', label: 'Flat' },
  { value: 'upDown', label: 'Up Down' },
  { value: 'upDownNatural', label: 'Up Down Alt' },
  { value: 'angry', label: 'Angry' },
  { value: 'angryNatural', label: 'Angry Alt' },
  { value: 'sadConcerned', label: 'Sad' },
  { value: 'unibrowNatural', label: 'Unibrow' },
];

const MOUTH_OPTIONS = [
  { value: 'smile', label: 'Smile' },
  { value: 'default', label: 'Default' },
  { value: 'twinkle', label: 'Twinkle' },
  { value: 'tongue', label: 'Tongue' },
  { value: 'eating', label: 'Eating' },
  { value: 'serious', label: 'Serious' },
  { value: 'grimace', label: 'Grimace' },
  { value: 'sad', label: 'Sad' },
  { value: 'concerned', label: 'Concerned' },
  { value: 'disbelief', label: 'Disbelief' },
  { value: 'screamOpen', label: 'Scream' },
];

const FACIAL_HAIR_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'beardLight', label: 'Light Beard' },
  { value: 'beardMedium', label: 'Medium Beard' },
  { value: 'beardMajestic', label: 'Full Beard' },
  { value: 'moustacheFancy', label: 'Fancy Stache' },
  { value: 'moustacheMagnum', label: 'Magnum Stache' },
];

const ACCESSORY_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'prescription01', label: 'Glasses 1' },
  { value: 'prescription02', label: 'Glasses 2' },
  { value: 'round', label: 'Round' },
  { value: 'sunglasses', label: 'Sunglasses' },
  { value: 'wayfarers', label: 'Wayfarers' },
  { value: 'kurt', label: 'Kurt' },
];

const CLOTHING_OPTIONS = [
  { value: 'hoodie', label: 'Hoodie' },
  { value: 'blazerAndShirt', label: 'Blazer' },
  { value: 'blazerAndSweater', label: 'Sweater' },
  { value: 'collarAndSweater', label: 'Collar' },
  { value: 'graphicShirt', label: 'Graphic Tee' },
  { value: 'overall', label: 'Overall' },
  { value: 'shirtCrewNeck', label: 'Crew Neck' },
  { value: 'shirtScoopNeck', label: 'Scoop Neck' },
  { value: 'shirtVNeck', label: 'V-Neck' },
];

const CLOTHES_COLORS = [
  { value: '3c4f5c', label: 'Charcoal' },
  { value: '65c9ff', label: 'Sky Blue' },
  { value: '25557c', label: 'Navy' },
  { value: 'e6e6e6', label: 'White' },
  { value: '929598', label: 'Gray' },
  { value: 'ff5c5c', label: 'Red' },
  { value: 'ff488e', label: 'Pink' },
  { value: '6C5CE7', label: 'Purple' },
  { value: '262e33', label: 'Black' },
];

// ─── CATEGORY TABS ───────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'skin', label: 'Skin', icon: 'face-man-profile', options: SKIN_COLORS, isColor: true },
  { id: 'top', label: 'Hair', icon: 'content-cut', options: HAIR_STYLES, isColor: false },
  { id: 'hairColor', label: 'Hair Color', icon: 'palette', options: HAIR_COLORS, isColor: true },
  { id: 'eyes', label: 'Eyes', icon: 'eye-outline', options: EYE_OPTIONS, isColor: false },
  { id: 'eyebrows', label: 'Brows', icon: 'arrow-up-bold-outline', options: EYEBROW_OPTIONS, isColor: false },
  { id: 'mouth', label: 'Mouth', icon: 'emoticon-happy-outline', options: MOUTH_OPTIONS, isColor: false },
  { id: 'facialHair', label: 'Beard', icon: 'face-man-shimmer', options: FACIAL_HAIR_OPTIONS, isColor: false },
  { id: 'accessories', label: 'Glasses', icon: 'glasses', options: ACCESSORY_OPTIONS, isColor: false },
  { id: 'clothing', label: 'Outfit', icon: 'tshirt-crew-outline', options: CLOTHING_OPTIONS, isColor: false },
  { id: 'clothesColor', label: 'Outfit Color', icon: 'palette-outline', options: CLOTHES_COLORS, isColor: true },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function AvatarSelectionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userStats, saveStatsToFirestore } = useUser();
  const isEditing = route.params?.isEditing || false;

  const [activeCategory, setActiveCategory] = useState('skin');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Avatar customization state
  const [config, setConfig] = useState({
    skin: 'ffdbb4',
    top: 'shortFlat',
    hairColor: '2c1b18',
    eyes: 'default',
    eyebrows: 'default',
    mouth: 'smile',
    facialHair: '',
    accessories: '',
    clothing: 'hoodie',
    clothesColor: '3c4f5c',
  });

  // Parse existing avatar URL when editing
  useEffect(() => {
    if (isEditing && userStats?.avatarUrl) {
      try {
        const url = new URL(userStats.avatarUrl);
        const params = url.searchParams;
        setConfig(prev => ({
          ...prev,
          skin: params.get('skinColor') || prev.skin,
          top: params.get('top') || prev.top,
          hairColor: params.get('hairColor') || prev.hairColor,
          eyes: params.get('eyes') || prev.eyes,
          eyebrows: params.get('eyebrows') || prev.eyebrows,
          mouth: params.get('mouth') || prev.mouth,
          facialHair: params.get('facialHair') || '',
          accessories: params.get('accessories') || '',
          clothing: params.get('clothing') || prev.clothing,
          clothesColor: params.get('clothesColor') || prev.clothesColor,
        }));
      } catch (e) {
        // If URL parsing fails, keep defaults
      }
    }
  }, []);

  // Build the DiceBear URL
  const buildAvatarUrl = useCallback(() => {
    const base = 'https://api.dicebear.com/9.x/avataaars/svg';
    const params = new URLSearchParams();
    params.set('skinColor', config.skin);
    params.set('top', config.top);
    params.set('hairColor', config.hairColor);
    params.set('eyes', config.eyes);
    params.set('eyebrows', config.eyebrows);
    params.set('mouth', config.mouth);
    if (config.facialHair) {
      params.set('facialHair', config.facialHair);
      params.set('facialHairProbability', '100');
      params.set('facialHairColor', config.hairColor);
    } else {
      params.set('facialHairProbability', '0');
    }
    if (config.accessories) {
      params.set('accessories', config.accessories);
      params.set('accessoriesProbability', '100');
    } else {
      params.set('accessoriesProbability', '0');
    }
    params.set('clothing', config.clothing);
    params.set('clothesColor', config.clothesColor);
    params.set('backgroundColor', 'b6e3f4');
    return `${base}?${params.toString()}`;
  }, [config]);

  const currentAvatarUrl = buildAvatarUrl();

  const updateOption = (categoryId, value) => {
    setLoading(true);
    setConfig(prev => ({ ...prev, [categoryId]: value }));
    setTimeout(() => setLoading(false), 300);
  };

  const randomize = () => {
    setLoading(true);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)].value;
    setConfig({
      skin: pick(SKIN_COLORS),
      top: pick(HAIR_STYLES),
      hairColor: pick(HAIR_COLORS),
      eyes: pick(EYE_OPTIONS),
      eyebrows: pick(EYEBROW_OPTIONS),
      mouth: pick(MOUTH_OPTIONS),
      facialHair: Math.random() > 0.5 ? pick(FACIAL_HAIR_OPTIONS.filter(o => o.value)) : '',
      accessories: Math.random() > 0.5 ? pick(ACCESSORY_OPTIONS.filter(o => o.value)) : '',
      clothing: pick(CLOTHING_OPTIONS),
      clothesColor: pick(CLOTHES_COLORS),
    });
    setTimeout(() => setLoading(false), 400);
  };

  const handleSave = () => {
    // Fire and forget: update context and start Firestore save in background
    saveStatsToFirestore({ ...userStats, avatarUrl: currentAvatarUrl });
    
    if (isEditing) {
      navigation.goBack();
    } else {
      navigation.navigate('UserType');
    }
  };

  const handleSkip = () => {
    navigation.navigate('UserType');
  };

  const activeCat = CATEGORIES.find(c => c.id === activeCategory);

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  const renderColorSwatch = ({ item }) => {
    const isSelected = config[activeCategory] === item.value;
    return (
      <TouchableOpacity
        onPress={() => updateOption(activeCategory, item.value)}
        style={[styles.colorSwatch, isSelected && styles.colorSwatchSelected]}
      >
        <View style={[styles.colorDot, { backgroundColor: `#${item.value}` }]}>
          {isSelected && <MaterialCommunityIcons name="check" size={18} color="#FFF" />}
        </View>
        <Text style={[styles.swatchLabel, isSelected && styles.swatchLabelSelected]}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  const renderOptionChip = ({ item }) => {
    const isSelected = config[activeCategory] === item.value;
    return (
      <TouchableOpacity
        onPress={() => updateOption(activeCategory, item.value)}
        style={[styles.optionChip, isSelected && styles.optionChipSelected]}
      >
        {isSelected && <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.accent} style={{ marginRight: 4 }} />}
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Avatar' : 'Create Your Avatar'}</Text>
        <Text style={styles.headerSub}>Customize every detail</Text>
      </View>

      {/* Avatar Preview */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.avatarContainer}>
        <LinearGradient colors={['rgba(108,92,231,0.3)', 'rgba(108,92,231,0)']} style={styles.avatarGlow} />
        <View style={styles.avatarCard}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <SvgUri width="150" height="150" uri={currentAvatarUrl} />
          )}
        </View>
        <TouchableOpacity style={styles.randomizeBtn} onPress={randomize}>
          <MaterialCommunityIcons name="dice-multiple" size={20} color="#FFF" />
          <Text style={styles.randomizeText}>Randomize</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Category Tabs */}
      <Animated.View entering={FadeIn.delay(200).duration(400)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryTab, isActive && styles.categoryTabActive]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <MaterialCommunityIcons
                  name={cat.icon}
                  size={20}
                  color={isActive ? '#FFF' : COLORS.textMuted}
                />
                <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Options Grid */}
      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.optionsContainer}>
        <FlatList
          data={activeCat?.options || []}
          renderItem={activeCat?.isColor ? renderColorSwatch : renderOptionChip}
          keyExtractor={(item) => item.value + item.label}
          numColumns={activeCat?.isColor ? 6 : 3}
          key={activeCat?.isColor ? 'color' : 'chip'}
          contentContainerStyle={styles.optionsGrid}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSave} disabled={saving}>
          <LinearGradient
            colors={COLORS.gradientPrimary}
            style={styles.primaryBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
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
      </View>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 56,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.heading,
    fontFamily: FONTS.extraBold,
    color: '#FFF',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: FONT_SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },

  // Avatar preview
  avatarContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -10,
  },
  avatarCard: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    ...SHADOWS.glow,
  },
  randomizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108,92,231,0.3)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.pill,
    marginTop: SPACING.sm,
    gap: 6,
  },
  randomizeText: {
    color: '#FFF',
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.caption,
  },

  // Category tabs
  categoryRow: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: 6,
  },
  categoryTab: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 60,
  },
  categoryTabActive: {
    backgroundColor: 'rgba(108,92,231,0.25)',
    borderColor: COLORS.accent,
  },
  categoryLabel: {
    fontSize: 10,
    fontFamily: FONTS.semiBold,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  categoryLabelActive: {
    color: '#FFF',
  },

  // Options
  optionsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  optionsGrid: {
    paddingBottom: SPACING.md,
  },

  // Color swatches
  colorSwatch: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    maxWidth: (width - SPACING.md * 2) / 6,
  },
  colorSwatchSelected: {},
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  swatchLabel: {
    fontSize: 9,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  swatchLabelSelected: {
    color: COLORS.accent,
  },

  // Option chips
  optionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    margin: 3,
  },
  optionChipSelected: {
    backgroundColor: 'rgba(108,92,231,0.2)',
    borderColor: COLORS.accent,
  },
  chipText: {
    fontSize: 11,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  chipTextSelected: {
    color: '#FFF',
  },

  // Footer
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: BORDER_RADIUS.pill,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  primaryBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: FONT_SIZES.bodyLarge,
    fontFamily: FONTS.extraBold,
    letterSpacing: 1,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  skipBtnText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.body,
    fontFamily: FONTS.semiBold,
  },
});
