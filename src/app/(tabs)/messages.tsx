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
import { Palette, Radius, Spacing } from '@/theme';
import { chatService } from '@/services/chatService';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorView } from '@/components/ui/error-view';

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
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversations</Text>
        <Text style={styles.headerSubtitle}>
          Direct coordination with assigned helpers & task creators.
        </Text>
      </View>

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
        contentContainerStyle={styles.listContent}
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

              <Text style={styles.taskTitle} numberOfLines={1}>
                {item.taskTitle}
              </Text>

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
              <Skeleton height={72} borderRadius={Radius.md} style={styles.skeletonItem} />
              <Skeleton height={72} borderRadius={Radius.md} style={styles.skeletonItem} />
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
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate100,
  },
  cardPressed: {
    backgroundColor: Palette.slate50,
  },
  contentCol: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate900,
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 11,
    color: Palette.slate400,
  },
  taskTitle: {
    fontSize: 12,
    color: Palette.primary600,
    fontWeight: '600',
    marginBottom: 4,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMsgText: {
    fontSize: 13,
    color: Palette.slate500,
    flex: 1,
    marginRight: 8,
  },
  lastMsgUnread: {
    color: Palette.slate900,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: Palette.primary600,
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
  },
  unreadCountText: {
    color: Palette.white,
    fontSize: 11,
    fontWeight: '700',
  },
  skeletonContainer: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  skeletonItem: {
    marginBottom: Spacing.xs,
  },
});
