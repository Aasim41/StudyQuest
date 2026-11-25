import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Image,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';
import {
  EXAM_TARGETS,
  EXAM_CATEGORIES,
  getStreamsForExam,
} from '../config/studyGuideData';
import { gsapTabTransition } from '../utils/gsapAnim';

const { width } = Dimensions.get('window');

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
  { value: 'bob', label: 'Bob' },
  { value: 'bun', label: 'Bun' },
  { value: 'curly', label: 'Curly' },
  { value: 'dreads', label: 'Dreads' },
  { value: 'straight01', label: 'Straight' },
  { value: 'turban', label: 'Turban' },
];

const HAIR_COLORS = [
  { value: '2c1b18', label: 'Black' },
  { value: '4a312c', label: 'Dark' },
  { value: '724133', label: 'Brown' },
  { value: 'a55728', label: 'Auburn' },
  { value: 'b58143', label: 'Caramel' },
  { value: 'd6b370', label: 'Blonde' },
];

const ACCESSORY_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'prescription01', label: 'Glasses 1' },
  { value: 'prescription02', label: 'Glasses 2' },
  { value: 'round', label: 'Round' },
  { value: 'wayfarers', label: 'Wayfarers' },
];

const CLOTHING_OPTIONS = [
  { value: 'hoodie', label: 'Hoodie' },
  { value: 'blazerAndShirt', label: 'Blazer' },
  { value: 'blazerAndSweater', label: 'Sweater' },
  { value: 'collarAndSweater', label: 'Collar' },
  { value: 'shirtCrewNeck', label: 'Crew Neck' },
  { value: 'shirtVNeck', label: 'V-Neck' },
];

const CATEGORIES = [
  { id: 'skin', label: 'Skin', options: SKIN_COLORS, isColor: true },
  { id: 'top', label: 'Hair', options: HAIR_STYLES, isColor: false },
  { id: 'hairColor', label: 'Tone', options: HAIR_COLORS, isColor: true },
  { id: 'accessories', label: 'Glasses', options: ACCESSORY_OPTIONS, isColor: false },
  { id: 'clothing', label: 'Outfit', options: CLOTHING_OPTIONS, isColor: false },
];

