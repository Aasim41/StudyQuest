/**
 * Avatar Configuration — Presets, customization parts, and utility functions
 */

// ─── Male Presets ───────────────────────────────────────────────────────────
export const MALE_PRESETS = [
  {
    id: 'male_warrior',
    name: 'Warrior',
    gender: 'male',
    skin: '#D4A574',
    hair: '#2C1810',
    hairStyle: 'spiky',
    eyes: '#4A90D9',
    outfit: '#C0392B',
    outfitStyle: 'armor',
    accessory: 'scar',
    bg: ['#C0392B', '#E74C3C'],
  },
  {
    id: 'male_scholar',
    name: 'Scholar',
    gender: 'male',
    skin: '#F5D0A9',
    hair: '#1A1A2E',
    hairStyle: 'neat',
    eyes: '#2C3E50',
    outfit: '#6C5CE7',
    outfitStyle: 'hoodie',
    accessory: 'glasses',
    bg: ['#6C5CE7', '#A29BFE'],
  },
  {
    id: 'male_ninja',
    name: 'Shadow',
    gender: 'male',
    skin: '#C49A6C',
    hair: '#000000',
    hairStyle: 'buzzcut',
    eyes: '#E74C3C',
    outfit: '#2D3436',
    outfitStyle: 'stealth',
    accessory: 'mask',
    bg: ['#2D3436', '#636E72'],
  },
  {
    id: 'male_astro',
    name: 'Cosmos',
    gender: 'male',
    skin: '#8D6E63',
    hair: '#3E2723',
    hairStyle: 'curly',
    eyes: '#00D2FF',
    outfit: '#FFFFFF',
    outfitStyle: 'spacesuit',
    accessory: 'helmet',
    bg: ['#00D2FF', '#74B9FF'],
  },
  {
    id: 'male_flame',
    name: 'Blaze',
    gender: 'male',
    skin: '#FFDAB9',
    hair: '#FF6B35',
    hairStyle: 'mohawk',
    eyes: '#FFD93D',
    outfit: '#FF6B35',
    outfitStyle: 'jacket',
    accessory: 'none',
    bg: ['#FF6B35', '#FFD93D'],
  },
];

// ─── Female Presets ─────────────────────────────────────────────────────────
export const FEMALE_PRESETS = [
  {
    id: 'female_mage',
    name: 'Mystic',
    gender: 'female',
    skin: '#F5D0A9',
    hair: '#6C5CE7',
    hairStyle: 'long_wavy',
    eyes: '#A29BFE',
    outfit: '#6C5CE7',
    outfitStyle: 'robe',
    accessory: 'tiara',
    bg: ['#6C5CE7', '#A29BFE'],
  },
  {
    id: 'female_tech',
    name: 'Pixel',
    gender: 'female',
    skin: '#D4A574',
    hair: '#00D2FF',
    hairStyle: 'bob',
    eyes: '#00D2FF',
    outfit: '#2D3436',
    outfitStyle: 'techvest',
    accessory: 'earpiece',
    bg: ['#00D2FF', '#0984E3'],
  },
  {
    id: 'female_nature',
    name: 'Flora',
    gender: 'female',
    skin: '#C49A6C',
    hair: '#27AE60',
    hairStyle: 'braided',
    eyes: '#2ECC71',
    outfit: '#2ECC71',
    outfitStyle: 'nature',
    accessory: 'flowers',
    bg: ['#2ECC71', '#27AE60'],
  },
  {
    id: 'female_royal',
    name: 'Queen',
    gender: 'female',
    skin: '#8D6E63',
    hair: '#1A1A2E',
    hairStyle: 'updo',
    eyes: '#FFD93D',
    outfit: '#FFD93D',
    outfitStyle: 'royal',
    accessory: 'crown',
    bg: ['#FFD93D', '#F39C12'],
  },
  {
    id: 'female_storm',
    name: 'Storm',
    gender: 'female',
    skin: '#FFDAB9',
    hair: '#FFFFFF',
    hairStyle: 'flowing',
    eyes: '#74B9FF',
    outfit: '#636E72',
    outfitStyle: 'jacket',
    accessory: 'lightning',
    bg: ['#636E72', '#B2BEC3'],
  },
];

// ─── Customization Options ──────────────────────────────────────────────────
export const SKIN_TONES = [
  { id: 'light', color: '#FFDAB9', name: 'Light' },
  { id: 'fair', color: '#F5D0A9', name: 'Fair' },
  { id: 'medium', color: '#D4A574', name: 'Medium' },
  { id: 'tan', color: '#C49A6C', name: 'Tan' },
  { id: 'brown', color: '#8D6E63', name: 'Brown' },
  { id: 'dark', color: '#5D4037', name: 'Dark' },
];

