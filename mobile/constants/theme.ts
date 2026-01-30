import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

/**
 * MINIMALIST THEME
 *
 * Core principles:
 * - Clean, airy backgrounds with lots of whitespace
 * - Subtle shadows (soft, blurred)
 * - Thin or no borders
 * - Muted, sophisticated color palette
 * - Light typography weights
 * - Generous spacing
 *
 * Neo-Brutalism reserved for:
 * - Paywall / upgrade prompts
 * - Empty states (CTAs)
 * - Achievements / celebrations
 * - Critical alerts
 */

const palette = {
  // Primary: Soft coral - warm but not aggressive
  primary: '#E07A5F',
  primaryLight: '#F2A391',
  primaryDark: '#C96A52',

  // Secondary: Warm sage green - calming, productive
  secondary: '#81B29A',
  secondaryLight: '#A8D5BA',
  secondaryDark: '#6A9B83',

  // Tertiary: Soft blue for accents
  tertiary: '#7EB8DA',
  tertiaryDark: '#5A9FC7',

  // Background: Clean whites
  background: '#FAFAFA',
  backgroundAlt: '#F5F5F5',

  // Surface: Pure white for cards
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text: Soft dark, not pure black
  text: '#2D3436',
  textMuted: '#636E72',
  textLight: '#B2BEC3',

  // Borders: Very subtle
  border: '#E8E8E8',
  borderLight: '#F0F0F0',

  // Status colors - muted versions
  success: '#81B29A',
  danger: '#E07A5F',
  warning: '#F2CC8F',
  info: '#7EB8DA',

  // Shadow color
  shadow: '#000000',
};

export const COLORS = palette;

export const SPACING = (factor: number) => factor * 8;

export const ACCESSIBILITY = {
  minTouchTarget: 44,
  textContrastRatio: 4.5,
  largeTouchTarget: 48,
};

// Minimalist typography - lighter weights, clean
export const TYPOGRAPHY = {
  display: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40, letterSpacing: -0.5 },
  headline: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  title: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
};

// Softer, more rounded corners
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Minimal borders
export const BORDERS = {
  none: 0,
  thin: 1,
  medium: 1.5,
  // Neo-Brutalist borders (for paywall, CTAs)
  thick: 3,
  extraThick: 4,
  brutal: 3,
  brutalThick: 4,
};

// Soft, subtle shadows
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  // Neo-Brutalist shadows (for paywall, CTAs)
  brutal: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  brutalPressed: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
  },
  // Legacy alias
  pressed: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
  },
};

// React Native Paper theme override
export const PAPER_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.primary,
    secondary: palette.secondary,
    tertiary: palette.tertiary,
    surface: palette.surface,
    surfaceVariant: palette.backgroundAlt,
    background: palette.background,
    error: palette.danger,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: palette.text,
    onBackground: palette.text,
    outline: palette.border,
    outlineVariant: palette.borderLight,
  },
  roundness: 12,
};

// ============================================
// MINIMALIST STYLE PRESETS
// ============================================

export const MINIMAL_CARD = {
  backgroundColor: palette.surface,
  borderRadius: RADIUS.lg,
  ...SHADOWS.card,
};

export const MINIMAL_BUTTON = {
  backgroundColor: palette.primary,
  borderRadius: RADIUS.md,
  paddingVertical: SPACING(1.5),
  paddingHorizontal: SPACING(3),
};

export const MINIMAL_INPUT = {
  backgroundColor: palette.backgroundAlt,
  borderRadius: RADIUS.md,
  borderWidth: 0,
};

// ============================================
// NEO-BRUTALIST STYLE PRESETS (for paywall, CTAs)
// ============================================

export const BRUTAL_CARD = {
  backgroundColor: palette.surface,
  borderWidth: BORDERS.brutal,
  borderColor: palette.text,
  borderRadius: RADIUS.sm,
  ...SHADOWS.brutal,
};

export const BRUTAL_BUTTON = {
  backgroundColor: palette.primary,
  borderWidth: BORDERS.brutal,
  borderColor: palette.text,
  borderRadius: RADIUS.xs,
  ...SHADOWS.brutal,
};

export const BRUTAL_BUTTON_SECONDARY = {
  backgroundColor: '#FFE66D', // Bright yellow for CTAs
  borderWidth: BORDERS.brutal,
  borderColor: palette.text,
  borderRadius: RADIUS.xs,
  ...SHADOWS.brutal,
};

// Backward compatibility aliases
export const BRUTALIST_CARD = BRUTAL_CARD;
export const BRUTALIST_BUTTON = BRUTAL_BUTTON;
export const BRUTALIST_INPUT = {
  backgroundColor: palette.surface,
  borderWidth: BORDERS.brutal,
  borderColor: palette.text,
  borderRadius: RADIUS.xs,
};

// Animation constants
export const ANIMATIONS = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    default: 'ease-out',
    bounce: 'ease-in-out',
  },
};
