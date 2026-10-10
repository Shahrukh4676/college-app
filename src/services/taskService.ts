import { apiClient } from './api/client';
import { API_CONFIG } from './api/config';
import { MockAdapter } from './api/mockAdapter';
import { Task, CreateTaskPayload } from '@/types';

export const taskService = {
  async getTasks(params?: {
    category?: string;
    search?: string;
    status?: string;
  }): Promise<Task[]> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.getTasks(params);
    }
    const response = await apiClient.get<Task[]>('/tasks', { params });
    return response.data;
  },

  async getTaskById(id: string): Promise<Task> {
    if (API_CONFIG.USE_MOCK_API) {
      const task = await MockAdapter.getTaskById(id);
      if (!task) throw new Error('Task not found');
      return task;
    }
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.createTask(payload);
    }
    const response = await apiClient.post<Task>('/tasks', payload);
    return response.data;
  },

  async updateTaskStatus(
    taskId: string,
    status: Task['status'],
    notes?: string
  ): Promise<Task> {
    if (API_CONFIG.USE_MOCK_API) {
      return MockAdapter.updateTaskStatus(taskId, status, notes);
    }
    const response = await apiClient.patch<Task>(`/tasks/${taskId}/status`, {
      status,
      notes,
    });
    return response.data;
  },
};
