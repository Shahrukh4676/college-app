import { Platform } from 'react-native';

const getDevBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    // 10.0.2.2 maps to host machine localhost in Android Emulator
    return 'http://10.0.2.2:8000/api/v1';
  }
  return 'http://localhost:8000/api/v1';
};

// Strict rule: Mock API is ONLY active if explicitly requested in environment or dev toggle.
// In production, mock API is strictly disabled.
let runtimeMockOverride: boolean | null = null;

export const setMockApiOverride = (enabled: boolean | null) => {
  if (__DEV__) {
    runtimeMockOverride = enabled;
  }
};

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || getDevBaseUrl(),

  get USE_MOCK_API(): boolean {
    if (!__DEV__) {
      // In production mode, NEVER use mock data or fallback.
      return false;
    }
    if (runtimeMockOverride !== null) {
      return runtimeMockOverride;
    }
    if (process.env.EXPO_PUBLIC_USE_MOCK_API === 'false') {
      return false;
    }
    return true;
  },

  TIMEOUT_MS: 12000,

  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};