export default function AvatarSelectionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    userStats,
    saveStatsToFirestore,
    completeOnboarding,
    targetExam,
    targetStream,
    setTargetExam,
  } = useUser();

  const isEditing = route.params?.isEditing || false;

  // Card Tabs: 'exam' | 'avatar' (Skip exam step automatically if editing avatar only)
  const [setupTab, setSetupTab] = useState(isEditing ? 'avatar' : 'exam');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [chosenExamLabel, setChosenExamLabel] = useState(targetExam || 'CBSE Class 12 Boards');
  const [chosenStreamId, setChosenStreamId] = useState(targetStream || 'pcm');

  const [activeAvatarCategory, setActiveAvatarCategory] = useState('skin');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const tabAnim = useRef(new Animated.Value(1)).current;
  const imgTimerRef = useRef(null);

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

  useEffect(() => {
    return () => {
      if (imgTimerRef.current) clearTimeout(imgTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isEditing && userStats?.avatarUrl) {
      try {
        const query = userStats.avatarUrl.split('?')[1] || '';
        const pairs = query.split('&');
        const map = {};
        pairs.forEach((p) => {
          const [k, v] = p.split('=');
          if (k && v) map[k] = decodeURIComponent(v);
        });
        setConfig((prev) => ({
          ...prev,
          skin: map.skinColor || prev.skin,
          top: map.top || prev.top,
          hairColor: map.hairColor || prev.hairColor,
          accessories: map.accessories || '',
          clothing: map.clothing || prev.clothing,
        }));
      } catch (e) {}
    }
  }, []);

  const availableStreams = useMemo(() => {
    return getStreamsForExam(chosenExamLabel);
  }, [chosenExamLabel]);

  // Keep chosenStreamId valid when exam changes
  useEffect(() => {
    if (availableStreams.length > 0 && !availableStreams.some((s) => s.id === chosenStreamId)) {
      setChosenStreamId(availableStreams[0].id);
    }
  }, [chosenExamLabel, availableStreams]);

  const filteredExams = useMemo(() => {
    if (selectedCategoryFilter === 'ALL') return EXAM_TARGETS;
    return EXAM_TARGETS.filter((e) => e.category === selectedCategoryFilter);
  }, [selectedCategoryFilter]);

  const switchSetupTab = (tab) => {
    if (tab === setupTab) return;
    gsapTabTransition(tabAnim);
    setSetupTab(tab);
  };

  const buildAvatarUrl = useCallback(() => {
    const base = 'https://api.dicebear.com/9.x/avataaars/png';
    const params = [
      `skinColor=${encodeURIComponent(config.skin || 'ffdbb4')}`,
      `top=${encodeURIComponent(config.top || 'shortFlat')}`,
      `hairColor=${encodeURIComponent(config.hairColor || '2c1b18')}`,
      `eyes=${encodeURIComponent(config.eyes || 'default')}`,
      `eyebrows=${encodeURIComponent(config.eyebrows || 'default')}`,
      `mouth=${encodeURIComponent(config.mouth || 'smile')}`,
      `accessories=${encodeURIComponent(config.accessories || '')}`,
      `accessoriesProbability=${config.accessories ? '100' : '0'}`,
      `clothing=${encodeURIComponent(config.clothing || 'hoodie')}`,
      `clothesColor=${encodeURIComponent(config.clothesColor || '3c4f5c')}`,
      `backgroundColor=b6e3f4`,
    ];
    return `${base}?${params.join('&')}`;
  }, [config]);

  const currentAvatarUrl = buildAvatarUrl();

  const updateOption = (categoryId, value) => {
    setLoading(true);
    setConfig((prev) => ({ ...prev, [categoryId]: value }));
    if (imgTimerRef.current) clearTimeout(imgTimerRef.current);
    imgTimerRef.current = setTimeout(() => setLoading(false), 250);
  };

  const finishOnboardingRedirect = async (saveProfile = true) => {
    try {
      setSaving(true);
      if (saveProfile) {
        if (!isEditing && setTargetExam) {
          await setTargetExam(chosenExamLabel, chosenStreamId);
        }
        await saveStatsToFirestore({ ...userStats, avatarUrl: currentAvatarUrl });
        await AsyncStorage.setItem('@avatarUrl', currentAvatarUrl).catch(() => {});
      }
      if (completeOnboarding) {
        await completeOnboarding();
      }
      if (isEditing && navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // AppNavigator transitions from OnboardingStack to MainStack on onboardingComplete=true
        try {
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        } catch {}
      }
    } catch (e) {
      if (completeOnboarding) await completeOnboarding();
    } finally {
      setSaving(false);
    }
  };

  const activeCat = CATEGORIES.find((c) => c.id === activeAvatarCategory);

  const renderColorSwatch = ({ item }) => {
    const isSelected = config[activeAvatarCategory] === item.value;
    return (
      <TouchableOpacity
        onPress={() => updateOption(activeAvatarCategory, item.value)}
        style={styles.colorSwatch}
      >
        <View style={[styles.colorDot, { backgroundColor: `#${item.value}` }, isSelected && styles.colorDotSelected]}>
          {isSelected && <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />}
        </View>
        <Text style={[styles.swatchLabel, isSelected && styles.swatchLabelSelected]}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  const renderOptionChip = ({ item }) => {
    const isSelected = config[activeAvatarCategory] === item.value;
    return (
      <TouchableOpacity
        onPress={() => updateOption(activeAvatarCategory, item.value)}
        style={[styles.optionChip, isSelected && styles.optionChipSelected]}
      >
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Minimal Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isEditing ? 'Customize Avatar' : 'Workspace Setup'}</Text>

        {!isEditing && (
          <View style={styles.cardTabsRow}>
            <TouchableOpacity
              style={[styles.cardTab, setupTab === 'exam' && styles.cardTabActive]}
              onPress={() => switchSetupTab('exam')}
              activeOpacity={0.85}
            >
              <Text style={[styles.cardTabText, setupTab === 'exam' && styles.cardTabTextActive]}>
                1. Exam & Stream
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cardTab, setupTab === 'avatar' && styles.cardTabActive]}
              onPress={() => switchSetupTab('avatar')}
              activeOpacity={0.85}
            >
              <Text style={[styles.cardTabText, setupTab === 'avatar' && styles.cardTabTextActive]}>
                2. Scholar Avatar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Animated.View style={[styles.body, { opacity: tabAnim, transform: [{ scale: tabAnim }] }]}>
        {setupTab === 'exam' && !isEditing ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.examScrollContent}>
            {/* Category Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catFilterRow}>
              {EXAM_CATEGORIES.map((cat) => {
                const active = selectedCategoryFilter === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catChip, active && styles.catChipActive]}
                    onPress={() => setSelectedCategoryFilter(cat.id)}
                  >
                    <Text style={[styles.catChipText, active && styles.catChipTextActive]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Target Exam Picker */}
            <Text style={styles.sectionLabel}>SELECT TARGET EXAM ({filteredExams.length})</Text>
            <View style={styles.examList}>
              {filteredExams.map((item) => {
                const isSelected = chosenExamLabel === item.label;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.examCard, isSelected && styles.examCardActive]}
                    onPress={() => setChosenExamLabel(item.label)}
                    activeOpacity={0.85}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.examCardLabel, isSelected && { color: '#00E5FF' }]}>
                        {item.label}
                      </Text>
                      <Text style={styles.examCardWeightage}>{item.weightage}</Text>
                    </View>
                    {isSelected && <MaterialCommunityIcons name="check-circle" size={18} color="#00E5FF" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Stream Selector for Exams with Streams, or Unified All-Subjects Badge */}
            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
              {availableStreams.length > 1 ? 'SELECT STREAM / TRACK' : 'CURRICULUM COVERAGE'}
            </Text>
            <View style={styles.streamList}>
              {availableStreams.length > 1 ? (
                availableStreams.map((str) => {
                  const isSel = chosenStreamId === str.id;
                  return (
                    <TouchableOpacity
                      key={str.id}
                      style={[styles.streamCard, isSel && styles.streamCardActive]}
                      onPress={() => setChosenStreamId(str.id)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.streamCardTop}>
                        <Text style={[styles.streamTitle, isSel && { color: '#00E5FF' }]}>{str.label}</Text>
                        {isSel && <MaterialCommunityIcons name="check-circle" size={16} color="#00E5FF" />}
                      </View>
                      <Text style={styles.streamDesc}>{str.desc}</Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                availableStreams[0] && (
                  <View style={[styles.streamCard, styles.streamCardActive]}>
                    <View style={styles.streamCardTop}>
                      <Text style={[styles.streamTitle, { color: '#00E5FF' }]}>
                        {availableStreams[0].label}
                      </Text>
                      <MaterialCommunityIcons name="check-circle" size={16} color="#00E5FF" />
                    </View>
                    <Text style={styles.streamDesc}>{availableStreams[0].desc}</Text>
                  </View>
                )
              )}
            </View>

            <TouchableOpacity
              style={styles.nextTabBtn}
              onPress={() => switchSetupTab('avatar')}
              activeOpacity={0.85}
            >
              <Text style={styles.nextTabBtnText}>Next: Customize Avatar →</Text>
            </TouchableOpacity>

            <View style={{ height: 24 }} />
          </ScrollView>
        ) : (
          <View style={styles.avatarTabContainer}>
            <View style={styles.avatarPreviewBox}>
              <View style={styles.avatarCircle}>
                {loading ? (
                  <ActivityIndicator size="large" color="#00E5FF" />
                ) : (
                  <Image
                    source={{ uri: currentAvatarUrl }}
                    style={{ width: 132, height: 132 }}
                  />
                )}
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ maxHeight: 46 }}
              contentContainerStyle={styles.avatarCatRow}
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeAvatarCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.avatarCatChip, isActive && styles.avatarCatChipActive]}
                    onPress={() => setActiveAvatarCategory(cat.id)}
                  >
                    <Text style={[styles.avatarCatLabel, isActive && styles.avatarCatLabelActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.optionsBox}>
              <FlatList
                data={activeCat?.options || []}
                renderItem={activeCat?.isColor ? renderColorSwatch : renderOptionChip}
                keyExtractor={(item) => item.value + item.label}
                numColumns={activeCat?.isColor ? 6 : 3}
                key={activeCat?.isColor ? 'color' : 'chip'}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        )}
      </Animated.View>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => finishOnboardingRedirect(true)}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#0B0C12" />
          ) : (
            <Text style={styles.primaryBtnText}>
              {isEditing ? 'Save Changes' : 'Launch Workspace →'}
            </Text>
          )}
        </TouchableOpacity>

        {!isEditing && (
          <TouchableOpacity style={styles.skipBtn} onPress={() => finishOnboardingRedirect(false)}>
            <Text style={styles.skipBtnText}>Skip Customization</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C12' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: '#0E1018',
    borderBottomWidth: 1.5,
    borderBottomColor: '#222436',
    gap: 12,
  },
  headerTitle: { fontSize: 19, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.3 },
  cardTabsRow: { flexDirection: 'row', gap: 8 },
  cardTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#141622',
    borderWidth: 1.5,
    borderColor: '#222436',
    alignItems: 'center',
  },
  cardTabActive: { backgroundColor: '#1A1E2E', borderColor: '#00E5FF' },
  cardTabText: { fontSize: 12, fontWeight: '700', color: '#8E8EA8' },
  cardTabTextActive: { color: '#00E5FF', fontWeight: '800' },

  body: { flex: 1 },
  examScrollContent: { padding: 16 },
  catFilterRow: { gap: 8, marginBottom: 14 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
  },
  catChipActive: { backgroundColor: '#1A1E2E', borderColor: '#00E5FF' },
  catChipText: { fontSize: 11, fontWeight: '700', color: '#8E8EA8' },
  catChipTextActive: { color: '#00E5FF', fontWeight: '800' },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8EA8',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  examList: { gap: 8 },
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 10,
    padding: 12,
  },
  examCardActive: { borderColor: '#00E5FF', backgroundColor: '#181C2B' },
  examCardLabel: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  examCardWeightage: { fontSize: 11, color: '#777799', marginTop: 2 },
  streamList: { gap: 8 },
  streamCard: {
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  streamCardActive: { borderColor: '#00E5FF', backgroundColor: '#181C2B' },
  streamCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streamTitle: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  streamDesc: { fontSize: 11, color: '#8E8EA8' },
  nextTabBtn: {
    marginTop: 18,
    backgroundColor: '#181C2B',
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  nextTabBtnText: { fontSize: 12, fontWeight: '800', color: '#00E5FF' },

  // Avatar Tab
  avatarTabContainer: { flex: 1, padding: 16, gap: 14 },
  avatarPreviewBox: { alignItems: 'center', paddingVertical: 8 },
  avatarCircle: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: '#12141F',
    borderWidth: 2,
    borderColor: '#00E5FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarCatRow: { gap: 8, alignItems: 'center' },
  avatarCatChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
  },
  avatarCatChipActive: { borderColor: '#00E5FF', backgroundColor: '#1A1E2E' },
  avatarCatLabel: { fontSize: 12, fontWeight: '700', color: '#8E8EA8' },
  avatarCatLabelActive: { color: '#00E5FF', fontWeight: '800' },
  optionsBox: { flex: 1 },
  colorSwatch: { flex: 1, alignItems: 'center', paddingVertical: 8, maxWidth: (width - 32) / 6 },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  colorDotSelected: { borderColor: '#00E5FF' },
  swatchLabel: { fontSize: 10, color: '#8E8EA8' },
  swatchLabelSelected: { color: '#00E5FF', fontWeight: '800' },
  optionChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12141F',
    borderWidth: 1.5,
    borderColor: '#222436',
    borderRadius: 8,
    paddingVertical: 10,
    margin: 4,
  },
  optionChipSelected: { borderColor: '#00E5FF', backgroundColor: '#1A1E2E' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#8E8EA8' },
  chipTextSelected: { color: '#00E5FF', fontWeight: '800' },

  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: '#222436',
    backgroundColor: '#0E1018',
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: '#00E5FF',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#0B0C12', fontSize: 14, fontWeight: '900' },
  skipBtn: { alignItems: 'center', paddingVertical: 6 },
  skipBtnText: { color: '#8E8EA8', fontSize: 12, fontWeight: '700' },
});
