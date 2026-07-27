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
  membershipStatus: string;
  interviewStatus: CampaignInterviewStatus;
}

export interface CandidateCampaignDetailResponse {
  campaignId: string;
  title: string;
  jobTitle?: string | null;
  description?: string | null;
  deadline?: string | null;
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
}

export interface FaceCheckResponse {
  match: boolean;
  faceCount: number;
  signals: string[];
}

export type AllowedFrontendSignalType = 'tab_switch' | 'paste' | 'focus_lost' | 'camera_blocked';

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
}

export type CampaignCandidateErrorCode =
  | 'notFound'
  | 'gone'
  | 'unauthorized'
  | 'forbidden'
  | 'paymentRequired'
  | 'conflict'
  | 'badRequest'
  | 'identityError'
  | 'serverError'
  | 'unknown';
