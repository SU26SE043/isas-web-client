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
  faceVerifyEnabled?: boolean | null;
  adaptiveEnabled?: boolean | null;
  maxFollowUps?: number | null;
  maxQuestions?: number | null;
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
  /** Preserve when replacing an existing server question; omit for new HR questions. */
  id?: string;
  questionText: string;
  source: 'AiGenerated' | 'CustomHr';
  isRequired: boolean;
};

/** PUT /api/v1/campaign/{id}/questions — full replace array body. */
export type UpdateCampaignQuestionRequest = CampaignCreateQuestionRequest;

export type GenerateCampaignQuestionsParams = {
  campaignId: string;
  /** When omitted, backend uses its default count. */
  count?: number;
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
  faceVerifyEnabled: boolean;
  adaptiveEnabled: boolean;
  /** Only meaningful when adaptiveEnabled; null when adaptive is off. */
  maxFollowUps?: number | null;
  /** Cap on total questions (0–20). Independent of adaptive interview. */
  maxQuestions?: number | null;
  jdText?: string | null;
  criteriaText?: string | null;
  criteria?: CampaignCreateCriterionRequest[] | null;
  startsAt: string;
  expiresAt: string;
  /** Required non-empty on create. */
  questions: CampaignCreateQuestionRequest[];
};

/**
 * PUT /api/v1/campaign/{id}/status — Active→Closed→Archived (Draft→Active uses /publish).
 */
export type CampaignStatusUpdateRequest = {
  status: 'Draft' | 'Active' | 'Closed' | 'Archived';
};

/**
 * PUT /api/v1/campaign/{id} — update Draft metadata / JD / criteria.
 * Every field is optional so callers can send only dirty/changed fields
 * (see `buildDirtyUpdateRequest`) — omit a field to leave it unchanged.
 * For nullable fields (e.g. `passScorePct`), sending `null` explicitly clears it;
 * omitting the field entirely keeps the current server value.
 */
export type CampaignUpdateRequest = {
  title?: string;
  domain?: string;
  maxCandidates?: number | null;
  timeLimitMinutes?: number;
  antiCheatEnabled?: boolean;
  faceVerifyEnabled?: boolean;
  adaptiveEnabled?: boolean;
  maxFollowUps?: number | null;
  maxQuestions?: number | null;
  passScorePct?: number | null;
  jdText?: string;
  criteriaText?: string;
  criteria?: CampaignCreateCriterionRequest[];
  startsAt?: string;
  expiresAt?: string;
};

/** POST /api/v1/campaign/{id}/invitations — invite by email list (Active only). */
export type CreateCampaignInvitationsRequest = {
  emails: string[];
};

export type CreatedCampaignInvitation = {
  id: string;
  email: string;
  /** ISO timestamp; present for successfully created invitations. */
  expiresAt: string;
};

export type FailedCampaignInvitation = {
  email: string;
  reason: string;
};

export type CreateCampaignInvitationsResponse = {
  created: CreatedCampaignInvitation[];
  failed: FailedCampaignInvitation[];
};

/** GET /api/v1/campaign/{id}/invitations — invitation history (keyset pagination). */
export type CampaignInvitationStatus =
  | 'Queued'
  | 'Sent'
  | 'Joined'
  | 'Expired'
  | 'Revoked';

export type CampaignInvitation = {
  id: string;
  email: string;
  status: CampaignInvitationStatus;
  createdAt: string;
  expiresAt: string;
  emailSentAt?: string | null;
  joinedAt?: string | null;
};

export type GetCampaignInvitationsQuery = {
  cursor?: string;
  limit?: number;
};

export type CampaignInvitationsPage = {
  items: CampaignInvitation[];
  nextCursor: string | null;
};

/** POST /api/v1/campaign/{id}/invitations/{invitationId}/reissue — no body. */
export type ReissuedCampaignInvitation = {
  id: string;
  email: string;
  expiresAt: string;
};

/** @deprecated Prefer CreateCampaignInvitationsRequest */
export type CampaignInviteByEmailRequest = CreateCampaignInvitationsRequest;
/** @deprecated Prefer CreatedCampaignInvitation */
export type CampaignInvitationCreatedItem = CreatedCampaignInvitation & {
  expiresAt?: string | null;
};
/** @deprecated Prefer FailedCampaignInvitation */
export type CampaignInvitationFailedItem = FailedCampaignInvitation;
/** @deprecated Prefer CreateCampaignInvitationsResponse */
export type CampaignInviteByEmailResponse = CreateCampaignInvitationsResponse;

/** POST /api/v1/campaign/{id}/candidates — multipart field `files` (202 Accepted). */
export type CandidateUploadResult = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  status: 'Filtered' | 'Rejected' | string;
  rejectReason?: string | null;
};

export type CandidateUploadResponse = {
  received: number;
  rejected: number;
  filtered: number;
  skipped: number;
  candidates: CandidateUploadResult[];
};

/** GET /api/v1/campaign/{id}/candidates query. */
export type CandidateListQuery = {
  status?: string;
  minScore?: number;
  skill?: string;
  sort?: 'score' | 'name';
};

export type CampaignCandidateListItem = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  status: string;
  overallMatchScore?: number | null;
  skills?: string[] | null;
};

export type CandidateCriterionScore = {
  criterionId: string;
  criterionName: string;
  matchScore: number;
  maxScore: number;
  reasoning?: string | null;
};

export type CampaignCandidateDetail = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  status: string;
  overallMatchScore?: number | null;
  skills?: string[] | null;
  yearsExperience?: number | null;
  summary?: string | null;
  rejectReason?: string | null;
  /** S3 key — not a public URL unless backend returns an absolute http(s) URL. */
  cvFileUrl?: string | null;
  criterionScores: CandidateCriterionScore[];
};

/** PATCH /api/v1/campaign/{id}/candidates/{candidateId} — only changed fields. */
export type UpdateCampaignCandidatePayload = {
  email?: string;
  fullName?: string;
};

/** POST /api/v1/campaign/{id}/candidates/invite */
export type InviteCampaignCandidatesRequest = {
  candidateIds: string[];
};

export type InvitedCandidateResult = {
  candidateId: string;
  invitationId: string;
  email: string;
};

export type FailedCandidateInvitation = {
  candidateId: string;
  reason: string;
};

export type InviteCampaignCandidatesResponse = {
  invited: InvitedCandidateResult[];
  failed: FailedCandidateInvitation[];
};

/** GET /api/v1/campaign/{id}/results — scored interview ranking only. */
export type CampaignResultFlag = {
  type: string;
  count: number;
  note?: string | null;
};

export type CampaignResultItem = {
  rank: number;
  candidateId: string;
  sessionId: string;
  fullName?: string | null;
  email?: string | null;
  totalScore: number;
  aiScore: number;
  overrideScore?: number | null;
  overrideResult?: string | null;
  overrideNote?: string | null;
  overriddenAt?: string | null;
  result?: 'Pass' | 'Fail' | null;
  scoredAt: string;
  flags: CampaignResultFlag[];
};

export type CampaignResultsResponse = {
  campaignId: string;
  passScorePct?: number | null;
  totalCandidates: number;
  results: CampaignResultItem[];
};
