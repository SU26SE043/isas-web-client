import { mockDelay, usesMockData } from '@/shared/mock';
import type { InterviewHistoryResponse } from '../types/history.types';
import { MOCK_INTERVIEW_HISTORY } from '../mocks/history.fixtures';

export async function fetchInterviewHistory(): Promise<InterviewHistoryResponse> {
  if (!usesMockData('practice')) {
    throw new Error('Practice history API is not wired yet. Keep usesMockData("practice") true.');
  }

  await mockDelay(300);
  return {
    interviews: MOCK_INTERVIEW_HISTORY,
    total: MOCK_INTERVIEW_HISTORY.length,
  };
}
