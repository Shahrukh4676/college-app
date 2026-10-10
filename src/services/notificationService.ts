import { apiClient } from './api/client';
import { API_CONFIG } from './api/config';
import { MockAdapter } from './api/mockAdapter';
import { AppNotification } from '@/types';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.getNotifications();
    }
    const response = await apiClient.get<AppNotification[]>('/notifications');
    return response.data;
  },

  async markAsRead(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.markNotificationRead(id);
    }
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async registerPushToken(): Promise<string | null> {
    if (Platform.OS === 'web') return null;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return null;
      }
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      if (!API_CONFIG.USE_MOCK_API) {
        await apiClient.post('/notifications/push-token', { token });
      }
      return token;
    } catch (e) {
      console.warn('[NotificationService] Push token registration skipped or failed:', e);
      return null;
    }
  },
};
