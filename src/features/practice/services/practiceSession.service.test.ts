import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPracticeSession } from './b2cPracticeSession.service';
import { practiceSessionService } from './practiceSession.service';

vi.mock('@/shared/mock', () => ({
  mockDelay: vi.fn(),
  usesMockData: () => false,
}));

vi.mock('./b2cPracticeSession.service', () => ({
  getPracticeSession: vi.fn(),
}));

describe('practiceSessionService.getSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the live practice detail service and adapts the real response', async () => {
    vi.mocked(getPracticeSession).mockResolvedValue({
      id: 'session-1',
      status: 'Ready',
      jobCategory: 'FE',
      questions: [
        {
          id: 'question-1',
          orderNo: 1,
          content: 'Question',
          timeLimitSec: 120,
          kind: 'Seed',
        },
      ],
      answers: [],
      result: null,
    });

    await expect(practiceSessionService.getSession('session-1')).resolves.toEqual({
      sessionId: 'session-1',
      title: '',
      description: '',
      jobCategory: 'FE',
      status: 'ready',
      questions: [
        {
          id: 'question-1',
          content: 'Question',
          timeLimitSeconds: 120,
        },
      ],
    });
    expect(getPracticeSession).toHaveBeenCalledOnce();
    expect(getPracticeSession).toHaveBeenCalledWith('session-1');
  });

  it.each(['', '   ', 'undefined', 'null'])(
    'rejects invalid session id %j without calling the API',
    async (sessionId) => {
      await expect(practiceSessionService.getSession(sessionId)).rejects.toThrow(
        'SESSION_ID_REQUIRED',
      );
      expect(getPracticeSession).not.toHaveBeenCalled();
    },
  );
});
