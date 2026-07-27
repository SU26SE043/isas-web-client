import { CvAnalysisError } from '@/features/cv-analysis/services/cvAnalysis.service';

export function resolveCvFileActionError(
  error: unknown,
  t: (key: string) => string,
  fallbackKey: string,
): string {
  if (error instanceof CvAnalysisError) {
    const key = `cv.error.${error.code}`;
    const translated = t(key);
    if (translated !== key) return translated;
    return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return t(fallbackKey);
}
