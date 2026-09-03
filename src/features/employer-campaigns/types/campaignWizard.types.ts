import type { CampaignDomainOption } from '../components/wizard/campaignWizard.steps';
import type { CampaignQuestion, RubricCriterion } from './campaignManagement.types';

export type JobDescriptionMethod = 'file' | 'text';

export type DeferredJdFileStatus =
  | 'idle'
  | 'selected'
  | 'uploading'
  | 'replacing'
  | 'uploaded'
  | 'failed';

/** Manual rubric + optional criteria PDF upload on the same step. */
export type CriteriaFileState = {
  criteriaFile: File | null;
  fileName: string | null;
  fileSize: number | null;
  fileStatus: DeferredJdFileStatus;
  fileError: string | null;
  uploadProgress: number | null;
  /** True after at least one successful server upload (POST/PUT …/files). */
  serverUploaded: boolean;
  isDownloading: boolean;
};

export type JobDescriptionState = {
  inputMethod: JobDescriptionMethod;
  jdFile: File | null;
  fileName: string | null;
  fileSize: number | null;
  jdText: string;
  /** Freeform criteria notes captured alongside JD (step 1); maps to API `criteriaText`. */
  criteriaText: string;
  fileStatus: DeferredJdFileStatus;
  fileError: string | null;
  uploadProgress: number | null;
  /** True after at least one successful server upload (POST/PUT …/files). */
  serverUploaded: boolean;
  isDownloading: boolean;
};

/** @deprecated Alias kept for gradual rename. */
export type JdAnalysisState = JobDescriptionState;

/** Manual rubric only — criteria step no longer supports file upload. */
export type CampaignInfoState = {
  title: string;
  domain: CampaignDomainOption | '';
  location: string;
  /** Browser-only map marker; CampaignService persists only `location`. */
  locationCoordinates: LocationCoordinates | null;
  maxCandidates: number | null;
  timeLimitMinutes: number;
  /** Optional 0–100; null = HR decides. */
  passScorePct: number | null;
  startsAt: string;
  expiresAt: string;
  timezone: string;
};

export type LocationCoordinates = {
  latitude: number;
  longitude: number;
};

/** New step 4 — moved out of Info (antiCheat) and net-new proctoring/adaptive fields. */
export type CampaignSettingsState = {
  antiCheatEnabled: boolean;
  faceVerifyEnabled: boolean;
  adaptiveEnabled: boolean;
  /** >= 0; only sent to API when adaptiveEnabled. */
  maxFollowUps: number;
  /** 0..20; only sent to API when adaptiveEnabled. */
  maxQuestions: number;
  maxDeepPerQuestion?: number;
};

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'failed' | 'dirty';

export type CampaignWizardPersistedState = {
  info: CampaignInfoState;
  jd: JobDescriptionState;
  criteria: CriteriaFileState;
  /** Weights as UI percents (0–100); convert on submit. */
  rubric: RubricCriterion[];
  questions: CampaignQuestion[];
  /** Count used by the "generate with AI" action on the Questions step. */
  questionCount: number;
  questionsPerSession?: number | null;
  settings: CampaignSettingsState;
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
    criteriaText: '',
    fileStatus: 'idle',
    fileError: null,
    uploadProgress: null,
    serverUploaded: false,
    isDownloading: false,
  };
}

export function createEmptyCriteriaFileState(): CriteriaFileState {
  return {
    criteriaFile: null,
    fileName: null,
    fileSize: null,
    fileStatus: 'idle',
    fileError: null,
    uploadProgress: null,
    serverUploaded: false,
    isDownloading: false,
  };
}

export function createDefaultSettingsState(): CampaignSettingsState {
  return {
    antiCheatEnabled: true,
    faceVerifyEnabled: false,
    adaptiveEnabled: false,
    maxFollowUps: 2,
    maxQuestions: 5,
    maxDeepPerQuestion: 0,
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