export const HAIR_COLORS = [
  { id: 'black', color: '#1A1A2E', name: 'Black' },
  { id: 'brown', color: '#3E2723', name: 'Brown' },
  { id: 'blonde', color: '#FFD93D', name: 'Blonde' },
  { id: 'red', color: '#C0392B', name: 'Red' },
  { id: 'purple', color: '#6C5CE7', name: 'Purple' },
  { id: 'blue', color: '#00D2FF', name: 'Blue' },
  { id: 'green', color: '#2ECC71', name: 'Green' },
  { id: 'orange', color: '#FF6B35', name: 'Orange' },
  { id: 'white', color: '#ECEFF1', name: 'White' },
  { id: 'pink', color: '#FD79A8', name: 'Pink' },
];

export const HAIR_STYLES_MALE = [
  { id: 'spiky', name: '🦔 Spiky' },
  { id: 'neat', name: '💇‍♂️ Neat' },
  { id: 'buzzcut', name: '👨‍🦲 Buzzcut' },
  { id: 'curly', name: '🌀 Curly' },
  { id: 'mohawk', name: '🤘 Mohawk' },
  { id: 'messy', name: '💨 Messy' },
];

export const HAIR_STYLES_FEMALE = [
  { id: 'long_wavy', name: '🌊 Long Wavy' },
  { id: 'bob', name: '💇‍♀️ Bob' },
  { id: 'braided', name: '🎀 Braided' },
  { id: 'updo', name: '👸 Updo' },
  { id: 'flowing', name: '💫 Flowing' },
  { id: 'ponytail', name: '🎗️ Ponytail' },
];

export const EYE_COLORS = [
  { id: 'brown', color: '#8B4513', name: 'Brown' },
  { id: 'blue', color: '#4A90D9', name: 'Blue' },
  { id: 'green', color: '#2ECC71', name: 'Green' },
  { id: 'amber', color: '#FFB300', name: 'Amber' },
  { id: 'violet', color: '#A29BFE', name: 'Violet' },
  { id: 'cyan', color: '#00D2FF', name: 'Cyan' },
  { id: 'red', color: '#E74C3C', name: 'Red' },
];

export const OUTFIT_COLORS = [
  { id: 'purple', color: '#6C5CE7', name: 'Purple' },
  { id: 'blue', color: '#0984E3', name: 'Blue' },
  { id: 'cyan', color: '#00D2FF', name: 'Cyan' },
  { id: 'green', color: '#2ECC71', name: 'Green' },
  { id: 'red', color: '#E74C3C', name: 'Red' },
  { id: 'orange', color: '#FF6B35', name: 'Orange' },
  { id: 'gold', color: '#FFD93D', name: 'Gold' },
  { id: 'pink', color: '#FD79A8', name: 'Pink' },
  { id: 'dark', color: '#2D3436', name: 'Dark' },
  { id: 'white', color: '#DFE6E9', name: 'White' },
];

export const ACCESSORIES = [
  { id: 'none', name: '❌ None' },
  { id: 'glasses', name: '👓 Glasses' },
  { id: 'sunglasses', name: '🕶️ Sunglasses' },
  { id: 'crown', name: '👑 Crown' },
  { id: 'tiara', name: '💎 Tiara' },
  { id: 'mask', name: '🎭 Mask' },
  { id: 'headphones', name: '🎧 Headphones' },
  { id: 'cap', name: '🧢 Cap' },
  { id: 'flowers', name: '🌸 Flowers' },
  { id: 'scar', name: '⚡ Scar' },
];

export const BG_GRADIENTS = [
  { id: 'purple', colors: ['#6C5CE7', '#A29BFE'], name: 'Purple' },
  { id: 'ocean', colors: ['#00D2FF', '#0984E3'], name: 'Ocean' },
  { id: 'fire', colors: ['#FF6B35', '#FFD93D'], name: 'Fire' },
  { id: 'forest', colors: ['#2ECC71', '#27AE60'], name: 'Forest' },
  { id: 'sunset', colors: ['#E74C3C', '#F39C12'], name: 'Sunset' },
  { id: 'night', colors: ['#2D3436', '#636E72'], name: 'Night' },
  { id: 'pink', colors: ['#FD79A8', '#E84393'], name: 'Pink' },
  { id: 'gold', colors: ['#FFD93D', '#F39C12'], name: 'Gold' },
];

// ─── Default avatar ─────────────────────────────────────────────────────────
export const DEFAULT_AVATAR = {
  id: 'custom',
  name: 'Custom',
  gender: 'male',
  skin: '#F5D0A9',
  hair: '#1A1A2E',
  hairStyle: 'neat',
  eyes: '#8B4513',
  outfit: '#6C5CE7',
  outfitStyle: 'hoodie',
  accessory: 'none',
  bg: ['#6C5CE7', '#A29BFE'],
};
