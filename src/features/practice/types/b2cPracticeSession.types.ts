/** B2C practice session API contract (POST/GET sessions, answers, speech, submit). */

export type PracticeJobCategory = 'BA' | 'BE' | 'FE';
export type PracticeLanguage = 'vi' | 'en';
export type PracticeSeniority = 'Fresher' | 'Junior' | 'Middle' | 'Senior';

export type PracticeTimeLimitSec = 60 | 120 | 240;

export const PRACTICE_TIME_LIMIT_OPTIONS = [60, 120, 240] as const satisfies readonly PracticeTimeLimitSec[];

export const PRACTICE_QUESTION_COUNT_MIN = 1;
export const PRACTICE_QUESTION_COUNT_MAX = 20;
export const PRACTICE_JD_TEXT_MAX_CHARS = 20_000;
export const PRACTICE_ANSWER_AUDIO_MAX_BYTES = 50 * 1024 * 1024;

export interface PracticeSessionOptionPreset {
  key: 'short' | 'medium' | 'long' | string;
  questionCount: number;
  seedCount: number;
  coversAllCriteria: boolean;
}

export interface PracticeSessionOptionPreview {
  questionCount: number;
  seedCount: number;
}

export interface PracticeQuestionCitation {
  chunkId: string;
  sourceUrl: string;
  sourceTitle: string;
}

export type PracticeCriterionEvidenceState = 'UNKNOWN' | 'PARTIAL' | 'SATISFIED' | 'FAILED';

export interface PracticeCriterionEvidence {
  criterionId: string;
  criterionName: string;
  state: PracticeCriterionEvidenceState;
  evidenceFound: string[];
  missingEvidence: string[];
  deepCount: number;
  updatedAt: string;
}

export interface PracticeSessionOptions {
  adaptiveEnabled: boolean;
  maxDeepPerQuestion: number;
  contentCriteriaCount: number;
  questionCountMin: number;
  questionCountMax: number;
  defaultQuestionCount: number;
  presets: PracticeSessionOptionPreset[];
  preview: PracticeSessionOptionPreview[];
}

export interface CreatePracticeSessionRequest {
  cvId?: string;
  jdId?: string;
  jobCategory: PracticeJobCategory;
  jdText?: string;
  timeLimitSec?: PracticeTimeLimitSec;
  questionCount?: number;
  language?: PracticeLanguage;
  seniority?: PracticeSeniority;
}

export interface PracticeSetupState {
  jobCategory: PracticeJobCategory | null;
  cvId: string | null;
  jdId: string | null;
  jdText: string;
  timeLimitSec: PracticeTimeLimitSec;
  questionCount: number;
  language: PracticeLanguage;
  seniority: PracticeSeniority;
}

export interface PracticeQuestionResponse {
  id: string;
  orderNo: number;
  content: string;
  timeLimitSec: number;
  kind: PracticeQuestionKind;
  citations?: PracticeQuestionCitation[] | null;
}

export type PracticeNextAction = 'follow_up' | 'clarify' | 'new_question' | 'end';

export type PracticeSessionStatus =
  | 'GeneratingQuestions'
  | 'Ready'
  | 'Created'
  | 'InProgress'
  | 'Completed'
  | 'Submitted'
  | 'Scoring'
  | 'Scored'
  | 'Failed'
  | 'SessionAbandoned'
  | string;

export type PracticeQuestionKind = 'Seed' | 'FollowUp' | 'Clarify' | 'NewQuestion' | string;

export interface PracticeCriteriaScore {
  name: string;
  score: number;
  maxScore?: number | null;
  comment?: string | null;
  criterionId?: string | null;
  /** v5: average score across answers for this criterion. */
  averageScore?: number | null;
  percentage?: number | null;
  weight?: number | null;
}

export interface PracticeRubricCriterionRef {
  id: string;
  name: string;
  maxScore?: number | null;
  description?: string | null;
}

export interface PracticeCvVsAnswerGap {
  criterionId: string;
  criterionName: string;
  percentage: number;
  maxScore: number;
  cvEvidence: string[];
}

export interface PracticeCvVsAnswer {
  consistencyScore?: number | null;
  matched?: string[] | null;
  unclear?: string[] | null;
  confirmedSkills?: string[] | null;
  differences?: string[] | null;
  summary?: string | null;
  /** v5 fields */
  cvStrengths?: string[] | null;
  gaps?: PracticeCvVsAnswerGap[] | null;
}

export interface PracticeBenchmarkCriterion {
  criterionId: string;
  name: string;
  targetPercentage: number;
}

export interface PracticeBenchmark {
  source: 'PeerAverage' | 'PassThreshold' | string;
  label: string;
  sampleSize: number;
  criteria: PracticeBenchmarkCriterion[];
}

