import type { RadarData } from './result.types';
import type {
  PracticeAnswerReview,
  PracticeSessionResult,
} from './b2cPracticeSession.types';

/** Response from POST .../lessons/{lessonId}/start (201) or embedded in 409. */
export type PracticeSessionResponse = {
  sessionId: string;
  id?: string;
  title?: string;
  status?: string;
  currentQuestionIndex?: number;
  questions?: PracticeSessionQuestionDto[];
  result?: PracticeSessionResult | null;
  answers?: PracticeAnswerReview[] | null;
  jobCategory?: string;
  cvId?: string | null;
};

export type PracticeSessionQuestionDto = {
  id: string;
  orderNo?: number;
  content?: string;
  prompt?: string;
  promptVi?: string;
  title?: string;
  timeLimitSeconds?: number;
  durationSec?: number;
};

export type SubmitPracticeAnswerInput = {
  questionId: string;
  file: Blob;
  durationSec: number;
  fileName?: string;
};

export type SubmitPracticeAnswerResponse = {
  answerId: string;
  questionId: string;
  status: string;
  score?: number;
  feedback?: string;
  feedbackVi?: string;
  strengths?: string[];
  strengthsVi?: string[];
  weaknesses?: string[];
  weaknessesVi?: string[];
  improvements?: string[];
  improvementsVi?: string[];
  betterAnswer?: string;
  betterAnswerVi?: string;
  transcript?: string | null;
  tips?: string[];
  tipsVi?: string[];
};

export type PracticeAnswerDetail = SubmitPracticeAnswerResponse & {
  scoringStatus?: string;
};

export type RoadmapReportKind = 'interim' | 'snapshot';

export type RoadmapLevelEvaluationItem = {
  criterionName: string;
  percentage: number;
  levelThreshold: number;
  passed: boolean;
};

export type RoadmapPracticeReport = {
  roadmapId: string;
  kind: RoadmapReportKind;
  roadmapStatus?: string;
  levelEvaluation: RoadmapLevelEvaluationItem[];
  levelEvaluationText?: string;
  levelEvaluationVi?: string;
  overallComment?: string;
  overallCommentVi?: string;
  strengths: string[];
  strengthsVi: string[];
  weaknesses: string[];
  weaknessesVi: string[];
  improvements: string[];
  improvementsVi: string[];
  radarData: RadarData[];
};

export type StartLessonErrorCode =
  | 'insufficient_credits'
  | 'forbidden'
  | 'not_found'
  | 'ai_failed'
  | 'conflict_resume'
  | 'generic';

export type StartLessonResult =
  | { ok: true; session: PracticeSessionResponse; resumed: boolean }
  | { ok: false; code: StartLessonErrorCode; sessionId?: string; message?: string };
