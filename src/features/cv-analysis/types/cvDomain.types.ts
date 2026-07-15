export type CvAnalysisDomain = 'frontend' | 'backend' | 'business-analyst';

export const CV_ANALYSIS_DOMAINS: readonly CvAnalysisDomain[] = [
  'frontend',
  'backend',
  'business-analyst',
] as const;

export function isCvAnalysisDomain(value: string | null | undefined): value is CvAnalysisDomain {
  return value === 'frontend' || value === 'backend' || value === 'business-analyst';
}
