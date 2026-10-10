import { Platform } from 'react-native';

export const Palette = {
  // Deep Professional Navy & Slate
  navy950: '#060D1F',
  navy900: '#0A1128',
  navy800: '#141E3C',
  navy700: '#1E2D56',
  
  // Electric Blue Primary Accents
  primary50: '#EFF6FF',
  primary100: '#DBEAFE',
  primary200: '#BFDBFE',
  primary500: '#3B82F6',
  primary600: '#2563EB',
  primary700: '#1D4ED8',
  primary800: '#1E40AF',

  // Slate Neutral Grayscale
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',

  // Semantics
  success50: '#ECFDF5',
  success100: '#D1FAE5',
  success500: '#10B981',
  success700: '#047857',

  warning50: '#FFFBEB',
  warning100: '#FEF3C7',
  warning500: '#F59E0B',
  warning700: '#B45309',

  danger50: '#FEF2F2',
  danger100: '#FEE2E2',
  danger500: '#EF4444',
  danger700: '#B91C1C',

  purple50: '#FAF5FF',
  purple500: '#8B5CF6',
  purple700: '#6D28D9',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const Colors = {
  light: {
    background: Palette.slate50,
    surface: Palette.white,
    surfaceElevated: Palette.white,
    surfaceSecondary: Palette.slate100,
    border: Palette.slate200,
    borderFocus: Palette.primary600,
    
    text: Palette.slate900,
    textSecondary: Palette.slate600,
    textMuted: Palette.slate400,
    textInverted: Palette.white,

    primary: Palette.primary600,
    primaryHover: Palette.primary700,
    primaryLight: Palette.primary50,
    primaryContent: Palette.white,

    success: Palette.success500,
    successBg: Palette.success50,
    warning: Palette.warning500,
    warningBg: Palette.warning50,
    danger: Palette.danger500,
    dangerBg: Palette.danger50,

    cardShadow: 'rgba(15, 23, 42, 0.06)',
    modalOverlay: 'rgba(15, 23, 42, 0.5)',
  },
  dark: {
    background: Palette.navy950,
    surface: Palette.navy900,
    surfaceElevated: Palette.navy800,
    surfaceSecondary: Palette.navy800,
    border: Palette.navy700,
    borderFocus: Palette.primary500,

    text: Palette.slate50,
    textSecondary: Palette.slate400,
    textMuted: Palette.slate500,
    textInverted: Palette.navy950,

    primary: Palette.primary500,
    primaryHover: Palette.primary600,
    primaryLight: Palette.navy800,
    primaryContent: Palette.white,

    success: Palette.success500,
    successBg: 'rgba(16, 185, 129, 0.15)',
    warning: Palette.warning500,
    warningBg: 'rgba(245, 158, 11, 0.15)',
    danger: Palette.danger500,
    dangerBg: 'rgba(239, 68, 68, 0.15)',

    cardShadow: 'rgba(0, 0, 0, 0.4)',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1440,
} as const;

export const Layout = {
  maxContentWidth: 1240,
  maxDetailWidth: 1080,
  maxFormWidth: 680,
  maxAuthWidth: 460,
  gutterMobile: 16,
  gutterTablet: 24,
  gutterDesktop: 32,
  minTouchTarget: 44,
} as const;

export const Typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800' as const,
    letterSpacing: -0.8,
  },
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodyBold: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  captionBold: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
  tiny: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500' as const,
  },
  amountLarge: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  amountMedium: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700' as const,
  },
  amountSmall: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700' as const,
  },
} as const;

export const Shadows = {
  sm: Platform.select({
    android: { elevation: 2 },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
  }),
  md: Platform.select({
    android: { elevation: 4 },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
  }),
  lg: Platform.select({
    android: { elevation: 8 },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
  }),
} as const;

