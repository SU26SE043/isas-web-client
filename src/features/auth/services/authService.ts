import { apiClient, authTokenStorage } from '../../../shared/api';
import { parseAuthTokens } from '../../../shared/api/authPayload';
import { getApiBaseUrl } from '../../../shared/config';
import type {
  AuthTokensResponse,
  LoginRequest,
  LogoutRequest,
  MfaVerifyRequest,
  RegisterRequest,
  RegisterOrgRequest,
  ResendVerificationRequest,
  User,
  UpdateProfileRequest,
  VerifyEmailRequest,
} from '../types/auth.types';
import { parseUser } from '../types/auth.types';
import { authEndpoints } from './authEndpoints';
import { sessionManager } from '../utils/sessionManager';

function storeTokensIfPresent(data: ReturnType<typeof parseAuthTokens>) {
  if (data.accessToken && data.refreshToken) {
    authTokenStorage.setTokens(data.accessToken, data.refreshToken, data.expiresAt ?? null);
    sessionManager.markSessionStart();
  }
}

export const authService = {
  register: async (payload: RegisterRequest): Promise<AuthTokensResponse> => {
    const { data } = await apiClient.post(authEndpoints.register, payload);
    const tokens = parseAuthTokens(data);
    if (tokens.mfaRequired) {
      return tokens;
    }
    storeTokensIfPresent(tokens);
    return tokens;
  },
  registerOrg: async (payload: RegisterOrgRequest): Promise<AuthTokensResponse> => {
    const { data } = await apiClient.post(authEndpoints.registerOrg, payload);
    const tokens = parseAuthTokens(data);
    if (tokens.mfaRequired) {
      return tokens;
    }
    storeTokensIfPresent(tokens);
    return tokens;
  },
  login: async (payload: LoginRequest) => {
    const { data } = await apiClient.post(authEndpoints.login, payload);
    const tokens = parseAuthTokens(data);
    if (tokens.mfaRequired) {
      return tokens;
    }
    storeTokensIfPresent(tokens);
    return tokens;
  },
  refresh: async () => {
    const refreshToken = authTokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const { data } = await apiClient.post(
      authEndpoints.refresh,
      { refreshToken } satisfies RefreshRequest,
      { skipAuth: true } as { skipAuth?: boolean },
    );
    const tokens = parseAuthTokens(data);
    if (!tokens.accessToken || !tokens.refreshToken) {
      throw new Error('Refresh response missing tokens');
    }
    storeTokensIfPresent(tokens);
    return tokens;
  },
  logout: async (refreshTokenOverride?: string | null) => {
    const refreshToken =
      refreshTokenOverride !== undefined ? refreshTokenOverride : authTokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        const payload: LogoutRequest = { refreshToken };
        await apiClient.post(authEndpoints.logout, payload);
      }
    } finally {
      authTokenStorage.clear();
      sessionManager.clear();
    }
  },
  me: async () => {
    const { data } = await apiClient.get(authEndpoints.me);
    return parseUser(data);
  },
  /** Auth service PUT /me returns a status string today — re-fetch profile after update. */
  updateProfile: async (payload: UpdateProfileRequest): Promise<User> => {
    await apiClient.put(authEndpoints.me, payload);
    return authService.me();
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
    const { data } = await apiClient.post(authEndpoints.verifyMfa, payload);
    const tokens = parseAuthTokens(data);
    storeTokensIfPresent(tokens);
    return tokens;
  },
  loginWithGoogle: () => {
    const returnUrl = encodeURIComponent(window.location.origin + window.location.pathname);
    const baseUrl = getApiBaseUrl();
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    window.location.href = `${normalizedBaseUrl}${authEndpoints.loginGoogle}?returnUrl=${returnUrl}`;
  },
  loginWithSso: () => {
    const returnUrl = encodeURIComponent(window.location.origin + window.location.pathname);
    const baseUrl = getApiBaseUrl();
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    window.location.href = `${normalizedBaseUrl}${authEndpoints.loginSso}?returnUrl=${returnUrl}`;
  },
  resetPasswordWithToken: async (payload: { token: string; newPassword: string }) => {
    const { data } = await apiClient.post(authEndpoints.resetPassword, payload);
    return data;
  },
};
