import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { Palette, Radius, Spacing, Typography, Shadows, Layout } from '@/theme';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@expo/vector-icons';

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const res = schema.safeParse({ email });
    if (!res.success) {
      setError(res.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 24), paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardContainer}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={Palette.slate800} />
          </Pressable>

          {isSubmitted ? (
            <View style={styles.successBox}>
              <View style={styles.successIconCircle}>
                <Ionicons name="mail-open-outline" size={32} color={Palette.success500} />
              </View>
              <Text style={styles.successTitle}>Check Your Inbox</Text>
              <Text style={styles.successDesc}>
                We sent password recovery instructions to{' '}
                <Text style={styles.boldEmail}>{email}</Text>. Please follow the secure link in the email to set a new password.
              </Text>
              <Button
                title="Return to Sign In"
                onPress={() => router.replace('/(auth)/login')}
                variant="primary"
                size="lg"
                style={styles.returnBtn}
              />
            </View>
          ) : (
            <View>
              <View style={styles.header}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Enter your registered college or personal email address to receive password reset instructions.
                </Text>
              </View>

              <View style={styles.form}>
                <Input
                  label="Registered Email"
                  placeholder="name@college.edu"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (error) setError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={error || undefined}
                  leftIcon={<Ionicons name="mail-outline" size={20} color={Palette.slate400} />}
                />

                <Button
                  title="Send Reset Link"
                  onPress={handleSubmit}
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  style={styles.submitBtn}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: Layout.maxAuthWidth,
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Palette.slate200,
    ...Shadows.md,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.slate100,
    marginBottom: Spacing.lg,
    alignSelf: 'flex-start',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Palette.slate900,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 14,
    color: Palette.slate600,
    lineHeight: 20,
  },
  form: {
    gap: Spacing.md,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.success50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.success100,
  },
  successTitle: {
    ...Typography.h2,
    color: Palette.slate900,
    marginBottom: Spacing.sm,
  },
  successDesc: {
    ...Typography.body,
    fontSize: 14,
    color: Palette.slate600,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: Spacing.xl,
  },
  boldEmail: {
    fontWeight: '700',
    color: Palette.slate900,
  },
  returnBtn: {
    width: '100%',
  },
});
