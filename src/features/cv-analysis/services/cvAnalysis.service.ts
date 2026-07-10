import { mockDelay, usesMockData } from '@/shared/mock';
import { MOCK_CV_ANALYSIS_RESULT } from '../mocks/cvAnalysis.fixtures';
import type { CvAnalysisResult, SubmitCvAnalysisInput } from '../types/cvAnalysis.types';

export const cvAnalysisService = {
  async submitAnalysis(_input: SubmitCvAnalysisInput): Promise<{ analysisId: string }> {
    if (!usesMockData('cv-analysis')) {
      throw new Error('CV analysis API is not wired yet. Keep usesMockData("cv-analysis") true.');
    }

    await mockDelay(800);
    return { analysisId: MOCK_CV_ANALYSIS_RESULT.id };
  },

  async getAnalysisResult(_analysisId?: string): Promise<CvAnalysisResult> {
    if (!usesMockData('cv-analysis')) {
      throw new Error('CV analysis API is not wired yet. Keep usesMockData("cv-analysis") true.');
    }

    await mockDelay(500);
    return MOCK_CV_ANALYSIS_RESULT;
  },
};
