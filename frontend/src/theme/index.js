/**
 * StudyQuest Design System
 * Premium, vibrant, gamified aesthetic
 */

export const COLORS = {
  // Primary gradient palette
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#5A4BD1',
  
  // Secondary
  secondary: '#A29BFE',

  // Accent / Energy
  accent: '#00D2FF',
  accentGlow: '#00F5FF',
  
  // Gamification colors
  xp: '#FFD93D',
  xpGlow: '#FFE066',
  streak: '#FF6B35',
  streakGlow: '#FF8C5A',
  levelUp: '#2ECC71',
  fest: '#9B59B6',
  
  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#6C5CE7', '#A29BFE', '#74B9FF'],
  gradientDark: ['#0A0A1A', '#111122', '#181830'],
  gradientCard: ['rgba(108, 92, 231, 0.15)', 'rgba(162, 155, 254, 0.05)'],
  gradientAccent: ['#00D2FF', '#3A7BD5'],
  gradientFire: ['#FF416C', '#FF4B2B'],
  gradientSuccess: ['#11998E', '#38EF7D'],
  gradientGlass: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'],
  gradientOnboarding: ['#05050A', '#130B29', '#1C0D45'],
  
  // Surface / Background
  background: '#0A0A1A',
  surface: '#141432',
  surfaceLight: '#1E1E4A',
  surfaceElevated: '#252552',
  
  // Glass
  glass: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  glassHeavy: 'rgba(255, 255, 255, 0.14)',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
  textAccent: '#A29BFE',
  
  // Status
  success: '#2ECC71',
  warning: '#FFD93D',
  error: '#FF4757',
  info: '#74B9FF',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(108, 92, 231, 0.5)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const FONT_SIZES = {
  caption: 12,
  body: 14,
  bodyLarge: 16,
  subtitle: 18,
  title: 22,
  heading: 28,
  hero: 36,
  display: 48,
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  pill: 999,
};

export const SHADOWS = {
  glow: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  glowAccent: {
    shadowColor: '#00D2FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const ANIMATION = {
  fast: 200,
  normal: 350,
  slow: 500,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  springBouncy: {
    damping: 10,
    stiffness: 180,
    mass: 0.8,
  },
  springSmooth: {
    damping: 20,
    stiffness: 120,
    mass: 1,
  },
};
