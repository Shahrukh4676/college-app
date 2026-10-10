import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Palette, Radius, Shadows, Spacing } from '@/theme';
import { taskService } from '@/services/taskService';
import { TaskCard } from '@/components/tasks/task-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorView } from '@/components/ui/error-view';
import { Ionicons } from '@expo/vector-icons';
import { TaskCategory } from '@/types';

const CATEGORIES: { label: string; key: 'ALL' | TaskCategory }[] = [
  { label: 'All', key: 'ALL' },
  { label: 'Coding', key: 'CODING_DEBUG' },
  { label: 'Math & Stats', key: 'MATH_STATS' },
  { label: 'Research', key: 'RESEARCH_EDITING' },
  { label: 'Notes', key: 'NOTES_SUMMARY' },
  { label: 'Slides', key: 'PRESENTATIONS' },
  { label: 'Tutoring', key: 'TUTORING' },
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

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Search & Header */}
      <View style={styles.headerArea}>
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Marketplace</Text>
          <Pressable
            onPress={() => router.push('/task/create')}
            accessibilityRole="button"
            accessibilityLabel="Create task"
            style={({ pressed }) => [styles.createIconBtn, pressed && styles.btnPressed]}
          >
            <Ionicons name="add" size={22} color={Palette.white} />
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Palette.slate400} />
          <TextInput
            placeholder="Search tasks by title, skill, or topic..."
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

        {/* Category Pills */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.key;
            return (
              <Pressable
                onPress={() => setSelectedCategory(item.key)}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
              >
                <Text
                  style={[styles.categoryText, isSelected && styles.categoryTextActive]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={[styles.categoryList, { marginTop: 6 }]}
          renderItem={({ item }) => {
            const isSelected = selectedStatus === item.value;
            return (
              <Pressable
                onPress={() => setSelectedStatus(item.value)}
                style={[styles.statusPill, isSelected && styles.statusPillActive]}
              >
                <Text style={[styles.statusPillText, isSelected && styles.statusPillTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Task List Content */}
      <FlatList
        data={tasks || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskCard task={item} />}
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
              message="Failed to connect to the task service. Please check your network or server status."
              onRetry={() => refetch()}
              isRetrying={isRefetching}
            />
          ) : isLoading ? (
            <View style={styles.skeletonList}>
              <Skeleton height={140} borderRadius={Radius.lg} style={styles.skeletonItem} />
              <Skeleton height={140} borderRadius={Radius.lg} style={styles.skeletonItem} />
              <Skeleton height={140} borderRadius={Radius.lg} style={styles.skeletonItem} />
            </View>
          ) : search || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' ? (
            <EmptyState
              icon="search-outline"
              title="No Matching Tasks"
              description="No tasks match your active filters. Clear filters to view all available tasks."
              actionTitle="Reset All Filters"
              onActionPress={() => {
                setSearch('');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
              }}
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

      {/* Floating Action Button (FAB) */}
      <Pressable
        onPress={() => router.push('/task/create')}
        accessibilityRole="button"
        accessibilityLabel="Create Task FAB"
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Ionicons name="add" size={28} color={Palette.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  headerArea: {
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.slate900,
    letterSpacing: -0.4,
  },
  createIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.primary600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPressed: {
    opacity: 0.85,
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
  categoryList: {
    gap: Spacing.xs,
    paddingBottom: 4,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Palette.slate100,
    marginRight: 6,
  },
  categoryPillActive: {
    backgroundColor: Palette.primary600,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate600,
  },
  categoryTextActive: {
    color: Palette.white,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  skeletonList: {
    paddingTop: Spacing.sm,
  },
  skeletonItem: {
    marginBottom: Spacing.md,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
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
