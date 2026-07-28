import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { getPracticeSession } from './b2cPracticeSession.service';

vi.mock('@/shared/mock', () => ({
  mockDelay: vi.fn(),
  usesMockData: () => false,
}));

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('getPracticeSession live API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the encoded session endpoint and maps the direct response object', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        id: 'session/id',
        status: 'Ready',
        jobCategory: 'FE',
        questions: [
          {
            id: 'question-1',
            orderNo: 1,
            content: 'Tell me about your React experience.',
            timeLimitSec: 120,
            kind: 'Seed',
          },
        ],
        answers: [],
        result: null,
      },
    });

    const result = await getPracticeSession('session/id');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/interview/practice/sessions/session%2Fid',
    );
    expect(result).toMatchObject({
      id: 'session/id',
      status: 'Ready',
      jobCategory: 'FE',
      questions: [{ id: 'question-1', timeLimitSec: 120 }],
    });
  });
});
