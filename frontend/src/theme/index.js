/**
 * StudyQuest Design System
 * Sleek, Minimal, Obsidian Aesthetics (JUET Companion)
 */

export const COLORS = {
  // Primary & Accents
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#4D3FB0',
  accent: '#C5BBED',
  accentSubtle: 'rgba(197, 187, 237, 0.12)',

  // Matte Obsidian Surfaces (Sleek Minimalist Dark)
  background: '#08080C',
  surface: '#101016',
  surfaceElevated: '#161620',
  surfaceCard: '#191824',
  surfaceHighlight: '#222130',

  // Subtle Status Tones
  success: '#38D39F',
  successSubtle: 'rgba(56, 211, 159, 0.14)',
  warning: '#E5A93C',
  warningSubtle: 'rgba(229, 169, 60, 0.14)',
  error: '#FF5C5C',
  errorSubtle: 'rgba(255, 92, 92, 0.14)',
  info: '#64B5F6',

  // Typography
  textPrimary: '#FFFFFF',
  textSecondary: '#9A99A7',
  textMuted: '#686777',
  textDim: '#4B4A56',

  // Gradients
  gradientDark: ['#08080C', '#0E0D14', '#12121B'],
  gradientCard: ['#161622', '#111018'],
  gradientPrimary: ['#6C5CE7', '#8474EE'],
  gradientOnboarding: ['#07070B', '#0D0C13', '#12111B'],

  // Subtle Borders
  border: 'rgba(255, 255, 255, 0.05)',
  borderLight: 'rgba(255, 255, 255, 0.10)',
  borderActive: 'rgba(197, 187, 237, 0.35)',

  // Streaks & Stats
  streak: '#FF8A50',
  xp: '#FFD166',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  caption: 11,
  bodySmall: 13,
  body: 14,
  bodyLarge: 16,
  subtitle: 18,
  title: 22,
  heading: 26,
  hero: 34,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  extraBold: 'System',
};

export const BORDER_RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 30,
  pill: 999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  glow: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const ANIMATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};
