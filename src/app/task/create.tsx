import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Palette, Radius, Spacing, Typography, Shadows } from '@/theme';
import { taskService } from '@/services/taskService';
import { AppHeader } from '@/components/ui/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { TaskCategory } from '@/types';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES: { label: string; value: TaskCategory }[] = [
  { label: 'Coding & Debugging', value: 'CODING_DEBUG' },
  { label: 'Math & Statistics', value: 'MATH_STATS' },
  { label: 'Research & Proofreading', value: 'RESEARCH_EDITING' },
  { label: 'Notes Summary', value: 'NOTES_SUMMARY' },
  { label: 'Slide Deck Design', value: 'PRESENTATIONS' },
  { label: 'Peer Tutoring', value: 'TUTORING' },
  { label: 'Campus Errands', value: 'CAMPUS_ERRANDS' },
];

const DEADLINE_PRESETS = [
  { label: '24 Hours', hours: 24 },
  { label: '48 Hours', hours: 48 },
  { label: '3 Days', hours: 72 },
  { label: '7 Days', hours: 168 },
];

const taskSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  category: z.string().min(1, 'Please select a category.'),
  budgetInr: z.number().min(50, 'Minimum budget is ₹50.').max(100000, 'Budget exceeds limit.'),
  deadline: z.string().min(1, 'Please select a deadline.'),
  requiredSkills: z.array(z.string()).min(1, 'Please specify at least 1 required skill.'),
});

