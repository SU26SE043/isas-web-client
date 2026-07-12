export type EmployerCampaignStatus = 'draft' | 'active' | 'paused' | 'closed';
export type EmployerCampaignMode = 'remote' | 'hybrid' | 'onsite';
export type CampaignLocale = 'vi' | 'en';

export interface RubricCriterion {
  id: string;
  name: string;
  weight: number;
  description: string;
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
  company: string;
  location: string;
  mode: EmployerCampaignMode;
  status: EmployerCampaignStatus;
  summary: string;
  jobDescription: string;
  capacity: number;
  applicants: number;
  deadline: string;
  durationMinutes: number;
  locale: CampaignLocale;
  rubric: RubricCriterion[];
  questions: CampaignQuestion[];
  invitedEmails: string[];
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
  'id' | 'status' | 'applicants' | 'invitedEmails' | 'updatedAt' | 'createdAt'
>;

export interface PublishResult {
  campaign: EmployerCampaign;
  warnings: string[];
}

export interface InviteResult {
  campaign: EmployerCampaign;
  invited: string[];
}
