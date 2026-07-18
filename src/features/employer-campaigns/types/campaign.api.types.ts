/**
 * API DTO for GET /api/v1/campaign and GET /api/v1/campaign/{id}
 * (camelCase per gateway contract).
 * List payloads may omit detail-only fields; mapper fills UI defaults.
 */
export type CampaignRubricCriterionResponse = {
  id?: string | null;
  name: string;
  weight: number;
  description?: string | null;
  maxScore?: number | null;
};

export type CampaignQuestionResponse = {
  id?: string | null;
  prompt: string;
  skill?: string | null;
  difficulty?: string | null;
  source?: string | null;
  isRequired?: boolean | null;
};

export type CampaignCandidateResponse = {
  email: string;
  displayName?: string | null;
  candidateId?: string | null;
  status?: string | null;
};

export type CampaignProctoringResponse = {
  faceCaptureIntervalSeconds?: number | null;
  faceSimilarityThreshold?: number | null;
  maxViolations?: number | null;
};

export type CampaignResponse = {
  id: string;
  title: string;
  domain?: string | null;
  company?: string | null;
  location?: string | null;
  mode?: string | null;
  status: string;
  summary?: string | null;
  jobDescription?: string | null;
  capacity?: number | null;
  applicants?: number | null;
  applicantCount?: number | null;
  maxCandidates?: number | null;
  deadline?: string | null;
  endDate?: string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  durationMinutes?: number | null;
  timeLimitMinutes?: number | null;
  passScorePct?: number | null;
  antiCheatEnabled?: boolean | null;
  locale?: string | null;
  organizationId?: string | null;
  welcomeMessage?: string | null;
  completionMessage?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  rubric?: CampaignRubricCriterionResponse[] | null;
  questions?: CampaignQuestionResponse[] | null;
  candidates?: CampaignCandidateResponse[] | null;
  invitedEmails?: string[] | null;
  proctoring?: CampaignProctoringResponse | null;
};

/** Shared criterion DTO for create/update. */
export type CampaignCreateCriterionRequest = {
  name: string;
  description?: string | null;
  /** Decimal 0 < weight <= 1 */
  weight: number;
  maxScore: number;
};

export type CampaignCreateQuestionRequest = {
  questionText: string;
  source: 'AiGenerated' | 'CustomHr';
  isRequired: boolean;
};

/** POST /api/v1/campaign — create Draft after wizard completes (Employer). */
export type CampaignCreateRequest = {
  title: string;
  domain: string;
  maxCandidates?: number | null;
  timeLimitMinutes: number;
  /** 0..100; null = HR decides */
  passScorePct?: number | null;
  antiCheatEnabled: boolean;
  jdText?: string | null;
  criteriaText?: string | null;
  criteria?: CampaignCreateCriterionRequest[] | null;
  startsAt: string;
  expiresAt: string;
  /** Required non-empty on create. */
  questions: CampaignCreateQuestionRequest[];
};

/**
 * PUT /api/v1/campaign/{id} — update Draft metadata / JD / criteria.
 * Omit fields you do not want to change. Do not put questions here.
 */
export type CampaignUpdateRequest = {
  title?: string;
  domain?: string;
  maxCandidates?: number | null;
  timeLimitMinutes?: number;
  antiCheatEnabled?: boolean;
  passScorePct?: number | null;
  jdText?: string;
  criteriaText?: string;
  criteria?: CampaignCreateCriterionRequest[];
  startsAt?: string;
  expiresAt?: string;
};
