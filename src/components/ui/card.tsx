import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import { Colors, Palette, Radius, Shadows, Spacing } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
  accessibilityLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
  accessibilityLabel,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: Palette.white,
          borderWidth: 1,
          borderColor: Colors.light.border,
        };
      case 'flat':
        return {
          backgroundColor: Palette.slate100,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: Palette.white,
          borderWidth: 1,
          borderColor: Palette.slate200,
          ...Shadows.sm,
        };
    }
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          styles.card,
          getVariantStyle(),
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.card, getVariantStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  pressed: {
    opacity: 0.93,
    transform: [{ scale: 0.995 }],
  },
});
