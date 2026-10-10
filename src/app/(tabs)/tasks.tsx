import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Palette, Radius, Shadows, Spacing, Typography } from '@/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { taskService } from '@/services/taskService';
import { TaskCard } from '@/components/tasks/task-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorView } from '@/components/ui/error-view';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Ionicons } from '@expo/vector-icons';
import { TaskCategory } from '@/types';

const CATEGORIES: { label: string; key: 'ALL' | TaskCategory; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'All Domains', key: 'ALL', icon: 'grid-outline' },
  { label: 'Coding & Debugging', key: 'CODING_DEBUG', icon: 'code-slash' },
  { label: 'Math & Statistics', key: 'MATH_STATS', icon: 'calculator' },
  { label: 'Research & Editing', key: 'RESEARCH_EDITING', icon: 'document-text' },
  { label: 'Notes & Summary', key: 'NOTES_SUMMARY', icon: 'book' },
  { label: 'Presentations', key: 'PRESENTATIONS', icon: 'easel' },
  { label: 'Tutoring & Concepts', key: 'TUTORING', icon: 'school' },
];

const STATUS_FILTERS = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

export default function TasksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();
  const { isMobile } = useResponsive();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | TaskCategory>(
    (params.category as TaskCategory) || 'ALL'
  );
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const {
    data: tasks,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['marketplace_tasks', selectedCategory, search, selectedStatus],
    queryFn: () =>
      taskService.getTasks({
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        search: search.trim() || undefined,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      }),
  });

  const isFiltered = search.length > 0 || selectedCategory !== 'ALL' || selectedStatus !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  return (
    <View style={styles.container}>
      {/* Mobile Top Header */}
      {isMobile && (
        <View style={[styles.mobileHeader, { paddingTop: Math.max(insets.top, 16) }]}>
          <View style={styles.mobileTitleRow}>
            <Text style={styles.mobileTitle}>Marketplace</Text>
            <Pressable
              onPress={() => router.push('/task/create')}
              accessibilityRole="button"
              accessibilityLabel="Create task"
              style={styles.mobileCreateBtn}
            >
              <Ionicons name="add" size={20} color={Palette.white} />
            </Pressable>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={Palette.slate400} />
            <TextInput
              placeholder="Search tasks, skills, topics..."
              placeholderTextColor={Palette.slate400}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={Palette.slate400} />
              </Pressable>
            )}
          </View>

          {/* Mobile Category & Status Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalPillsRow}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => setSelectedCategory(cat.key)}
                  style={[styles.categoryPill, active && styles.categoryPillActive]}
                >
                  <Text style={[styles.categoryPillText, active && styles.categoryPillTextActive]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.horizontalPillsRow, { marginTop: 6, paddingBottom: 6 }]}
          >
            {STATUS_FILTERS.map((item) => {
              const active = selectedStatus === item.value;
              return (
                <Pressable
                  key={item.value}
                  onPress={() => setSelectedStatus(item.value)}
                  style={[styles.statusPill, active && styles.statusPillActive]}
                >
                  <Text style={[styles.statusPillText, active && styles.statusPillTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Main Content Area */}
      <ResponsiveContainer maxWidth="content" style={{ flex: 1 }}>
        <View style={[styles.bodyLayout, !isMobile && styles.desktopBodyLayout]}>
          {/* Desktop Filter Sidebar */}
          {!isMobile && (
            <View style={styles.desktopSidebar}>
              <View style={styles.sidebarCard}>
                <Text style={styles.sidebarHeading}>Filter by Domain</Text>
                <View style={styles.sidebarList}>
                  {CATEGORIES.map((cat) => {
                    const active = selectedCategory === cat.key;
                    return (
                      <Pressable
                        key={cat.key}
                        onPress={() => setSelectedCategory(cat.key)}
                        style={[styles.sidebarItem, active && styles.sidebarItemActive]}
                      >
                        <Ionicons
                          name={cat.icon}
                          size={16}
                          color={active ? Palette.primary600 : Palette.slate500}
                        />
                        <Text style={[styles.sidebarItemText, active && styles.sidebarItemTextActive]}>
                          {cat.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.sidebarDivider} />

                <Text style={styles.sidebarHeading}>Task Status</Text>
                <View style={styles.sidebarList}>
                  {STATUS_FILTERS.map((item) => {
                    const active = selectedStatus === item.value;
                    return (
                      <Pressable
                        key={item.value}
                        onPress={() => setSelectedStatus(item.value)}
                        style={[styles.sidebarItem, active && styles.sidebarItemActive]}
                      >
                        <View style={[styles.statusIndicatorDot, active && styles.statusDotActive]} />
                        <Text style={[styles.sidebarItemText, active && styles.sidebarItemTextActive]}>
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {isFiltered && (
                  <Pressable onPress={resetFilters} style={styles.resetFilterBtn}>
                    <Ionicons name="refresh-outline" size={14} color={Palette.primary600} />
                    <Text style={styles.resetFilterText}>Reset Filters</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {/* Task Feed */}
          <View style={styles.feedColumn}>
            {/* Desktop Search & Header Bar */}
            {!isMobile && (
              <View style={styles.desktopHeaderRow}>
                <View style={styles.desktopSearchBox}>
                  <Ionicons name="search" size={18} color={Palette.slate400} />
                  <TextInput
                    placeholder="Search tasks by title, skill keywords, or topics..."
                    placeholderTextColor={Palette.slate400}
                    value={search}
                    onChangeText={setSearch}
                    style={styles.desktopSearchInput}
                  />
                  {search.length > 0 && (
                    <Pressable onPress={() => setSearch('')}>
                      <Ionicons name="close-circle" size={18} color={Palette.slate400} />
                    </Pressable>
                  )}
                </View>

                <Pressable
                  onPress={() => router.push('/task/create')}
                  style={styles.desktopCreateBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Create task"
                >
                  <Ionicons name="add" size={18} color={Palette.white} />
                  <Text style={styles.desktopCreateBtnText}>Post Request</Text>
                </Pressable>
              </View>
            )}

            {/* Results Counter */}
            {tasks && tasks.length > 0 && (
              <View style={styles.resultsBar}>
                <Text style={styles.resultsCountText}>
                  Showing <Text style={styles.resultsCountBold}>{tasks.length}</Text> academic tasks
                </Text>
              </View>
            )}

            <FlatList
              data={tasks || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={!isMobile ? styles.desktopTaskGridWrapper : undefined}>
                  <TaskCard task={item} />
                </View>
              )}
              numColumns={!isMobile ? 2 : 1}
              key={!isMobile ? 'desktop-grid' : 'mobile-list'}
              columnWrapperStyle={!isMobile ? styles.columnWrapper : undefined}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={refetch}
                  tintColor={Palette.primary600}
                />
              }
              ListEmptyComponent={
                isError ? (
                  <ErrorView
                    title="Unable to Load Marketplace"
                    message="Failed to connect to the task service. Please verify your connection."
                    onRetry={() => refetch()}
                    isRetrying={isRefetching}
                  />
                ) : isLoading ? (
                  <View style={styles.skeletonList}>
                    <Skeleton height={140} borderRadius={Radius.lg} style={styles.skeletonItem} />
                    <Skeleton height={140} borderRadius={Radius.lg} style={styles.skeletonItem} />
                    <Skeleton height={140} borderRadius={Radius.lg} style={styles.skeletonItem} />
                  </View>
                ) : isFiltered ? (
                  <EmptyState
                    icon="search-outline"
                    title="No Matching Tasks"
                    description="No tasks match your active filters. Clear your filters to view all campus opportunities."
                    actionTitle="Reset All Filters"
                    onActionPress={resetFilters}
                  />
                ) : (
                  <EmptyState
                    icon="file-tray-outline"
                    title="No Tasks Available"
                    description="There are currently no tasks posted in the marketplace. Be the first to post a request!"
                    actionTitle="Post a New Task"
                    onActionPress={() => router.push('/task/create')}
                  />
                )
              }
            />
          </View>
        </View>
      </ResponsiveContainer>

      {/* Floating Action Button (Mobile Only) */}
      {isMobile && (
        <Pressable
          onPress={() => router.push('/task/create')}
          accessibilityRole="button"
          accessibilityLabel="Create Task FAB"
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        >
          <Ionicons name="add" size={28} color={Palette.white} />
        </Pressable>
      )}
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
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
  },
  mobileTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mobileTitle: {
    ...Typography.h2,
    color: Palette.slate900,
  },
  mobileCreateBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Palette.primary600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.slate100,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Palette.slate900,
  },
  horizontalPillsRow: {
    gap: Spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Palette.slate100,
    marginRight: 6,
  },
  categoryPillActive: {
    backgroundColor: Palette.primary600,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate600,
  },
  categoryPillTextActive: {
    color: Palette.white,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Palette.slate100,
    marginRight: 6,
  },
  statusPillActive: {
    backgroundColor: Palette.slate800,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.slate600,
  },
  statusPillTextActive: {
    color: Palette.white,
  },
  bodyLayout: {
    flex: 1,
  },
  desktopBodyLayout: {
    flexDirection: 'row',
    paddingTop: Spacing.xl,
    gap: Spacing.xxl,
  },
  desktopSidebar: {
    width: 250,
  },
  sidebarCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    ...Shadows.sm,
  },
  sidebarHeading: {
    ...Typography.tiny,
    fontWeight: '700',
    color: Palette.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  sidebarList: {
    gap: 4,
    marginBottom: Spacing.md,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  sidebarItemActive: {
    backgroundColor: Palette.primary50,
  },
  sidebarItemText: {
    ...Typography.caption,
    color: Palette.slate700,
    fontWeight: '500',
  },
  sidebarItemTextActive: {
    color: Palette.primary700,
    fontWeight: '700',
  },
  statusIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.slate300,
  },
  statusDotActive: {
    backgroundColor: Palette.primary600,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: Palette.slate100,
    marginVertical: Spacing.md,
  },
  resetFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Palette.primary50,
    marginTop: Spacing.xs,
  },
  resetFilterText: {
    ...Typography.tiny,
    color: Palette.primary700,
    fontWeight: '700',
  },
  feedColumn: {
    flex: 1,
  },
  desktopHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  desktopSearchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Palette.slate200,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  desktopSearchInput: {
    flex: 1,
    fontSize: 14,
    color: Palette.slate900,
  },
  desktopCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.primary600,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    ...Shadows.sm,
  },
  desktopCreateBtnText: {
    color: Palette.white,
    fontWeight: '600',
    fontSize: 14,
  },
  resultsBar: {
    marginBottom: Spacing.md,
  },
  resultsCountText: {
    ...Typography.caption,
    color: Palette.slate500,
  },
  resultsCountBold: {
    fontWeight: '700',
    color: Palette.slate800,
  },
  columnWrapper: {
    gap: Spacing.lg,
  },
  desktopTaskGridWrapper: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingBottom: Spacing.xxxl * 2,
  },
  skeletonList: {
    gap: Spacing.md,
  },
  skeletonItem: {
    width: '100%',
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.primary600,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  fabPressed: {
    backgroundColor: Palette.primary700,
    transform: [{ scale: 0.96 }],
  },
});
