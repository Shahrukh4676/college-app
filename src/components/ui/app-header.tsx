import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Palette, Spacing } from '@/theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  canGoBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  showBorder?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  canGoBack = false,
  onBackPress,
  rightAction,
  showBorder = true,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, 16) },
        showBorder && styles.border,
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.leftCol}>
          {canGoBack && (
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            >
              <Ionicons name="arrow-back" size={24} color={Palette.slate800} />
            </Pressable>
          )}
          <View style={styles.titleWrapper}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {rightAction && <View style={styles.rightCol}>{rightAction}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: Spacing.md,
    padding: 4,
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.slate900,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
  },
  rightCol: {
    marginLeft: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
