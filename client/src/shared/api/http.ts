import axios from 'axios';
import { env } from '@/shared/config/env';

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
});

http.interceptors.response.use(
  response => response,
  error => {
    const apiMessage =
      typeof error.response?.data?.error === 'string'
        ? error.response.data.error
        : undefined;

    return Promise.reject(
      new Error(apiMessage ?? error.message ?? 'Не удалось выполнить запрос'),
    );
  },
);
