import type {
  CampaignQuestionResponse,
  CampaignResponse,
  CampaignRubricCriterionResponse,
  CampaignJobNeed,
} from '../types/campaign.api.types';
import type {
  CampaignProctoringConfig,
  CampaignQuestion,
  EmployerCampaign,
  EmployerCampaignStatus,
  RubricCriterion,
} from '../types/campaignManagement.types';

const LIST_DEFAULT_PROCTORING: CampaignProctoringConfig = {
  faceCaptureIntervalSeconds: 90,
  faceSimilarityThreshold: 0.75,
  maxViolations: 3,
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function pickString(record: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = asString(record[key]);
    if (value) return value;
  }
  return undefined;
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = asNumber(record[key]);
    if (value != null) return value;
  }
  return undefined;
}

function pickBoolean(record: Record<string, unknown>, ...keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') return value;
  }
  return undefined;
}

export function unwrapCampaignListPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const record = asRecord(data);
  if (!record) return [];
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.campaigns)) return record.campaigns;
  const nested = asRecord(record.data);
  if (nested) {
    if (Array.isArray(nested.items)) return nested.items;
    if (Array.isArray(nested.campaigns)) return nested.campaigns;
  }
  return [];
}

/** Detail may be bare CampaignResponse or wrapped as `{ data: CampaignResponse }`. */
export function unwrapCampaignDetailPayload(data: unknown): unknown {
  const record = asRecord(data);
  if (!record) return data;
  if ('id' in record || 'Id' in record || 'title' in record || 'Title' in record) {
    return record;
  }
  if (record.data != null) return record.data;
  return data;
}

function parseRubric(raw: unknown): CampaignRubricCriterionResponse[] {
  if (!Array.isArray(raw)) return [];
  const result: CampaignRubricCriterionResponse[] = [];
  raw.forEach((item, index) => {
    const record = asRecord(item);
    if (!record) return;
    const name = pickString(record, 'name', 'Name');
    const weight = pickNumber(record, 'weight', 'Weight');
    if (!name || weight == null) return;
    const levels = parseRubricLevels(record.levels ?? record.Levels);
    result.push({
      id: pickString(record, 'id', 'Id') ?? `criterion-${index}`,
      orderNo: pickNumber(record, 'orderNo', 'OrderNo') ?? index + 1,
      name,
      weight,
      description: pickString(record, 'description', 'Description') ?? null,
      maxScore: pickNumber(record, 'maxScore', 'MaxScore') ?? null,
      minPct: pickNumber(record, 'minPct', 'MinPct', 'minimumPct', 'MinimumPct'),
      source: pickString(record, 'source', 'Source') ?? null,
      levels,
    });
  });
  return result;
}

function parseRubricLevels(raw: unknown): CampaignRubricCriterionResponse['levels'] {
  if (!Array.isArray(raw)) return null;
  const levels = raw.flatMap((item) => {
    const record = asRecord(item);
    if (!record) return [];
    const score = pickNumber(record, 'score', 'Score');
    const descriptor = pickString(record, 'descriptor', 'Descriptor');
    return score != null && descriptor ? [{ score, descriptor }] : [];
  });
  return levels;
}

function parseQuestions(raw: unknown): CampaignQuestionResponse[] {
  if (!Array.isArray(raw)) return [];
  const result: CampaignQuestionResponse[] = [];
  raw.forEach((item, index) => {
    const record = asRecord(item);
    if (!record) return;
    const prompt = pickString(
      record,
      'questionText',
      'QuestionText',
      'prompt',
      'Prompt',
      'text',
      'Text',
      'content',
      'Content',
    );
    if (!prompt) return;
    result.push({
      id: pickString(record, 'id', 'Id') ?? `question-${index}`,
      questionText: prompt,
      prompt,
      skill: null,
      difficulty: null,
      source: pickString(record, 'source', 'Source') ?? null,
      isRequired:
        typeof record.isRequired === 'boolean'
          ? record.isRequired
          : typeof record.IsRequired === 'boolean'
            ? record.IsRequired
            : null,
      questionGroup: pickString(record, 'questionGroup', 'QuestionGroup') ?? null,
      hrEditedAt: pickString(record, 'hrEditedAt', 'HrEditedAt') ?? null,
    });
  });
  return result;
}

function parseJobNeeds(raw: unknown): CampaignJobNeed[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const record = asRecord(item);
    if (!record) return [];
    const needId = pickString(record, 'needId', 'NeedId');
    const text = pickString(record, 'text', 'Text');
    if (!needId || !text) return [];
    return [{
      needId,
      category: pickString(record, 'category', 'Category') ?? 'Technical',
      text,
      isMustHave: pickBoolean(record, 'isMustHave', 'IsMustHave') ?? false,
      source: pickString(record, 'source', 'Source') ?? null,
    }];
  });
}