export interface PracticeSessionResult {
  overallScore: number;
  maxScore?: number | null;
  passThreshold?: number | null;
  /** Backend explanation for the threshold line (optional). */
  passThresholdNote?: string | null;
  answeredCount?: number | null;
  totalQuestions?: number | null;
  criteriaScores: PracticeCriteriaScore[];
  strengths?: string[];
  needsImprovement: string[];
  nextSteps?: string[];
  overallComment: string;
  cvVsAnswer: PracticeCvVsAnswer | null;
  /** v5: peer average or pass-threshold comparison series for radar. */
  benchmark?: PracticeBenchmark | null;
}

/** v5 delivery metrics (API name). Null = not measured — never coerce to 0. */
export interface DeliveryMetrics {
  audioSec?: number | null;
  speechSec?: number | null;
  wordCount?: number | null;
  speechRateWpm?: number | null;
  longestPauseSec?: number | null;
  pauseCount?: number | null;
  silenceRatio?: number | null;
  fillerCount?: number | null;
  fillerPer100Words?: number | null;
  fillerBreakdown?: Record<string, number> | null;
  metricsVersion?: number | null;
}

/** UI-facing speaking metrics (maps from DeliveryMetrics + legacy aliases). */
export interface PracticeSpeakingMetrics {
  speechRate?: number | null;
  longestPauseSec?: number | null;
  hesitationCount?: number | null;
  silenceRatio?: number | null;
  fillerWordCount?: number | null;
  audioDurationSec?: number | null;
  speechSec?: number | null;
  wordCount?: number | null;
  fillerPer100Words?: number | null;
  fillerBreakdown?: Record<string, number> | null;
  referenceText?: string | null;
  speechRateNote?: string | null;
  longestPauseNote?: string | null;
  hesitationNote?: string | null;
  silenceRatioNote?: string | null;
  fillerWordNote?: string | null;
  notes?: string[] | null;
  metricsVersion?: number | null;
}

export interface PracticeAnswerReview {
  questionId: string;
  answerId?: string | null;
  orderNo?: number;
  content?: string;
  kind?: string;
  transcript?: string | null;
  textAnswer?: string | null;
  audioUrl?: string | null;
  durationSec?: number | null;
  status?: string | null;
  score?: number | null;
  comment?: string | null;
  criteriaScores?: PracticeCriteriaScore[];
  speakingMetrics?: PracticeSpeakingMetrics | null;
  /** Alias of API `sampleAnswer` — never replaces candidate transcript. */
  suggestedAnswer?: string | null;
  sampleAnswer?: string | null;
  needsReview?: boolean;
  isClarify?: boolean;
}

export interface PracticeSessionResponse {
  id: string;
  status: PracticeSessionStatus;
  jobCategory?: PracticeJobCategory | string;
  language?: PracticeLanguage;
  seniority?: PracticeSeniority;
  criterionEvidence?: PracticeCriterionEvidence[] | null;
  timeLimitSec?: number;
  questionCount?: number;
  level?: string | null;
  durationSeconds?: number | null;
  cvId?: string | null;
  jdId?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;
  /** Rubric catalog used to resolve criterionId → name on scores. */
  rubric?: PracticeRubricCriterionRef[] | null;
  questions: PracticeQuestionResponse[];
  result?: PracticeSessionResult | null;
  answers?: PracticeAnswerReview[] | null;
}

export interface SubmitPracticeAnswerInput {
  sessionId: string;
  questionId: string;
  file: File;
  durationSec: number;
}

export interface SubmitPracticeAnswerResponse {
  answerId: string;
  questionId: string;
  status: string;
  transcript?: string | null;
  nextAction?: PracticeNextAction | null;
  nextQuestion: PracticeQuestionResponse | null;
  interviewComplete: boolean;
}

export type PracticeInterviewStage =
  | 'setup'
  | 'creating_session'
  | 'device_check'
  | 'interviewing'
  | 'submitting_answer'
  | 'ready_to_finish'
  | 'submitting_session'
  | 'scoring'
  | 'scored'
  | 'error';

export type QuestionAnswerState =
  | 'not_started'
  | 'reading_question'
  | 'recording'
  | 'recorded'
  | 'uploading'
  | 'submitted'
  | 'unanswered'
  | 'error';

export type RecordingStatus =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'paused'
  | 'stopped'
  | 'uploading'
  | 'submitted'
  | 'error';

export type CreatePracticeSessionErrorCode =
  | 'job_category_required'
  | 'invalid_time_limit'
  | 'invalid_question_count'
  | 'jd_too_long'
  | 'insufficient_credit'
  | 'create_failed'
  | 'ai_failed'
  | 'platform_capacity'
  | 'unauthorized'
  | 'generic';
