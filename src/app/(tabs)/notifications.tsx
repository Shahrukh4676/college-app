import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Palette, Radius, Spacing, Typography, Shadows } from '@/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { notificationService } from '@/services/notificationService';
import { AppNotification, NotificationType } from '@/types';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorView } from '@/components/ui/error-view';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Ionicons } from '@expo/vector-icons';

function formatRelativeTime(iso: string) {
  try {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return '';
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { isMobile } = useResponsive();

  const {
    data: notifications,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handlePress = (notif: AppNotification) => {
    if (!notif.isRead) {
      markReadMutation.mutate(notif.id);
    }

    if (notif.entityType === 'task' && notif.entityId) {
      router.push(`/task/${notif.entityId}` as any);
    } else if (notif.entityType === 'chat' && notif.entityId) {
      router.push(`/chat/${notif.entityId}` as any);
    } else if (notif.entityType === 'payment') {
      router.push('/(tabs)/profile');
    }
  };

  const getNotifIcon = (
    type: NotificationType
  ): { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string } => {
    switch (type) {
      case 'NEW_OFFER':
      case 'OFFER_ACCEPTED':
        return { icon: 'pricetag', color: Palette.primary600, bg: Palette.primary50 };
      case 'PAYMENT_UPDATE':
        return { icon: 'wallet', color: Palette.success500, bg: Palette.success50 };
      case 'NEW_MESSAGE':
        return { icon: 'chatbubble', color: Palette.purple500, bg: Palette.purple50 };
      case 'WORK_SUBMITTED':
      case 'TASK_COMPLETED':
        return { icon: 'checkmark-circle', color: Palette.success500, bg: Palette.success50 };
      case 'SAFETY_ALERT':
        return { icon: 'shield-outline', color: Palette.danger500, bg: Palette.danger50 };
      default:
        return { icon: 'notifications', color: Palette.slate500, bg: Palette.slate100 };
    }
  };

  return (
    <View style={styles.container}>
      {/* Mobile Header */}
      {isMobile && (
        <View style={[styles.mobileHeader, { paddingTop: Math.max(insets.top, 16) }]}>
          <Text style={styles.mobileTitle}>Alerts & Activity</Text>
          <Text style={styles.mobileSubtitle}>
            Real-time updates on offers, payments, and task status.
          </Text>
        </View>
      )}

      <ResponsiveContainer maxWidth="detail" style={{ flex: 1 }}>
        {!isMobile && (
          <View style={styles.desktopHeader}>
            <Text style={styles.desktopTitle}>Notifications & Alerts</Text>
            <Text style={styles.desktopSubtitle}>
              Stay updated on offers, escrow updates, and peer collaboration milestones.
            </Text>
          </View>
        )}

        <FlatList
          data={notifications || []}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Palette.primary600}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            !isMobile && styles.desktopListContent,
          ]}
          renderItem={({ item }) => {
            const cfg = getNotifIcon(item.type);
            return (
              <Pressable
                onPress={() => handlePress(item)}
                style={({ pressed }) => [
                  styles.notifCard,
                  !item.isRead && styles.notifUnread,
                  pressed && styles.cardPressed,
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon} size={20} color={cfg.color} />
                </View>

                <View style={styles.textCol}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, !item.isRead && styles.boldTitle]}>
                      {item.title}
                    </Text>
                    <Text style={styles.timeText}>{formatRelativeTime(item.createdAt)}</Text>
                  </View>

                  <Text style={styles.messageText}>{item.message}</Text>
                </View>

                {!item.isRead && <View style={styles.unreadDot} />}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.skeletonContainer}>
                <Skeleton height={70} borderRadius={Radius.lg} style={styles.skeletonItem} />
                <Skeleton height={70} borderRadius={Radius.lg} style={styles.skeletonItem} />
              </View>
            ) : isError ? (
              <ErrorView
                title="Unable to load alerts"
                message="Failed to connect to the notifications service. Please verify server connection."
                onRetry={refetch}
              />
            ) : (
              <EmptyState
                icon="notifications-off-outline"
                title="All Caught Up"
                description="You have no notifications at this time. We will alert you when peers engage with your requests."
                actionTitle="Explore Open Tasks"
                onActionPress={() => router.push('/(tabs)/tasks')}
              />
            )
          }
        />
      </ResponsiveContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  mobileHeader: {
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
  },
  mobileTitle: {
    ...Typography.h2,
    color: Palette.slate900,
    marginBottom: 2,
  },
  mobileSubtitle: {
    ...Typography.caption,
    color: Palette.slate500,
  },
  desktopHeader: {
    paddingVertical: Spacing.xl,
  },
  desktopTitle: {
    ...Typography.h2,
    color: Palette.navy950,
    marginBottom: 4,
  },
  desktopSubtitle: {
    ...Typography.body,
    fontSize: 14,
    color: Palette.slate500,
  },
  listContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  desktopListContent: {
    paddingTop: 0,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.slate200,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  notifUnread: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  cardPressed: {
    backgroundColor: Palette.slate50,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    ...Typography.bodyMedium,
    color: Palette.slate800,
    flex: 1,
    marginRight: Spacing.sm,
  },
  boldTitle: {
    fontWeight: '700',
    color: Palette.slate900,
  },
  timeText: {
    ...Typography.tiny,
    color: Palette.slate400,
  },
  messageText: {
    ...Typography.caption,
    color: Palette.slate600,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.primary600,
  },
  skeletonContainer: {
    gap: Spacing.sm,
    paddingTop: Spacing.md,
  },
  skeletonItem: {
    width: '100%',
  },
});
