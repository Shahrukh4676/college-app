import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Offer } from '@/types';
import { Colors, Palette, Radius, Shadows, Spacing } from '@/theme';
import { Avatar } from '@/components/ui/avatar';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@expo/vector-icons';

interface OfferCardProps {
  offer: Offer;
  isRequester: boolean;
  onAccept?: (offer: Offer) => void;
  onReject?: (offer: Offer) => void;
  isActionLoading?: boolean;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  isRequester,
  onAccept,
  onReject,
  isActionLoading = false,
}) => {
  const getBadge = (status: Offer['status']): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'ACCEPTED':
        return { label: 'Accepted', variant: 'success' };
      case 'REJECTED':
        return { label: 'Declined', variant: 'danger' };
      case 'WITHDRAWN':
        return { label: 'Withdrawn', variant: 'neutral' };
      case 'PENDING':
      default:
        return { label: 'Pending', variant: 'warning' };
    }
  };

  const badge = getBadge(offer.status);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.helperMeta}>
          <Avatar
            url={offer.helperAvatarUrl}
            name={offer.helperName}
            size="md"
          />
          <View style={styles.nameCol}>
            <Text style={styles.name}>{offer.helperName}</Text>
            <Text style={styles.college}>{offer.helperCollege}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color="#EAB308" />
              <Text style={styles.ratingText}>{offer.helperRating.toFixed(1)}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.tasksText}>{offer.helperCompletedTasks} completed</Text>
            </View>
          </View>
        </View>

        <Badge label={badge.label} variant={badge.variant} showDot />
      </View>

      <View style={styles.detailsBox}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Offer Price</Text>
          <Text style={styles.metricValue}>₹{offer.offerAmountInr.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Delivery</Text>
          <Text style={styles.metricValue}>{offer.estimatedDeliveryHours} hrs</Text>
        </View>
      </View>

      <Text style={styles.proposalText}>{offer.proposal}</Text>

      {isRequester && offer.status === 'PENDING' && (
        <View style={styles.actionsRow}>
          <Button
            title="Decline"
            variant="outline"
            size="sm"
            style={styles.actionBtn}
            disabled={isActionLoading}
            onPress={() => onReject?.(offer)}
          />
          <Button
            title="Accept Offer"
            variant="primary"
            size="sm"
            style={styles.actionBtn}
            isLoading={isActionLoading}
            onPress={() => onAccept?.(offer)}
          />
        </View>
      )}
    </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  helperMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameCol: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate900,
  },
  college: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate800,
    marginLeft: 3,
  },
  dot: {
    marginHorizontal: 4,
    color: Palette.slate400,
    fontSize: 10,
  },
  tasksText: {
    fontSize: 12,
    color: Palette.slate500,
  },
  detailsBox: {
    flexDirection: 'row',
    backgroundColor: Palette.slate50,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: Palette.slate500,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate900,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: Palette.slate200,
  },
  proposalText: {
    fontSize: 13,
    color: Palette.slate700,
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    paddingTop: Spacing.md,
  },
  actionBtn: {
    minWidth: 100,
  },
});
