import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api';
import { authService } from './authService';
import { authEndpoints } from './authEndpoints';
import { UserRole } from '../types/auth.types';

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

describe('authService.updateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PUTs profile fields, ignores response body, then returns GET /me user', async () => {
    mockedApi.put.mockResolvedValueOnce({ data: 'Updated profile object' });
    mockedApi.get.mockResolvedValueOnce({
      data: {
        id: 'u-1',
        fullName: 'New Name',
        email: 'user@isas.dev',
        location: 'Hanoi',
        title: 'Engineer',
        role: 'Candidate',
        createdAt: '2026-07-14T00:00:00Z',
      },
    });

    const payload = { fullName: 'New Name', location: 'Hanoi', title: 'Engineer' };
    const user = await authService.updateProfile(payload);

    expect(mockedApi.put).toHaveBeenCalledWith(authEndpoints.me, payload);
    expect(mockedApi.get).toHaveBeenCalledWith(authEndpoints.me);
    expect(user).toEqual({
      id: 'u-1',
      fullName: 'New Name',
      email: 'user@isas.dev',
      location: 'Hanoi',
      title: 'Engineer',
      role: UserRole.CANDIDATE,
      createdAt: '2026-07-14T00:00:00Z',
    });
  });

  it('does not parse the PUT status string as a user', async () => {
    mockedApi.put.mockResolvedValueOnce({ data: 'Updated profile object' });
    mockedApi.get.mockRejectedValueOnce(new Error('GET /me failed'));

    await expect(authService.updateProfile({ fullName: 'X' })).rejects.toThrow('GET /me failed');
    expect(mockedApi.put).toHaveBeenCalledTimes(1);
    expect(mockedApi.get).toHaveBeenCalledTimes(1);
  });
});
