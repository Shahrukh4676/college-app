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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Palette, Radius, Shadows, Spacing } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { paymentService } from '@/services/paymentService';
import { reviewService } from '@/services/reviewService';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuth();

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
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Student Profile</Text>
        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          style={styles.settingsBtn}
        >
          <Ionicons name="settings-outline" size={22} color={Palette.slate700} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

          {user?.bio ? (
            <Text style={styles.bioText}>{user.bio}</Text>
          ) : (
            <Text style={styles.emptyBio}>No biography added yet.</Text>
          )}

          <Button
            title="Edit Profile Info"
            onPress={() => {
              setEditBio(user?.bio || '');
              setIsEditModalOpen(true);
            }}
            variant="outline"
            size="sm"
            style={styles.editBtn}
          />
        </View>

        {/* Reputation & Performance Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user?.completedTasksCount ?? 0}</Text>
            <Text style={styles.statDesc}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.ratingValRow}>
              <Ionicons name="star" size={14} color="#EAB308" />
              <Text style={styles.statNum}> {user?.rating?.toFixed(1) ?? '5.0'}</Text>
            </View>
            <Text style={styles.statDesc}>{user?.reviewCount ?? 0} reviews</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: Palette.primary600 }]}>
              ₹{stats?.totalEarnedInr.toLocaleString('en-IN') ?? 0}
            </Text>
            <Text style={styles.statDesc}>Earned</Text>
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Skills & Competencies</Text>
          <View style={styles.skillsPillContainer}>
            {user?.skills?.map((skill, index) => (
              <View key={index} style={styles.skillPill}>
                <Text style={styles.skillPillText}>{skill}</Text>
                <Pressable
                  onPress={() => handleRemoveSkill(skill)}
                  style={styles.removeSkillBtn}
                >
                  <Ionicons name="close" size={14} color={Palette.slate500} />
                </Pressable>
              </View>
            ))}
          </View>

          <View style={styles.addSkillRow}>
            <Input
              placeholder="Add skill (e.g. Python, Calculus)"
              value={newSkill}
              onChangeText={setNewSkill}
              containerStyle={styles.addSkillInput}
            />
            <Button
              title="Add"
              onPress={handleAddSkill}
              size="md"
              variant="secondary"
              style={styles.addBtn}
            />
          </View>
        </View>

        {/* Peer Reviews */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Peer Feedback & Reviews</Text>
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
            <Text style={styles.emptyText}>No peer reviews submitted yet.</Text>
          )}
        </View>

        {/* Recent Financial Transactions */}
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
            <Text style={styles.emptyText}>No transactions recorded.</Text>
          )}
        </View>

        {/* Account Controls */}
        <View style={styles.accountActions}>
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="outline"
            size="lg"
            icon={<Ionicons name="log-out-outline" size={20} color={Palette.danger500} />}
            textStyle={{ color: Palette.danger500 }}
          />
        </View>
      </ScrollView>

      {/* Edit Bio Modal */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Biography</Text>
            <Input
              label="Bio / Academic Specialization"
              placeholder="Tell campus peers about your strengths..."
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
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.slate900,
    letterSpacing: -0.4,
  },
  settingsBtn: {
    padding: 6,
    borderRadius: Radius.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  profileCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  nameBlock: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
  },
  collegeText: {
    fontSize: 13,
    color: Palette.slate600,
    marginTop: 2,
  },
  courseText: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 1,
  },
  bioText: {
    fontSize: 13,
    color: Palette.slate700,
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  emptyBio: {
    fontSize: 13,
    color: Palette.slate400,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  editBtn: {
    alignSelf: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: Palette.white,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.slate200,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
  },
  statDesc: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 2,
    fontWeight: '600',
  },
  ratingValRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate900,
    marginBottom: Spacing.md,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 6,
  },
  skillPillText: {
    fontSize: 12,
    color: Palette.primary700,
    fontWeight: '600',
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
    height: 48,
  },
  reviewItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate100,
  },
  reviewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerMeta: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate900,
  },
  reviewCollege: {
    fontSize: 11,
    color: Palette.slate500,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  starBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#854D0E',
  },
  reviewComment: {
    fontSize: 13,
    color: Palette.slate700,
    lineHeight: 18,
    marginTop: 4,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate100,
  },
  txIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.slate100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  txMeta: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate800,
  },
  txRef: {
    fontSize: 11,
    color: Palette.slate400,
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate900,
  },
  txStatus: {
    fontSize: 10,
    fontWeight: '600',
    color: Palette.slate500,
  },
  emptyText: {
    fontSize: 13,
    color: Palette.slate500,
  },
  accountActions: {
    marginTop: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.slate900,
    marginBottom: Spacing.md,
  },
  modalInput: {
    minHeight: 80,
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
