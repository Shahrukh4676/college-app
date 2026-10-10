import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Palette, Radius, Shadows, Spacing } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { taskService } from '@/services/taskService';
import { paymentService } from '@/services/paymentService';
import { TaskCard } from '@/components/tasks/task-card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorView } from '@/components/ui/error-view';
import { Ionicons } from '@expo/vector-icons';
import { TaskCategory } from '@/types';

const CATEGORIES: { label: string; icon: keyof typeof Ionicons.glyphMap; key: TaskCategory }[] = [
  { label: 'Coding', icon: 'code-slash', key: 'CODING_DEBUG' },
  { label: 'Math & Stats', icon: 'calculator', key: 'MATH_STATS' },
  { label: 'Editing', icon: 'document-text', key: 'RESEARCH_EDITING' },
  { label: 'Notes', icon: 'book', key: 'NOTES_SUMMARY' },
  { label: 'Slides', icon: 'easel', key: 'PRESENTATIONS' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isMockMode } = useAuth();

  const {
    data: tasks,
    isLoading: isTasksLoading,
    isError: isTasksError,
    refetch: refetchTasks,
    isRefetching,
  } = useQuery({
    queryKey: ['home_tasks'],
    queryFn: () => taskService.getTasks(),
  });

  const { data: stats } = useQuery({
    queryKey: ['home_stats'],
    queryFn: () => paymentService.getEarningStats(),
  });

  const firstName = user?.fullName?.split(' ')[0] || 'Student';

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.userGreetingRow}>
          <Pressable onPress={() => router.push('/(tabs)/profile')}>
            <Avatar
              url={user?.avatarUrl}
              name={user?.fullName || 'Student'}
              size="md"
            />
          </Pressable>
          <View style={styles.greetingMeta}>
            <Text style={styles.greetingText}>Hello, {firstName} 👋</Text>
            <Text style={styles.collegeText} numberOfLines={1}>
              {user?.college || 'Campus Member'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {isMockMode && (
            <View style={styles.mockBadge}>
              <Text style={styles.mockBadgeText}>MOCK</Text>
            </View>
          )}
          <Pressable
            onPress={() => router.push('/(tabs)/notifications')}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={styles.notifBtn}
          >
            <Ionicons name="notifications-outline" size={22} color={Palette.slate700} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetchTasks}
            tintColor={Palette.primary600}
          />
        }
      >
        {/* Search trigger */}
        <Pressable
          onPress={() => router.push('/(tabs)/tasks')}
          style={styles.searchBar}
          accessibilityRole="button"
          accessibilityLabel="Search marketplace tasks"
        >
          <Ionicons name="search-outline" size={20} color={Palette.slate400} />
          <Text style={styles.searchPlaceholder}>Search coding, assignments, lab assistance...</Text>
        </Pressable>

        {/* Quick Post Action Card */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>Need assistance on a task?</Text>
            <Text style={styles.bannerDesc}>
              Post your request with budget in INR and get proposals from vetted campus peers.
            </Text>
            <Pressable
              onPress={() => router.push('/task/create')}
              style={({ pressed }) => [styles.postBtn, pressed && styles.btnPressed]}
              accessibilityRole="button"
              accessibilityLabel="Post a task now"
            >
              <Ionicons name="add" size={18} color={Palette.white} />
              <Text style={styles.postBtnText}>Post a Task</Text>
            </Pressable>
          </View>
        </View>

        {/* Category shortcuts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Pressable onPress={() => router.push('/(tabs)/tasks')}>
            <Text style={styles.seeAllText}>See all</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              onPress={() => router.push({ pathname: '/(tabs)/tasks', params: { category: cat.key } } as any)}
              style={({ pressed }) => [styles.catPill, pressed && styles.catPillPressed]}
            >
              <View style={styles.catIconWrap}>
                <Ionicons name={cat.icon} size={18} color={Palette.primary600} />
              </View>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Earnings Snapshot if available */}
        {stats && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Earned</Text>
              <Text style={styles.statValue}>₹{stats.totalEarnedInr.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>In Escrow</Text>
              <Text style={[styles.statValue, { color: Palette.warning700 }]}>
                ₹{stats.pendingEscrowInr.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Rating</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={15} color="#EAB308" />
                <Text style={styles.statValue}> {stats.averageRating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent / Recommended Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Marketplace Opportunities</Text>
          <Pressable onPress={() => router.push('/(tabs)/tasks')}>
            <Text style={styles.seeAllText}>View all</Text>
          </Pressable>
        </View>

        {isTasksError ? (
          <ErrorView
            title="Failed to Load Tasks"
            message="Could not reach the marketplace service. Please check your network connection or server status."
            onRetry={() => refetchTasks()}
            isRetrying={isRefetching}
          />
        ) : isTasksLoading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton height={140} borderRadius={Radius.lg} style={styles.skeletonItem} />
            <Skeleton height={140} borderRadius={Radius.lg} style={styles.skeletonItem} />
          </View>
        ) : tasks && tasks.length > 0 ? (
          tasks.slice(0, 4).map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No open tasks at the moment.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
  },
  userGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  greetingMeta: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  greetingText: {
    fontSize: 17,
    fontWeight: '800',
    color: Palette.slate900,
    letterSpacing: -0.3,
  },
  collegeText: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mockBadge: {
    backgroundColor: Palette.warning50,
    borderWidth: 1,
    borderColor: Palette.warning500,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  mockBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Palette.warning700,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.slate100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.danger500,
    borderWidth: 1.5,
    borderColor: Palette.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 13,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: Palette.slate400,
    flex: 1,
  },
  bannerCard: {
    backgroundColor: Palette.navy900,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  bannerTextCol: {},
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.white,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  bannerDesc: {
    fontSize: 13,
    color: Palette.slate300,
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary600,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
    gap: 4,
  },
  btnPressed: {
    opacity: 0.9,
  },
  postBtnText: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.slate900,
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.primary600,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  catPill: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Palette.slate200,
    minWidth: 80,
  },
  catPillPressed: {
    backgroundColor: Palette.slate100,
  },
  catIconWrap: {
    marginBottom: 4,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate700,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Palette.slate500,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate900,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Palette.slate200,
  },
  skeletonContainer: {
    gap: Spacing.md,
  },
  skeletonItem: {
    marginBottom: Spacing.sm,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: Palette.slate500,
    fontSize: 14,
  },
});
