import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { fetchInterviewHistory } from './history.service';

vi.mock('@/shared/mock', () => ({
  mockDelay: vi.fn(),
  usesMockData: () => false,
}));

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('fetchInterviewHistory live API adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] });
  });

  it('does not send optional status filters when the query omits them', async () => {
    await fetchInterviewHistory({});

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/interview/practice/sessions/history',
      { params: { limit: 5 } },
    );
  });

  it('forwards status and excludeCampaign to the HTTP history request', async () => {
    await fetchInterviewHistory({ status: 'Scored', excludeCampaign: true });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/interview/practice/sessions/history',
      { params: { limit: 5, status: 'Scored', excludeCampaign: true } },
    );
  });
});
