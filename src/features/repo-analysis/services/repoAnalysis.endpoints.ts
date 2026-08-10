const INTERVIEW_API_PREFIX = '/api/v1/interview';

export const repoAnalysisEndpoints = {
  analyze: `${INTERVIEW_API_PREFIX}/practice/repo-analysis`,
  listAnalyses: `${INTERVIEW_API_PREFIX}/practice/repo-analysis`,
  getAnalysis: (id: string) =>
    `${INTERVIEW_API_PREFIX}/practice/repo-analysis/${encodeURIComponent(id)}`,
} as const;
