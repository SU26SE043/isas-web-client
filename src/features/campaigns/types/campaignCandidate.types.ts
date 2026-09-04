/**
 * B2B Candidate Campaign — live API types.
 * Spec: invitation, join, my-campaigns, start, face-enroll/check, flags.
 */

export interface CampaignCriterion {
  id?: string;
  name: string;
  description?: string | null;
  weight?: number;
  maxScore?: number;
}

export interface CampaignInvitationResponse {
  campaignId: string;
  title: string;
  orgName?: string | null;
  jobTitle?: string | null;
  description?: string | null;
  deadline?: string | null;
  startsAt?: string | null;
  durationMinutes?: number | null;
  questionCount?: number | null;
  faceVerifyEnabled?: boolean | null;
  criteria: CampaignCriterion[];
}

export interface JoinCampaignResponse {
  accessToken: string;
  campaignId: string;
  candidateId: string;
  membershipStatus: 'Joined' | string;
}

export type CampaignInterviewStatus = 'NotStarted' | 'InProgress' | 'Completed';

export interface CandidateCampaignListItem {
  campaignId: string;
  title: string;
  company?: string | null;
  jobTitle?: string | null;
  deadline?: string | null;
  startsAt?: string | null;
  membershipStatus: string;
  interviewStatus: CampaignInterviewStatus;
}

export interface CandidateCampaignsPage {
  items: CandidateCampaignListItem[];
  nextCursor: string | null;
}

export interface CandidateCampaignDetailResponse {
  campaignId: string;
  title: string;
  jobTitle?: string | null;
  description?: string | null;
  deadline?: string | null;
  startsAt?: string | null;
  criteria: CampaignCriterion[];
  membershipStatus: string;
  interviewStatus: CampaignInterviewStatus;
  sessionId?: string | null;
  started: boolean;
}

export interface StartCampaignInterviewResponse {
  sessionId: string;
  campaignId: string;
  questions: Array<{
    id: string;
    orderNo: number;
    content: string;
    timeLimitSec: number;
  }>;
  antiCheatEnabled: boolean;
  faceEnrollRequired: boolean;
  adaptiveEnabled: boolean;
  deadlineAt?: string | null;
}

export interface FaceCheckResponse {
  match: boolean;
  faceCount: number;
  signals: string[];
}

export type AllowedFrontendSignalType = 'tab_switch' | 'paste' | 'focus_lost' | 'camera_blocked' | 'monitoring_gap';

export interface CreateCampaignFlagRequest {
  signalType: AllowedFrontendSignalType;
  note?: string;
}

export interface CampaignInterviewContext {
  mode: 'b2b-campaign';
  campaignId: string;
  sessionId: string;
  antiCheatEnabled: boolean;
  faceEnrollRequired: boolean;
  adaptiveEnabled: boolean;
  deadlineAt?: string | null;
}

export type CampaignCandidateErrorCode =
  | 'emailMismatch'
  | 'notFound'
  | 'gone'
  | 'unauthorized'
  | 'forbidden'
  | 'paymentRequired'
  | 'conflict'
  | 'outsideSlotWindow'
  | 'concurrentLimit'
  | 'badRequest'
  | 'identityError'
  | 'serverError'
  | 'unknown';
