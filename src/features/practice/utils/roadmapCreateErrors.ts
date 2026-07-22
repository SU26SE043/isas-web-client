import { getApiStatusCode } from '@/shared/api/apiError';

export type CreateRoadmapErrorCode =
  | 'invalid_input'
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
  if (status === 400) return new CreateRoadmapError('invalid_input');
  if (status === 403) return new CreateRoadmapError('forbidden');
  if (status === 404) return new CreateRoadmapError('cv_not_found');
  if (status === 502) return new CreateRoadmapError('ai_failed');
  return new CreateRoadmapError('generic');
}
