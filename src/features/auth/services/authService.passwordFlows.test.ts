/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, authTokenStorage } from '@/shared/api';
import { authService } from './authService';
import { authEndpoints } from './authEndpoints';

vi.mock('@/shared/api', async () => {
  const actual = await vi.importActual<typeof import('@/shared/api')>('@/shared/api');
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      put: vi.fn(),
      post: vi.fn(),
    },
  };
});

const mockedApi = vi.mocked(apiClient);

describe('authService password and Google flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('verifies an OTP through the public endpoint and checks the exact response', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: 'OTP verified, you can reset your password',
    });

    const payload = { email: 'user@isas.dev', otp: '123456' };
    await expect(authService.verifyOtp(payload)).resolves.toBe(
      'OTP verified, you can reset your password',
    );
    expect(mockedApi.post).toHaveBeenCalledWith(authEndpoints.verifyOtp, payload, {
      skipAuth: true,
    });
  });

  it('rejects a malformed verify-otp success response', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: 'verified' });
    await expect(
      authService.verifyOtp({ email: 'user@isas.dev', otp: '123456' }),
    ).rejects.toThrow('Invalid verify-otp response from Auth API');
  });

  it('resets the password with the verified OTP through the public endpoint', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: 'Password reset successful' });
    const payload = {
      email: 'user@isas.dev',
      otp: '123456',
      newPassword: 'ValidPass123!',
    };

    await expect(authService.resetPassword(payload)).resolves.toBe('Password reset successful');
    expect(mockedApi.post).toHaveBeenCalledWith(authEndpoints.resetPassword, payload, {
      skipAuth: true,
    });
  });

  it('rejects a malformed reset-password success response', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { message: 'Password reset successful' } });
    await expect(
      authService.resetPassword({
        email: 'user@isas.dev',
        otp: '123456',
        newPassword: 'ValidPass123!',
      }),
    ).rejects.toThrow('Invalid reset-password response from Auth API');
  });

  it('exchanges a Google code publicly and stores the returned session', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: '2026-07-22T10:00:00Z',
      },
    });

    const result = await authService.exchangeGoogleCode({ code: 'one-time-code' });

    expect(mockedApi.post).toHaveBeenCalledWith(
      authEndpoints.googleExchange,
      { code: 'one-time-code' },
      { skipAuth: true },
    );
    expect(result.accessToken).toBe('access-token');
    expect(authTokenStorage.getAccessToken()).toBe('access-token');
    expect(authTokenStorage.getRefreshToken()).toBe('refresh-token');
  });

  it('does not create a session from an incomplete Google exchange response', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { accessToken: 'access-token', refreshToken: 'refresh-token' },
    });

    await expect(authService.exchangeGoogleCode({ code: 'bad-code' })).rejects.toThrow(
      'Invalid Google exchange response from Auth API',
    );
    expect(authTokenStorage.getAccessToken()).toBeNull();
  });

  it('changes an authenticated password without marking the request public', async () => {
    mockedApi.post.mockResolvedValueOnce({ status: 204, data: undefined });
    const payload = { oldPassword: 'OldPass123!', newPassword: 'NewPass123!' };

    await expect(authService.changePassword(payload)).resolves.toBeUndefined();
    expect(mockedApi.post).toHaveBeenCalledWith(authEndpoints.changePassword, payload);
  });

  it('rejects a non-204 change-password success response', async () => {
    mockedApi.post.mockResolvedValueOnce({ status: 200, data: 'Password changed' });

    await expect(
      authService.changePassword({
        oldPassword: 'OldPass123!',
        newPassword: 'NewPassword123!',
      }),
    ).rejects.toThrow('Invalid change-password response from Auth API');
  });
});
