import { mockDelay, usesMockData } from '@/shared/mock';
import { MOCK_CV_ANALYSIS_RESULT } from '../mocks/cvAnalysis.fixtures';
import type { CvAnalysisResult, SubmitCvAnalysisInput } from '../types/cvAnalysis.types';

export class CvAnalysisError extends Error {
  readonly code: 'passwordProtected' | 'corruptFile' | 'parseFailed';

  constructor(code: 'passwordProtected' | 'corruptFile' | 'parseFailed', message?: string) {
    super(message ?? code);
    this.name = 'CvAnalysisError';
    this.code = code;
  }
}

function detectMockFailure(file: File): CvAnalysisError | null {
  const name = file.name.toLowerCase();
  if (name.includes('locked') || name.includes('protected')) {
    return new CvAnalysisError('passwordProtected');
  }
  if (name.includes('corrupt') || name.includes('broken')) {
    return new CvAnalysisError('corruptFile');
  }
  return null;
}

export const cvAnalysisService = {
  async submitAnalysis(input: SubmitCvAnalysisInput): Promise<{ analysisId: string }> {
    if (!usesMockData('cv-analysis')) {
      throw new Error('CV analysis API is not wired yet. Keep usesMockData("cv-analysis") true.');
    }

    const failure = detectMockFailure(input.file);
    if (failure) {
      throw failure;
    }

    await mockDelay(800);
    return { analysisId: MOCK_CV_ANALYSIS_RESULT.id };
  },

  async getAnalysisResult(analysisId?: string): Promise<CvAnalysisResult> {
    if (!usesMockData('cv-analysis')) {
      throw new Error('CV analysis API is not wired yet. Keep usesMockData("cv-analysis") true.');
    }

    if (!analysisId) {
      throw new CvAnalysisError('parseFailed');
    }

    await mockDelay(500);
    return { ...MOCK_CV_ANALYSIS_RESULT, id: analysisId };
  },
};
