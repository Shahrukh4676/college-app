import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Task } from '@/types';
import { Colors, Palette, Radius, Shadows, Spacing } from '@/theme';
import { Avatar } from '@/components/ui/avatar';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { Ionicons } from '@expo/vector-icons';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const router = useRouter();

  const getStatusBadge = (status: Task['status']): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'OPEN':
        return { label: 'Open', variant: 'primary' };
      case 'HELPER_SELECTED':
        return { label: 'Assigned', variant: 'purple' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', variant: 'warning' };
      case 'SUBMITTED':
        return { label: 'Submitted', variant: 'purple' };
      case 'COMPLETED':
        return { label: 'Completed', variant: 'success' };
      case 'CANCELLED':
        return { label: 'Cancelled', variant: 'neutral' };
    }
  };

  const badge = getStatusBadge(task.status);

  const formatDeadline = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Soon';
    }
  };

  return (
    <Pressable
      onPress={() => router.push(`/task/${task.id}` as any)}
      accessibilityRole="button"
      accessibilityLabel={`Task: ${task.title}, Budget ₹${task.budgetInr}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <View style={styles.requesterRow}>
          <Avatar
            url={task.requesterAvatarUrl}
            name={task.requesterName}
            size="sm"
          />
          <View style={styles.requesterMeta}>
            <Text style={styles.requesterName} numberOfLines={1}>
              {task.requesterName}
            </Text>
            <Text style={styles.collegeName} numberOfLines={1}>
              {task.requesterCollege}
            </Text>
          </View>
        </View>

        <Badge label={badge.label} variant={badge.variant} showDot />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {task.title}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {task.description}
      </Text>

      {task.requiredSkills && task.requiredSkills.length > 0 && (
        <View style={styles.skillsRow}>
          {task.requiredSkills.slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.skillPill}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {task.requiredSkills.length > 3 && (
            <View style={styles.skillPill}>
              <Text style={styles.skillText}>+{task.requiredSkills.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.budgetCol}>
          <Text style={styles.budgetLabel}>Budget</Text>
          <Text style={styles.budgetAmount}>₹{task.budgetInr.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.metaCol}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Palette.slate400} />
            <Text style={styles.metaText}>{formatDeadline(task.deadline)}</Text>
          </View>

          <View style={[styles.metaItem, styles.offersMargin]}>
            <Ionicons name="chatbubbles-outline" size={14} color={Palette.slate400} />
            <Text style={styles.metaText}>{task.offersCount} offers</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.sm,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  requesterMeta: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  requesterName: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate800,
  },
  collegeName: {
    fontSize: 11,
    color: Palette.slate500,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate900,
    lineHeight: 22,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13,
    color: Palette.slate600,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  skillPill: {
    backgroundColor: Palette.slate100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
  },
  skillText: {
    fontSize: 11,
    fontWeight: '500',
    color: Palette.slate700,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.slate100,
    marginBottom: Spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetCol: {},
  budgetLabel: {
    fontSize: 11,
    color: Palette.slate400,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.primary600,
    letterSpacing: -0.3,
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  offersMargin: {
    marginLeft: Spacing.md,
  },
  metaText: {
    fontSize: 12,
    color: Palette.slate500,
    fontWeight: '500',
  },
});
