import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  FadeInDown,
  FadeIn,
  ZoomIn,
  SlideInUp,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS, ANIMATION } from '../theme';
import { GradientButton, FloatingParticle } from '../components/ui';
import AvatarRenderer from '../components/AvatarRenderer';
import {
  MALE_PRESETS,
  FEMALE_PRESETS,
  DEFAULT_AVATAR,
  SKIN_TONES,
  HAIR_COLORS,
  HAIR_STYLES_MALE,
  HAIR_STYLES_FEMALE,
  EYE_COLORS,
  OUTFIT_COLORS,
  ACCESSORIES,
  BG_GRADIENTS,
} from '../config/avatarConfig';

const { width, height } = Dimensions.get('window');
const PRESET_SIZE = (width - SPACING.xl * 2 - SPACING.md * 2) / 3;

// ─── Gender Tab Component ───────────────────────────────────────────────────
const GenderTabs = ({ selected, onSelect }) => {
  const indicatorLeft = useSharedValue(selected === 'male' ? 0 : 1);

  useEffect(() => {
    indicatorLeft.value = withSpring(selected === 'male' ? 0 : 1, ANIMATION.springBouncy);
  }, [selected]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${indicatorLeft.value * 50}%`,
  }));

  return (
    <View style={styles.genderContainer}>
      <Animated.View style={[styles.genderIndicator, indicatorStyle]} />
      <TouchableOpacity style={styles.genderTab} onPress={() => onSelect('male')}>
        <Text style={[styles.genderText, selected === 'male' && styles.genderTextActive]}>
          ♂️ Male
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.genderTab} onPress={() => onSelect('female')}>
        <Text style={[styles.genderText, selected === 'female' && styles.genderTextActive]}>
          ♀️ Female
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Color Picker Row ───────────────────────────────────────────────────────
const ColorPicker = ({ options, selected, onSelect, label }) => (
  <View style={styles.pickerSection}>
    <Text style={styles.pickerLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          onPress={() => onSelect(opt.color || opt.colors)}
          style={[
            styles.colorDot,
            {
              backgroundColor: opt.color || opt.colors?.[0],
              borderColor: (opt.color || opt.colors?.[0]) === selected
                ? '#FFF'
                : 'transparent',
            },
          ]}
        >
          {(opt.color || opt.colors?.[0]) === selected && (
            <View style={styles.colorCheck}>
              <Text style={{ fontSize: 10, color: '#FFF' }}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// ─── Style Picker Row ───────────────────────────────────────────────────────
const StylePicker = ({ options, selected, onSelect, label }) => (
  <View style={styles.pickerSection}>
    <Text style={styles.pickerLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.styleRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          onPress={() => onSelect(opt.id)}
          style={[
            styles.stylePill,
            selected === opt.id && styles.stylePillActive,
          ]}
        >
          <Text style={[styles.stylePillText, selected === opt.id && styles.stylePillTextActive]}>
            {opt.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// ─── Preset Card ────────────────────────────────────────────────────────────
const PresetCard = ({ preset, index, isSelected, onSelect }) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.88, { damping: 8, stiffness: 200 }),
      withSpring(1.03, { damping: 10, stiffness: 180 }),
      withSpring(1, { damping: 12, stiffness: 150 })
    );
    onSelect(preset);
  };

  return (
    <Animated.View entering={ZoomIn.delay(150 + index * 60).springify()} style={animStyle}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View style={[styles.presetCard, isSelected && { borderColor: preset.bg[0], borderWidth: 2 }]}>
          <AvatarRenderer avatarData={preset} size={PRESET_SIZE - 20} />
          <Text style={[styles.presetName, isSelected && { color: '#FFF', fontWeight: '800' }]}>
            {preset.name}
          </Text>
          {isSelected && (
            <Animated.View entering={ZoomIn.springify()} style={[styles.selectedBadge, { backgroundColor: preset.bg[0] }]}>
              <Text style={styles.checkmark}>✓</Text>
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Screen ────────────────────────────────────────────────────────────
export default function AvatarSelectionScreen({ navigation }) {
  const [gender, setGender] = useState('male');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customAvatar, setCustomAvatar] = useState({ ...DEFAULT_AVATAR });
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [mode, setMode] = useState('presets'); // 'presets' or 'custom'

  const presets = gender === 'male' ? MALE_PRESETS : FEMALE_PRESETS;

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);

  useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    headerTranslateY.value = withDelay(100, withSpring(0, ANIMATION.springSmooth));
  }, []);

  const headerAnimStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    setCustomAvatar({ ...preset });
    setMode('presets');
  };

  const handleGenderChange = (g) => {
    setGender(g);
    setSelectedPreset(null);
    setCustomAvatar(prev => ({ ...prev, gender: g, hairStyle: g === 'male' ? 'neat' : 'long_wavy' }));
  };

  const handleCustomize = () => {
    setMode('custom');
    setShowCustomizer(true);
    if (!selectedPreset) {
      setCustomAvatar(prev => ({ ...prev, gender }));
    }
  };

  const currentAvatar = mode === 'custom' ? customAvatar : (selectedPreset || customAvatar);

  const handleContinue = () => {
    if (!selectedPreset && mode !== 'custom') return;
    navigation.navigate('UserType', { avatar: currentAvatar });
  };

  const hairStyles = gender === 'male' ? HAIR_STYLES_MALE : HAIR_STYLES_FEMALE;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientOnboarding} style={StyleSheet.absoluteFill} />

      <FloatingParticle size={200} color={COLORS.primary} x={width * 0.7} y={-50} delay={200} />
      <FloatingParticle size={150} color={COLORS.accent} x={-60} y={height * 0.65} delay={500} />

      {/* Header */}
      <Animated.View style={[styles.header, headerAnimStyle]}>
        <Text style={styles.stepLabel}>STEP 1 OF 3</Text>
        <Text style={styles.title}>Create Your Avatar</Text>
        <Text style={styles.subtitle}>Choose a preset or customize your own</Text>
      </Animated.View>

      {/* Gender Tabs */}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <GenderTabs selected={gender} onSelect={handleGenderChange} />
      </Animated.View>

      {/* Avatar Preview */}
      <Animated.View entering={FadeIn.delay(400).duration(600)} style={styles.previewContainer}>
        <View style={styles.previewGlow}>
          <AvatarRenderer avatarData={currentAvatar} size={100} />
        </View>
        <TouchableOpacity style={styles.customizeButton} onPress={handleCustomize}>
          <LinearGradient colors={COLORS.gradientGlass} style={styles.customizePill}>
            <Text style={styles.customizeText}>✏️ Customize</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Preset Grid */}
      <FlatList
        data={presets}
        renderItem={({ item, index }) => (
          <PresetCard
            preset={item}
            index={index}
            isSelected={selectedPreset?.id === item.id}
            onSelect={handlePresetSelect}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom */}
      <View style={styles.bottomContainer}>
        <LinearGradient
          colors={['transparent', COLORS.background + 'E6', COLORS.background]}
          style={styles.bottomGradient}
        >
          <GradientButton
            title={(selectedPreset || mode === 'custom') ? 'Continue →' : 'Select or Customize'}
            onPress={handleContinue}
            disabled={!selectedPreset && mode !== 'custom'}
            colors={(selectedPreset || mode === 'custom')
              ? (currentAvatar.bg || COLORS.gradientAccent)
              : ['#333', '#444']
            }
            style={styles.continueButton}
          />
        </LinearGradient>
      </View>

      {/* ─── Customization Modal ────────────────────────────────────────── */}
      <Modal
        visible={showCustomizer}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowCustomizer(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient colors={COLORS.gradientOnboarding} style={StyleSheet.absoluteFill} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCustomizer(false)}>
              <Text style={styles.modalClose}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Customize Avatar</Text>
            <TouchableOpacity onPress={() => { setMode('custom'); setSelectedPreset(null); setShowCustomizer(false); }}>
              <Text style={styles.modalDone}>Done ✓</Text>
            </TouchableOpacity>
          </View>

          {/* Live Preview */}
          <View style={styles.modalPreview}>
            <AvatarRenderer avatarData={customAvatar} size={140} />
          </View>

          <ScrollView
            style={styles.customizerScroll}
            contentContainerStyle={styles.customizerContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Skin Tone */}
            <ColorPicker
              options={SKIN_TONES}
              selected={customAvatar.skin}
              onSelect={(color) => setCustomAvatar(prev => ({ ...prev, skin: color }))}
              label="Skin Tone"
            />

            {/* Hair Color */}
            <ColorPicker
              options={HAIR_COLORS}
              selected={customAvatar.hair}
              onSelect={(color) => setCustomAvatar(prev => ({ ...prev, hair: color }))}
              label="Hair Color"
            />

            {/* Hair Style */}
            <StylePicker
              options={hairStyles}
              selected={customAvatar.hairStyle}
              onSelect={(id) => setCustomAvatar(prev => ({ ...prev, hairStyle: id }))}
              label="Hair Style"
            />

            {/* Eye Color */}
            <ColorPicker
              options={EYE_COLORS}
              selected={customAvatar.eyes}
              onSelect={(color) => setCustomAvatar(prev => ({ ...prev, eyes: color }))}
              label="Eye Color"
            />

            {/* Outfit Color */}
            <ColorPicker
              options={OUTFIT_COLORS}
              selected={customAvatar.outfit}
              onSelect={(color) => setCustomAvatar(prev => ({ ...prev, outfit: color }))}
              label="Outfit Color"
            />

            {/* Accessories */}
            <StylePicker
              options={ACCESSORIES}
              selected={customAvatar.accessory}
              onSelect={(id) => setCustomAvatar(prev => ({ ...prev, accessory: id }))}
              label="Accessory"
            />

            {/* Background */}
            <View style={styles.pickerSection}>
              <Text style={styles.pickerLabel}>Background</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
                {BG_GRADIENTS.map((bg) => (
                  <TouchableOpacity
                    key={bg.id}
                    onPress={() => setCustomAvatar(prev => ({ ...prev, bg: bg.colors }))}
                  >
                    <LinearGradient
                      colors={bg.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.bgDot,
                        customAvatar.bg?.[0] === bg.colors[0] && { borderColor: '#FFF', borderWidth: 2.5 },
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: height * 0.06,
    marginBottom: SPACING.md,
  },
  stepLabel: {
    fontSize: FONT_SIZES.caption, fontWeight: '700', color: COLORS.accent,
    letterSpacing: 2, marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.heading, fontWeight: '800', color: COLORS.textPrimary,
    marginBottom: SPACING.xs, letterSpacing: -0.5,
  },
  subtitle: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary },

  // Gender Tabs
  genderContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.glass,
    borderRadius: BORDER_RADIUS.pill,
    padding: 3,
    marginBottom: SPACING.md,
    position: 'relative',
  },
  genderIndicator: {
    position: 'absolute',
    top: 3, bottom: 3,
    width: '50%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.pill,
  },
  genderTab: {
    flex: 1, paddingVertical: 10, alignItems: 'center', zIndex: 1,
  },
  genderText: {
    fontSize: FONT_SIZES.body, fontWeight: '600', color: COLORS.textMuted,
  },
  genderTextActive: { color: '#FFF' },

  // Preview
  previewContainer: {
    alignItems: 'center', marginBottom: SPACING.md,
  },
  previewGlow: {
    borderRadius: 30,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  customizeButton: { marginTop: SPACING.sm },
  customizePill: {
    paddingHorizontal: SPACING.md, paddingVertical: 8,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  customizeText: {
    fontSize: FONT_SIZES.caption, fontWeight: '600', color: COLORS.textPrimary,
  },

  // Preset Grid
  grid: { paddingHorizontal: SPACING.xl, paddingBottom: 130 },
  row: { justifyContent: 'space-between', marginBottom: SPACING.md },
  presetCard: {
    width: PRESET_SIZE, alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    paddingTop: SPACING.sm, paddingBottom: SPACING.sm,
    backgroundColor: COLORS.glass,
    overflow: 'hidden',
  },
  presetName: {
    fontSize: FONT_SIZES.caption, fontWeight: '600',
    color: COLORS.textSecondary, marginTop: 4,
  },
  selectedBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  checkmark: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  // Bottom
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  bottomGradient: {
    paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxl, paddingTop: SPACING.xxl,
  },
  continueButton: { width: '100%' },

  // ─── Modal ────────────────────────────────────────────────────────
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl, paddingTop: height * 0.06, paddingBottom: SPACING.md,
  },
  modalClose: { color: COLORS.textSecondary, fontSize: FONT_SIZES.bodyLarge, fontWeight: '600' },
  modalTitle: { fontSize: FONT_SIZES.subtitle, fontWeight: '700', color: COLORS.textPrimary },
  modalDone: { color: COLORS.accent, fontSize: FONT_SIZES.bodyLarge, fontWeight: '700' },
  modalPreview: {
    alignItems: 'center', marginBottom: SPACING.lg,
  },
  customizerScroll: { flex: 1 },
  customizerContent: { paddingHorizontal: SPACING.xl },

  // Pickers
  pickerSection: { marginBottom: SPACING.lg },
  pickerLabel: {
    fontSize: FONT_SIZES.body, fontWeight: '700', color: COLORS.textPrimary,
    marginBottom: SPACING.sm, letterSpacing: 0.5,
  },
  colorRow: { flexDirection: 'row', gap: SPACING.sm },
  colorDot: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 2.5, borderColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  colorCheck: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  bgDot: {
    width: 44, height: 44, borderRadius: 12, marginRight: SPACING.sm,
  },
  styleRow: { flexDirection: 'row', gap: SPACING.sm },
  stylePill: {
    paddingHorizontal: SPACING.md, paddingVertical: 8,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.glass,
    borderWidth: 1, borderColor: COLORS.border,
  },
  stylePillActive: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
  },
  stylePillText: {
    fontSize: FONT_SIZES.caption, fontWeight: '600', color: COLORS.textSecondary,
  },
  stylePillTextActive: { color: '#FFF' },
});
