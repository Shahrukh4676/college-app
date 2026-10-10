import { apiClient } from './api/client';
import { API_CONFIG } from './api/config';
import { MockAdapter } from './api/mockAdapter';
import { Offer, SubmitOfferPayload, Task } from '@/types';

export const offerService = {
  async getOffersForTask(taskId: string): Promise<Offer[]> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.getOffersForTask(taskId);
    }
    const response = await apiClient.get<Offer[]>(`/tasks/${taskId}/offers`);
    return response.data;
  },

  async getMyOffers(): Promise<Offer[]> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.getMyOffers();
    }
    const response = await apiClient.get<Offer[]>('/offers/my');
    return response.data;
  },

  async submitOffer(payload: SubmitOfferPayload): Promise<Offer> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.submitOffer(payload);
    }
    const response = await apiClient.post<Offer>(`/tasks/${payload.taskId}/offers`, payload);
    return response.data;
  },

  async acceptOffer(offerId: string): Promise<{ task: Task; offer: Offer }> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.acceptOffer(offerId);
    }
    const response = await apiClient.post<{ task: Task; offer: Offer }>(
      `/offers/${offerId}/accept`
    );
    return response.data;
  },

  async rejectOffer(offerId: string): Promise<Offer> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.rejectOffer(offerId);
    }
    const response = await apiClient.post<Offer>(`/offers/${offerId}/reject`);
    return response.data;
  },
};
