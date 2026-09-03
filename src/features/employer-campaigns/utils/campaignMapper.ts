import type {
  CampaignCandidateResponse,
  CampaignProctoringResponse,
  CampaignQuestionResponse,
  CampaignResponse,
  CampaignRubricCriterionResponse,
  CampaignJobNeed,
} from '../types/campaign.api.types';
import type {
  CampaignCandidateRow,
  CampaignCandidateStatus,
  CampaignLocale,
  CampaignProctoringConfig,
  CampaignQuestion,
  EmployerCampaign,
  EmployerCampaignMode,
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
      skill: pickString(record, 'skill', 'Skill') ?? null,
      difficulty: pickString(record, 'difficulty', 'Difficulty') ?? null,
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

function parseCandidates(raw: unknown): CampaignCandidateResponse[] {
  if (!Array.isArray(raw)) return [];
  const result: CampaignCandidateResponse[] = [];
  for (const item of raw) {
    const record = asRecord(item);
    if (!record) continue;
    const email = pickString(record, 'email', 'Email');
    if (!email) continue;
    result.push({
      email,
      displayName: pickString(record, 'displayName', 'DisplayName', 'fullName', 'FullName') ?? null,
      candidateId: pickString(record, 'candidateId', 'CandidateId') ?? null,
      status: pickString(record, 'status', 'Status') ?? null,
    });
  }
  return result;
}

function parseInvitedEmails(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => asString(item)).filter((item): item is string => Boolean(item));
}

function parseProctoring(raw: unknown): CampaignProctoringResponse | null {
  const record = asRecord(raw);
  if (!record) return null;
  return {
    faceCaptureIntervalSeconds: pickNumber(record, 'faceCaptureIntervalSeconds', 'FaceCaptureIntervalSeconds') ?? null,
    faceSimilarityThreshold: pickNumber(record, 'faceSimilarityThreshold', 'FaceSimilarityThreshold') ?? null,
    maxViolations: pickNumber(record, 'maxViolations', 'MaxViolations') ?? null,
  };
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
    company: pickString(record, 'company', 'Company') ?? null,
    location: pickString(record, 'location', 'Location') ?? null,
    mode: pickString(record, 'mode', 'Mode', 'workingMode', 'WorkingMode') ?? null,
    status: pickString(record, 'status', 'Status') ?? 'draft',
    language: pickString(record, 'language', 'Language') ?? null,
    seniority: pickString(record, 'seniority', 'Seniority') ?? null,
    summary: pickString(record, 'summary', 'Summary', 'description', 'Description') ?? null,
    jobDescription: pickString(record, 'jobDescription', 'JobDescription', 'jdText', 'JdText') ?? null,
    jdText: pickString(record, 'jdText', 'JdText') ?? null,
    criteriaText: pickString(record, 'criteriaText', 'CriteriaText') ?? null,
    capacity: pickNumber(record, 'capacity', 'Capacity', 'maxCandidates', 'MaxCandidates') ?? null,
    applicants: pickNumber(record, 'applicants', 'Applicants', 'applicantCount', 'ApplicantCount') ?? null,
    applicantCount: pickNumber(record, 'applicantCount', 'ApplicantCount') ?? null,
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
    questionBankSummary: (() => { const summary = asRecord(record.questionBankSummary ?? record.QuestionBankSummary); return summary ? { total: pickNumber(summary, 'total', 'Total') } : null; })(),
    maxDeepPerQuestion: pickNumber(record, 'maxDeepPerQuestion', 'MaxDeepPerQuestion') ?? null,
    skipPenalty: pickBoolean(record, 'skipPenalty', 'SkipPenalty') ?? null,
    locale: pickString(record, 'locale', 'Locale') ?? null,
    organizationId: pickString(record, 'organizationId', 'OrganizationId') ?? null,
    welcomeMessage: pickString(record, 'welcomeMessage', 'WelcomeMessage') ?? null,
    completionMessage: pickString(record, 'completionMessage', 'CompletionMessage') ?? null,
    createdAt: pickString(record, 'createdAt', 'CreatedAt') ?? null,
    updatedAt: pickString(record, 'updatedAt', 'UpdatedAt') ?? null,
    rubric: parseRubric(record.criteria ?? record.Criteria ?? record.rubric ?? record.Rubric),
    jobNeeds: parseJobNeeds(record.jobNeeds ?? record.JobNeeds),
    questions: parseQuestions(record.questions ?? record.Questions),
    candidates: parseCandidates(record.candidates ?? record.Candidates),
    invitedEmails: parseInvitedEmails(record.invitedEmails ?? record.InvitedEmails),
    proctoring: parseProctoring(record.proctoring ?? record.Proctoring),
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

function mapMode(value: string | null | undefined): EmployerCampaignMode {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized === 'hybrid') return 'hybrid';
  if (normalized === 'onsite' || normalized === 'on-site' || normalized === 'on_site') return 'onsite';
  return 'remote';
}

