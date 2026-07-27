import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api';
import { authEndpoints } from './authEndpoints';
import { authService } from './authService';

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

describe('authService password recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests a reset OTP without attaching auth', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: 'OTP sent to your email' });

    await expect(authService.forgotPassword({ email: 'user@isas.dev' })).resolves.toBe(
      'OTP sent to your email',
    );
    expect(mockedApi.post).toHaveBeenCalledWith(
      authEndpoints.forgotPassword,
      { email: 'user@isas.dev' },
      { skipAuth: true },
    );
  });

  it('verifies the OTP as a public request', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: 'OTP verified, you can reset your password',
    });

    await expect(
      authService.verifyOtp({ email: 'user@isas.dev', otp: '123456' }),
    ).resolves.toBe('OTP verified, you can reset your password');
    expect(mockedApi.post).toHaveBeenCalledWith(
      authEndpoints.verifyOtp,
      { email: 'user@isas.dev', otp: '123456' },
      { skipAuth: true },
    );
  });

  it('sends the verified OTP when resetting the password', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: 'Password reset successful' });

    await expect(
      authService.resetPassword({
        email: 'user@isas.dev',
        otp: '123456',
        newPassword: 'StrongPass123!',
      }),
    ).resolves.toBe('Password reset successful');
    expect(mockedApi.post).toHaveBeenCalledWith(
      authEndpoints.resetPassword,
      {
        email: 'user@isas.dev',
        otp: '123456',
        newPassword: 'StrongPass123!',
      },
      { skipAuth: true },
    );
  });

  it.each([
    ['forgotPassword', () => authService.forgotPassword({ email: 'user@isas.dev' })],
    [
      'verifyOtp',
      () => authService.verifyOtp({ email: 'user@isas.dev', otp: '123456' }),
    ],
    [
      'resetPassword',
      () =>
        authService.resetPassword({
          email: 'user@isas.dev',
          otp: '123456',
          newPassword: 'StrongPass123!',
        }),
    ],
  ])('rejects an unexpected %s success payload', async (_name, request) => {
    mockedApi.post.mockResolvedValueOnce({ data: { message: 'unexpected' } });

    await expect(request()).rejects.toThrow('Invalid');
  });
});
