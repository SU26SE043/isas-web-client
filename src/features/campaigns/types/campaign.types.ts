export type CampaignMode = 'remote' | 'hybrid' | 'onsite';
export type CampaignSeniority = 'intern' | 'junior' | 'middle' | 'senior';
export type CampaignStatus = 'active' | 'closing-soon' | 'filled' | 'enrolled';

export interface Campaign {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: CampaignMode;
  seniority: CampaignSeniority;
  language: 'en' | 'vi';
  status: CampaignStatus;
  deadline: string;
  publishedAt: string;
  capacity: number;
  applicants: number;
  matchScore: number;
  salaryRange: string;
  skills: string[];
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  process: string[];
  hasEnrolled?: boolean;
}

export interface CampaignFilters {
  query: string;
  mode: 'all' | CampaignMode;
  seniority: 'all' | CampaignSeniority;
}

export interface EnrollmentInput {
  motivation: string;
  availability: string;
  consent: boolean;
}

export interface EnrollmentResult {
  enrollmentId: string;
  sessionId: string;
}

export interface CampaignInvite {
  token: string;
  campaignId: string;
  candidateEmail: string;
  expiresAt: string;
  status: 'valid' | 'expired' | 'used';
  authMode?: 'sign_in' | 'register';
}

export type InviteAuthMode = 'sign_in' | 'register' | 'role_blocked' | 'invalid';

export interface InviteAuthResolution {
  mode: InviteAuthMode;
  candidateEmail?: string;
  invite?: CampaignInvite & { campaign: Campaign };
}

export interface CampaignBriefing {
  token: string;
  sessionId: string;
  campaignId: string;
  title: string;
  titleVi: string;
  company: string;
  candidateEmail: string;
  estimatedMinutes: number;
  instructions: string[];
  instructionsVi: string[];
  proctoringNotice: string;
  proctoringNoticeVi: string;
  assessmentSteps: string[];
  assessmentStepsVi: string[];
}

export type CandidateInviteStatus = 'invited' | 'in_progress' | 'completed' | 'expired';

export interface CandidateCampaignInvite {
  inviteToken: string;
  campaignId: string;
  title: string;
  company: string;
  deadline: string;
  status: CandidateInviteStatus;
  sessionId: string;
}
