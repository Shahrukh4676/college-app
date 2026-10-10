import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Palette, Radius, Spacing, Typography, Shadows } from '@/theme';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useAuth();
  const { isMobile } = useResponsive();

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

  const isWide = !isMobile;

  return (
    <View
      style={[
        styles.rootContainer,
        {
          paddingTop: Math.max(insets.top, isWide ? 40 : 16),
          paddingBottom: Math.max(insets.bottom, 24),
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isWide && styles.scrollContentWide,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainWrapper, isWide && styles.mainWrapperWide]}>
          {/* Left Column (Hero & Features) */}
          <View style={[styles.heroColumn, isWide && styles.heroColumnWide]}>
            <Animated.View entering={FadeInDown.duration(500)}>
              <View style={styles.badgeWrapper}>
                <View style={styles.badge}>
                  <Ionicons name="school" size={14} color={Palette.primary600} />
                  <Text style={styles.badgeText}>Campus Skill Network</Text>
                </View>
              </View>

              <Text style={[styles.brandTitle, isWide && styles.brandTitleWide]}>
                Student Marketplace
              </Text>
              <Text style={styles.subtitle}>
                A trusted peer network for university students to exchange academic skills, collaborate on labs and code reviews, and earn safely through transparent escrow.
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(120).duration(500)}
              style={styles.featuresContainer}
            >
              <View style={styles.featureCard}>
                <View style={[styles.iconCircle, { backgroundColor: Palette.primary50 }]}>
                  <Ionicons name="shield-checkmark" size={20} color={Palette.primary600} />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Verified Campus Peers</Text>
                  <Text style={styles.featureDesc}>
                    Connect exclusively with verified college students using institutional email verification.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.iconCircle, { backgroundColor: Palette.success50 }]}>
                  <Ionicons name="wallet-outline" size={20} color={Palette.success500} />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Transparent Milestone Escrow</Text>
                  <Text style={styles.featureDesc}>
                    Task funds remain held securely in escrow until you verify satisfactory assistance.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.iconCircle, { backgroundColor: Palette.purple50 }]}>
                  <Ionicons name="sparkles-outline" size={20} color={Palette.purple500} />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Skill Growth & Ethical Earnings</Text>
                  <Text style={styles.featureDesc}>
                    Help peers debug programming assignments, solve lab roadblocks, and prepare presentations.
                  </Text>
                </View>
              </View>
            </Animated.View>

            <View style={styles.integrityBox}>
              <Ionicons name="information-circle-outline" size={16} color={Palette.slate500} />
              <Text style={styles.integrityText}>
                Committed to academic integrity. Strictly prohibits exam cheating, impersonation, or plagiarism.
              </Text>
            </View>
          </View>

          {/* Right Column (Auth Action Box) */}
          <View style={[styles.authColumn, isWide && styles.authColumnWide]}>
            <Animated.View
              entering={FadeInUp.delay(200).duration(500)}
              style={styles.authCard}
            >
              <View style={styles.authCardHeader}>
                <Text style={styles.authCardTitle}>
                  {isAuthenticated ? 'Welcome Back!' : 'Get Started'}
                </Text>
                <Text style={styles.authCardSubtitle}>
                  {isAuthenticated
                    ? 'Your campus session is active. Continue to discover or post tasks.'
                    : 'Join your campus peers to request assistance or offer your technical skills.'}
                </Text>
              </View>

              <View style={styles.buttonStack}>
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
              </View>

              <View style={styles.cardFooterNotice}>
                <Ionicons name="lock-closed-outline" size={13} color={Palette.slate400} />
                <Text style={styles.cardFooterNoticeText}>
                  Active posting & proposals require verified campus credentials.
                </Text>
              </View>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContentWide: {
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.xxxl,
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 480,
    gap: Spacing.xxl,
  },
  mainWrapperWide: {
    maxWidth: 1040,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 48,
  },
  heroColumn: {
    width: '100%',
  },
  heroColumnWide: {
    flex: 1,
    maxWidth: 540,
  },
  authColumn: {
    width: '100%',
  },
  authColumnWide: {
    width: 420,
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
    borderWidth: 1,
    borderColor: Palette.primary100,
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
    ...Typography.h1,
    fontSize: 30,
    color: Palette.slate900,
    marginBottom: Spacing.sm,
  },
  brandTitleWide: {
    fontSize: 38,
    lineHeight: 46,
    letterSpacing: -1,
  },
  subtitle: {
    ...Typography.body,
    color: Palette.slate600,
    lineHeight: 23,
    marginBottom: Spacing.xl,
  },
  featuresContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  featureCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    alignItems: 'flex-start',
    ...Shadows.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Palette.slate900,
    marginBottom: 2,
  },
  featureDesc: {
    ...Typography.caption,
    color: Palette.slate600,
    lineHeight: 18,
  },
  integrityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Palette.slate100,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  integrityText: {
    ...Typography.tiny,
    color: Palette.slate600,
    flex: 1,
  },
  authCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Palette.slate200,
    ...Shadows.md,
  },
  authCardHeader: {
    marginBottom: Spacing.xl,
  },
  authCardTitle: {
    ...Typography.h3,
    color: Palette.slate900,
    marginBottom: 4,
  },
  authCardSubtitle: {
    ...Typography.caption,
    color: Palette.slate500,
    lineHeight: 18,
  },
  buttonStack: {
    gap: Spacing.xs,
  },
  signInBtn: {
    marginTop: Spacing.xs,
  },
  guestBtn: {
    marginTop: 2,
  },
  cardFooterNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    justifyContent: 'center',
  },
  cardFooterNoticeText: {
    ...Typography.tiny,
    fontSize: 10,
    color: Palette.slate400,
    textAlign: 'center',
  },
});
