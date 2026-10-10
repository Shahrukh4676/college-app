import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, StyleProp, RefreshControlProps } from 'react-native';
import { Layout, Palette } from '@/theme';
import { useResponsive } from '@/hooks/useResponsive';

export type ContainerMaxWidth = 'content' | 'detail' | 'form' | 'auth' | number;

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: ContainerMaxWidth;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  asScrollView?: boolean;
  showsVerticalScrollIndicator?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  disableGutters?: boolean;
}

export function ResponsiveContainer({
  children,
  maxWidth = 'content',
  style,
  contentContainerStyle,
  asScrollView = false,
  showsVerticalScrollIndicator = false,
  refreshControl,
  disableGutters = false,
}: ResponsiveContainerProps) {
  const { gutter } = useResponsive();

  let maxW: number = Layout.maxContentWidth;
  if (typeof maxWidth === 'number') {
    maxW = maxWidth;
  } else if (maxWidth === 'detail') {
    maxW = Layout.maxDetailWidth;
  } else if (maxWidth === 'form') {
    maxW = Layout.maxFormWidth;
  } else if (maxWidth === 'auth') {
    maxW = Layout.maxAuthWidth;
  }

  const paddingHorizontal = disableGutters ? 0 : gutter;

  const innerStyle: ViewStyle = {
    width: '100%',
    maxWidth: maxW,
    alignSelf: 'center',
    paddingHorizontal,
  };

  if (asScrollView) {
    return (
      <ScrollView
        style={[styles.scrollBase, style]}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
      >
        <View style={innerStyle}>{children}</View>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.viewBase, style]}>
      <View style={[innerStyle, contentContainerStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollBase: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  scrollContent: {
    flexGrow: 1,
  },
  viewBase: {
    flex: 1,
    backgroundColor: Palette.slate50,
    width: '100%',
  },
});