function mapLocale(value: string | null | undefined): CampaignLocale {
  return value?.trim().toLowerCase() === 'en' ? 'en' : 'vi';
}

function mapDifficulty(value: string | null | undefined): CampaignQuestion['difficulty'] {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized === 'senior') return 'senior';
  if (normalized === 'junior') return 'junior';
  return 'middle';
}

function mapCandidateStatus(value: string | null | undefined): CampaignCandidateStatus {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized === 'invited' || normalized === 'linked') return 'invited';
  return 'invite_pending';
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
    skill: item.skill?.trim() || '',
    difficulty: mapDifficulty(item.difficulty),
    source: mapQuestionSource(item.source),
    isRequired: item.isRequired ?? true,
    questionGroup: item.questionGroup ?? null,
  }));
}

function mapCandidates(items: CampaignCandidateResponse[] | null | undefined): CampaignCandidateRow[] {
  return (items ?? []).map((item) => ({
    email: item.email,
    displayName: item.displayName?.trim() || undefined,
    candidateId: item.candidateId?.trim() || undefined,
    status: mapCandidateStatus(item.status),
  }));
}

function mapProctoring(value: CampaignProctoringResponse | null | undefined): CampaignProctoringConfig {
  return {
    faceCaptureIntervalSeconds:
      value?.faceCaptureIntervalSeconds ?? LIST_DEFAULT_PROCTORING.faceCaptureIntervalSeconds,
    faceSimilarityThreshold:
      value?.faceSimilarityThreshold ?? LIST_DEFAULT_PROCTORING.faceSimilarityThreshold,
    maxViolations: value?.maxViolations ?? LIST_DEFAULT_PROCTORING.maxViolations,
  };
}

/** Map API campaign → UI model used by list / detail screens. */
export function mapCampaignResponseToEmployerCampaign(item: CampaignResponse): EmployerCampaign {
  const now = new Date().toISOString();
  const capacity = item.capacity ?? item.maxCandidates ?? 0;
  const candidates = mapCandidates(item.candidates);
  const applicants = item.applicants ?? item.applicantCount ?? candidates.length;
  const deadline = item.deadline ?? item.endDate ?? now;
  const invitedEmails =
    item.invitedEmails && item.invitedEmails.length > 0
      ? item.invitedEmails
      : candidates.map((row) => row.email);

  return {
    id: item.id,
    title: item.title,
    domain: item.domain?.trim() || undefined,
    company: item.company?.trim() || item.domain?.trim() || '—',
    location: item.location?.trim() || '—',
    mode: mapMode(item.mode),
    status: mapStatus(item.status),
    summary: item.summary?.trim() || '',
    jobDescription: item.jobDescription?.trim() || '',
    capacity,
    applicants,
    deadline,
    startsAt: item.startsAt?.trim() || undefined,
    durationMinutes: item.durationMinutes ?? item.timeLimitMinutes ?? 0,
    passScorePct: item.passScorePct ?? null,
    skipPenalty: item.skipPenalty ?? null,
    antiCheatEnabled:
      item.antiCheatEnabled ??
      (mapProctoring(item.proctoring).maxViolations > 0),
    faceVerifyEnabled: item.faceVerifyEnabled ?? false,
    adaptiveEnabled: item.adaptiveEnabled ?? false,
    groundingEnabled: item.groundingEnabled ?? false,
    maxConcurrentInterviews: item.maxConcurrentInterviews ?? null,
    maxDeepPerQuestion: item.maxDeepPerQuestion ?? null,
    maxFollowUps: item.maxFollowUps ?? null,
    maxQuestions: item.maxQuestions ?? null,
    questionsPerSession: item.questionsPerSession ?? null,
    questionBankSummary: item.questionBankSummary ?? null,
    locale: mapLocale(item.locale),
    rubric: mapRubric(item.rubric),
    questions: mapQuestions(item.questions),
    jobNeeds: item.jobNeeds ?? [],
    invitedEmails,
    candidates,
    proctoring: mapProctoring(item.proctoring),
    welcomeMessage: item.welcomeMessage?.trim() || '',
    completionMessage: item.completionMessage?.trim() || '',
    createdAt: item.createdAt ?? now,
    updatedAt: item.updatedAt ?? item.createdAt ?? now,
  };
}
