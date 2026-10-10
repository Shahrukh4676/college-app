import '@/global.css';
import { Platform } from 'react-native';
import {
  Colors as ThemeColors,
  Spacing as ThemeSpacing,
  Palette,
  Radius,
  Typography,
  Shadows,
} from '@/theme';

export { Palette, Radius, Typography, Shadows };

export const Colors = {
  light: {
    text: ThemeColors.light.text,
    background: ThemeColors.light.background,
    backgroundElement: ThemeColors.light.surfaceSecondary,
    backgroundSelected: ThemeColors.light.border,
    textSecondary: ThemeColors.light.textSecondary,
    primary: ThemeColors.light.primary,
    surface: ThemeColors.light.surface,
    border: ThemeColors.light.border,
  },
  dark: {
    text: ThemeColors.dark.text,
    background: ThemeColors.dark.background,
    backgroundElement: ThemeColors.dark.surfaceSecondary,
    backgroundSelected: ThemeColors.dark.border,
    textSecondary: ThemeColors.dark.textSecondary,
    primary: ThemeColors.dark.primary,
    surface: ThemeColors.dark.surface,
    border: ThemeColors.dark.border,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: ThemeSpacing.xs,
  two: ThemeSpacing.sm,
  three: ThemeSpacing.lg,
  four: ThemeSpacing.xxl,
  five: ThemeSpacing.xxxl,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
