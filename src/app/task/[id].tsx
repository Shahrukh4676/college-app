import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Palette, Radius, Shadows, Spacing } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { taskService } from '@/services/taskService';
import { offerService } from '@/services/offerService';
import { AppHeader } from '@/components/ui/app-header';
import { Avatar } from '@/components/ui/avatar';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OfferCard } from '@/components/offers/offer-card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorView } from '@/components/ui/error-view';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '@/types';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [deliveryHours, setDeliveryHours] = useState('24');
  const [proposal, setProposal] = useState('');
  const [offerError, setOfferError] = useState<string | null>(null);

  const {
    data: task,
    isLoading: isTaskLoading,
    isError: isTaskError,
    error: taskError,
    refetch: refetchTask,
  } = useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getTaskById(id as string),
    enabled: !!id,
  });

  const { data: offers, isLoading: isOffersLoading } = useQuery({
    queryKey: ['task_offers', id],
    queryFn: () => offerService.getOffersForTask(id as string),
    enabled: !!id,
  });

  const isRequester = user?.id === task?.requesterId;
  const isHelper = user?.id === task?.helperId;

  // Submit offer mutation
  const submitOfferMutation = useMutation({
    mutationFn: offerService.submitOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['task_offers', id] });
      setIsOfferModalOpen(false);
      setProposal('');
      setOfferAmount('');
      Alert.alert('Offer Submitted', 'Your proposal was sent to the requester.');
    },
    onError: (err: any) => {
      setOfferError(err.message || 'Failed to submit offer.');
    },
  });

  // Accept offer mutation
  const acceptOfferMutation = useMutation({
    mutationFn: (offerId: string) => offerService.acceptOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['task_offers', id] });
      Alert.alert(
        'Offer Accepted',
        'Helper assigned! Task is now IN PROGRESS and an active chat channel has opened.'
      );
    },
  });

  // Reject offer mutation
  const rejectOfferMutation = useMutation({
    mutationFn: (offerId: string) => offerService.rejectOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task_offers', id] });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ status, notes }: { status: Task['status']; notes?: string }) =>
      taskService.updateTaskStatus(task!.id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      Alert.alert('Status Updated', 'Task progress updated successfully.');
    },
  });

  const handleSubmitOffer = () => {
    setOfferError(null);
    const amt = parseFloat(offerAmount);
    const hrs = parseInt(deliveryHours, 10);

    if (isNaN(amt) || amt <= 0) {
      setOfferError('Please enter a valid offer amount in INR.');
      return;
    }
    if (proposal.trim().length < 15) {
      setOfferError('Please write a brief proposal explaining your experience (15+ chars).');
      return;
    }

    submitOfferMutation.mutate({
      taskId: task!.id,
      offerAmountInr: amt,
      estimatedDeliveryHours: hrs || 24,
      proposal: proposal.trim(),
    });
  };

  const getStatusBadge = (status: Task['status']): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'OPEN':
        return { label: 'Open for Offers', variant: 'primary' };
      case 'HELPER_SELECTED':
        return { label: 'Assigned', variant: 'purple' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', variant: 'warning' };
      case 'SUBMITTED':
        return { label: 'Work Submitted', variant: 'purple' };
      case 'COMPLETED':
        return { label: 'Completed', variant: 'success' };
      case 'CANCELLED':
        return { label: 'Cancelled', variant: 'neutral' };
    }
  };

  if (isTaskLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Task Details" canGoBack />
        <View style={styles.skeletonBox}>
          <Skeleton height={200} borderRadius={Radius.lg} />
          <Skeleton height={100} borderRadius={Radius.lg} />
        </View>
      </View>
    );
  }

  if (isTaskError || !task) {
    return (
      <View style={styles.container}>
        <AppHeader title="Task Details" canGoBack />
        <ErrorView
          title="Task Unavailable"
          message={taskError instanceof Error ? taskError.message : "The requested task could not be loaded or may have been deleted."}
          onRetry={refetchTask}
        />
      </View>
    );
  }

  const badge = getStatusBadge(task.status);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Task Overview"
        canGoBack
        rightAction={
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/safety/report',
                params: { targetType: 'TASK', targetId: task.id },
              })
            }
            style={styles.flagBtn}
            accessibilityRole="button"
            accessibilityLabel="Report task"
          >
            <Ionicons name="flag-outline" size={20} color={Palette.slate500} />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status & Category Bar */}
        <View style={styles.metaBadgeRow}>
          <Badge label={badge.label} variant={badge.variant} showDot />
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{task.category}</Text>
          </View>
        </View>

        <Text style={styles.title}>{task.title}</Text>

        {/* Pricing & Deadline Card */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetCol}>
            <Text style={styles.budgetSub}>Budget Offering</Text>
            <Text style={styles.budgetNum}>₹{task.budgetInr.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.budgetDivider} />
          <View style={styles.budgetCol}>
            <Text style={styles.budgetSub}>Target Deadline</Text>
            <Text style={styles.deadlineNum}>
              {new Date(task.deadline).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {/* Requester info */}
        <View style={styles.requesterCard}>
          <Avatar
            url={task.requesterAvatarUrl}
            name={task.requesterName}
            size="md"
          />
          <View style={styles.requesterDetails}>
            <Text style={styles.requesterLabel}>Requested by</Text>
            <Text style={styles.requesterName}>{task.requesterName}</Text>
            <Text style={styles.requesterCollege}>{task.requesterCollege}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={13} color="#EAB308" />
            <Text style={styles.ratingText}>{task.requesterRating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Task Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Required Skills</Text>
          <View style={styles.skillsRow}>
            {task.requiredSkills.map((skill, idx) => (
              <View key={idx} style={styles.skillPill}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Assigned Helper section if present */}
        {task.helperId && (
          <View style={styles.helperSection}>
            <Text style={styles.sectionHeading}>Assigned Helper</Text>
            <View style={styles.helperCard}>
              <Avatar
                url={task.helperAvatarUrl}
                name={task.helperName || 'Helper'}
                size="md"
              />
              <View style={styles.helperMeta}>
                <Text style={styles.helperName}>{task.helperName}</Text>
                <Text style={styles.helperRole}>Assigned Academic Peer</Text>
              </View>
              <Button
                title="Open Chat"
                variant="primary"
                size="sm"
                icon={<Ionicons name="chatbubble" size={14} color={Palette.white} />}
                onPress={() => router.push('/(tabs)/messages')}
              />
            </View>
          </View>
        )}

        {/* Lifecycle Transitions based on status */}
        {task.status === 'IN_PROGRESS' && (isHelper || isRequester) && (
          <View style={styles.actionBox}>
            <Text style={styles.actionBoxTitle}>Task Status Control</Text>
            {isHelper && (
              <Button
                title="Submit Completed Work"
                variant="primary"
                size="lg"
                onPress={() =>
                  updateStatusMutation.mutate({
                    status: 'SUBMITTED',
                    notes: 'Work submitted for review by helper.',
                  })
                }
              />
            )}
            {isRequester && (
              <Button
                title="Mark Completed & Release Escrow"
                variant="primary"
                size="lg"
                onPress={() =>
                  Alert.alert(
                    'Release Escrow Payment',
                    `Confirm releasing ₹${task.budgetInr} from escrow to ${task.helperName}?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Release Payment',
                        onPress: () =>
                          updateStatusMutation.mutate({
                            status: 'COMPLETED',
                          }),
                      },
                    ]
                  )
                }
              />
            )}
          </View>
        )}

        {/* Received Offers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            Proposals & Offers ({offers?.length || 0})
          </Text>

          {isOffersLoading ? (
            <Skeleton height={120} borderRadius={Radius.lg} />
          ) : offers && offers.length > 0 ? (
            offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                isRequester={isRequester}
                onAccept={(o) => acceptOfferMutation.mutate(o.id)}
                onReject={(o) => rejectOfferMutation.mutate(o.id)}
                isActionLoading={acceptOfferMutation.isPending}
              />
            ))
          ) : (
            <Text style={styles.emptyOffersText}>
              No proposals submitted yet. Be the first to assist!
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Action if helper and task is OPEN */}
      {!isRequester && task.status === 'OPEN' && (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Button
            title="Submit Proposal / Offer"
            variant="primary"
            size="lg"
            onPress={() => {
              setOfferAmount(task.budgetInr.toString());
              setIsOfferModalOpen(true);
            }}
          />
        </View>
      )}

      {/* Offer Submission Modal */}
      <Modal
        visible={isOfferModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOfferModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Offer</Text>
              <Pressable onPress={() => setIsOfferModalOpen(false)}>
                <Ionicons name="close" size={24} color={Palette.slate600} />
              </Pressable>
            </View>

            {offerError && (
              <View style={styles.modalErrorBox}>
                <Ionicons name="alert-circle" size={16} color={Palette.danger500} />
                <Text style={styles.modalErrorText}>{offerError}</Text>
              </View>
            )}

            <Input
              label="Your Price (INR)"
              placeholder={`e.g. ${task.budgetInr}`}
              value={offerAmount}
              onChangeText={setOfferAmount}
              keyboardType="numeric"
              leftIcon={<Text style={styles.inrSymbol}>₹</Text>}
            />

            <Input
              label="Estimated Delivery (Hours)"
              placeholder="24"
              value={deliveryHours}
              onChangeText={setDeliveryHours}
              keyboardType="numeric"
            />

            <Input
              label="Your Proposal & Background"
              placeholder="Explain how you can solve this task and your relevant coursework..."
              value={proposal}
              onChangeText={setProposal}
              multiline
              numberOfLines={4}
              style={styles.proposalInput}
            />

            <Button
              title="Submit Offer"
              variant="primary"
              size="lg"
              isLoading={submitOfferMutation.isPending}
              onPress={handleSubmitOffer}
              style={styles.submitOfferBtn}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  flagBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryPill: {
    backgroundColor: Palette.slate200,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
  },
  categoryText: {
    fontSize: 11,
    color: Palette.slate700,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.slate900,
    lineHeight: 28,
    marginBottom: Spacing.md,
    letterSpacing: -0.3,
  },
  budgetCard: {
    flexDirection: 'row',
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  budgetCol: {
    flex: 1,
    alignItems: 'center',
  },
  budgetSub: {
    fontSize: 11,
    color: Palette.slate500,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  budgetNum: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.primary600,
  },
  deadlineNum: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
  },
  budgetDivider: {
    width: 1,
    height: 36,
    backgroundColor: Palette.slate200,
  },
  requesterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  requesterDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  requesterLabel: {
    fontSize: 11,
    color: Palette.slate400,
  },
  requesterName: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate900,
  },
  requesterCollege: {
    fontSize: 11,
    color: Palette.slate500,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.xs,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#854D0E',
    marginLeft: 3,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate900,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 14,
    color: Palette.slate700,
    lineHeight: 22,
    backgroundColor: Palette.white,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillPill: {
    backgroundColor: Palette.slate200,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate800,
  },
  helperSection: {
    marginBottom: Spacing.lg,
  },
  helperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    gap: Spacing.md,
  },
  helperMeta: {
    flex: 1,
  },
  helperName: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate900,
  },
  helperRole: {
    fontSize: 12,
    color: Palette.slate500,
  },
  actionBox: {
    backgroundColor: Palette.primary50,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.primary200,
    marginBottom: Spacing.lg,
  },
  actionBoxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.primary700,
    marginBottom: Spacing.md,
  },
  emptyOffersText: {
    fontSize: 13,
    color: Palette.slate500,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.slate200,
    ...Shadows.lg,
  },
  skeletonBox: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.danger50,
    padding: 10,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  modalErrorText: {
    fontSize: 12,
    color: Palette.danger700,
  },
  inrSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate600,
    marginRight: 4,
  },
  proposalInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitOfferBtn: {
    marginTop: Spacing.sm,
  },
});
