import { apiClient } from './api/client';
import { API_CONFIG } from './api/config';
import { MockAdapter } from './api/mockAdapter';
import { ReportPayload } from '@/types';

export const safetyService = {
  async submitReport(payload: ReportPayload): Promise<{ success: boolean; message: string }> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.submitReport(payload);
    }
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/safety/reports',
      payload
    );
    return response.data;
  },
};
