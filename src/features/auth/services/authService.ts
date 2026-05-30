import { apiClient, authTokenStorage } from '../../../shared/api';
import type { AuthTokensResponse, RegisterRequest } from '../types/auth.types';
import { authEndpoints } from './authEndpoints';

export const authService = {
  register: async (payload: RegisterRequest) => {
    const { data } = await apiClient.post<AuthTokensResponse>(authEndpoints.register, payload);
    authTokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data;
  },
};
