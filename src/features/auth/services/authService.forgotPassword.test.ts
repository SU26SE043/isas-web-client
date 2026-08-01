import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api';
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

describe('authService.forgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POSTs the email as a public request and returns the OTP status message', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: 'OTP sent to your email' });

    const result = await authService.forgotPassword({ email: 'user@isas.dev' });

    expect(mockedApi.post).toHaveBeenCalledWith(
      authEndpoints.forgotPassword,
      { email: 'user@isas.dev' },
      { skipAuth: true },
    );
    expect(result).toBe('OTP sent to your email');
  });

  it('rejects an unexpected success payload instead of passing malformed data to the UI', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { message: 'OTP sent' } });

    await expect(authService.forgotPassword({ email: 'user@isas.dev' })).rejects.toThrow(
      'Invalid forgot-password response from Auth API',
    );
  });

  it('preserves the API error so the form can display User not found', async () => {
    const error = new Error('User not found');
    mockedApi.post.mockRejectedValueOnce(error);

    await expect(authService.forgotPassword({ email: 'missing@isas.dev' })).rejects.toBe(error);
  });
});
