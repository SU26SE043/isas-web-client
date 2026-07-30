import type { AnalyzeCvRequest } from '../types/cvAnalysis.types';

export const CV_JD_TEXT_MAX_CHARS = 20_000;

export function buildCreateCvAnalysisRequest(input: {
  cvId: string;
  jobCategory: string;
  jdId?: string | null;
  jdText?: string;
}): AnalyzeCvRequest {
  if (!input.cvId.trim()) {
    throw new Error('CV_ID_REQUIRED');
  }
  if (!input.jobCategory.trim()) {
    throw new Error('JOB_CATEGORY_REQUIRED');
  }

  const normalizedText = input.jdText?.trim() ?? '';
  if (normalizedText.length > CV_JD_TEXT_MAX_CHARS) {
    throw new Error('JD_TEXT_TOO_LONG');
  }

  const body: AnalyzeCvRequest = {
    cvId: input.cvId.trim(),
    jobCategory: input.jobCategory.trim(),
  };

  if (normalizedText.length > 0) {
    body.jdText = normalizedText;
  } else if (input.jdId?.trim()) {
    body.jdId = input.jdId.trim();
  }

  return body;
}
