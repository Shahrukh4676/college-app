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
import { Palette, Radius, Spacing } from '@/theme';
import { notificationService } from '@/services/notificationService';
import { AppNotification, NotificationType } from '@/types';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorView } from '@/components/ui/error-view';
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
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Text style={styles.headerSubtitle}>
          Real-time updates on offers, payments, and task status.
        </Text>
      </View>

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
        contentContainerStyle={styles.listContent}
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
              <Skeleton height={70} borderRadius={Radius.md} style={styles.skeletonItem} />
              <Skeleton height={70} borderRadius={Radius.md} style={styles.skeletonItem} />
            </View>
          ) : isError ? (
            <ErrorView
              title="Unable to load notifications"
              message="Could not retrieve recent updates. Please verify your connection or check if the notification service is online."
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              icon="notifications-off-outline"
              title="No Notifications"
              description="You are all caught up! You'll receive updates here when peers submit proposals or send messages."
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.slate900,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Palette.slate500,
    marginTop: 2,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xxxl,
  },
  notifCard: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate100,
    alignItems: 'center',
  },
  notifUnread: {
    backgroundColor: Palette.primary50,
  },
  cardPressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    color: Palette.slate800,
    fontWeight: '600',
  },
  boldTitle: {
    color: Palette.slate900,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
    color: Palette.slate400,
  },
  messageText: {
    fontSize: 13,
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
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  skeletonItem: {
    marginBottom: Spacing.xs,
  },
});
