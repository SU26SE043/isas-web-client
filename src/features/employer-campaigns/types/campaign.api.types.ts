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
};

export type CampaignQuestionResponse = {
  id?: string | null;
  prompt: string;
  skill?: string | null;
  difficulty?: string | null;
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
  durationMinutes?: number | null;
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
