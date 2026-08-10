import type { CreateRepoAnalysisRequest } from '../types/repoAnalysis.types';

export const REPO_JD_TEXT_MAX_CHARS = 20_000;

export function buildCreateRepoAnalysisRequest(input: CreateRepoAnalysisRequest): CreateRepoAnalysisRequest {
  const repoUrl = input.repoUrl.trim();
  const jobCategory = input.jobCategory.trim();

  if (!repoUrl) throw new Error('REPO_URL_REQUIRED');
  if (!jobCategory) throw new Error('JOB_CATEGORY_REQUIRED');

  let url: URL;
  try {
    url = new URL(repoUrl);
  } catch {
    throw new Error('REPO_URL_INVALID');
  }

  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split('/').filter(Boolean);
  if (url.protocol !== 'https:' || !['github.com', 'www.github.com'].includes(host) || segments.length < 2) {
    throw new Error('REPO_URL_INVALID');
  }

  const jdText = input.jdText?.trim() ?? '';
  if (jdText.length > REPO_JD_TEXT_MAX_CHARS) throw new Error('JD_TEXT_TOO_LONG');

  const body: CreateRepoAnalysisRequest = { repoUrl, jobCategory };
  if (jdText) body.jdText = jdText;
  else if (input.jdId?.trim()) body.jdId = input.jdId.trim();
  return body;
}
