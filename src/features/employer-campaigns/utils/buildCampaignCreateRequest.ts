import type {
  CampaignCreateCriterionRequest,
  CampaignCreateQuestionRequest,
  CampaignCreateRequest,
  CampaignUpdateRequest,
} from '../types/campaign.api.types';
import type { CampaignDomainOption } from '../components/wizard/campaignWizard.steps';
import type {
  CampaignInfoState,
  CampaignSettingsState,
  JobDescriptionState,
} from '../types/campaignWizard.types';
import type { CampaignQuestion, EmployerCampaign, RubricCriterion } from '../types/campaignManagement.types';
import { isServerQuestionId } from './campaignQuestionLimits';

const DOMAIN_API_LABEL: Record<CampaignDomainOption, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  'business-analyst': 'Business Analyst',
};

export function toIsoDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('INVALID_DATE');
  }
  return date.toISOString();
}

export function mapDomainToApiLabel(domain: CampaignDomainOption): string {
  return DOMAIN_API_LABEL[domain];
}

export function resolveDomainOption(value?: string | null): CampaignDomainOption | '' {
  const normalized = (value ?? '').trim().toLowerCase();
  if (!normalized) return '';
  if (normalized.includes('frontend') || normalized === 'frontend development') return 'frontend';
  if (normalized.includes('backend')) return 'backend';
  if (normalized.includes('business') || normalized.includes('analyst')) return 'business-analyst';
  return '';
}

export function mapRubricToCreateCriteria(
  rubric: RubricCriterion[],
): CampaignCreateCriterionRequest[] {
  return rubric
    .filter((item) => item.name.trim())
    .map((item) => {
      const rawWeight = Number(item.weight);
      const weight = rawWeight > 1 ? Number((rawWeight / 100).toFixed(4)) : rawWeight;
      return {
        name: item.name.trim(),
        description: item.description.trim() || null,
        weight,
        maxScore: Math.max(1, Math.round(Number(item.maxScore) || 1)),
      };
    });
}

/** The server owns question source; only preserve an id when editing an existing AI question. */
export function mapQuestionsToApiRequest(
  questions: CampaignQuestion[],
): CampaignCreateQuestionRequest[] {
  return questions
    .filter((item) => item.prompt.trim())
    .map((item) => {
      const payload: CampaignCreateQuestionRequest = {
        questionText: item.prompt.trim(),
        isRequired: item.isRequired,
      };
      if (isServerQuestionId(item.id)) {
        payload.id = item.id.trim();
      }
      return payload;
    });
}

function criteriaRequestToRubric(
  criteria: CampaignCreateCriterionRequest[] | null | undefined,
): RubricCriterion[] {
  return (criteria ?? []).map((item, index) => ({
    id: `criterion-${index}`,
    name: item.name,
    description: item.description?.trim() || '',
    weight: item.weight,
    maxScore: item.maxScore,
  }));
}

function questionRequestToUi(
  questions: CampaignCreateQuestionRequest[],
): CampaignQuestion[] {
  return questions.map((item, index) => ({
    id: `question-${index}`,
    prompt: item.questionText,
    skill: '',
    difficulty: 'middle' as const,
    source: item.source === 'AiGenerated' ? ('ai' as const) : ('manual' as const),
    isRequired: item.isRequired,
  }));
}

/**
 * Some CampaignResponse payloads omit nested criteria/questions even after a successful write.
 * Prefer response collections when present; otherwise keep what we just submitted.
 */
export function mergeCampaignWriteResult(
  mapped: EmployerCampaign,
  input: {
    criteria?: CampaignCreateCriterionRequest[] | null;
    questions?: CampaignCreateQuestionRequest[] | null;
    jdText?: string | null;
    title?: string;
    domain?: string;
    maxCandidates?: number | null;
    timeLimitMinutes?: number;
    startsAt?: string;
    expiresAt?: string;
  },
): EmployerCampaign {
  const next: EmployerCampaign = { ...mapped };

  if (!next.rubric.length && input.criteria?.length) {
    next.rubric = criteriaRequestToRubric(input.criteria);
  }
  if (!next.questions.length && input.questions?.length) {
    next.questions = questionRequestToUi(input.questions);
  }
  if (!next.jobDescription.trim() && input.jdText?.trim()) {
    next.jobDescription = input.jdText.trim();
    next.summary = next.summary || input.jdText.trim().slice(0, 200);
  }
  if (input.title?.trim()) next.title = input.title.trim();
  if (input.domain?.trim()) {
    next.domain = input.domain.trim();
    next.company = input.domain.trim();
  }
  if (input.maxCandidates && input.maxCandidates > 0) next.capacity = input.maxCandidates;
  if (input.timeLimitMinutes && input.timeLimitMinutes > 0) {
    next.durationMinutes = input.timeLimitMinutes;
  }
  if (input.expiresAt) next.deadline = input.expiresAt;
  if (input.startsAt) next.startsAt = input.startsAt;

  return next;
}

