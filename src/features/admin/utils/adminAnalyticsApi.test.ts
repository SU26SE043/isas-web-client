/* @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { adminAnalyticsService } from '../services/adminAnalytics.service';
import { buildAdminAnalyticsParams, parseAdminAnalytics } from './adminAnalyticsApi';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: vi.fn() },
}));

const mockedApi = vi.mocked(apiClient);
const response = {
  from: '2026-07-01T00:00:00.000Z',
  to: '2026-07-29T00:00:00.000Z',
  granularity: 'day',
  totals: {
    totalUsers: 120,
    newUsers: 18,
    bannedUsers: 3,
    totalOrganizations: 9,
    byRole: [
      { role: 'Candidate', count: 90 },
      { role: 'Admin', count: 2 },
    ],
  },
  activeUsers: { last7Days: 42, last30Days: 88 },
  buckets: [{
    periodStart: '2026-07-28T00:00:00.000Z',
    newUsers: 4,
    logins: 37,
    distinctUsers: 25,
  }],
};

describe('Admin Auth analytics API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls analytics with trimmed date filters and groupBy', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: response });

    await expect(adminAnalyticsService.getAdminAnalytics({
      from: ' 2026-07-01T00:00:00.000Z ',
      to: ' 2026-07-29T00:00:00.000Z ',
      groupBy: 'month',
    })).resolves.toMatchObject({
      totals: { totalUsers: 120, bannedUsers: 3 },
      activeUsers: { last7Days: 42 },
      buckets: [{ logins: 37 }],
    });
    expect(mockedApi.get).toHaveBeenCalledWith(
      '/api/v1/auth/admin/analytics',
      {
        params: {
          from: '2026-07-01T00:00:00.000Z',
          to: '2026-07-29T00:00:00.000Z',
          groupBy: 'month',
        },
      },
    );
  });

  it('omits optional parameters when the backend defaults are requested', () => {
    expect(buildAdminAnalyticsParams({ from: ' ', to: '' })).toEqual({});
  });

  it('rejects malformed or negative analytics values at the service boundary', () => {
    expect(() => parseAdminAnalytics({
      ...response,
      totals: { ...response.totals, bannedUsers: -1 },
    })).toThrow(/bannedUsers/);
    expect(() => parseAdminAnalytics({ ...response, buckets: null })).toThrow(/series/);
  });
});
