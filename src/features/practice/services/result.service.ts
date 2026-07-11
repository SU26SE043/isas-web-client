import { mockDelay, usesMockData } from '@/shared/mock';
import type {
  AssessmentStatusResponse,
  InterviewResult,
} from '../types/result.types';
import { resolveMockResult } from '../mocks/result.fixtures';

const scoringPollCounts = new Map<string, number>();
const pendingAssessments = new Set<string>();

export const resultService = {
  registerPendingAssessment(assessmentId: string): void {
    pendingAssessments.add(assessmentId);
    scoringPollCounts.set(assessmentId, 0);
  },

  async pollAssessmentStatus(assessmentId: string): Promise<AssessmentStatusResponse> {
    if (!usesMockData('practice')) {
      throw new Error('Practice result API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(500);

    if (!pendingAssessments.has(assessmentId)) {
      return {
        assessmentId,
        status: 'scored',
        resultId: assessmentId,
      };
    }

    const pollCount = (scoringPollCounts.get(assessmentId) ?? 0) + 1;
    scoringPollCounts.set(assessmentId, pollCount);

    if (pollCount < 4) {
      return { assessmentId, status: 'scoring' };
    }

    pendingAssessments.delete(assessmentId);
    return {
      assessmentId,
      status: 'scored',
      resultId: assessmentId,
    };
  },

  async getInterviewResult(resultId: string): Promise<InterviewResult> {
    if (!usesMockData('practice')) {
      throw new Error('Practice result API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(600);
    return resolveMockResult(resultId);
  },
};
