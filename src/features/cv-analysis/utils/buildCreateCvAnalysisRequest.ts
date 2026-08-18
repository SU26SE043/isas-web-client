import type { AnalyzeCvRequest, RequirementInput } from '../types/cvAnalysis.types';

export const CV_JD_TEXT_MAX_CHARS = 20_000;
export const CV_ANALYSIS_MAX_REQUIREMENTS = 20;
export const CV_REQUIREMENT_MAX_CHARS = 500;

export function buildCreateCvAnalysisRequest(input: {
  cvId: string;
  jobCategory: string;
  jdId?: string | null;
  jdText?: string;
  mustHave?: RequirementInput[];
  niceToHave?: RequirementInput[];
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

  const mustHave = input.mustHave ?? [];
  const niceToHave = input.niceToHave ?? [];
  if (mustHave.length + niceToHave.length > CV_ANALYSIS_MAX_REQUIREMENTS) {
    throw new Error('REQUIREMENT_LIMIT_EXCEEDED');
  }
  if ([...mustHave, ...niceToHave].some((requirement) => requirement.text.length > CV_REQUIREMENT_MAX_CHARS)) {
    throw new Error('REQUIREMENT_TEXT_TOO_LONG');
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

  if (mustHave.length > 0 || niceToHave.length > 0) {
    body.mustHave = mustHave.map(({ text }) => ({ text: text.trim() }));
    body.niceToHave = niceToHave.map(({ text }) => ({ text: text.trim() }));
  }

  return body;
}
