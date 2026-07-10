import { apiClient, authTokenStorage } from '../../../shared/api';
import { getApiBaseUrl } from '../../../shared/config';
import type {
  AuthTokensResponse,
  LoginRequest,
  MfaVerifyRequest,
  RegisterRequest,
  ResendVerificationRequest,
  User,
  UpdateProfileRequest,
  VerifyEmailRequest,
} from '../types/auth.types';
import { parseUser } from '../types/auth.types';
import { authEndpoints } from './authEndpoints';

function storeTokensIfPresent(data: AuthTokensResponse) {
  if (data.accessToken && data.refreshToken) {
    authTokenStorage.setTokens(data.accessToken, data.refreshToken);
  }
}

export const authService = {
  register: async (payload: RegisterRequest) => {
    const { data } = await apiClient.post<AuthTokensResponse>(authEndpoints.register, payload);
    storeTokensIfPresent(data);
    return data;
  },
  login: async (payload: LoginRequest) => {
    const { data } = await apiClient.post<AuthTokensResponse>(authEndpoints.login, payload);
    if (data.mfaRequired) {
      return data;
    }
    storeTokensIfPresent(data);
    return data;
  },
  refresh: async () => {
    const refreshToken = authTokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const { data } = await apiClient.post<AuthTokensResponse>(authEndpoints.refresh, { refreshToken });
    storeTokensIfPresent(data);
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
    return parseUser(data);
  },
  updateProfile: async (payload: UpdateProfileRequest) => {
    const { data } = await apiClient.put<User>(authEndpoints.me, payload);
    return parseUser(data);
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
  verifyEmail: async (payload: VerifyEmailRequest) => {
    const { data } = await apiClient.post(authEndpoints.verifyEmail, payload);
    return data;
  },
  resendVerification: async (payload: ResendVerificationRequest) => {
    const { data } = await apiClient.post(authEndpoints.resendVerification, payload);
    return data;
  },
  verifyMfa: async (payload: MfaVerifyRequest) => {
    const { data } = await apiClient.post<AuthTokensResponse>(authEndpoints.verifyMfa, payload);
    storeTokensIfPresent(data);
    return data;
  },
  loginWithGoogle: () => {
    const returnUrl = encodeURIComponent(window.location.origin + window.location.pathname);
    const baseUrl = getApiBaseUrl();
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    window.location.href = `${normalizedBaseUrl}/api/auth/login-google?returnUrl=${returnUrl}`;
  },
};
