import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Palette, Radius, Shadows, Spacing, Typography } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import { paymentService } from '@/services/paymentService';
import { reviewService } from '@/services/reviewService';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuth();
  const { isMobile } = useResponsive();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['profile_stats'],
    queryFn: () => paymentService.getEarningStats(),
  });

  const { data: transactions } = useQuery({
    queryKey: ['profile_transactions'],
    queryFn: () => paymentService.getTransactions(),
  });

  const { data: reviews } = useQuery({
    queryKey: ['profile_reviews', user?.id],
    queryFn: () => reviewService.getReviewsForUser(user?.id || ''),
    enabled: !!user?.id,
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        bio: editBio,
      });
      setIsEditModalOpen(false);
    } catch {
      Alert.alert('Error', 'Failed to update profile details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !user) return;
    const updatedSkills = [...(user.skills || []), newSkill.trim()];
    await updateProfile({ skills: updatedSkills });
    setNewSkill('');
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    if (!user) return;
    const updatedSkills = (user.skills || []).filter((s) => s !== skillToRemove);
    await updateProfile({ skills: updatedSkills });
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Student Marketplace?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Mobile Top Bar */}
      {isMobile && (
        <View style={[styles.mobileTopBar, { paddingTop: Math.max(insets.top, 16) }]}>
          <Text style={styles.mobileTitle}>Student Profile</Text>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            style={styles.settingsBtn}
          >
            <Ionicons name="settings-outline" size={22} color={Palette.slate700} />
          </Pressable>
        </View>
      )}

      <ResponsiveContainer
        maxWidth="detail"
        asScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}
      >
        <View style={[styles.layoutWrapper, !isMobile && styles.desktopLayoutWrapper]}>
          {/* Identity & Stats Column */}
          <View style={[styles.leftColumn, !isMobile && styles.desktopLeftColumn]}>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarRow}>
                <Avatar
                  url={user?.avatarUrl}
                  name={user?.fullName || 'Student'}
                  size="xl"
                />
                <View style={styles.nameBlock}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{user?.fullName}</Text>
                    {user?.isVerified && (
                      <Ionicons name="checkmark-circle" size={18} color={Palette.primary600} />
                    )}
                  </View>
                  <Text style={styles.collegeText}>{user?.college || 'Campus Member'}</Text>
                  <Text style={styles.courseText}>
                    {user?.course ? `${user.course}${user.yearOfStudy ? ` • Year ${user.yearOfStudy}` : ''}` : 'Student Member'}
                  </Text>
                </View>
              </View>

              <View style={styles.bioBox}>
                <Text style={styles.bioHeading}>About Me</Text>
                {user?.bio ? (
                  <Text style={styles.bioText}>{user.bio}</Text>
                ) : (
                  <Text style={styles.emptyBio}>No biography added yet. Share your academic strengths!</Text>
                )}
              </View>

              <Button
                title="Edit Bio / Profile"
                onPress={() => {
                  setEditBio(user?.bio || '');
                  setIsEditModalOpen(true);
                }}
                variant="outline"
                size="sm"
                style={styles.editBtn}
              />
            </View>

            {/* Performance Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.statsHeading}>Marketplace Track Record</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{user?.completedTasksCount ?? 0}</Text>
                  <Text style={styles.statDesc}>Tasks Completed</Text>
                </View>
                <View style={styles.statBox}>
                  <View style={styles.ratingValRow}>
                    <Ionicons name="star" size={15} color="#EAB308" />
                    <Text style={styles.statNum}> {user?.rating?.toFixed(1) ?? '5.0'}</Text>
                  </View>
                  <Text style={styles.statDesc}>{user?.reviewCount ?? 0} reviews</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: Palette.primary600 }]}>
                    ₹{stats?.totalEarnedInr.toLocaleString('en-IN') ?? 0}
                  </Text>
                  <Text style={styles.statDesc}>Total Earned</Text>
                </View>
              </View>
            </View>

            {/* Sign Out Action */}
            <View style={styles.accountActionBox}>
              <Button
                title="Sign Out"
                onPress={handleLogout}
                variant="outline"
                size="md"
                icon={<Ionicons name="log-out-outline" size={18} color={Palette.danger500} />}
                textStyle={{ color: Palette.danger500 }}
              />
            </View>
          </View>

          {/* Details & History Column */}
          <View style={[styles.rightColumn, !isMobile && styles.desktopRightColumn]}>
            {/* Skills Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Skills & Competencies</Text>
                <Text style={styles.sectionSubtitle}>
                  {user?.skills?.length || 0} active skills
                </Text>
              </View>

              <View style={styles.skillsPillContainer}>
                {user?.skills?.map((skill, index) => (
                  <View key={index} style={styles.skillPill}>
                    <Text style={styles.skillPillText}>{skill}</Text>
                    <Pressable
                      onPress={() => handleRemoveSkill(skill)}
                      style={styles.removeSkillBtn}
                    >
                      <Ionicons name="close" size={13} color={Palette.slate500} />
                    </Pressable>
                  </View>
                ))}
              </View>

              <View style={styles.addSkillRow}>
                <Input
                  placeholder="Add skill (e.g. Python, Calculus, LaTeX)"
                  value={newSkill}
                  onChangeText={setNewSkill}
                  containerStyle={styles.addSkillInput}
                />
                <Button
                  title="Add Skill"
                  onPress={handleAddSkill}
                  size="md"
                  variant="secondary"
                  style={styles.addBtn}
                />
              </View>
            </View>

            {/* Peer Reviews */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Peer Reviews & Feedback</Text>
              {reviews && reviews.length > 0 ? (
                reviews.map((rev) => (
                  <View key={rev.id} style={styles.reviewItem}>
                    <View style={styles.reviewerRow}>
                      <Avatar url={rev.reviewerAvatarUrl} name={rev.reviewerName} size="sm" />
                      <View style={styles.reviewerMeta}>
                        <Text style={styles.reviewerName}>{rev.reviewerName}</Text>
                        <Text style={styles.reviewCollege}>{rev.reviewerCollege}</Text>
                      </View>
                      <View style={styles.starBadge}>
                        <Ionicons name="star" size={12} color="#EAB308" />
                        <Text style={styles.starBadgeText}> {rev.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{rev.comment}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyCardBox}>
                  <Ionicons name="star-outline" size={24} color={Palette.slate300} />
                  <Text style={styles.emptyText}>No peer reviews recorded yet.</Text>
                </View>
              )}
            </View>

            {/* Financial Ledger & Escrow History */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Escrow & Payment History</Text>
              {transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                  <View key={tx.id} style={styles.txItem}>
                    <View style={styles.txIcon}>
                      <Ionicons
                        name={tx.type === 'EARNING_PAYOUT' ? 'arrow-down' : 'shield-checkmark'}
                        size={16}
                        color={tx.type === 'EARNING_PAYOUT' ? Palette.success500 : Palette.primary600}
                      />
                    </View>
                    <View style={styles.txMeta}>
                      <Text style={styles.txTitle} numberOfLines={1}>
                        {tx.taskTitle}
                      </Text>
                      <Text style={styles.txRef}>{tx.referenceId}</Text>
                    </View>
                    <View style={styles.txAmountCol}>
                      <Text
                        style={[
                          styles.txAmount,
                          tx.type === 'EARNING_PAYOUT' && { color: Palette.success500 },
                        ]}
                      >
                        {tx.type === 'EARNING_PAYOUT' ? '+' : ''}₹{tx.amountInr}
                      </Text>
                      <Text style={styles.txStatus}>{tx.status}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyCardBox}>
                  <Ionicons name="receipt-outline" size={24} color={Palette.slate300} />
                  <Text style={styles.emptyText}>No payment history recorded.</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ResponsiveContainer>

      {/* Edit Bio Modal */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Student Profile</Text>
            <Input
              label="Bio & Academic Strengths"
              placeholder="Tell campus peers about your strengths, coursework, and technical skills..."
              value={editBio}
              onChangeText={setEditBio}
              multiline
              numberOfLines={4}
              style={styles.modalInput}
            />
            <View style={styles.modalBtns}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => setIsEditModalOpen(false)}
                style={styles.modalBtn}
              />
              <Button
                title="Save Changes"
                variant="primary"
                size="md"
                isLoading={isSaving}
                onPress={handleSaveProfile}
                style={styles.modalBtn}
              />
            </View>
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
  mobileTitle: {
    ...Typography.h2,
    color: Palette.slate900,
  },
  settingsBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
  },
  layoutWrapper: {
    width: '100%',
  },
  desktopLayoutWrapper: {
    flexDirection: 'row',
    gap: Spacing.xxl,
    alignItems: 'flex-start',
  },
  leftColumn: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  desktopLeftColumn: {
    width: 380,
    marginBottom: 0,
  },
  rightColumn: {
    flex: 1,
  },
  desktopRightColumn: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  nameBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    ...Typography.h3,
    color: Palette.slate900,
  },
  collegeText: {
    ...Typography.body,
    fontSize: 13,
    color: Palette.primary700,
    fontWeight: '600',
    marginTop: 2,
  },
  courseText: {
    ...Typography.caption,
    color: Palette.slate500,
    marginTop: 2,
  },
  bioBox: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    marginBottom: Spacing.md,
  },
  bioHeading: {
    ...Typography.tiny,
    fontWeight: '700',
    color: Palette.slate400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bioText: {
    ...Typography.body,
    fontSize: 14,
    color: Palette.slate700,
    lineHeight: 20,
  },
  emptyBio: {
    ...Typography.body,
    fontSize: 13,
    color: Palette.slate400,
    fontStyle: 'italic',
  },
  editBtn: {
    alignSelf: 'flex-start',
  },
  statsCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  statsHeading: {
    ...Typography.tiny,
    fontWeight: '700',
    color: Palette.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    ...Typography.amountMedium,
    color: Palette.slate900,
  },
  statDesc: {
    ...Typography.tiny,
    color: Palette.slate500,
    marginTop: 2,
  },
  ratingValRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountActionBox: {
    marginBottom: Spacing.lg,
  },
  sectionCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: Palette.slate900,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    ...Typography.tiny,
    color: Palette.slate400,
  },
  skillsPillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.primary100,
    gap: 6,
  },
  skillPillText: {
    ...Typography.captionBold,
    color: Palette.primary700,
  },
  removeSkillBtn: {
    padding: 2,
  },
  addSkillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  addSkillInput: {
    flex: 1,
    marginBottom: 0,
  },
  addBtn: {
    minWidth: 80,
  },
  reviewItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate100,
  },
  reviewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  reviewerMeta: {
    flex: 1,
  },
  reviewerName: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Palette.slate900,
  },
  reviewCollege: {
    ...Typography.tiny,
    color: Palette.slate500,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  starBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#854D0E',
  },
  reviewComment: {
    ...Typography.body,
    fontSize: 13,
    color: Palette.slate600,
    lineHeight: 18,
  },
  emptyCardBox: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: 6,
  },
  emptyText: {
    ...Typography.caption,
    color: Palette.slate400,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate100,
    gap: Spacing.md,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Palette.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txMeta: {
    flex: 1,
  },
  txTitle: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Palette.slate900,
  },
  txRef: {
    ...Typography.tiny,
    color: Palette.slate400,
    marginTop: 2,
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    ...Typography.amountSmall,
    color: Palette.slate900,
  },
  txStatus: {
    ...Typography.tiny,
    fontSize: 10,
    color: Palette.slate500,
    marginTop: 2,
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
  modalTitle: {
    ...Typography.h2,
    color: Palette.slate900,
    marginBottom: Spacing.md,
  },
  modalInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalBtn: {
    flex: 1,
  },
});
