import type { CampaignTargetLevel, CampaignDomainOption } from '../components/wizard/campaignWizard.steps';
import type { CampaignQuestion, RubricCriterion } from './campaignManagement.types';

export type JdSource = 'file' | 'paste' | null;

export type JdAnalysisState = {
  source: JdSource;
  fileName: string | null;
  fileSize: number | null;
  jdText: string;
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

/** Maps to POST /api/v1/campaign campaign fields. */
export type CampaignInfoState = {
  title: string;
  domain: CampaignDomainOption | '';
  customDomain: string;
  targetLevel: CampaignTargetLevel | '';
  jobTitle: string;
  /** Optional; omit/empty = unlimited */
  maxCandidates: number | null;
  timeLimitMinutes: number;
  antiCheatEnabled: boolean;
  startsAt: string;
  expiresAt: string;
  timezone: string;
  description: string;
};

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'failed';

export type CampaignWizardPersistedState = {
  info: CampaignInfoState;
  jd: JdAnalysisState;
  rubricSource: RubricSource;
  /** Weights stored as UI percents (0–100); convert with percentWeightsToDecimal on submit. */
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
  autosaveStatus: AutosaveStatus;
  publishConfirmed: boolean;
};

export function createEmptyJdState(): JdAnalysisState {
  return {
    source: null,
    fileName: null,
    fileSize: null,
    jdText: '',
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

/** Convert UI percent (0–100) weights to API decimals summing to ~1. */
export function percentWeightsToDecimal(items: RubricCriterion[]): RubricCriterion[] {
  return items.map((item) => ({
    ...item,
    weight: Number((Number(item.weight) / 100).toFixed(4)),
  }));
}

export function decimalWeightsToPercent(items: RubricCriterion[]): RubricCriterion[] {
  return items.map((item) => ({
    ...item,
    weight: Number((Number(item.weight) <= 1 ? Number(item.weight) * 100 : Number(item.weight)).toFixed(2)),
  }));
}
