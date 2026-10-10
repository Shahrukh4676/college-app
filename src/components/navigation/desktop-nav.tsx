import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius, Typography, Shadows, Layout } from '@/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/avatar';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: keyof typeof Ionicons.glyphMap;
  badgeCount?: number;
}

export function DesktopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useResponsive();
  const { user, isAuthenticated } = useAuth();

  if (isMobile) {
    return null;
  }

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', path: '/(tabs)/home', icon: 'home-outline' },
    { id: 'tasks', label: 'Marketplace', path: '/(tabs)/tasks', icon: 'briefcase-outline' },
    { id: 'messages', label: 'Messages', path: '/(tabs)/messages', icon: 'chatbubbles-outline' },
    { id: 'notifications', label: 'Alerts', path: '/(tabs)/notifications', icon: 'notifications-outline' },
    { id: 'profile', label: 'Profile', path: '/(tabs)/profile', icon: 'person-outline' },
  ];

  const isCurrentActive = (itemPath: string) => {
    if (pathname === itemPath) return true;
    if (itemPath.includes('/home') && (pathname === '/' || pathname === '/home')) return true;
    if (itemPath.includes('/tasks') && (pathname.includes('/tasks') || pathname.includes('/task/'))) return true;
    if (itemPath.includes('/messages') && (pathname.includes('/messages') || pathname.includes('/chat/'))) return true;
    if (itemPath.includes('/notifications') && pathname.includes('/notifications')) return true;
    if (itemPath.includes('/profile') && pathname.includes('/profile')) return true;
    return false;
  };

  return (
    <View style={styles.navWrapper} accessibilityRole="header">
      <View style={styles.innerContainer}>
        {/* Brand */}
        <Pressable
          style={styles.brandRow}
          onPress={() => router.push('/(tabs)/home')}
          accessibilityRole="button"
          accessibilityLabel="Student Marketplace Home"
        >
          <View style={styles.logoBadge}>
            <Ionicons name="school" size={20} color={Palette.white} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>Student Marketplace</Text>
              <View style={styles.campusTag}>
                <Text style={styles.campusTagText}>CAMPUS</Text>
              </View>
            </View>
            <Text style={styles.brandTagline}>Peer Academic Assistance</Text>
          </View>
        </Pressable>

        {/* Center Nav Links */}
        <View style={styles.navLinksRow}>
          {navItems.map((item) => {
            const active = isCurrentActive(item.path);
            return (
              <Pressable
                key={item.id}
                onPress={() => router.push(item.path as any)}
                style={[styles.navItem, active && styles.navItemActive]}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: active }}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={active ? Palette.primary600 : Palette.slate600}
                />
                <Text style={[styles.navItemText, active && styles.navItemTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Right Actions */}
        <View style={styles.rightActionsRow}>
          <Pressable
            style={styles.postTaskBtn}
            onPress={() => router.push('/task/create')}
            accessibilityRole="button"
            accessibilityLabel="Post New Task Request"
          >
            <Ionicons name="add" size={18} color={Palette.white} />
            <Text style={styles.postTaskBtnText}>Post Task</Text>
          </Pressable>

          <Pressable
            style={styles.settingsIconBtn}
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={20} color={Palette.slate700} />
          </Pressable>

          {isAuthenticated && user ? (
            <Pressable
              style={styles.profileBadge}
              onPress={() => router.push('/(tabs)/profile')}
              accessibilityRole="button"
              accessibilityLabel={`Profile for ${user.fullName}`}
            >
              <Avatar name={user.fullName} size="sm" />
              <View style={styles.userInfoCol}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.fullName.split(' ')[0]}
                </Text>
                <Text style={styles.userRole}>Student</Text>
              </View>
            </Pressable>
          ) : (
            <Pressable
              style={styles.loginBtn}
              onPress={() => router.push('/(auth)/login')}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
            >
              <Text style={styles.loginBtnText}>Sign In</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrapper: {
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
    width: '100%',
    zIndex: 100,
    ...Shadows.sm,
  },
  innerContainer: {
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Layout.gutterDesktop,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Palette.primary600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    ...Typography.h4,
    color: Palette.navy950,
    fontWeight: '700',
  },
  campusTag: {
    backgroundColor: Palette.primary50,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    borderWidth: 1,
    borderColor: Palette.primary200,
  },
  campusTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: Palette.primary700,
    letterSpacing: 0.5,
  },
  brandTagline: {
    ...Typography.tiny,
    color: Palette.slate500,
  },
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  navItemActive: {
    backgroundColor: Palette.primary50,
  },
  navItemText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Palette.slate600,
  },
  navItemTextActive: {
    color: Palette.primary700,
    fontWeight: '600',
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  postTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.primary600,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  postTaskBtnText: {
    color: Palette.white,
    fontWeight: '600',
    fontSize: 13,
  },
  settingsIconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.slate200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.slate50,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
  },
  userInfoCol: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate900,
    maxWidth: 90,
  },
  userRole: {
    fontSize: 10,
    color: Palette.slate500,
  },
  loginBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.primary600,
  },
  loginBtnText: {
    color: Palette.primary600,
    fontWeight: '600',
    fontSize: 13,
  },
});
