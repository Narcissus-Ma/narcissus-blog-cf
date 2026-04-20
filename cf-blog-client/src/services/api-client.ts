import axios, { type InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/auth-store';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8788/api',
  timeout: 12000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  async (response) => {
    // 直接返回响应数据，不需要处理 code 字段
    return response;
  },
  async (error) => {
    const status = error.response?.status as number | undefined;

    if (status === 401) {
      // 清除认证状态
      useAuthStore.getState().clearAuth();
    }

    return Promise.reject(error);
  },
);

export function unwrapResponse<T>(response: { data: T }): T {
  return response.data;
}

export { apiClient };
