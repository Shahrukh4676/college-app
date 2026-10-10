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
import { Palette, Radius, Shadows, Spacing, Typography } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import { taskService } from '@/services/taskService';
import { paymentService } from '@/services/paymentService';
import { TaskCard } from '@/components/tasks/task-card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorView } from '@/components/ui/error-view';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Ionicons } from '@expo/vector-icons';
import { TaskCategory } from '@/types';

const CATEGORIES: { label: string; icon: keyof typeof Ionicons.glyphMap; key: TaskCategory }[] = [
  { label: 'Coding & Debugging', icon: 'code-slash', key: 'CODING_DEBUG' },
  { label: 'Math & Stats', icon: 'calculator', key: 'MATH_STATS' },
  { label: 'Research & Editing', icon: 'document-text', key: 'RESEARCH_EDITING' },
  { label: 'Notes & Summary', icon: 'book', key: 'NOTES_SUMMARY' },
  { label: 'Presentations', icon: 'easel', key: 'PRESENTATIONS' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isMobile } = useResponsive();

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
    <View style={styles.container}>
      {/* Mobile-Only Header Bar (Desktop has DesktopNav in TabLayout) */}
      {isMobile && (
        <View style={[styles.mobileTopBar, { paddingTop: Math.max(insets.top, 16) }]}>
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
      )}

      <ResponsiveContainer
        maxWidth="content"
        asScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          !isMobile && styles.scrollContentDesktop,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetchTasks}
            tintColor={Palette.primary600}
          />
        }
      >
        {/* Desktop Welcome Bar */}
        {!isMobile && (
          <View style={styles.desktopWelcomeBar}>
            <View>
              <Text style={styles.desktopGreetingTitle}>
                Welcome back, {firstName} 👋
              </Text>
              <Text style={styles.desktopGreetingSub}>
                {user?.college || 'Campus Network'} • Explore academic assistance opportunities and manage requests.
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/task/create')}
              style={styles.desktopPostBtn}
              accessibilityRole="button"
              accessibilityLabel="Request Academic Assistance"
            >
              <Ionicons name="add" size={18} color={Palette.white} />
              <Text style={styles.desktopPostBtnText}>Post Task Request</Text>
            </Pressable>
          </View>
        )}

        {/* Search trigger */}
        <Pressable
          onPress={() => router.push('/(tabs)/tasks')}
          style={styles.searchBar}
          accessibilityRole="button"
          accessibilityLabel="Search marketplace tasks"
        >
          <Ionicons name="search-outline" size={20} color={Palette.slate400} />
          <Text style={styles.searchPlaceholder}>Search coding, lab assignments, stats, notes...</Text>
        </Pressable>

        {/* Quick Post Action Card (Mobile only) */}
        {isMobile && (
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
        )}

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse Domains</Text>
          <Pressable onPress={() => router.push('/(tabs)/tasks')}>
            <Text style={styles.seeAllText}>View all</Text>
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

        {/* Earnings & Escrow Snapshot */}
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
              <Text style={styles.statLabel}>Peer Rating</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#EAB308" />
                <Text style={styles.statValue}> {stats.averageRating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Opportunities Feed */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Marketplace Opportunities</Text>
          <Pressable onPress={() => router.push('/(tabs)/tasks')}>
            <Text style={styles.seeAllText}>Explore full marketplace</Text>
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
          <View style={!isMobile ? styles.tasksGrid : undefined}>
            {tasks.slice(0, 6).map((task) => (
              <View key={task.id} style={!isMobile ? styles.taskGridItem : undefined}>
                <TaskCard task={task} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={36} color={Palette.slate300} />
            <Text style={styles.emptyText}>No open tasks at the moment.</Text>
            <Pressable
              onPress={() => router.push('/task/create')}
              style={styles.emptyPostBtn}
            >
              <Text style={styles.emptyPostBtnText}>Be the first to post a request</Text>
            </Pressable>
          </View>
        )}
      </ResponsiveContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  mobileTopBar: {
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
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Palette.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.primary600,
  },
  scrollContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  scrollContentDesktop: {
    paddingTop: Spacing.xl,
  },
  desktopWelcomeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Palette.white,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  desktopGreetingTitle: {
    ...Typography.h2,
    color: Palette.navy950,
    marginBottom: 4,
  },
  desktopGreetingSub: {
    ...Typography.body,
    fontSize: 14,
    color: Palette.slate500,
  },
  desktopPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.primary600,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  desktopPostBtnText: {
    color: Palette.white,
    fontWeight: '600',
    fontSize: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  searchPlaceholder: {
    ...Typography.body,
    fontSize: 14,
    color: Palette.slate400,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  bannerCard: {
    backgroundColor: Palette.navy950,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  bannerTextCol: {
    gap: 8,
  },
  bannerTitle: {
    ...Typography.h3,
    color: Palette.white,
    fontWeight: '700',
  },
  bannerDesc: {
    ...Typography.body,
    fontSize: 13,
    color: Palette.slate300,
    lineHeight: 18,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: Palette.primary600,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginTop: 6,
  },
  btnPressed: {
    opacity: 0.85,
  },
  postBtnText: {
    color: Palette.white,
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 17,
    color: Palette.slate900,
    fontWeight: '700',
  },
  seeAllText: {
    ...Typography.captionBold,
    color: Palette.primary600,
  },
  categoryRow: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    gap: 8,
    ...Shadows.sm,
  },
  catPillPressed: {
    backgroundColor: Palette.primary50,
  },
  catIconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Palette.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: {
    ...Typography.captionBold,
    color: Palette.slate800,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.xl,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.tiny,
    color: Palette.slate500,
    marginBottom: 4,
    fontWeight: '600',
  },
  statValue: {
    ...Typography.amountMedium,
    color: Palette.slate900,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: Palette.slate200,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tasksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  taskGridItem: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  skeletonContainer: {
    gap: Spacing.md,
  },
  skeletonItem: {
    width: '100%',
  },
  emptyContainer: {
    backgroundColor: Palette.white,
    padding: Spacing.xxl,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.slate200,
    gap: 8,
  },
  emptyText: {
    ...Typography.body,
    color: Palette.slate500,
  },
  emptyPostBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Palette.primary50,
    marginTop: 4,
  },
  emptyPostBtnText: {
    ...Typography.captionBold,
    color: Palette.primary700,
  },
});
