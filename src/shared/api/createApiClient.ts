import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { HttpStatus } from '@/shared/constants/http-status';
import { authEndpoints } from '@/features/auth/services/authEndpoints';
import type { RefreshRequest } from '@/features/auth/types/auth.types';
import { sessionManager } from '@/features/auth/utils/sessionManager';
import { getApiBaseUrl } from '../config';
import { toApiError } from './apiError';
import { parseAuthTokens } from './authPayload';
import { authTokenStorage } from './authTokenStorage';
import { notifyUnauthorized } from './unauthorizedHandler';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  /** Skip attaching Bearer (public endpoints such as refresh). */
  skipAuth?: boolean;
};

type RefreshSubscriber = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let refreshSubscribers: RefreshSubscriber[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(token));
  refreshSubscribers = [];
};

const onRefreshFailed = (error: unknown) => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (subscriber: RefreshSubscriber) => {
  refreshSubscribers.push(subscriber);
};

const handleSessionExpired = () => {
  authTokenStorage.clear();
  sessionManager.clear();
  notifyUnauthorized();
};

/** Auth routes that must not trigger the 401→refresh loop (and usually skip Bearer). */
const isPublicAuthUrl = (url?: string) =>
  Boolean(
    url &&
      (url.includes('/auth/refresh') ||
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/register-org') ||
        url.includes('/auth/google/exchange') ||
        url.includes('/auth/forgot-password') ||
        url.includes('/auth/verify-otp') ||
        url.includes('/auth/reset-password')),
  );

export const createApiClient = () => {
  const client = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config: RetriableRequestConfig) => {
    if (config.skipAuth || isPublicAuthUrl(config.url)) {
      if (config.headers) {
        delete config.headers.Authorization;
      }
      return config;
    }

    const accessToken = authTokenStorage.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetriableRequestConfig | undefined;
      const status = toApiError(error)?.status ?? error.response?.status;

      if (!originalRequest) {
        return Promise.reject(error);
      }

      // Already retried once — do not refresh again (avoids infinite loops).
      if (originalRequest._retry) {
        if (status === HttpStatus.UNAUTHORIZED) {
          handleSessionExpired();
        }
        return Promise.reject(error);
      }

      // Login/register/refresh 401s are not access-token expiry — do not auto-refresh.
      if (status !== HttpStatus.UNAUTHORIZED || isPublicAuthUrl(originalRequest.url)) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      return new Promise((resolve, reject) => {
        addRefreshSubscriber({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(client(originalRequest));
          },
          reject,
        });

        if (isRefreshing) {
          return;
        }

        isRefreshing = true;

        void (async () => {
          try {
            const refreshToken = authTokenStorage.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const body: RefreshRequest = { refreshToken };
            const { data } = await client.post(authEndpoints.refresh, body, {
              skipAuth: true,
            });

            const tokens = parseAuthTokens(data);
            if (!tokens.accessToken || !tokens.refreshToken) {
              throw new Error('Refresh response missing tokens');
            }

            authTokenStorage.setTokens(
              tokens.accessToken,
              tokens.refreshToken,
              tokens.expiresAt ?? null,
            );
            sessionManager.touchActivity();
            onRefreshed(tokens.accessToken);
          } catch (refreshError) {
            onRefreshFailed(refreshError);
            handleSessionExpired();
          } finally {
            isRefreshing = false;
          }
        })();
      });
    },
  );

  return client;
};
