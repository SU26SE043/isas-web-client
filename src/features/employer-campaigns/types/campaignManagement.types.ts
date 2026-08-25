export type EmployerCampaignStatus = 'draft' | 'active' | 'paused' | 'closed' | 'archived';
export type EmployerCampaignMode = 'remote' | 'hybrid' | 'onsite';
export type CampaignLocale = 'vi' | 'en';
export type CampaignCandidateStatus = 'invited' | 'invite_pending';

import type { RubricLevel } from '@/features/rubrics/types/rubric.types';

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
  /** Server-authored score anchors; keep them when renaming or editing a criterion. */
  levels?: RubricLevel[];
}

export type CampaignQuestionSource = 'ai' | 'manual';

export interface CampaignQuestion {
  id: string;
  prompt: string;
  skill: string;
  difficulty: 'junior' | 'middle' | 'senior';
  /** UI-level source; maps to API `AiGenerated` | `CustomHr`. */
  source: CampaignQuestionSource;
  isRequired: boolean;
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
  faceVerifyEnabled?: boolean;
  adaptiveEnabled?: boolean;
  groundingEnabled?: boolean;
  maxConcurrentInterviews?: number | null;
  maxDeepPerQuestion?: number | null;
  maxFollowUps?: number | null;
  maxQuestions?: number | null;
  locale: CampaignLocale;
  rubric: RubricCriterion[];
  questions: CampaignQuestion[];
  jobNeeds: import('./campaign.api.types').CampaignJobNeed[];
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
  reason: string;
}

export interface InviteCreatedItem {
  id: string;
  email: string;
  expiresAt?: string | null;
}

export interface InviteResolution {
  campaign: EmployerCampaign;
  created: InviteCreatedItem[];
  linked: CampaignCandidateRow[];
  pending: CampaignCandidateRow[];
  rejected: InviteRejectedEmail[];
}
