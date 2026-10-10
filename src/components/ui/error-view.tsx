import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette, Spacing } from '@/theme';
import { Button } from './button';
import { Ionicons } from '@expo/vector-icons';

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title = 'Connection Unavailable',
  message = 'Unable to communicate with the server. Please check your internet connection or backend configuration.',
  onRetry,
  isRetrying = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="cloud-offline-outline" size={36} color={Palette.danger500} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="outline"
          size="md"
          isLoading={isRetrying}
          icon={<Ionicons name="refresh" size={16} color={Palette.primary600} />}
          style={styles.retryBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xl,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Palette.danger50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.slate900,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: 13,
    color: Palette.slate600,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 300,
    marginBottom: Spacing.lg,
  },
  retryBtn: {
    minWidth: 130,
  },
});
