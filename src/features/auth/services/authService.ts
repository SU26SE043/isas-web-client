import { apiClient, authTokenStorage } from '../../../shared/api';
import { parseAuthTokens } from '../../../shared/api/authPayload';
import { getApiErrorMessage, getApiStatusCode } from '../../../shared/api/apiError';
import { getApiBaseUrl } from '../../../shared/config';
import { HttpStatus } from '@/shared/constants/http-status';
import type {
  AuthTokensResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  GoogleExchangeRequest,
  GoogleExchangeResponse,
  LoginRequest,
  LogoutRequest,
  MfaVerifyRequest,
  RefreshRequest,
  RegisterRequest,
  RegisterOrgRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
  UpdateProfileRequest,
  VerifyOtpRequest,
  VerifyOtpResponse,
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
  /**
   * Public refresh — body `{ refreshToken }` only (no Bearer).
   * On 401 (expired/revoked), clears local tokens so callers can redirect.
   */
  refresh: async () => {
    const refreshToken = authTokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const body: RefreshRequest = { refreshToken };

    try {
      const { data } = await apiClient.post(authEndpoints.refresh, body, {
        skipAuth: true,
      });
      const tokens = parseAuthTokens(data);
      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new Error('Refresh response missing tokens');
      }
      storeTokensIfPresent(tokens);
      return tokens;
    } catch (error) {
      if (getApiStatusCode(error) === HttpStatus.UNAUTHORIZED) {
        authTokenStorage.clear();
        sessionManager.clear();
      }
      throw error instanceof Error
        ? error
        : new Error(getApiErrorMessage(error, 'Refresh token expired or revoked'));
    }
  },
  logout: async (refreshTokenOverride?: string | null) => {
    const refreshToken =
      refreshTokenOverride !== undefined ? refreshTokenOverride : authTokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        const payload: LogoutRequest = { refreshToken };
        // Requires Bearer access token (not a public auth route).
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
  /**
   * PUT /api/v1/auth/me — body may omit or set fields to null to keep current values.
   * On 200 the response body is a status string only; always re-fetch via GET /me.
   */
  updateProfile: async (payload: UpdateProfileRequest): Promise<User> => {
    await apiClient.put(authEndpoints.me, payload);
    return authService.me();
  },
  forgotPassword: async (payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const { data } = await apiClient.post<unknown>(authEndpoints.forgotPassword, payload, {
      skipAuth: true,
    });
    if (data !== 'OTP sent to your email') {
      throw new Error('Invalid forgot-password response from Auth API');
    }
    return data;
  },
  verifyOtp: async (payload: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const { data } = await apiClient.post<unknown>(authEndpoints.verifyOtp, payload, {
      skipAuth: true,
    });
    if (data !== 'OTP verified, you can reset your password') {
      throw new Error('Invalid verify-otp response from Auth API');
    }
    return data;
  },
  resetPassword: async (payload: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const { data } = await apiClient.post<unknown>(authEndpoints.resetPassword, payload, {
      skipAuth: true,
    });
    if (data !== 'Password reset successful') {
      throw new Error('Invalid reset-password response from Auth API');
    }
    return data;
  },
  exchangeGoogleCode: async (payload: GoogleExchangeRequest): Promise<GoogleExchangeResponse> => {
    const { data } = await apiClient.post<unknown>(authEndpoints.googleExchange, payload, {
      skipAuth: true,
    });
    const tokens = parseAuthTokens(data);
    if (!tokens.accessToken || !tokens.refreshToken || !tokens.expiresAt) {
      throw new Error('Invalid Google exchange response from Auth API');
    }
    storeTokensIfPresent(tokens);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    };
  },
  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    const response = await apiClient.post(authEndpoints.changePassword, payload);
    if (response.status !== HttpStatus.NO_CONTENT) {
      throw new Error('Invalid change-password response from Auth API');
    }
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
    const returnUrl = encodeURIComponent(`${window.location.origin}/auth/google/callback`);
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
};
