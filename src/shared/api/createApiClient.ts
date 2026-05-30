import axios from 'axios';
import { authTokenStorage } from './authTokenStorage';

const DEFAULT_API_BASE_URL = 'https://engine-spectrum-differential-book.trycloudflare.com';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

export const createApiClient = () => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    const accessToken = authTokenStorage.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Only retry refresh on 401 and if it's not the refresh endpoint itself
      if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/refresh')) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshToken = authTokenStorage.getRefreshToken();
            if (!refreshToken) {
              authTokenStorage.clear();
              throw new Error('No refresh token available');
            }

            const { data } = await client.post('/api/auth/refresh', { refreshToken });
            authTokenStorage.setTokens(data.accessToken, data.refreshToken);
            isRefreshing = false;
            onRefreshed(data.accessToken);
          } catch (refreshError) {
            isRefreshing = false;
            authTokenStorage.clear();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(client(originalRequest));
          });
        });
      }

      return Promise.reject(error);
    }
  );

  return client;
};
