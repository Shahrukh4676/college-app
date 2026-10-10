import { apiClient } from './api/client';
import { API_CONFIG } from './api/config';
import { MockAdapter } from './api/mockAdapter';
import { Review, CreateReviewPayload } from '@/types';

export const reviewService = {
  async getReviewsForUser(userId: string): Promise<Review[]> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.getReviewsForUser(userId);
    }
    const response = await apiClient.get<Review[]>(`/users/${userId}/reviews`);
    return response.data;
  },

  async submitReview(payload: CreateReviewPayload): Promise<Review> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.submitReview(payload);
    }
    const response = await apiClient.post<Review>('/reviews', payload);
    return response.data;
  },
};
