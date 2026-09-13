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
  minPct?: number | null;
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
  questionGroup?: string | null;
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
  questionsPerSession?: number | null;
  questionBank?: {
    total?: number | null;
    alwaysAsked?: number | null;
    questionsPerSession?: number | null;
    groups?: Array<{ name: string; count: number }>;
    warnings?: string[];
  } | null;
  questionBankWarnings?: string[];
  cvCount?: number | null;
  invitedCount?: number | null;
  completedCount?: number | null;
  skipPenalty?: boolean | null;
  /** CAMP-18 — phiên bản thước đo hiện hành của chiến dịch (Campaign cấp; null = response cũ chưa mang). */
  rubricVersion?: number | null;
  locale: CampaignLocale;
  rubric: RubricCriterion[];
  questions: CampaignQuestion[];
  jobNeeds: import('./campaign.api.types').CampaignJobNeed[];
  requiredSkills?: string[];
  keywordsAny?: string[];
  minYearsExperience?: number | null;
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

/** T13 R2 — tuỳ chọn lúc triển khai từ wizard (D-3 quick-deploy). */
export interface CampaignDeployOptions {
  /** Sau publish, gọi `POST /campaign/{id}/start-now` rồi mới mời (thứ tự publish → start-now → mời). */
  startNow?: boolean;
}

/**
 * Kết quả bước "Mở ngay" trong deploy: `done` = đã kéo giờ mở về hiện tại · `failed` = publish
 * xong nhưng start-now lỗi (I7: KHÔNG ném, vẫn mời) · `skipped` = không yêu cầu.
 */
export type CampaignDeployStartNowOutcome = 'done' | 'failed' | 'skipped';

export interface CampaignDeployResult extends PublishResult {
  invitations: import('./campaign.api.types').CreateCampaignInvitationsResponse | null;
  startNow: CampaignDeployStartNowOutcome;
  /** Chỉ có khi `startNow === 'failed'` — để banner/toast nói được vì sao. */
  startNowError?: { status?: number; message: string };
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
