import {
  ROADMAP_FOCUS_MAX_CHARS,
  ROADMAP_NAME_MAX_CHARS,
  type CreateRoadmapApiRequest,
  type CreateRoadmapInput,
} from '../types/learning.types';

export type BuildCreateRoadmapPayloadResult =
  | { ok: true; body: CreateRoadmapApiRequest }
  | { ok: false; reason: 'invalid_input' | 'focus_too_long' | 'name_too_long' };

function uniqueNonEmptyIds(ids: string[] | undefined): string[] {
  if (!ids?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    const trimmed = typeof id === 'string' ? id.trim() : '';
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

/** Build POST /roadmaps body — only include optional fields with valid values. */
export function buildCreateRoadmapRequest(
  jobCategory: string,
  level: string,
  input: Pick<
    CreateRoadmapInput,
    'name' | 'cvId' | 'sessionIds' | 'reportIds' | 'cvAnalysisId' | 'priorRoadmapId' | 'focus' | 'language' | 'scope'
  >,
): BuildCreateRoadmapPayloadResult {
  if (!jobCategory.trim() || !level.trim()) {
    return { ok: false, reason: 'invalid_input' };
  }

  const focus = input.focus?.trim() ?? '';
  if (focus.length > ROADMAP_FOCUS_MAX_CHARS) {
    return { ok: false, reason: 'focus_too_long' };
  }

  const name = input.name?.trim() ?? '';
  if (name.length > ROADMAP_NAME_MAX_CHARS) {
    return { ok: false, reason: 'name_too_long' };
  }

  const sessionIds = uniqueNonEmptyIds(input.sessionIds ?? input.reportIds);
  const body: CreateRoadmapApiRequest = {
    jobCategory: jobCategory.trim(),
    level,
    language: input.language ?? 'vi',
  };

  // Chỉ gửi khi khác mặc định — backend coi vắng mặt là "Standard", nên gửi thừa
  // không sai nhưng làm payload nói nhiều hơn ý định của người dùng.
  if (input.scope && input.scope !== 'Standard') body.scope = input.scope;
  if (input.cvId?.trim()) body.cvId = input.cvId.trim();
  if (sessionIds.length > 0) body.sessionIds = sessionIds;
  if (input.cvAnalysisId?.trim()) body.cvAnalysisId = input.cvAnalysisId.trim();
  if (input.priorRoadmapId?.trim()) body.priorRoadmapId = input.priorRoadmapId.trim();
  if (focus) body.focus = focus;
  if (name) body.name = name;

  return { ok: true, body };
}
