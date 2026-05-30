import { apiClient, authTokenStorage } from '../../../shared/api';
import type { AuthTokensResponse, LoginRequest, RegisterRequest } from '../types/auth.types';
import { authEndpoints } from './authEndpoints';

export const authService = {
  register: async (payload: RegisterRequest) => {
    const { data } = await apiClient.post<AuthTokensResponse>(authEndpoints.register, payload);
    authTokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data;
  },
  login: async (payload: LoginRequest) => {
    const { data } = await apiClient.post<AuthTokensResponse>(authEndpoints.login, payload);
    authTokenStorage.setTokens(data.accessToken, data.refreshToken);
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
};
