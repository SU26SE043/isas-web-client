import { mockDelay, usesMockData } from '@/shared/mock';
import {
  DEFAULT_PRACTICE_SESSION,
  MOCK_ASYNC_QUESTIONS,
  MOCK_PRACTICE_SESSIONS,
  type PracticeQuestion,
  type PracticeSession,
} from '../mocks/session.fixtures';

let asyncQuestionPollCount = 0;

export const practiceSessionService = {
  async getSession(sessionId: string): Promise<PracticeSession> {
    if (!usesMockData('practice')) {
      throw new Error('Practice session API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(1000);
    return MOCK_PRACTICE_SESSIONS[sessionId] ?? { ...DEFAULT_PRACTICE_SESSION, sessionId };
  },

  async pollQuestions(sessionId: string): Promise<PracticeQuestion[]> {
    if (!usesMockData('practice')) {
      throw new Error('Practice questions API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(800);

    const session = MOCK_PRACTICE_SESSIONS[sessionId];
    if (session?.status === 'ready') {
      return session.questions;
    }

    asyncQuestionPollCount += 1;
    if (asyncQuestionPollCount < 3) {
      return [];
    }

    asyncQuestionPollCount = 0;
    return MOCK_ASYNC_QUESTIONS;
  },
};

export type { PracticeQuestion, PracticeSession };
