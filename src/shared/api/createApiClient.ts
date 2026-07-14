import axios from 'axios';
import { getApiBaseUrl } from '../config';
import { parseAuthTokens } from './authPayload';
import { authTokenStorage } from './authTokenStorage';
import { notifyUnauthorized } from './unauthorizedHandler';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const handleSessionExpired = () => {
  authTokenStorage.clear();
  notifyUnauthorized();
};

export const createApiClient = () => {
  const client = axios.create({
    baseURL: getApiBaseUrl(),
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

      if (!originalRequest || originalRequest._retry) {
        if (error.response?.status === 401) {
          handleSessionExpired();
        }
        return Promise.reject(error);
      }

      const isAuthEndpoint =
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/logout');

      if (error.response?.status === 401 && !isAuthEndpoint) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshToken = authTokenStorage.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const { data } = await client.post('/api/v1/auth/refresh', { refreshToken });
            const tokens = parseAuthTokens(data);
            if (!tokens.accessToken || !tokens.refreshToken) {
              throw new Error('Refresh response missing tokens');
            }
            authTokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
            isRefreshing = false;
            onRefreshed(tokens.accessToken);
          } catch (refreshError) {
            isRefreshing = false;
            handleSessionExpired();
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
