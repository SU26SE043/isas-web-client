import type { RadarData } from './result.types';

/** Response from POST .../lessons/{lessonId}/start (201) or embedded in 409. */
export type PracticeSessionResponse = {
  sessionId: string;
  id?: string;
  title?: string;
  status?: string;
  currentQuestionIndex?: number;
  questions?: PracticeSessionQuestionDto[];
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

export type RoadmapPracticeReport = {
  roadmapId: string;
  kind: RoadmapReportKind;
  roadmapStatus?: string;
  levelEvaluation?: string;
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
