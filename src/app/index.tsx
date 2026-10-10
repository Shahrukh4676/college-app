import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Palette, Radius, Spacing } from '@/theme';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isMockMode, isLoading } = useAuth();

  // If already logged in, allow instant direct entry
  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)/home');
    } else {
      router.push('/(auth)/register');
    }
  };

  const handleLogin = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)/home');
    } else {
      router.push('/(auth)/login');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.headerSection}>
          <View style={styles.badgeWrapper}>
            <View style={styles.badge}>
              <Ionicons name="school" size={14} color={Palette.primary600} />
              <Text style={styles.badgeText}>Campus Skill Network</Text>
            </View>
            {isMockMode && (
              <View style={styles.mockBadge}>
                <Text style={styles.mockBadgeText}>DEV MOCK MODE</Text>
              </View>
            )}
          </View>

          <Text style={styles.brandTitle}>Student Marketplace</Text>
          <Text style={styles.subtitle}>
            Empowering students to exchange academic skills, collaborate on labs, and earn ethically.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(600)} style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={[styles.iconCircle, { backgroundColor: Palette.primary50 }]}>
              <Ionicons name="shield-checkmark" size={22} color={Palette.primary600} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Verified Campus Peers</Text>
              <Text style={styles.featureDesc}>
                Connect exclusively with verified university students using official institutional domains.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.iconCircle, { backgroundColor: Palette.success50 }]}>
              <Ionicons name="wallet-outline" size={22} color={Palette.success500} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Transparent Escrow</Text>
              <Text style={styles.featureDesc}>
                Payments remain safely in escrow until you verify the completed academic assistance.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.iconCircle, { backgroundColor: Palette.purple50 }]}>
              <Ionicons name="sparkles-outline" size={22} color={Palette.purple500} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Skill Growth & Earnings</Text>
              <Text style={styles.featureDesc}>
                Monetize your expertise in coding, statistics, writing, and presentation design.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.actionSection}>
        <Button
          title={isAuthenticated ? 'Continue to Marketplace' : 'Create Student Account'}
          onPress={handleGetStarted}
          variant="primary"
          size="lg"
          isLoading={isLoading}
        />

        <Button
          title={isAuthenticated ? 'Switch Account / Log In' : 'Sign In with Existing Account'}
          onPress={handleLogin}
          variant="outline"
          size="md"
          style={styles.signInBtn}
        />

        {!isAuthenticated && (
          <Button
            title="Browse Marketplace as Guest"
            onPress={() => router.push('/(tabs)/tasks')}
            variant="ghost"
            size="sm"
            style={styles.guestBtn}
          />
        )}

        <Text style={styles.integrityDisclaimer}>
          Committed to academic integrity. Strict prohibition against examination fraud.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.white,
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary50,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.primary700,
  },
  mockBadge: {
    backgroundColor: Palette.warning50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.warning500,
  },
  mockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.warning700,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Palette.slate900,
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: Palette.slate600,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  featuresContainer: {
    gap: Spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    padding: Spacing.lg,
    backgroundColor: Palette.slate50,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate900,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: Palette.slate600,
    lineHeight: 18,
  },
  actionSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    backgroundColor: Palette.white,
  },
  signInBtn: {
    marginTop: Spacing.sm,
  },
  guestBtn: {
    marginTop: Spacing.xs,
  },
  integrityDisclaimer: {
    fontSize: 11,
    color: Palette.slate400,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 15,
  },
});
