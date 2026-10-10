import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'student_marketplace_token',
  REFRESH_TOKEN: 'student_marketplace_refresh_token',
  USER_PROFILE: 'student_marketplace_user',
} as const;

// Web memory fallback
const memoryStorage = new Map<string, string>();

export const StorageService = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        } else {
          memoryStorage.set(key, value);
        }
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn(`[StorageService] Failed to set item for key "${key}":`, error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return memoryStorage.get(key) ?? null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`[StorageService] Failed to get item for key "${key}":`, error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        memoryStorage.delete(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn(`[StorageService] Failed to remove item for key "${key}":`, error);
    }
  },

  // Auth specific helpers
  async saveAuthSession(token: string, user: object, refreshToken?: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await this.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    if (refreshToken) {
      await this.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  },

  async getAuthToken(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async getUserProfile<T>(): Promise<T | null> {
    const raw = await this.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async clearAuthSession(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await this.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await this.removeItem(STORAGE_KEYS.USER_PROFILE);
  },
};
