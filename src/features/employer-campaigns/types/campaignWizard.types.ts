import type { CampaignTargetLevel, CampaignDomainOption } from '../components/wizard/campaignWizard.steps';
import type { CampaignQuestion, RubricCriterion } from './campaignManagement.types';

export type JobDescriptionMethod = 'file' | 'text';
export type CriteriaInputMethod = 'manual' | 'file';

export type DeferredJdFileStatus = 'idle' | 'selected' | 'uploading' | 'uploaded' | 'failed';

export type JobDescriptionState = {
  inputMethod: JobDescriptionMethod;
  jdFile: File | null;
  fileName: string | null;
  fileSize: number | null;
  jdText: string;
  fileStatus: DeferredJdFileStatus;
  fileError: string | null;
  uploadProgress: number | null;
  /** True after at least one successful server upload (POST/PUT …/files). */
  serverUploaded: boolean;
};

export type CriteriaFileState = {
  inputMethod: CriteriaInputMethod;
  criteriaFile: File | null;
  fileName: string | null;
  fileSize: number | null;
  fileStatus: DeferredJdFileStatus;
  fileError: string | null;
  uploadProgress: number | null;
  serverUploaded: boolean;
};

/** @deprecated Alias kept for gradual rename. */
export type JdAnalysisState = JobDescriptionState;

export type RubricSource = 'ai' | 'upload' | 'manual' | null;
export type QuestionSource = 'ai' | 'upload' | 'manual' | null;

/** Maps to POST /api/v1/campaign campaign fields. */
export type CampaignInfoState = {
  title: string;
  domain: CampaignDomainOption | '';
  targetLevel: CampaignTargetLevel | '';
  maxCandidates: number | null;
  timeLimitMinutes: number;
  /** Optional 0–100; null = HR decides. */
  passScorePct: number | null;
  antiCheatEnabled: boolean;
  startsAt: string;
  expiresAt: string;
  timezone: string;
};

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'failed' | 'dirty';

export type CampaignWizardPersistedState = {
  info: CampaignInfoState;
  jd: JobDescriptionState;
  criteria: CriteriaFileState;
  rubricSource: RubricSource;
  /** Weights as UI percents (0–100); convert on submit. */
  rubric: RubricCriterion[];
  rubricSavedAt: string | null;
  questionSource: QuestionSource;
  questionCount: number;
  questions: CampaignQuestion[];
  currentStep: number;
  completedSteps: number[];
  errorSteps: number[];
  draftId?: string;
  lastSavedAt?: string;
  autosaveStatus: AutosaveStatus;
};

export type RankedCandidate = {
  id: string;
  name: string;
  email: string;
  overallMatch: number;
  technicalMatch: number;
  experienceMatch: number;
  skillsMatch: number;
  selected: boolean;
  status?: string;
};

export type InvalidEmail = {
  value: string;
  reason: string;
};

export type InviteMethod = 'cv' | 'email' | null;

export type CampaignInvitationState = {
  campaignId: string;
  method: InviteMethod;
  selectedCandidateIds: string[];
  rankedCandidates: RankedCandidate[];
  rawEmailInput: string;
  validEmails: string[];
  invalidEmails: InvalidEmail[];
  isSubmitting: boolean;
  result?: {
    invited: Array<{ email: string; invitationId?: string }>;
    failed: Array<{ email: string; reason: string }>;
  };
};

export function createEmptyJdState(): JobDescriptionState {
  return {
    inputMethod: 'file',
    jdFile: null,
    fileName: null,
    fileSize: null,
    jdText: '',
    fileStatus: 'idle',
    fileError: null,
    uploadProgress: null,
    serverUploaded: false,
  };
}

export function createEmptyCriteriaFileState(): CriteriaFileState {
  return {
    inputMethod: 'manual',
    criteriaFile: null,
    fileName: null,
    fileSize: null,
    fileStatus: 'idle',
    fileError: null,
    uploadProgress: null,
    serverUploaded: false,
  };
}

export function percentWeightsToDecimal(items: RubricCriterion[]): RubricCriterion[] {
  return items.map((item) => ({
    ...item,
    weight: Number((Number(item.weight) / 100).toFixed(4)),
    maxScore: Number(item.maxScore) || 0,
  }));
}

export function decimalWeightsToPercent(items: RubricCriterion[]): RubricCriterion[] {
  return items.map((item) => ({
    ...item,
    weight: Number(
      (Number(item.weight) <= 1 ? Number(item.weight) * 100 : Number(item.weight)).toFixed(2),
    ),
    maxScore: Number(item.maxScore) > 0 ? Number(item.maxScore) : 10,
  }));
}
