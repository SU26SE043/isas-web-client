export type EmployerCampaignStatus = 'draft' | 'active' | 'paused' | 'closed';
export type EmployerCampaignMode = 'remote' | 'hybrid' | 'onsite';
export type CampaignLocale = 'vi' | 'en';
export type CampaignCandidateStatus = 'invited' | 'invite_pending';

export interface CampaignProctoringConfig {
  faceCaptureIntervalSeconds: number;
  faceSimilarityThreshold: number;
  maxViolations: number;
}

export interface CampaignCandidateRow {
  email: string;
  displayName?: string;
  candidateId?: string;
  status: CampaignCandidateStatus;
}

export interface RubricCriterion {
  id: string;
  name: string;
  weight: number;
  description: string;
  maxScore: number;
}

export interface CampaignQuestion {
  id: string;
  prompt: string;
  skill: string;
  difficulty: 'junior' | 'middle' | 'senior';
}

export interface EmployerCampaign {
  id: string;
  title: string;
  /** API domain label when present (e.g. Frontend). */
  domain?: string;
  company: string;
  location: string;
  mode: EmployerCampaignMode;
  status: EmployerCampaignStatus;
  summary: string;
  jobDescription: string;
  capacity: number;
  applicants: number;
  deadline: string;
  startsAt?: string;
  durationMinutes: number;
  passScorePct?: number | null;
  antiCheatEnabled?: boolean;
  locale: CampaignLocale;
  rubric: RubricCriterion[];
  questions: CampaignQuestion[];
  invitedEmails: string[];
  candidates: CampaignCandidateRow[];
  proctoring: CampaignProctoringConfig;
  welcomeMessage: string;
  completionMessage: string;
  updatedAt: string;
  createdAt: string;
}

export interface CampaignFilters {
  query: string;
  status: EmployerCampaignStatus | 'all';
}

export type CampaignDraftInput = Omit<
  EmployerCampaign,
  'id' | 'status' | 'applicants' | 'invitedEmails' | 'candidates' | 'updatedAt' | 'createdAt'
>;

export interface PublishResult {
  campaign: EmployerCampaign;
  warnings: string[];
}

export interface InviteRejectedEmail {
  email: string;
  reason: 'EMPLOYER_EMAIL' | 'INVALID_EMAIL';
}

export interface InviteResolution {
  campaign: EmployerCampaign;
  linked: CampaignCandidateRow[];
  pending: CampaignCandidateRow[];
  rejected: InviteRejectedEmail[];
}
