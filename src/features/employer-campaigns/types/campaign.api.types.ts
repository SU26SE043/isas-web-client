/**
 * API DTO for GET /api/v1/campaign and GET /api/v1/campaign/{id}
 * (camelCase per gateway contract).
 * List payloads may omit detail-only fields; mapper fills UI defaults.
 */
export type CampaignStatus = 'Draft' | 'Active' | 'Closed' | 'Archived';
export type CampaignLanguage = 'vi' | 'en';
export type CampaignSeniority = 'Fresher' | 'Junior' | 'Middle' | 'Senior';
export type CampaignQuestionSource = 'AiGenerated' | 'CustomHr';
export type CampaignCriterionSource = 'AiSuggested' | 'HrEdited';

export type CampaignRubricCriterionResponse = {
  id?: string | null;
  orderNo?: number | null;
  name: string;
  weight: number;
  description?: string | null;
  maxScore?: number | null;
  source?: CampaignCriterionSource | string | null;
};

export type CampaignQuestionResponse = {
  id?: string | null;
  questionText?: string | null;
  prompt?: string | null;
  skill?: string | null;
  difficulty?: string | null;
  source?: CampaignQuestionSource | string | null;
  isRequired?: boolean | null;
  hrEditedAt?: string | null;
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
  orgId?: string | null;
  title: string;
  domain?: string | null;
  company?: string | null;
  location?: string | null;
  mode?: string | null;
  status: CampaignStatus | string;
  language?: CampaignLanguage | string | null;
  seniority?: CampaignSeniority | string | null;
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
  groundingEnabled?: boolean | null;
  maxConcurrentInterviews?: number | null;
  maxDeepPerQuestion?: number | null;
  maxFollowUps?: number | null;
  maxQuestions?: number | null;
  locale?: string | null;
  organizationId?: string | null;
  welcomeMessage?: string | null;
  completionMessage?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  rubric?: CampaignRubricCriterionResponse[] | null;
  criteria?: CampaignRubricCriterionResponse[] | null;
  criteriaText?: string | null;
  jdText?: string | null;
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
  source?: CampaignQuestionSource;
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
  language?: CampaignLanguage;
  seniority?: CampaignSeniority;
  maxCandidates?: number | null;
  timeLimitMinutes: number;
  /** 0..100; null = HR decides */
  passScorePct?: number | null;
  antiCheatEnabled: boolean;
  faceVerifyEnabled: boolean;
  adaptiveEnabled: boolean;
  groundingEnabled: boolean;
  maxConcurrentInterviews?: number | null;
  /** Only meaningful when adaptiveEnabled; null when adaptive is off. */
  maxFollowUps?: number | null;
  /** Cap on total questions (0–20). Independent of adaptive interview. */
  maxQuestions?: number | null;
  maxDeepPerQuestion?: number | null;
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
  language?: CampaignLanguage;
  seniority?: CampaignSeniority;
  maxCandidates?: number | null;
  timeLimitMinutes?: number;
  antiCheatEnabled?: boolean;
  faceVerifyEnabled?: boolean;
  adaptiveEnabled?: boolean;
  groundingEnabled?: boolean;
  maxConcurrentInterviews?: number | null;
  maxFollowUps?: number | null;
  maxQuestions?: number | null;
  maxDeepPerQuestion?: number | null;
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
  sentAt?: string | null;
  revokedAt?: string | null;
  campaignCandidateId?: string | null;
  joinedAt?: string | null;
};

export type GetCampaignInvitationsQuery = {
  cursor?: string;
  limit?: number;
  status?: CampaignInvitationStatus;
  search?: string;
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
  search?: string;
  cursor?: string;
  limit?: number;
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

/** GET /api/v1/campaign/{id}/results — scored ranking + unscored flagged candidates. */
export type CampaignResultStatus = 'Pass' | 'Fail' | null;

export type CampaignResultFlag = {
  type: string;
  count: number;
  note?: string | null;
};

export type CampaignScoredResult = {
  rank: number;
  candidateId: string;
  sessionId: string;
  fullName?: string | null;
  email?: string | null;
  /** Effective score after override. */
  totalScore: number;
  /** Original AI score. */
  aiScore: number;
  overrideScore?: number | null;
  overrideResult?: CampaignResultStatus;
  overrideNote?: string | null;
  overriddenAt?: string | null;
  result: CampaignResultStatus;
  scoredAt: string;
  flags: CampaignResultFlag[];
};

/** Spec alias — same shape as CampaignScoredResult. */
export type CampaignResultItem = CampaignScoredResult;
export type CampaignRankingResult = CampaignScoredResult;

export type CampaignUnscoredFlaggedResult = {
  candidateId: string;
  sessionId: string;
  fullName?: string | null;
  email?: string | null;
  flags: CampaignResultFlag[];
};

export type CampaignResultsResponse = {
  campaignId: string;
  passScorePct?: number | null;
  totalCandidates: number;
  results: CampaignScoredResult[];
  /** v5: flagged candidates without scored ranking rows. */
  unscoredFlagged: CampaignUnscoredFlaggedResult[];
};

export type CampaignResultExportFormat = 'csv' | 'pdf';

export type TranscriptCriterionScore = {
  criterionId: string;
  criterionName?: string | null;
  score: number;
  maxScore?: number | null;
  reasoning?: string | null;
};

export type TranscriptQuestion = {
  questionId: string;
  orderNo: number;
  content: string;
  transcript?: string | null;
  needsReview: boolean;
  scores: TranscriptCriterionScore[];
};

export type CampaignTranscriptResponse = {
  sessionId: string;
  questions: TranscriptQuestion[];
};

export type OverrideCampaignResultPayload = {
  score: number | null;
  result: 'Pass' | 'Fail' | null;
  note: string;
};
