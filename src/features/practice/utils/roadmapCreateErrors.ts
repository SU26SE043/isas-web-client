import { getApiStatusCode } from '@/shared/api/apiError';
import { getApiErrorMessage } from '@/shared/api/apiError';

export type CreateRoadmapErrorCode =
  | 'invalid_input'
  | 'sessions_required'
  | 'too_many_sessions'
  | 'no_weakness'
  | 'no_content_mistakes'
  | 'language_mismatch'
  | 'unsupported_level'
  | 'forbidden'
  | 'cv_not_found'
  | 'ai_failed'
  | 'generic';

export class CreateRoadmapError extends Error {
  readonly code: CreateRoadmapErrorCode;

  constructor(code: CreateRoadmapErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'CreateRoadmapError';
    this.code = code;
  }
}

export function mapCreateRoadmapError(error: unknown): CreateRoadmapError {
  if (error instanceof CreateRoadmapError) return error;
  if (error instanceof Error && error.message === 'INVALID_ROADMAP_INPUT') {
    return new CreateRoadmapError('invalid_input');
  }
  const status = getApiStatusCode(error);
  const message = getApiErrorMessage(error);
  const prefix = /^([A-Z][A-Z0-9_]*):/.exec(message)?.[1];
  const codeByPrefix: Record<string, CreateRoadmapErrorCode> = {
    ROADMAP_SESSIONS_REQUIRED: 'sessions_required',
    ROADMAP_TOO_MANY_SESSIONS: 'too_many_sessions',
    ROADMAP_NO_WEAKNESS: 'no_weakness',
    ROADMAP_NO_CONTENT_MISTAKES: 'no_content_mistakes',
    ROADMAP_LANGUAGE_MISMATCH: 'language_mismatch',
  };
  if (status === 400 && prefix && codeByPrefix[prefix]) return new CreateRoadmapError(codeByPrefix[prefix]);
  if (status === 400) return new CreateRoadmapError('invalid_input');
  if (status === 403) return new CreateRoadmapError('forbidden');
  if (status === 404) return new CreateRoadmapError('cv_not_found');
  if (status === 502) return new CreateRoadmapError('ai_failed');
  return new CreateRoadmapError('generic');
}
