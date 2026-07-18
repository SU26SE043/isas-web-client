import type { CampaignTargetLevel, CampaignDomainOption } from '../components/wizard/campaignWizard.steps';
import type {
  CampaignQuestion,
  RubricCriterion,
} from './campaignManagement.types';

export type JdAnalysisState = {
  fileName: string | null;
  fileSize: number | null;
  status: 'idle' | 'uploading' | 'analyzing' | 'ready' | 'failed';
  errorKey?: string;
  jobTitle: string;
  domain: string;
  targetLevel: string;
  yearsExperience: string;
  technicalSkills: string[];
  frameworks: string[];
  tools: string[];
  softSkills: string[];
  responsibilities: string;
  requiredQualifications: string;
  preferredQualifications: string;
  keywords: string[];
  summary: string;
};

export type RubricSource = 'ai' | 'upload' | null;

export type QuestionSource = 'ai' | 'upload' | null;

export type CandidateInviteMethod = 'emails' | 'cv-ranking' | null;

export type RankedCandidate = {
  id: string;
  name: string;
  email: string;
  overallMatch: number;
  technicalMatch: number;
  experienceMatch: number;
  skillsMatch: number;
  selected: boolean;
};

export type MagicLinkState = {
  url: string;
  campaignCode: string;
  expiresAt: string;
  status: 'idle' | 'ready' | 'error';
  candidateCount: number;
};

export type InvitationEmailState = {
  subject: string;
  body: string;
  buttonText: string;
  attachmentName: string | null;
};

export type CampaignInfoState = {
  name: string;
  domain: CampaignDomainOption | '';
  customDomain: string;
  targetLevel: CampaignTargetLevel | '';
  jobTitle: string;
  hireCount: number;
  startDate: string;
  endDate: string;
  joinDeadline: string;
  timezone: string;
  description: string;
};

export type CampaignWizardPersistedState = {
  info: CampaignInfoState;
  jd: JdAnalysisState;
  rubricSource: RubricSource;
  rubric: RubricCriterion[];
  rubricSavedAt: string | null;
  questionSource: QuestionSource;
  questionCount: number;
  questions: CampaignQuestion[];
  candidateMethod: CandidateInviteMethod;
  candidateEmails: string[];
  rankedCandidates: RankedCandidate[];
  matchThreshold: number;
  magicLink: MagicLinkState;
  invitationEmail: InvitationEmailState;
  currentStep: number;
  completedSteps: number[];
  errorSteps: number[];
  draftId?: string;
  lastSavedAt?: string;
};

export function createEmptyJdState(): JdAnalysisState {
  return {
    fileName: null,
    fileSize: null,
    status: 'idle',
    jobTitle: '',
    domain: '',
    targetLevel: '',
    yearsExperience: '',
    technicalSkills: [],
    frameworks: [],
    tools: [],
    softSkills: [],
    responsibilities: '',
    requiredQualifications: '',
    preferredQualifications: '',
    keywords: [],
    summary: '',
  };
}

export function createDefaultInvitationEmail(campaignName: string): InvitationEmailState {
  return {
    subject: `Invitation: ${campaignName || 'Campaign'}`,
    body: 'You are invited to join our AI interview campaign. Please use the magic link below before the deadline.',
    buttonText: 'Join interview',
    attachmentName: 'campaign-guide.pptx',
  };
}
