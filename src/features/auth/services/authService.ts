import { apiClient, authTokenStorage } from '../../../shared/api';
import type { AuthTokensResponse, LoginRequest, RegisterRequest, User, UpdateProfileRequest } from '../types/auth.types';
import { authEndpoints } from './authEndpoints';

export const authService = {
  register: async (payload: RegisterRequest) => {
    const { data } = await apiClient.post<AuthTokensResponse>(authEndpoints.register, payload);
    authTokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data;
  },
  login: async (payload: LoginRequest) => {
    const { data } = await apiClient.post<AuthTokensResponse>(authEndpoints.login, payload);
    console.log('Login response:', data); // Debug login response
    authTokenStorage.setTokens(data.accessToken, data.refreshToken);

    // Verify token was saved
    const savedToken = authTokenStorage.getAccessToken();
    console.log('Token saved:', savedToken ? 'Yes' : 'No');
    console.log('Token preview:', savedToken?.substring(0, 20) + '...');

    return data;
  },
  refresh: async () => {
    const refreshToken = authTokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const { data } = await apiClient.post<AuthTokensResponse>(authEndpoints.refresh, { refreshToken });
    authTokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data;
  },
  logout: async () => {
    const refreshToken = authTokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await apiClient.post(authEndpoints.logout, { refreshToken });
      }
    } finally {
      authTokenStorage.clear();
    }
  },
  me: async () => {
    const { data } = await apiClient.get<User>(authEndpoints.me);
    return data;
  },
  updateProfile: async (payload: UpdateProfileRequest) => {
    const { data } = await apiClient.put<User>(authEndpoints.me, payload);
    return data;
  },
  forgotPassword: async (payload: { email: string }) => {
    const { data } = await apiClient.post(authEndpoints.forgotPassword, payload);
    return data;
  },
  verifyOtp: async (payload: { email: string; otp: string }) => {
    const { data } = await apiClient.post(authEndpoints.verifyOtp, payload);
    return data;
  },
  resetPassword: async (payload: { email: string; newPassword: string }) => {
    const { data } = await apiClient.post(authEndpoints.resetPassword, payload);
    return data;
  },
  loginWithGoogle: () => {
    const returnUrl = encodeURIComponent(window.location.origin + window.location.pathname);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    window.location.href = `${normalizedBaseUrl}/api/auth/login-google?returnUrl=${returnUrl}`;
  },
};
