import axios from 'axios';
import { authTokenStorage } from './authTokenStorage';

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
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    const accessToken = authTokenStorage.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('Request to:', config.url);
      console.log('Authorization header:', config.headers.Authorization?.substring(0, 30) + '...');
    } else {
      console.log('No token found for request to:', config.url);
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      console.log('Response from:', response.config.url, 'Status:', response.status);
      return response;
    },
    async (error) => {
      console.log('Error response from:', error.config?.url, 'Status:', error.response?.status);
      console.log('Error details:', error.response?.data);

      const originalRequest = error.config;

      // Prevent infinite loops by marking requests that have already been retried
      if (originalRequest._retry) {
        authTokenStorage.clear();
        return Promise.reject(error);
      }

      // Only retry refresh on 401 and if it's not the refresh endpoint itself
      if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/refresh') && !originalRequest.url?.includes('/auth/me')) {
        originalRequest._retry = true;

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
            // Don't reload page, just reject the error
            return Promise.reject(refreshError);
          }
        }

        return new Promise((resolve, reject) => {
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
