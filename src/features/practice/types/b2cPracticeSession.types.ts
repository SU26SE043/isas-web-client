/** B2C practice session API contract (POST/GET sessions, answers, speech, submit). */

export type PracticeJobCategory = 'BA' | 'BE' | 'FE';

export type PracticeTimeLimitSec = 60 | 120 | 240;

export const PRACTICE_TIME_LIMIT_OPTIONS = [60, 120, 240] as const satisfies readonly PracticeTimeLimitSec[];

export const PRACTICE_QUESTION_COUNT_MIN = 1;
export const PRACTICE_QUESTION_COUNT_MAX = 20;
export const PRACTICE_JD_TEXT_MAX_CHARS = 20_000;
export const PRACTICE_ANSWER_AUDIO_MAX_BYTES = 50 * 1024 * 1024;

export interface CreatePracticeSessionRequest {
  cvId?: string;
  jdId?: string;
  jobCategory: PracticeJobCategory;
  jdText?: string;
  timeLimitSec?: PracticeTimeLimitSec;
  questionCount?: number;
}

export interface PracticeSetupState {
  jobCategory: PracticeJobCategory | null;
  cvId: string | null;
  jdId: string | null;
  jdText: string;
  timeLimitSec: PracticeTimeLimitSec;
  questionCount: number;
}

export interface PracticeQuestionResponse {
  id: string;
  orderNo: number;
  content: string;
  timeLimitSec: number;
  kind: string;
}

export type PracticeNextAction = 'follow_up' | 'clarify' | 'new_question' | 'end';

export type PracticeSessionStatus =
  | 'Created'
  | 'InProgress'
  | 'Submitted'
  | 'Scoring'
  | 'Scored'
  | string;

export interface PracticeCriteriaScore {
  name: string;
  score: number;
  maxScore?: number | null;
  comment?: string | null;
}

export interface PracticeCvVsAnswer {
  consistencyScore?: number | null;
  matched?: string[] | null;
  unclear?: string[] | null;
  confirmedSkills?: string[] | null;
  differences?: string[] | null;
  summary?: string | null;
}

export interface PracticeSessionResult {
  overallScore: number;
  criteriaScores: PracticeCriteriaScore[];
  needsImprovement: string[];
  overallComment: string;
  cvVsAnswer: PracticeCvVsAnswer | null;
}

export interface PracticeSpeakingMetrics {
  speechRate?: number | null;
  longestPauseSec?: number | null;
  hesitationCount?: number | null;
  silenceRatio?: number | null;
  fillerWordCount?: number | null;
}

export interface PracticeAnswerReview {
  questionId: string;
  answerId?: string | null;
  orderNo?: number;
  content?: string;
  kind?: string;
  transcript?: string | null;
  status?: string | null;
  score?: number | null;
  comment?: string | null;
  criteriaScores?: PracticeCriteriaScore[];
  speakingMetrics?: PracticeSpeakingMetrics | null;
  suggestedAnswer?: string | null;
}

export interface PracticeSessionResponse {
  id: string;
  status: PracticeSessionStatus;
  jobCategory?: PracticeJobCategory | string;
  timeLimitSec?: number;
  questionCount?: number;
  cvId?: string | null;
  jdId?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;
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
  | 'unauthorized'
  | 'generic';
