import { apiClient } from './api/client';
import { API_CONFIG } from './api/config';
import { MockAdapter } from './api/mockAdapter';
import { StorageService } from './api/storage';
import { StudentProfile } from '@/types';

export interface LoginDto {
  email: string;
  password?: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  college: string;
  course: string;
  yearOfStudy: number;
  password?: string;
}

export const authService = {
  async login(payload: LoginDto): Promise<{ user: StudentProfile; token: string }> {
    if (API_CONFIG.USE_MOCK_API) {
      const res = await MockAdapter.login(payload.email);
      await StorageService.saveAuthSession(res.token, res.user);
      return res;
    }
    const response = await apiClient.post<{ user: StudentProfile; token: string }>(
      '/auth/login',
      payload
    );
    await StorageService.saveAuthSession(response.data.token, response.data.user);
    return response.data;
  },

  async register(payload: RegisterDto): Promise<{ user: StudentProfile; token: string }> {
    if (API_CONFIG.USE_MOCK_API) {
      const res = await MockAdapter.register(payload);
      await StorageService.saveAuthSession(res.token, res.user);
      return res;
    }
    const response = await apiClient.post<{ user: StudentProfile; token: string }>(
      '/auth/register',
      payload
    );
    await StorageService.saveAuthSession(response.data.token, response.data.user);
    return response.data;
  },

  async getMe(): Promise<StudentProfile> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.getMe();
    }
    const response = await apiClient.get<StudentProfile>('/auth/me');
    return response.data;
  },

  async updateProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
    if (API_CONFIG.USE_MOCK_API) {
      const updated = await MockAdapter.updateProfile(updates);
      const token = (await StorageService.getAuthToken()) || '';
      await StorageService.saveAuthSession(token, updated);
      return updated;
    }
    const response = await apiClient.patch<StudentProfile>('/auth/profile', updates);
    const token = (await StorageService.getAuthToken()) || '';
    await StorageService.saveAuthSession(token, response.data);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      if (!API_CONFIG.USE_MOCK_API) {
        await apiClient.post('/auth/logout');
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      await StorageService.clearAuthSession();
    }
  },
};
