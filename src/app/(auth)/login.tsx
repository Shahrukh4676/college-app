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
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid academic or personal email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setApiError(null);
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await login({ email, password });
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setApiError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
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

          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="school" size={20} color={Palette.white} />
            </View>
            <Text style={styles.brandName}>Student Marketplace</Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to manage tasks, collaborate with campus peers, and view milestone payments.
            </Text>
          </View>

          {apiError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Palette.danger500} />
              <Text style={styles.errorBoxText}>{apiError}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="College / Academic Email"
              placeholder="e.g. name@college.edu"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              leftIcon={<Ionicons name="mail-outline" size={20} color={Palette.slate400} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              secureTextEntry
              error={errors.password}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Palette.slate400} />}
            />

            <Pressable
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPasswordPress}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </Pressable>

            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={styles.submitBtn}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to Student Marketplace? </Text>
            <Pressable
              onPress={() => router.push('/(auth)/register')}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              <Text style={styles.footerLink}>Register here</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
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
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Palette.primary600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    ...Typography.bodyBold,
    color: Palette.navy950,
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.danger50,
    borderWidth: 1,
    borderColor: Palette.danger500,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorBoxText: {
    ...Typography.caption,
    color: Palette.danger700,
    flex: 1,
  },
  form: {
    gap: Spacing.md,
  },
  forgotPasswordPress: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
  },
  forgotPasswordText: {
    ...Typography.caption,
    color: Palette.primary600,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xxl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
  },
  footerText: {
    ...Typography.body,
    fontSize: 14,
    color: Palette.slate600,
  },
  footerLink: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Palette.primary600,
  },
});
