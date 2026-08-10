import { apiClient } from '@/shared/api/apiClient';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { buildCreateRepoAnalysisRequest } from '../utils/buildCreateRepoAnalysisRequest';
import type { CreateRepoAnalysisRequest, RepoAnalysisPage, RepoAnalysisResponse, RepoJdMatch } from '../types/repoAnalysis.types';
import { repoAnalysisEndpoints } from './repoAnalysis.endpoints';

export type RepoAnalysisErrorCode = 'badRequest' | 'insufficientCredits' | 'forbidden' | 'notFound' | 'rateLimited' | 'aiBusy' | 'serverError' | 'unknown';

export class RepoAnalysisError extends Error {
  readonly code: RepoAnalysisErrorCode;
  readonly status?: number;
  constructor(code: RepoAnalysisErrorCode, message: string, status?: number) {
    super(message); this.name = 'RepoAnalysisError'; this.code = code; this.status = status;
  }
}

function statusToCode(status?: number): RepoAnalysisErrorCode {
  if (status === 400) return 'badRequest';
  if (status === 402) return 'insufficientCredits';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 429) return 'rateLimited';
  if (status === 502) return 'aiBusy';
  if (status && status >= 500) return 'serverError';
  return 'unknown';
}

function toError(error: unknown, fallback: string): RepoAnalysisError {
  if (error instanceof RepoAnalysisError) return error;
  const status = getApiStatusCode(error);
  return new RepoAnalysisError(statusToCode(status), getApiErrorMessage(error, fallback), status);
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function jdMatch(value: unknown): RepoJdMatch | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  const score = Number(data.score);
  return Number.isFinite(score) ? { score, matchedSkills: strings(data.matchedSkills), missingSkills: strings(data.missingSkills) } : null;
}

function parseAnalysis(value: unknown): RepoAnalysisResponse {
  if (!value || typeof value !== 'object') throw new RepoAnalysisError('unknown', 'Invalid repository analysis response.');
  const data = value as Record<string, unknown>;
  const id = String(data.id ?? '');
  if (!id) throw new RepoAnalysisError('unknown', 'Repository analysis id is missing.');
  const rawLanguages = data.languages && typeof data.languages === 'object' ? data.languages as Record<string, unknown> : {};
  const languages = Object.fromEntries(Object.entries(rawLanguages).map(([key, item]) => [key, Number(item) || 0]));
  return {
    id, repoUrl: String(data.repoUrl ?? ''), repoOwner: String(data.repoOwner ?? ''), repoName: String(data.repoName ?? ''),
    jobCategory: String(data.jobCategory ?? ''), primaryLanguage: data.primaryLanguage == null ? null : String(data.primaryLanguage),
    stars: Number(data.stars) || 0, languages, summary: String(data.summary ?? ''), techStack: strings(data.techStack),
    strengths: strings(data.strengths), weaknesses: strings(data.weaknesses), suggestions: strings(data.suggestions),
    interviewTalkingPoints: strings(data.interviewTalkingPoints), jdMatch: jdMatch(data.jdMatch),
    commitSha: data.commitSha == null ? null : String(data.commitSha), createdAt: String(data.createdAt ?? ''),
  };
}

function unwrap(value: unknown): unknown {
  if (value && typeof value === 'object' && 'data' in value) return (value as { data: unknown }).data;
  return value;
}

function listItems(value: unknown): unknown[] {
  const data = unwrap(value);
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.results)) return record.results;
  }
  return [];
}

function nextCursor(headers: unknown): string | null {
  if (!headers || typeof headers !== 'object') return null;
  const record = headers as Record<string, unknown> & { get?: (name: string) => unknown };
  const value = typeof record.get === 'function' ? record.get('x-next-cursor') ?? record.get('X-Next-Cursor') : record['x-next-cursor'] ?? record['X-Next-Cursor'];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export const repoAnalysisService = {
  async create(input: CreateRepoAnalysisRequest): Promise<RepoAnalysisResponse> {
    try {
      const response = await apiClient.post<unknown>(repoAnalysisEndpoints.analyze, buildCreateRepoAnalysisRequest(input));
      return parseAnalysis(unwrap(response.data));
    } catch (error) {
      if (error instanceof Error && ['REPO_URL_REQUIRED', 'REPO_URL_INVALID', 'JOB_CATEGORY_REQUIRED', 'JD_TEXT_TOO_LONG'].includes(error.message)) {
        throw new RepoAnalysisError('badRequest', error.message);
      }
      throw toError(error, 'Repository analysis failed.');
    }
  },
  async listPage(params?: { cursor?: string; limit?: number }): Promise<RepoAnalysisPage> {
    try {
      const response = await apiClient.get<unknown>(repoAnalysisEndpoints.listAnalyses, { params });
      return { items: listItems(response.data).map(parseAnalysis), nextCursor: nextCursor(response.headers) };
    } catch (error) { throw toError(error, 'Could not load repository analyses.'); }
  },
  async get(id: string): Promise<RepoAnalysisResponse> {
    if (!id) throw new RepoAnalysisError('badRequest', 'Missing analysis id.');
    try {
      const response = await apiClient.get<unknown>(repoAnalysisEndpoints.getAnalysis(id));
      return parseAnalysis(unwrap(response.data));
    } catch (error) { throw toError(error, 'Could not load repository analysis.'); }
  },
};
