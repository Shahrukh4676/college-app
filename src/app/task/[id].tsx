import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Palette, Radius, Shadows, Spacing, Typography } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
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
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '@/types';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { isMobile } = useResponsive();

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
        <ResponsiveContainer maxWidth="detail" style={{ flex: 1, padding: Spacing.xl }}>
          <Skeleton height={200} borderRadius={Radius.lg} style={{ marginBottom: 16 }} />
          <Skeleton height={100} borderRadius={Radius.lg} />
        </ResponsiveContainer>
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

      <ResponsiveContainer
        maxWidth="detail"
        asScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainLayout, !isMobile && styles.desktopLayout]}>
          {/* Primary Column (Details & Proposals) */}
          <View style={[styles.primaryColumn, !isMobile && styles.desktopPrimaryColumn]}>
            {/* Meta & Badges */}
            <View style={styles.metaBadgeRow}>
              <Badge label={badge.label} variant={badge.variant} showDot />
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{task.category}</Text>
              </View>
            </View>

            <Text style={styles.title}>{task.title}</Text>

            {/* Mobile-Only Budget Card */}
            {isMobile && (
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
            )}

            {/* Description Card */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>Task Description</Text>
              <Text style={styles.description}>{task.description}</Text>
            </View>

            {/* Required Skills */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>Required Competencies</Text>
              <View style={styles.skillsRow}>
                {task.requiredSkills.map((skill, idx) => (
                  <View key={idx} style={styles.skillPill}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Assigned Helper Section if present */}
            {task.helperId && (
              <View style={styles.cardSection}>
                <Text style={styles.sectionHeading}>Assigned Helper</Text>
                <View style={styles.helperCard}>
                  <Avatar
                    url={task.helperAvatarUrl}
                    name={task.helperName || 'Helper'}
                    size="md"
                  />
                  <View style={styles.helperMeta}>
                    <Text style={styles.helperName}>{task.helperName}</Text>
                    <Text style={styles.helperRole}>Assigned Campus Peer</Text>
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

            {/* Lifecycle State Controls */}
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

            {/* Received Proposals / Offers Section */}
            <View style={styles.cardSection}>
              <View style={styles.proposalsHeaderRow}>
                <Text style={styles.sectionHeading}>
                  Proposals & Offers ({offers?.length || 0})
                </Text>
                {task.status === 'OPEN' && !isRequester && !isMobile && (
                  <Button
                    title="Submit Offer"
                    size="sm"
                    variant="outline"
                    onPress={() => {
                      setOfferAmount(task.budgetInr.toString());
                      setIsOfferModalOpen(true);
                    }}
                  />
                )}
              </View>

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
                <View style={styles.emptyOffersBox}>
                  <Ionicons name="chatbubbles-outline" size={28} color={Palette.slate300} />
                  <Text style={styles.emptyOffersText}>
                    No proposals submitted yet. Be the first to offer assistance!
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Side Action Column (Desktop/Tablet) or Bottom Requester Card (Mobile) */}
          <View style={[styles.sideColumn, !isMobile && styles.desktopSideColumn]}>
            {/* Desktop Budget & Action Card */}
            {!isMobile && (
              <View style={styles.desktopActionPanel}>
                <View style={styles.panelBudgetHeader}>
                  <Text style={styles.panelBudgetLabel}>Budget Offering</Text>
                  <Text style={styles.panelBudgetVal}>
                    ₹{task.budgetInr.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.panelRow}>
                  <Ionicons name="time-outline" size={16} color={Palette.slate500} />
                  <View>
                    <Text style={styles.panelRowLabel}>Target Deadline</Text>
                    <Text style={styles.panelRowVal}>
                      {new Date(task.deadline).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.escrowNoticeBox}>
                  <Ionicons name="shield-checkmark" size={16} color={Palette.success500} />
                  <Text style={styles.escrowNoticeText}>
                    Milestone Escrow Protected. Funds are held safely until task verification.
                  </Text>
                </View>

                {!isRequester && task.status === 'OPEN' && (
                  <Button
                    title="Submit Proposal / Offer"
                    variant="primary"
                    size="lg"
                    onPress={() => {
                      setOfferAmount(task.budgetInr.toString());
                      setIsOfferModalOpen(true);
                    }}
                    style={styles.panelSubmitBtn}
                  />
                )}
              </View>
            )}

            {/* Requester Profile Card */}
            <View style={styles.requesterCard}>
              <View style={styles.requesterHeader}>
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
              </View>

              <View style={styles.requesterDivider} />

              <View style={styles.requesterMetaRow}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#EAB308" />
                  <Text style={styles.ratingText}>{task.requesterRating.toFixed(1)} Peer Rating</Text>
                </View>
                <View style={styles.campusVerifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color={Palette.primary600} />
                  <Text style={styles.campusVerifiedText}>Campus Verified</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ResponsiveContainer>

      {/* Sticky Bottom Action (Mobile Only) */}
      {isMobile && !isRequester && task.status === 'OPEN' && (
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
    paddingTop: Spacing.lg,
  },
  mainLayout: {
    width: '100%',
  },
  desktopLayout: {
    flexDirection: 'row',
    gap: Spacing.xxl,
    alignItems: 'flex-start',
  },
  primaryColumn: {
    flex: 1,
  },
  desktopPrimaryColumn: {
    flex: 1.6,
  },
  sideColumn: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  desktopSideColumn: {
    width: 360,
    marginTop: 0,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  categoryPill: {
    backgroundColor: Palette.slate200,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  categoryText: {
    ...Typography.tiny,
    color: Palette.slate700,
  },
  title: {
    ...Typography.h1,
    fontSize: 24,
    color: Palette.slate900,
    marginBottom: Spacing.lg,
    lineHeight: 32,
  },
  budgetCard: {
    flexDirection: 'row',
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  budgetCol: {
    flex: 1,
    alignItems: 'center',
  },
  budgetSub: {
    ...Typography.tiny,
    color: Palette.slate500,
    marginBottom: 4,
  },
  budgetNum: {
    ...Typography.amountMedium,
    color: Palette.primary600,
  },
  budgetDivider: {
    width: 1,
    height: 36,
    backgroundColor: Palette.slate200,
  },
  deadlineNum: {
    ...Typography.bodyBold,
    color: Palette.slate800,
  },
  cardSection: {
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  sectionHeading: {
    ...Typography.h3,
    fontSize: 16,
    color: Palette.slate900,
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Palette.slate700,
    lineHeight: 22,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillPill: {
    backgroundColor: Palette.slate100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  skillText: {
    ...Typography.captionBold,
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
    gap: 12,
  },
  helperMeta: {
    flex: 1,
  },
  helperName: {
    ...Typography.bodyBold,
    color: Palette.slate900,
  },
  helperRole: {
    ...Typography.tiny,
    color: Palette.slate500,
  },
  actionBox: {
    backgroundColor: Palette.primary50,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Palette.primary200,
    marginBottom: Spacing.lg,
    gap: 12,
  },
  actionBoxTitle: {
    ...Typography.bodyBold,
    color: Palette.primary800,
  },
  proposalsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyOffersBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: 8,
  },
  emptyOffersText: {
    ...Typography.body,
    fontSize: 14,
    color: Palette.slate500,
    textAlign: 'center',
  },
  desktopActionPanel: {
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
    gap: Spacing.md,
  },
  panelBudgetHeader: {
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate100,
  },
  panelBudgetLabel: {
    ...Typography.tiny,
    color: Palette.slate500,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  panelBudgetVal: {
    ...Typography.amountLarge,
    color: Palette.primary600,
    marginTop: 2,
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  panelRowLabel: {
    ...Typography.tiny,
    color: Palette.slate500,
  },
  panelRowVal: {
    ...Typography.bodyBold,
    color: Palette.slate800,
  },
  escrowNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.success50,
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.success100,
  },
  escrowNoticeText: {
    ...Typography.tiny,
    color: Palette.success700,
    flex: 1,
    lineHeight: 15,
  },
  panelSubmitBtn: {
    marginTop: Spacing.xs,
  },
  requesterCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    ...Shadows.sm,
  },
  requesterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requesterDetails: {
    flex: 1,
  },
  requesterLabel: {
    ...Typography.tiny,
    color: Palette.slate400,
  },
  requesterName: {
    ...Typography.bodyBold,
    color: Palette.slate900,
  },
  requesterCollege: {
    ...Typography.caption,
    color: Palette.slate500,
  },
  requesterDivider: {
    height: 1,
    backgroundColor: Palette.slate100,
    marginVertical: Spacing.md,
  },
  requesterMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...Typography.captionBold,
    color: Palette.slate800,
  },
  campusVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  campusVerifiedText: {
    ...Typography.tiny,
    color: Palette.primary700,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Palette.white,
    borderTopWidth: 1,
    borderTopColor: Palette.slate200,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h2,
    color: Palette.slate900,
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.danger50,
    padding: 10,
    borderRadius: Radius.md,
    gap: 8,
    marginBottom: Spacing.md,
  },
  modalErrorText: {
    ...Typography.caption,
    color: Palette.danger700,
    flex: 1,
  },
  inrSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate700,
  },
  proposalInput: {
    height: 90,
    textAlignVertical: 'top',
  },
  submitOfferBtn: {
    marginTop: Spacing.sm,
  },
});
