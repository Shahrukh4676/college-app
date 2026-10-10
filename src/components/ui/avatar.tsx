import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Palette } from '@/theme';

interface AvatarProps {
  url?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  url,
  name,
  size = 'md',
  isOnline,
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { dimension: 32, fontSize: 12, dotSize: 8 };
      case 'lg':
        return { dimension: 56, fontSize: 20, dotSize: 12 };
      case 'xl':
        return { dimension: 80, fontSize: 28, dotSize: 16 };
      case 'md':
      default:
        return { dimension: 44, fontSize: 16, dotSize: 10 };
    }
  };

  const { dimension, fontSize, dotSize } = getDimensions();

  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.[0] || 'U').toUpperCase();
  };

  return (
    <View style={[styles.container, { width: dimension, height: dimension }]}>
      {url ? (
        <Image
          source={{ uri: url }}
          style={[
            styles.image,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
        </View>
      )}

      {isOnline !== undefined && (
        <View
          style={[
            styles.statusDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: isOnline ? Palette.success500 : Palette.slate400,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    backgroundColor: Palette.slate200,
  },
  fallback: {
    backgroundColor: Palette.primary100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '700',
    color: Palette.primary700,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: Palette.white,
  },
});
