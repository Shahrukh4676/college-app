import { apiClient } from './api/client';
import { API_CONFIG } from './api/config';
import { MockAdapter } from './api/mockAdapter';
import { EarningStats, Transaction } from '@/types';

export const paymentService = {
  async getEarningStats(): Promise<EarningStats> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.getEarningStats();
    }
    const response = await apiClient.get<EarningStats>('/payments/stats');
    return response.data;
  },

  async getTransactions(): Promise<Transaction[]> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.getTransactions();
    }
    const response = await apiClient.get<Transaction[]>('/payments/transactions');
    return response.data;
  },

  /**
   * Payment initiation is orchestrated with the backend.
   * The backend generates an order/intent from the configured gateway (e.g. Razorpay / Cashfree / Stripe).
   * Note: The client must never mark payment successful until confirmed by backend verification endpoint.
   */
  async initiatePayment(taskId: string, amountInr: number): Promise<{ orderId: string; keyId: string }> {
    if (API_CONFIG.USE_MOCK_API) {
      return {
        orderId: 'order_mock_' + Date.now(),
        keyId: 'rzp_test_placeholder',
      };
    }
    const response = await apiClient.post<{ orderId: string; keyId: string }>(
      '/payments/initiate',
      { taskId, amountInr }
    );
    return response.data;
  },

  async verifyPayment(params: {
    orderId: string;
    paymentId: string;
    signature: string;
    taskId: string;
  }): Promise<{ status: 'VERIFIED' | 'FAILED' }> {
    if (API_CONFIG.USE_MOCK_API) {
      return { status: 'VERIFIED' };
    }
    const response = await apiClient.post<{ status: 'VERIFIED' | 'FAILED' }>(
      '/payments/verify',
      params
    );
    return response.data;
  },
};
