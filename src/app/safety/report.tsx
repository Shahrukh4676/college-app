import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { Palette, Radius, Spacing } from '@/theme';
import { safetyService } from '@/services/safetyService';
import { AppHeader } from '@/components/ui/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReportTargetType } from '@/types';
import { Ionicons } from '@expo/vector-icons';

const REASONS = [
  'Facilitates live examination cheating or proxy submission',
  'Plagiarism or unauthorized copyright violation',
  'Commercial spam or non-academic solicitation',
  'Harassment or disrespectful communication',
  'Suspected fraud or payment evasion outside platform',
  'Other campus conduct violation',
];

export default function ReportSafetyScreen() {
  const { targetType, targetId } = useLocalSearchParams<{
    targetType?: ReportTargetType;
    targetId?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedReason, setSelectedReason] = useState<string>(REASONS[0]);
  const [explanation, setExplanation] = useState('');

  const reportMutation = useMutation({
    mutationFn: safetyService.submitReport,
    onSuccess: (data) => {
      Alert.alert('Report Submitted', data.message, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: () => {
      Alert.alert('Error', 'Unable to submit report. Please try again.');
    },
  });

  const handleSubmit = () => {
    reportMutation.mutate({
      targetType: (targetType as ReportTargetType) || 'TASK',
      targetId: targetId || 'unknown',
      reason: selectedReason,
      explanation: explanation.trim() || undefined,
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Report Violation" canGoBack />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.noticeBox}>
          <Ionicons name="shield-outline" size={24} color={Palette.danger500} />
          <Text style={styles.noticeText}>
            We strictly protect academic integrity. Submitting false reports or engaging in fraudulent behavior results in immediate account suspension.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Select Reason</Text>
        <View style={styles.reasonsList}>
          {REASONS.map((reason) => {
            const isSelected = selectedReason === reason;
            return (
              <Pressable
                key={reason}
                onPress={() => setSelectedReason(reason)}
                style={[styles.reasonOption, isSelected && styles.reasonOptionActive]}
              >
                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.reasonText, isSelected && styles.reasonTextActive]}>
                  {reason}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Input
          label="Additional Details (Optional)"
          placeholder="Provide context or links to assist campus moderators..."
          value={explanation}
          onChangeText={setExplanation}
          multiline
          numberOfLines={4}
          style={styles.detailsInput}
        />

        <Button
          title="Submit Report"
          onPress={handleSubmit}
          variant="danger"
          size="lg"
          isLoading={reportMutation.isPending}
          style={styles.submitBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Palette.danger50,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.danger100,
    marginBottom: Spacing.lg,
  },
  noticeText: {
    fontSize: 12,
    color: Palette.danger700,
    flex: 1,
    lineHeight: 17,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate800,
    marginBottom: Spacing.sm,
  },
  reasonsList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Palette.slate50,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  reasonOptionActive: {
    backgroundColor: Palette.primary50,
    borderColor: Palette.primary600,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Palette.slate400,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  radioCircleActive: {
    borderColor: Palette.primary600,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.primary600,
  },
  reasonText: {
    fontSize: 13,
    color: Palette.slate700,
    flex: 1,
    lineHeight: 18,
  },
  reasonTextActive: {
    color: Palette.primary800,
    fontWeight: '600',
  },
  detailsInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
});
