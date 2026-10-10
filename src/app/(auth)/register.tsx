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
import { Palette, Radius, Spacing } from '@/theme';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Please enter your full name (at least 2 characters).'),
    email: z.string().email('Please enter a valid email address.'),
    college: z.string().min(3, 'Please enter your college or university name.'),
    course: z.string().min(2, 'Please enter your course or major.'),
    yearOfStudy: z.number().min(1).max(6, 'Year must be between 1 and 6.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('3');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setApiError(null);
    const parsedYear = parseInt(yearOfStudy, 10) || 1;

    const result = registerSchema.safeParse({
      fullName,
      email,
      college,
      course,
      yearOfStudy: parsedYear,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const fieldName = err.path[0]?.toString() || 'generic';
        fieldErrors[fieldName] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await register({
        fullName,
        email,
        college,
        course,
        yearOfStudy: parsedYear,
        password,
      });
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setApiError(err.message || 'Registration failed. Please verify your details.');
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
          { paddingTop: Math.max(insets.top, 20), paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Palette.slate800} />
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Join Marketplace</Text>
          <Text style={styles.subtitle}>
            Create your verified student profile to start collaborating.
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
            label="Full Name"
            placeholder="e.g. Aarav Sharma"
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
            }}
            error={errors.fullName}
            leftIcon={<Ionicons name="person-outline" size={20} color={Palette.slate400} />}
          />

          <Input
            label="Academic / Institutional Email"
            placeholder="name@college.edu"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon={<Ionicons name="mail-outline" size={20} color={Palette.slate400} />}
          />

          <Input
            label="College / Institution"
            placeholder="e.g. IIT Delhi, BITS Pilani"
            value={college}
            onChangeText={(t) => {
              setCollege(t);
              if (errors.college) setErrors((prev) => ({ ...prev, college: '' }));
            }}
            error={errors.college}
            leftIcon={<Ionicons name="school-outline" size={20} color={Palette.slate400} />}
          />

          <View style={styles.row}>
            <View style={styles.col2}>
              <Input
                label="Course / Branch"
                placeholder="e.g. Computer Science"
                value={course}
                onChangeText={(t) => {
                  setCourse(t);
                  if (errors.course) setErrors((prev) => ({ ...prev, course: '' }));
                }}
                error={errors.course}
              />
            </View>
            <View style={styles.col1}>
              <Input
                label="Year (1-5)"
                placeholder="3"
                value={yearOfStudy}
                onChangeText={(t) => {
                  setYearOfStudy(t);
                  if (errors.yearOfStudy) setErrors((prev) => ({ ...prev, yearOfStudy: '' }));
                }}
                keyboardType="numeric"
                error={errors.yearOfStudy}
              />
            </View>
          </View>

          <Input
            label="Password"
            placeholder="Create a strong password (6+ chars)"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            secureTextEntry
            error={errors.password}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Palette.slate400} />}
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (errors.confirmPassword)
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            secureTextEntry
            error={errors.confirmPassword}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Palette.slate400} />}
          />

          <View style={styles.noticeBox}>
            <Ionicons name="shield-outline" size={16} color={Palette.primary600} />
            <Text style={styles.noticeText}>
              By registering, you affirm that all assistance offered adheres to academic integrity and campus conduct policies.
            </Text>
          </View>

          <Button
            title="Complete Registration"
            onPress={handleRegister}
            variant="primary"
            size="lg"
            isLoading={isLoading}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            <Text style={styles.loginLink}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 6,
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.slate900,
    letterSpacing: -0.4,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Palette.slate600,
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.danger50,
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.danger100,
  },
  errorBoxText: {
    fontSize: 13,
    color: Palette.danger700,
    flex: 1,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col2: {
    flex: 2,
  },
  col1: {
    flex: 1,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Palette.slate50,
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  noticeText: {
    fontSize: 12,
    color: Palette.slate600,
    flex: 1,
    lineHeight: 17,
  },
  submitBtn: {
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  footerText: {
    fontSize: 14,
    color: Palette.slate600,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.primary600,
  },
});
