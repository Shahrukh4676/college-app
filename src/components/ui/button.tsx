import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Colors, Palette, Radius, Spacing } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const isDisabled = disabled || isLoading;

  const getContainerStyle = (pressed: boolean): ViewStyle => {
    let bg: string = Colors.light.primary;
    let border: string = 'transparent';
    let borderWidth = 0;

    switch (variant) {
      case 'primary':
        bg = pressed ? Palette.primary700 : Colors.light.primary;
        break;
      case 'secondary':
        bg = pressed ? Palette.slate200 : Palette.slate100;
        break;
      case 'outline':
        bg = pressed ? Palette.primary50 : 'transparent';
        border = Colors.light.border;
        borderWidth = 1.5;
        break;
      case 'ghost':
        bg = pressed ? Palette.slate100 : 'transparent';
        break;
      case 'danger':
        bg = pressed ? Palette.danger700 : Palette.danger500;
        break;
    }

    if (isDisabled) {
      bg = variant === 'outline' || variant === 'ghost' ? 'transparent' : Palette.slate200;
      border = variant === 'outline' ? Palette.slate300 : 'transparent';
    }

    const sizePadding: ViewStyle =
      size === 'sm'
        ? { paddingVertical: 8, paddingHorizontal: 12, minHeight: 36 }
        : size === 'lg'
        ? { paddingVertical: 16, paddingHorizontal: 24, minHeight: 52 }
        : { paddingVertical: 12, paddingHorizontal: 18, minHeight: 46 };

    return {
      backgroundColor: bg,
      borderColor: border,
      borderWidth,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: isDisabled ? 0.65 : pressed ? 0.92 : 1,
      ...sizePadding,
    };
  };

  const getTextStyle = (): TextStyle => {
    let color: string = Colors.light.primaryContent;
    switch (variant) {
      case 'primary':
      case 'danger':
        color = Palette.white;
        break;
      case 'secondary':
        color = Palette.slate800;
        break;
      case 'outline':
      case 'ghost':
        color = Palette.primary600;
        break;
    }

    if (isDisabled) {
      color = Palette.slate400;
    }

    const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;

    return {
      color,
      fontSize,
      fontWeight: '600',
      letterSpacing: -0.2,
    };
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      style={({ pressed }) => [getContainerStyle(pressed), style]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Palette.primary600 : Palette.white}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <>{icon}</>}
          <Text
            style={[
              getTextStyle(),
              icon ? (iconPosition === 'left' ? styles.iconRightMargin : styles.iconLeftMargin) : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && <>{icon}</>}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  iconRightMargin: {
    marginLeft: Spacing.sm,
  },
  iconLeftMargin: {
    marginRight: Spacing.sm,
  },
});