export default function CreateTaskScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('CODING_DEBUG');
  const [budget, setBudget] = useState('500');
  const [selectedPresetHours, setSelectedPresetHours] = useState(48);
  const [skillInput, setSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>(['Problem Solving']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['home_tasks'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace_tasks'] });
      Alert.alert('Task Published!', 'Your task is now open to offers from campus peers.', [
        {
          text: 'View Task',
          onPress: () => router.replace(`/task/${newTask.id}` as any),
        },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to create task.');
    },
  });

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    if (!skillsList.includes(skillInput.trim())) {
      setSkillsList([...skillsList, skillInput.trim()]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsList(skillsList.filter((s) => s !== skill));
  };

  const handleSubmit = () => {
    const parsedBudget = parseFloat(budget) || 0;
    const deadlineIso = new Date(Date.now() + selectedPresetHours * 3600 * 1000).toISOString();

    const result = taskSchema.safeParse({
      title,
      description,
      category,
      budgetInr: parsedBudget,
      deadline: deadlineIso,
      requiredSkills: skillsList,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0]?.toString() || 'generic'] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    createTaskMutation.mutate({
      title,
      description,
      category,
      budgetInr: parsedBudget,
      deadline: deadlineIso,
      requiredSkills: skillsList,
    });
  };

  const handleBack = () => {
    if (title.trim() || description.trim() || skillInput.trim()) {
      Alert.alert(
        'Discard Unsaved Task?',
        'You have unsaved changes in this task. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <AppHeader title="Request Academic Assistance" canGoBack onBackPress={handleBack} />

      <ResponsiveContainer
        maxWidth="form"
        asScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}
      >
        <View style={styles.formCard}>
          <View style={styles.headerBox}>
            <Text style={styles.formTitle}>Task Specifications</Text>
            <Text style={styles.formSubtitle}>
              Provide detailed expectations so qualified peers can assess your task and submit accurate proposals.
            </Text>
          </View>

          <Input
            label="Task Title"
            placeholder="e.g. Red-Black Tree rotation debugging in C++"
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            error={errors.title}
          />

          {/* Category Picker */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Academic Domain</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {CATEGORIES.map((cat) => {
                const active = category === cat.value;
                return (
                  <Pressable
                    key={cat.value}
                    onPress={() => setCategory(cat.value)}
                    style={[styles.catOption, active && styles.catOptionActive]}
                  >
                    <Text style={[styles.catOptionText, active && styles.catOptionTextActive]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <Input
            label="Detailed Scope & Requirements"
            placeholder="Describe what needs to be solved, what you've tried, and expected deliverables..."
            value={description}
            onChangeText={(t) => {
              setDescription(t);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            multiline
            numberOfLines={5}
            style={styles.descInput}
            error={errors.description}
          />

          {/* Budget */}
          <Input
            label="Budget Offering (INR)"
            placeholder="e.g. 800"
            value={budget}
            onChangeText={(t) => {
              setBudget(t);
              if (errors.budgetInr) setErrors((prev) => ({ ...prev, budgetInr: '' }));
            }}
            keyboardType="numeric"
            leftIcon={<Text style={styles.currencyPrefix}>₹</Text>}
            error={errors.budgetInr}
            helperText="Milestone Escrow: Funds are safely held until you verify deliverables."
          />

          {/* Deadline Preset */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Target Completion Window</Text>
            <View style={styles.presetRow}>
              {DEADLINE_PRESETS.map((preset) => {
                const isSelected = selectedPresetHours === preset.hours;
                return (
                  <Pressable
                    key={preset.hours}
                    onPress={() => setSelectedPresetHours(preset.hours)}
                    style={[styles.presetBtn, isSelected && styles.presetBtnActive]}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        isSelected && styles.presetTextActive,
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Required Skills */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Required Competencies</Text>
            <View style={styles.skillsTagWrap}>
              {skillsList.map((skill) => (
                <View key={skill} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                  <Pressable onPress={() => handleRemoveSkill(skill)}>
                    <Ionicons name="close" size={14} color={Palette.slate600} />
                  </Pressable>
                </View>
              ))}
            </View>
            <View style={styles.addSkillRow}>
              <Input
                placeholder="Add skill (e.g. C++, Linear Algebra)"
                value={skillInput}
                onChangeText={setSkillInput}
                containerStyle={styles.skillInputFlex}
              />
              <Button title="Add" onPress={handleAddSkill} variant="secondary" size="md" />
            </View>
            {errors.requiredSkills && (
              <Text style={styles.errorText}>{errors.requiredSkills}</Text>
            )}
          </View>

          {/* Academic Integrity Pledge */}
          <View style={styles.integrityBox}>
            <Ionicons name="shield-checkmark" size={18} color={Palette.primary600} />
            <Text style={styles.integrityText}>
              <Text style={styles.boldText}>Academic Integrity Notice: </Text>
              Requests for live examination fraud, exam impersonation, or plagiarism violate campus policy and are strictly prohibited.
            </Text>
          </View>

          <Button
            title="Publish Task Request"
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            isLoading={createTaskMutation.isPending}
            style={styles.submitBtn}
          />
        </View>
      </ResponsiveContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
  },
  formCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Palette.slate200,
    ...Shadows.sm,
  },
  headerBox: {
    marginBottom: Spacing.xl,
  },
  formTitle: {
    ...Typography.h2,
    color: Palette.slate900,
    marginBottom: 4,
  },
  formSubtitle: {
    ...Typography.body,
    fontSize: 14,
    color: Palette.slate600,
    lineHeight: 20,
  },
  fieldSection: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    ...Typography.captionBold,
    color: Palette.slate700,
    marginBottom: 8,
  },
  catScroll: {
    flexDirection: 'row',
  },
  catOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Palette.slate100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  catOptionActive: {
    backgroundColor: Palette.primary600,
    borderColor: Palette.primary600,
  },
  catOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate700,
  },
  catOptionTextActive: {
    color: Palette.white,
  },
  descInput: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate600,
    marginRight: 4,
  },
  presetRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: Palette.slate100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  presetBtnActive: {
    backgroundColor: Palette.primary50,
    borderColor: Palette.primary600,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate700,
  },
  presetTextActive: {
    color: Palette.primary700,
  },
  skillsTagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.slate100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  skillTagText: {
    ...Typography.caption,
    color: Palette.slate800,
    fontWeight: '500',
  },
  addSkillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  skillInputFlex: {
    flex: 1,
    marginBottom: 0,
  },
  errorText: {
    ...Typography.tiny,
    color: Palette.danger500,
    marginTop: 4,
  },
  integrityBox: {
    flexDirection: 'row',
    backgroundColor: Palette.primary50,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.primary200,
    marginBottom: Spacing.lg,
  },
  integrityText: {
    ...Typography.tiny,
    color: Palette.slate700,
    flex: 1,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: Palette.primary800,
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
});
