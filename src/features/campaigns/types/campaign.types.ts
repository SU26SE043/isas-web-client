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
}
