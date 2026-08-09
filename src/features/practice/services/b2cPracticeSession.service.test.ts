import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import {
  getPracticeAnswerAudio,
  getPracticeSession,
  getPracticeSessionOptions,
} from './b2cPracticeSession.service';

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
    const sessionId = '685d10e7-af3c-4971-a207-54abfb6d7dee';
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        id: sessionId,
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

    const result = await getPracticeSession(sessionId);

    expect(apiClient.get).toHaveBeenCalledWith(
      `/api/v1/interview/practice/sessions/${sessionId}`,
    );
    expect(result).toMatchObject({
      id: sessionId,
      status: 'Ready',
      jobCategory: 'FE',
      questions: [{ id: 'question-1', timeLimitSec: 120 }],
    });
  });

  it('rejects a prefixed assessment id without calling the API', async () => {
    await expect(
      getPracticeSession('assessment-685d10e7-af3c-4971-a207-54abfb6d7dee'),
    ).rejects.toThrow('INVALID_PRACTICE_SESSION_ID');

    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('loads server-calculated session options with matching category and language', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        adaptiveEnabled: true,
        maxDeepPerQuestion: 3,
        contentCriteriaCount: 6,
        questionCountMin: 1,
        questionCountMax: 12,
        defaultQuestionCount: 5,
        presets: [{ key: 'short', questionCount: 5, seedCount: 2, coversAllCriteria: false }],
        preview: [{ questionCount: 1, seedCount: 1 }],
      },
    });

    await expect(getPracticeSessionOptions('BE', 'en')).resolves.toMatchObject({
      defaultQuestionCount: 5,
      presets: [{ key: 'short', questionCount: 5 }],
    });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/interview/practice/session-options',
      { params: { jobCategory: 'BE', language: 'en' } },
    );
  });

  it('downloads answer audio through the authenticated blob endpoint', async () => {
    const audio = new Blob(['audio'], { type: 'audio/webm' });
    vi.mocked(apiClient.get).mockResolvedValue({ data: audio });

    await expect(getPracticeAnswerAudio('session-1', 'answer-1')).resolves.toBe(audio);
    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/interview/practice/sessions/session-1/answers/answer-1/audio',
      { responseType: 'blob' },
    );
  });
});