export function parseCampaignResponse(raw: unknown): CampaignResponse | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record, 'id', 'Id', 'campaignId', 'CampaignId');
  const title = pickString(record, 'title', 'Title', 'name', 'Name');
  if (!id || !title) return null;

  return {
    id,
    title,
    domain: pickString(record, 'domain', 'Domain') ?? null,
    orgId: pickString(record, 'orgId', 'OrgId', 'organizationId', 'OrganizationId') ?? null,
    status: pickString(record, 'status', 'Status') ?? 'draft',
    language: pickString(record, 'language', 'Language') ?? null,
    seniority: pickString(record, 'seniority', 'Seniority') ?? null,
    jobDescription: pickString(record, 'jobDescription', 'JobDescription', 'jdText', 'JdText') ?? null,
    jdText: pickString(record, 'jdText', 'JdText') ?? null,
    criteriaText: pickString(record, 'criteriaText', 'CriteriaText') ?? null,
    requiredSkills: asStringArray(record.requiredSkills ?? record.RequiredSkills),
    keywordsAny: asStringArray(record.keywordsAny ?? record.KeywordsAny),
    minYearsExperience: pickNumber(record, 'minYearsExperience', 'MinYearsExperience') ?? null,
    capacity: pickNumber(record, 'capacity', 'Capacity', 'maxCandidates', 'MaxCandidates') ?? null,
    questionBank: (() => { const bank = asRecord(record.questionBank ?? record.QuestionBank); return bank ? { total: pickNumber(bank, 'total', 'Total'), alwaysAsked: pickNumber(bank, 'alwaysAsked', 'AlwaysAsked'), questionsPerSession: pickNumber(bank, 'questionsPerSession', 'QuestionsPerSession'), groups: Array.isArray(bank.groups) ? bank.groups as Array<{ name: string; count: number }> : [], warnings: Array.isArray(bank.warnings) ? asStringArray(bank.warnings) : [] } : null; })(),
    cvCount: pickNumber(record, 'cvCount', 'CvCount') ?? null,
    invitedCount: pickNumber(record, 'invitedCount', 'InvitedCount') ?? null,
    completedCount: pickNumber(record, 'completedCount', 'CompletedCount') ?? null,
    maxCandidates: pickNumber(record, 'maxCandidates', 'MaxCandidates') ?? null,
    deadline: pickString(record, 'deadline', 'Deadline', 'endDate', 'EndDate', 'expiresAt', 'ExpiresAt') ?? null,
    endDate: pickString(record, 'endDate', 'EndDate', 'expiresAt', 'ExpiresAt') ?? null,
    startsAt: pickString(record, 'startsAt', 'StartsAt') ?? null,
    expiresAt: pickString(record, 'expiresAt', 'ExpiresAt') ?? null,
    durationMinutes:
      pickNumber(record, 'durationMinutes', 'DurationMinutes', 'timeLimitMinutes', 'TimeLimitMinutes') ?? null,
    timeLimitMinutes: pickNumber(record, 'timeLimitMinutes', 'TimeLimitMinutes') ?? null,
    passScorePct: pickNumber(record, 'passScorePct', 'PassScorePct') ?? null,
    antiCheatEnabled: pickBoolean(record, 'antiCheatEnabled', 'AntiCheatEnabled') ?? null,
    faceVerifyEnabled: pickBoolean(record, 'faceVerifyEnabled', 'FaceVerifyEnabled') ?? null,
    adaptiveEnabled: pickBoolean(record, 'adaptiveEnabled', 'AdaptiveEnabled') ?? null,
    groundingEnabled: pickBoolean(record, 'groundingEnabled', 'GroundingEnabled') ?? null,
    maxConcurrentInterviews: pickNumber(record, 'maxConcurrentInterviews', 'MaxConcurrentInterviews') ?? null,
    maxFollowUps: pickNumber(record, 'maxFollowUps', 'MaxFollowUps') ?? null,
    maxQuestions: pickNumber(record, 'maxQuestions', 'MaxQuestions') ?? null,
    questionsPerSession: pickNumber(record, 'questionsPerSession', 'QuestionsPerSession') ?? null,
    maxDeepPerQuestion: pickNumber(record, 'maxDeepPerQuestion', 'MaxDeepPerQuestion') ?? null,
    skipPenalty: pickBoolean(record, 'skipPenalty', 'SkipPenalty') ?? null,
    organizationId: pickString(record, 'organizationId', 'OrganizationId') ?? null,
    createdAt: pickString(record, 'createdAt', 'CreatedAt') ?? null,
    updatedAt: pickString(record, 'updatedAt', 'UpdatedAt') ?? null,
    rubric: parseRubric(record.criteria ?? record.Criteria ?? record.rubric ?? record.Rubric),
    jobNeeds: parseJobNeeds(record.jobNeeds ?? record.JobNeeds),
    questions: parseQuestions(record.questions ?? record.Questions),
  };
}