function resolveJdTextForCreate(jd: JobDescriptionState): string | null {
  if (jd.inputMethod !== 'text') return null;
  const text = jd.jdText.trim();
  return text || null;
}

function resolveJdTextForUpdate(jd: JobDescriptionState): string | undefined {
  if (jd.inputMethod !== 'text') return undefined;
  const text = jd.jdText.trim();
  return text || undefined;
}

export type CampaignWizardSubmitSnapshot = {
  info: CampaignInfoState;
  jd: JobDescriptionState;
  rubric: RubricCriterion[];
  questions: CampaignQuestion[];
  settings: CampaignSettingsState;
};

/**
 * Build POST /api/v1/campaign body from the full wizard (all 6 steps).
 * File-based JD is omitted (jdText: null) — the file itself is uploaded once,
 * right after this create call succeeds (see useCampaignWizard.handleCreateCampaign).
 */
export function buildCampaignCreateRequest(
  snapshot: CampaignWizardSubmitSnapshot,
): CampaignCreateRequest {
  const { info, settings } = snapshot;
  if (!info.domain) {
    throw new Error('DOMAIN_REQUIRED');
  }

  const questions = mapQuestionsToApiRequest(snapshot.questions);
  if (questions.length === 0) {
    throw new Error('QUESTIONS_REQUIRED');
  }

  return {
    title: info.title.trim(),
    domain: mapDomainToApiLabel(info.domain),
    maxCandidates:
      info.maxCandidates && info.maxCandidates > 0 ? info.maxCandidates : undefined,
    timeLimitMinutes: info.timeLimitMinutes,
    passScorePct: info.passScorePct ?? null,
    antiCheatEnabled: settings.antiCheatEnabled,
    faceVerifyEnabled: settings.faceVerifyEnabled,
    adaptiveEnabled: settings.adaptiveEnabled,
    groundingEnabled: false,
    maxFollowUps: settings.adaptiveEnabled ? settings.maxFollowUps : undefined,
    maxQuestions: settings.maxQuestions > 0 ? settings.maxQuestions : undefined,
    maxDeepPerQuestion: null,
    jdText: resolveJdTextForCreate(snapshot.jd),
    criteriaText: snapshot.jd.criteriaText.trim() || null,
    criteria: mapRubricToCreateCriteria(snapshot.rubric),
    startsAt: toIsoDateTime(info.startsAt),
    expiresAt: toIsoDateTime(info.expiresAt),
    questions,
  };
}

/**
 * Build PUT /api/v1/campaign/{id} body (no questions) with every updatable field set.
 * Prefer `buildDirtyUpdateRequest` when editing so only changed fields are sent.
 */
export function buildCampaignUpdateRequest(
  snapshot: CampaignWizardSubmitSnapshot,
): CampaignUpdateRequest {
  const { info, settings } = snapshot;
  if (!info.domain) {
    throw new Error('DOMAIN_REQUIRED');
  }

  return {
    title: info.title.trim(),
    domain: mapDomainToApiLabel(info.domain),
    maxCandidates:
      info.maxCandidates && info.maxCandidates > 0 ? info.maxCandidates : undefined,
    timeLimitMinutes: info.timeLimitMinutes,
    antiCheatEnabled: settings.antiCheatEnabled,
    faceVerifyEnabled: settings.faceVerifyEnabled,
    adaptiveEnabled: settings.adaptiveEnabled,
    groundingEnabled: false,
    // v10 treats null for these limits as "keep existing" on PUT; omit when UI has no limit.
    maxFollowUps: settings.adaptiveEnabled ? settings.maxFollowUps : undefined,
    maxQuestions: settings.maxQuestions > 0 ? settings.maxQuestions : undefined,
    maxDeepPerQuestion: null,
    passScorePct: info.passScorePct ?? null,
    jdText: resolveJdTextForUpdate(snapshot.jd),
    criteriaText: snapshot.jd.criteriaText.trim() || undefined,
    criteria: mapRubricToCreateCriteria(snapshot.rubric),
    startsAt: toIsoDateTime(info.startsAt),
    expiresAt: toIsoDateTime(info.expiresAt),
  };
}

/**
 * Diff two full update payloads and keep only the fields that changed.
 * Used on edit-mode save so PUT /api/v1/campaign/{id} only sends dirty fields.
 */
export function buildDirtyUpdateRequest(
  baseline: CampaignWizardSubmitSnapshot,
  current: CampaignWizardSubmitSnapshot,
): CampaignUpdateRequest {
  const baselinePayload = buildCampaignUpdateRequest(baseline);
  const currentPayload = buildCampaignUpdateRequest(current);
  const dirty: CampaignUpdateRequest = {};

  (Object.keys(currentPayload) as Array<keyof CampaignUpdateRequest>).forEach((key) => {
    const before = baselinePayload[key];
    const after = currentPayload[key];
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      (dirty as Record<string, unknown>)[key] = after;
    }
  });

  return dirty;
}
