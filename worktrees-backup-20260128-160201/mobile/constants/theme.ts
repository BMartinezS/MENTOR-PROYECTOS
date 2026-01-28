import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

const palette = {
  // Cyan brillante como primary - muy distintivo y tech
  primary: '#00F5FF',
  primaryLight: '#4DFFFF',
  primaryDark: '#00CDD9',

  // Dorado elegante como secondary - premium feel
  secondary: '#FFD700',
  secondaryLight: '#FFED4E',
  secondaryDark: '#D4AF37',

  // Gradiente de fondo ultra moderno
  background: '#0F172A',
  backgroundAlt: '#1E293B',
  backgroundGradient: ['#0F172A', '#1E293B', '#334155'],

  // Superficies con glass morphism
  surface: '#1E293B',
  surfaceGlass: 'rgba(30, 41, 59, 0.7)',
  surfaceMuted: '#334155',
  surfaceHighlight: 'rgba(0, 245, 255, 0.1)',

  // Texto con mejor contraste
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textAccent: '#00F5FF',

  // Bordes con gradientes
  border: '#475569',
  borderGlow: 'rgba(0, 245, 255, 0.3)',
  borderSubtle: '#334155',

  // Estados con colores más vibrantes
  success: '#22D3EE',
  danger: '#F97316',
  warning: '#EAB308',

  // Nuevos colores para efectos premium
  glow: 'rgba(0, 245, 255, 0.4)',
  shadow: 'rgba(0, 0, 0, 0.8)',
  accent: '#6366F1',
};

export const COLORS = palette;

export const SPACING = (factor: number) => factor * 8;

// Accessibility constants
export const ACCESSIBILITY = {
  minTouchTarget: 44, // Minimum 44px touch targets
  textContrastRatio: 4.5, // WCAG AA standard
  largeTouchTarget: 48, // Recommended for important actions
};

// Enhanced typography system
export const TYPOGRAPHY = {
  display: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  headline: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  title: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
};

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 24,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
  cardHover: {
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
  },
  glow: {
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  premium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 24,
  },
};

export const GRADIENTS = {
  background: ['#0F172A', '#1E293B', '#334155'],
  card: ['rgba(30, 41, 59, 0.8)', 'rgba(51, 65, 85, 0.6)'],
  cardHover: ['rgba(0, 245, 255, 0.1)', 'rgba(255, 215, 0, 0.05)'],
  primary: ['#00F5FF', '#00CDD9'],
  secondary: ['#FFD700', '#D4AF37'],
  glow: ['rgba(0, 245, 255, 0.4)', 'rgba(0, 245, 255, 0.1)'],
  glass: ['rgba(30, 41, 59, 0.7)', 'rgba(51, 65, 85, 0.4)'],
};

// Animation constants
export const ANIMATIONS = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    ease: 'ease-out' as const,
    spring: 'spring' as const,
  },
};

export const PAPER_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.primary,
    secondary: palette.secondary,
    surface: palette.surface,
    surfaceVariant: palette.surfaceMuted,
    background: palette.background,
    text: palette.text,
    onSurface: palette.text,
    onBackground: palette.text,
    error: palette.danger,
  },
  roundness: 14,
};

