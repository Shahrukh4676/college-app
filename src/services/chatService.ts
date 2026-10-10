import { apiClient } from './api/client';
import { API_CONFIG } from './api/config';
import { MockAdapter } from './api/mockAdapter';
import { Conversation, Message } from '@/types';

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.getConversations();
    }
    const response = await apiClient.get<Conversation[]>('/chats');
    return response.data;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.getMessages(conversationId);
    }
    const response = await apiClient.get<Message[]>(`/chats/${conversationId}/messages`);
    return response.data;
  },

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.sendMessage(conversationId, text);
    }
    const response = await apiClient.post<Message>(
      `/chats/${conversationId}/messages`,
      { text }
    );
    return response.data;
  },
};
