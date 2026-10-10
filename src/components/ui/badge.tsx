import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Palette, Radius, Spacing } from '@/theme';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'purple';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  style,
  textStyle,
  showDot = false,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'success':
        return { bg: Palette.success50, text: Palette.success700, dot: Palette.success500 };
      case 'warning':
        return { bg: Palette.warning50, text: Palette.warning700, dot: Palette.warning500 };
      case 'danger':
        return { bg: Palette.danger50, text: Palette.danger700, dot: Palette.danger500 };
      case 'purple':
        return { bg: Palette.purple50, text: Palette.purple700, dot: Palette.purple500 };
      case 'neutral':
        return { bg: Palette.slate100, text: Palette.slate700, dot: Palette.slate500 };
      case 'primary':
      default:
        return { bg: Palette.primary50, text: Palette.primary700, dot: Palette.primary600 };
    }
  };

  const colors = getBadgeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }, style]}>
      {showDot && <View style={[styles.dot, { backgroundColor: colors.dot }]} />}
      <Text style={[styles.text, { color: colors.text }, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
