import { useWindowDimensions } from 'react-native';
import { Breakpoints, Layout } from '@/theme';

export interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWideDesktop: boolean;
  columns: number;
  gutter: number;
  contentWidth: number;
  responsiveValue: <T>(values: { mobile: T; tablet?: T; desktop?: T }) => T;
}

export function useResponsive(): ResponsiveState {
  const { width, height } = useWindowDimensions();

  const isMobile = width < Breakpoints.md;
  const isTablet = width >= Breakpoints.md && width < Breakpoints.lg;
  const isDesktop = width >= Breakpoints.lg;
  const isWideDesktop = width >= Breakpoints.xl;

  let columns = 1;
  if (isWideDesktop) {
    columns = 3;
  } else if (width >= Breakpoints.md) {
    columns = 2;
  }

  let gutter: number = Layout.gutterMobile;
  if (isDesktop) {
    gutter = Layout.gutterDesktop;
  } else if (isTablet) {
    gutter = Layout.gutterTablet;
  }

  const contentWidth = Math.min(Math.max(width - gutter * 2, 300), Layout.maxContentWidth);

  const responsiveValue = <T>(values: { mobile: T; tablet?: T; desktop?: T }): T => {
    if (isDesktop && values.desktop !== undefined) {
      return values.desktop;
    }
    if (isTablet && values.tablet !== undefined) {
      return values.tablet;
    }
    return values.mobile;
  };

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isWideDesktop,
    columns,
    gutter,
    contentWidth,
    responsiveValue,
  };
}
