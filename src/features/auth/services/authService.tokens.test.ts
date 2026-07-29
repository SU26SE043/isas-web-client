/* @vitest-environment jsdom */
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, authTokenStorage } from '@/shared/api';
import { sessionManager } from '../utils/sessionManager';
import { authEndpoints } from './authEndpoints';
import { authService } from './authService';

vi.mock('@/shared/api', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
  authTokenStorage: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    setTokens: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock('../utils/sessionManager', () => ({
  sessionManager: {
    markSessionStart: vi.fn(),
    clear: vi.fn(),
    touchActivity: vi.fn(),
  },
}));

const mockedApi = vi.mocked(apiClient);
const mockedTokenStorage = vi.mocked(authTokenStorage);
const mockedSessionManager = vi.mocked(sessionManager);

const fullTokens = {
  accessToken: 'access-new',
  refreshToken: 'refresh-new',
  expiresAt: '2026-07-29T00:00:00.000Z',
};

describe('authService token contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refreshes with the stored token and persists the full AuthResponse', async () => {
    mockedTokenStorage.getRefreshToken.mockReturnValue('refresh-old');
    mockedApi.post.mockResolvedValueOnce({ data: fullTokens });

    await expect(authService.refresh()).resolves.toMatchObject(fullTokens);
    expect(mockedApi.post).toHaveBeenCalledWith(
      authEndpoints.refresh,
      { refreshToken: 'refresh-old' },
      { skipAuth: true },
    );
    expect(mockedTokenStorage.setTokens).toHaveBeenCalledWith(
      fullTokens.accessToken,
      fullTokens.refreshToken,
      fullTokens.expiresAt,
    );
  });

  it('rejects an incomplete refresh response instead of silently losing expiresAt', async () => {
    mockedTokenStorage.getRefreshToken.mockReturnValue('refresh-old');
    mockedApi.post.mockResolvedValueOnce({
      data: { accessToken: 'access-new', refreshToken: 'refresh-new' },
    });

    await expect(authService.refresh()).rejects.toThrow('Refresh response missing tokens');
    expect(mockedTokenStorage.setTokens).not.toHaveBeenCalled();
  });

  it('clears the session when refresh returns 401 expired or revoked', async () => {
    mockedTokenStorage.getRefreshToken.mockReturnValue('refresh-old');
    mockedApi.post.mockRejectedValueOnce(
      new axios.AxiosError('Refresh token expired or revoked', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {} as never,
        data: 'Refresh token expired or revoked',
      }),
    );

    await expect(authService.refresh()).rejects.toThrow('Refresh token expired or revoked');
    expect(mockedTokenStorage.clear).toHaveBeenCalledTimes(1);
    expect(mockedSessionManager.clear).toHaveBeenCalledTimes(1);
  });

  it('exchanges a one-time Google code and persists all three token fields', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: fullTokens });

    await expect(authService.exchangeGoogleCode({ code: 'one-time-code' })).resolves.toMatchObject(
      fullTokens,
    );
    expect(mockedApi.post).toHaveBeenCalledWith(
      authEndpoints.googleExchange,
      { code: 'one-time-code' },
      { skipAuth: true },
    );
    expect(mockedTokenStorage.setTokens).toHaveBeenCalledWith(
      fullTokens.accessToken,
      fullTokens.refreshToken,
      fullTokens.expiresAt,
    );
  });
});
