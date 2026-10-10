import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, Radius, Spacing } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/services/api/config';
import { AppHeader } from '@/components/ui/app-header';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout, isMockMode, setDevMockMode } = useAuth();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Request Account Deletion',
      'Permanently deleting your account will remove your student profile, completed task history, and ratings after backend verification. Any active escrow funds must be cleared first. Do you wish to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Deletion',
          style: 'destructive',
          onPress: async () => {
            Alert.alert(
              'Deletion Request Logged',
              'Your deletion request has been submitted to campus administrators. You will receive email confirmation within 48 hours.'
            );
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Settings" canGoBack />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowTitle}>Push Notifications</Text>
                <Text style={styles.rowDesc}>Offers, messages, and task status updates</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: Palette.slate300, true: Palette.primary600 }}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowTitle}>Email Digests</Text>
                <Text style={styles.rowDesc}>Weekly summary of relevant academic tasks</Text>
              </View>
              <Switch
                value={emailAlerts}
                onValueChange={setEmailAlerts}
                trackColor={{ false: Palette.slate300, true: Palette.primary600 }}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowTitle}>Notification Sounds</Text>
                <Text style={styles.rowDesc}>Audible chime on incoming chat messages</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: Palette.slate300, true: Palette.primary600 }}
              />
            </View>
          </View>
        </View>

        {/* Academic Integrity & Guidelines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Policy & Safety</Text>
          <View style={styles.card}>
            <Pressable
              onPress={() =>
                Alert.alert(
                  'Community Guidelines',
                  '1. Assistance only: No examination impersonation or plagiarism.\n2. Genuine collaboration: Be respectful and deliver quality help.\n3. Transparent pricing: Keep all financial agreements on-platform.\n4. Escrow protection: Verify deliverables before releasing funds.'
                )
              }
              style={styles.navRow}
            >
              <Ionicons name="ribbon-outline" size={20} color={Palette.slate700} />
              <Text style={styles.navRowText}>Academic Integrity Code</Text>
              <Ionicons name="chevron-forward" size={18} color={Palette.slate400} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              onPress={() =>
                Alert.alert(
                  'Terms & Privacy',
                  'Student Marketplace complies with institutional data policies. Your academic credentials and phone details are never exposed to other students.'
                )
              }
              style={styles.navRow}
            >
              <Ionicons name="lock-closed-outline" size={20} color={Palette.slate700} />
              <Text style={styles.navRowText}>Privacy & Data Protection</Text>
              <Ionicons name="chevron-forward" size={18} color={Palette.slate400} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              onPress={async () => {
                const url = 'mailto:support@studentmarketplace.campus.edu?subject=Student%20Marketplace%20Support';
                const canOpen = await Linking.canOpenURL(url).catch(() => false);
                if (canOpen) {
                  void Linking.openURL(url);
                } else {
                  Alert.alert(
                    'Campus Support Desk',
                    'Email: support@studentmarketplace.campus.edu\nOffice: Student Welfare Center, Room 204\nHours: Mon-Fri 09:00 - 17:00 IST'
                  );
                }
              }}
              style={styles.navRow}
            >
              <Ionicons name="help-buoy-outline" size={20} color={Palette.slate700} />
              <Text style={styles.navRowText}>Help & Support Desk</Text>
              <Ionicons name="chevron-forward" size={18} color={Palette.slate400} />
            </Pressable>
          </View>
        </View>

        {/* Developer / Integration Mode (Visible only in __DEV__) */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Developer Diagnostics</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>Offline Mock API Adapter</Text>
                  <Text style={styles.rowDesc}>
                    {isMockMode
                      ? 'Enabled: Using simulated local campus data'
                      : `Disabled: Connecting to live backend at ${API_CONFIG.BASE_URL}`}
                  </Text>
                </View>
                <Switch
                  value={isMockMode}
                  onValueChange={(val) => {
                    setDevMockMode?.(val);
                    Alert.alert(
                      'API Mode Switched',
                      val
                        ? 'Using mock repository. Restart or refresh screens to reload demo fixtures.'
                        : `Targeting live backend: ${API_CONFIG.BASE_URL}`
                    );
                  }}
                  trackColor={{ false: Palette.slate300, true: Palette.primary600 }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>Backend Base URL</Text>
                  <Text style={styles.rowDesc}>{API_CONFIG.BASE_URL}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <Pressable onPress={handleLogout} style={styles.navRow}>
              <Ionicons name="log-out-outline" size={20} color={Palette.slate700} />
              <Text style={styles.navRowText}>Sign Out</Text>
              <Ionicons name="chevron-forward" size={18} color={Palette.slate400} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable onPress={handleDeleteAccount} style={styles.navRow}>
              <Ionicons name="trash-outline" size={20} color={Palette.danger500} />
              <Text style={[styles.navRowText, { color: Palette.danger500 }]}>
                Delete Account Request
              </Text>
              <Ionicons name="chevron-forward" size={18} color={Palette.slate400} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.versionText}>Student Marketplace v1.0.0 (Release Build)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate500,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  rowTextCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.slate900,
  },
  rowDesc: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.slate100,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  navRowText: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.slate800,
    flex: 1,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Palette.slate400,
    marginTop: Spacing.md,
  },
});
