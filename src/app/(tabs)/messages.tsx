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
import { useQuery } from '@tanstack/react-query';
import { Palette, Radius, Spacing, Typography, Shadows } from '@/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { chatService } from '@/services/chatService';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorView } from '@/components/ui/error-view';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Ionicons } from '@expo/vector-icons';

function formatConversationTime(iso?: string) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    if (now.getTime() - d.getTime() < 24 * 3600 * 1000) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();

  const {
    data: conversations,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatService.getConversations(),
  });

  return (
    <View style={styles.container}>
      {/* Mobile Top Header */}
      {isMobile && (
        <View style={[styles.mobileHeader, { paddingTop: Math.max(insets.top, 16) }]}>
          <Text style={styles.mobileTitle}>Messages</Text>
          <Text style={styles.mobileSubtitle}>
            Direct coordination with assigned helpers & task creators.
          </Text>
        </View>
      )}

      <ResponsiveContainer maxWidth="detail" style={{ flex: 1 }}>
        {!isMobile && (
          <View style={styles.desktopHeader}>
            <Text style={styles.desktopTitle}>Campus Conversations</Text>
            <Text style={styles.desktopSubtitle}>
              Direct coordination with assigned helpers and task creators. Keep academic communication respectful and clear.
            </Text>
          </View>
        )}

        <FlatList
          data={conversations || []}
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
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/chat/${item.id}` as any)}
              style={({ pressed }) => [styles.convCard, pressed && styles.cardPressed]}
            >
              <Avatar
                url={item.participant.avatarUrl}
                name={item.participant.fullName}
                size="md"
                isOnline={item.participant.isOnline}
              />

              <View style={styles.contentCol}>
                <View style={styles.topRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.participant.fullName}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatConversationTime(item.lastMessage?.timestamp || item.updatedAt)}
                  </Text>
                </View>

                <View style={styles.taskTagRow}>
                  <Ionicons name="briefcase-outline" size={12} color={Palette.primary600} />
                  <Text style={styles.taskTitle} numberOfLines={1}>
                    {item.taskTitle}
                  </Text>
                </View>

                <View style={styles.msgRow}>
                  <Text
                    style={[
                      styles.lastMsgText,
                      item.unreadCount > 0 && styles.lastMsgUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage?.text || 'No messages yet'}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.skeletonContainer}>
                <Skeleton height={78} borderRadius={Radius.lg} style={styles.skeletonItem} />
                <Skeleton height={78} borderRadius={Radius.lg} style={styles.skeletonItem} />
              </View>
            ) : isError ? (
              <ErrorView
                title="Unable to load conversations"
                message="Could not connect to the messaging service. Check your connection or verify that the messaging backend is online."
                onRetry={refetch}
              />
            ) : (
              <EmptyState
                icon="chatbubbles-outline"
                title="No Conversations Yet"
                description="When an offer is accepted on a task, an authenticated coordination channel will open here."
                actionTitle="Browse Open Tasks"
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
  convCard: {
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
  cardPressed: {
    backgroundColor: Palette.slate50,
  },
  contentCol: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...Typography.bodyBold,
    color: Palette.slate900,
    flex: 1,
    marginRight: Spacing.sm,
  },
  timeText: {
    ...Typography.tiny,
    color: Palette.slate400,
  },
  taskTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskTitle: {
    ...Typography.tiny,
    color: Palette.primary700,
    fontWeight: '600',
    flex: 1,
  },
  msgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  lastMsgText: {
    ...Typography.caption,
    color: Palette.slate500,
    flex: 1,
    marginRight: Spacing.sm,
  },
  lastMsgUnread: {
    fontWeight: '700',
    color: Palette.slate900,
  },
  unreadBadge: {
    backgroundColor: Palette.primary600,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  unreadCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.white,
  },
  skeletonContainer: {
    gap: Spacing.sm,
    paddingTop: Spacing.md,
  },
  skeletonItem: {
    width: '100%',
  },
});