export function parseCampaignResponseList(data: unknown): CampaignResponse[] {
  return unwrapCampaignListPayload(data)
    .map(parseCampaignResponse)
    .filter((item): item is CampaignResponse => item != null);
}

function mapStatus(value: string): EmployerCampaignStatus {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'active' || normalized === 'open' || normalized === 'published') return 'active';
  if (normalized === 'paused' || normalized === 'pause') return 'paused';
  if (normalized === 'archived') return 'archived';
  if (normalized === 'closed' || normalized === 'ended') return 'closed';
  return 'draft';
}

function mapRubric(items: CampaignRubricCriterionResponse[] | null | undefined): RubricCriterion[] {
  return (items ?? []).map((item, index) => ({
    id: item.id?.trim() || `criterion-${index}`,
    name: item.name,
    weight: item.weight,
    description: item.description?.trim() || '',
    maxScore: item.maxScore != null && Number(item.maxScore) > 0 ? Number(item.maxScore) : 10,
    minPct: item.minPct ?? null,
    levels: item.levels?.length ? item.levels : undefined,
  }));
}

function mapQuestionSource(value: string | null | undefined): CampaignQuestion['source'] {
  return (value ?? '').trim().toLowerCase() === 'aigenerated' ? 'ai' : 'manual';
}

function mapQuestions(items: CampaignQuestionResponse[] | null | undefined): CampaignQuestion[] {
  return (items ?? []).map((item, index) => ({
    id: item.id?.trim() || `question-${index}`,
    prompt: item.questionText?.trim() || item.prompt?.trim() || '',
    skill: '',
    difficulty: 'middle',
    source: mapQuestionSource(item.source),
    isRequired: item.isRequired ?? true,
    questionGroup: item.questionGroup ?? null,
  }));
}

/** Map API campaign → UI model used by list / detail screens. */
export function mapCampaignResponseToEmployerCampaign(item: CampaignResponse): EmployerCampaign {
  const now = new Date().toISOString();
  const capacity = item.capacity ?? item.maxCandidates ?? 0;
  const deadline = item.deadline ?? item.endDate ?? now;

  return {
    id: item.id,
    title: item.title,
    domain: item.domain?.trim() || undefined,
    status: mapStatus(item.status),
    jobDescription: item.jobDescription?.trim() || '',
    capacity,
    cvCount: item.cvCount ?? null,
    invitedCount: item.invitedCount ?? null,
    completedCount: item.completedCount ?? null,
    deadline,
    startsAt: item.startsAt?.trim() || undefined,
    durationMinutes: item.durationMinutes ?? item.timeLimitMinutes ?? 0,
    passScorePct: item.passScorePct ?? null,
    skipPenalty: item.skipPenalty ?? null,
    antiCheatEnabled:
      item.antiCheatEnabled ??
      LIST_DEFAULT_PROCTORING.maxViolations > 0,
    faceVerifyEnabled: item.faceVerifyEnabled ?? false,
    adaptiveEnabled: item.adaptiveEnabled ?? false,
    groundingEnabled: item.groundingEnabled ?? false,
    maxConcurrentInterviews: item.maxConcurrentInterviews ?? null,
    maxDeepPerQuestion: item.maxDeepPerQuestion ?? null,
    maxFollowUps: item.maxFollowUps ?? null,
    maxQuestions: item.maxQuestions ?? null,
    questionsPerSession: item.questionsPerSession ?? null,
    questionBank: item.questionBank,
    questionBankWarnings: item.questionBank?.warnings ?? [],
    rubric: mapRubric(item.rubric),
    questions: mapQuestions(item.questions),
    jobNeeds: item.jobNeeds ?? [],
    requiredSkills: item.requiredSkills ?? [],
    keywordsAny: item.keywordsAny ?? [],
    minYearsExperience: item.minYearsExperience ?? null,
    createdAt: item.createdAt ?? now,
    updatedAt: item.createdAt ?? now,
  } as EmployerCampaign;
}
