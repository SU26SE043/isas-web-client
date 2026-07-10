import { mockDelay, usesMockData } from '@/shared/mock';
import type { InterviewResult } from '../types/result.types';
import { MOCK_INTERVIEW_RESULT } from '../mocks/result.fixtures';

export const resultService = {
  async getInterviewResult(_resultId: string): Promise<InterviewResult> {
    if (!usesMockData('practice')) {
      throw new Error('Practice result API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(600);
    return MOCK_INTERVIEW_RESULT;
  },
};
