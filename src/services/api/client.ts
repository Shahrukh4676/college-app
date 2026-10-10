import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from './config';
import { StorageService } from './storage';

export interface ApiErrorResponse {
  message: string;
  code?: string;
  status: number;
  errors?: Record<string, string[]>;
}

export class NormalizedApiError extends Error {
  public status: number;
  public code?: string;
  public fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, code?: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'NormalizedApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

let onSessionExpiredCallback: (() => void) | null = null;

export const setOnSessionExpired = (cb: () => void) => {
  onSessionExpiredCallback = cb;
};

export const createApiClient = (): AxiosInstance => {
  // eslint-disable-next-line import/no-named-as-default-member
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT_MS,
    headers: API_CONFIG.HEADERS,
  });

  // Attach token
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await StorageService.getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Normalize responses and errors
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
      if (error.response?.status === 401) {
        await StorageService.clearAuthSession();
        if (onSessionExpiredCallback) {
          onSessionExpiredCallback();
        }
      }

      const status = error.response?.status ?? 0;
      const data = error.response?.data;
      const message =
        data?.message ||
        (error.code === 'ECONNABORTED'
          ? 'Network request timed out. Please check your connection.'
          : error.message || 'An unexpected error occurred.');

      const normalizedError = new NormalizedApiError(
        message,
        status,
        data?.code,
        data?.errors
      );

      return Promise.reject(normalizedError);
    }
  );

  return instance;
};

export const apiClient = createApiClient();
