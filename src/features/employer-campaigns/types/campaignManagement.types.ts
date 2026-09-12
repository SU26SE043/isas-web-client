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

/**
 * SC2 — chấm THEO PHẠM VI CÂU HỎI. `Always` = tiêu chí CÁCH NÓI, chấm mọi câu.
 * `WhenTargeted` = tiêu chí NỘI DUNG, chỉ chấm khi có câu hỏi nhắm tới (`CampaignQuestion.targetCriterionIds`).
 * Vắng (server không trả field) ⇒ coi như `'Always'` — lùi an toàn, khớp Interview INT-18.
 */
export type RubricScoringScope = 'Always' | 'WhenTargeted';

export interface RubricCriterion {
  id: string;
  name: string;
  weight: number;
  description: string;
  maxScore: number;
  minPct?: number | null;
  /** Server-authored score anchors; keep them when renaming or editing a criterion. */
  levels?: RubricLevel[];
  /** SC2 — xem `RubricScoringScope`. Optional để không phá các nơi đúc object chưa biết field này. */
  scoringScope?: RubricScoringScope;
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
  /**
   * SC2 — id các tiêu chí `WhenTargeted` mà câu này nhắm tới. Ba trạng thái CHỈ có ý nghĩa lúc GHI
   * (xem `mapQuestionsToApiRequest`): `undefined`/`null` = chưa gắn nhãn (Interview chấm ĐỦ rubric,
   * coi như PUT không đổi gì) · `[]` = đã gắn nhãn RỖNG (chỉ chấm `Always`) · `[ids]` = thay thế.
   * GET luôn trả `null` khi câu chưa từng được gắn nhãn.
   */
  targetCriterionIds?: string[] | null;
  /**
   * Câu trả lời mẫu (AI viết hoặc HR tự soạn) cho câu hỏi này. Ba trạng thái trên PUT (CAMP-16):
   * `undefined` = chưa từng đọc (không gửi field) · `null` = GIỮ NGUYÊN trên server ·
   * `''` = XOÁ · chuỗi khác = đặt giá trị mới.
   */
  sampleAnswer?: string | null;
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
    /** Chặn Publish (400 `QUESTION_BANK_INVALID`) — bao gồm cả mã SC2 `K_BELOW_CRITERIA_GROUPS`. */
    warnings?: string[];
    /**
     * SC2 — tiêu chí `WhenTargeted` KHÔNG câu hỏi nào nhắm tới. Thuần THÔNG TIN, KHÔNG chặn Publish
     * (khác `warnings` ở trên).
     */
    coverageWarnings?: Array<{ criterionId: string; name: string }>;
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

export interface CampaignDeployResult extends PublishResult {
  invitations: import('./campaign.api.types').CreateCampaignInvitationsResponse | null;
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
