import type { PracticeQuestion, PracticeSession } from '../mocks/session.fixtures';
import { LEARNING_PRACTICE_QUESTIONS } from '../mocks/learningPath.fixtures';
import type { LearningPracticeReport } from '../types/learningPath.types';

export type LearningQuestionAnswerEntry = LearningPracticeReport['questionFeedback'][number];

export interface LearningPracticeSessionMeta {
  sessionId: string;
  roadmapId: string;
  lessonId: string;
  title: string;
  questions: PracticeQuestion[];
  /** Answers already evaluated (persisted across room ↔ report navigation). */
  answered: LearningQuestionAnswerEntry[];
  /** Most recent question feedback awaiting Continue on the question report page. */
  pendingQuestionId: string | null;
  /** Index to restore when re-entering the shared room after a question report. */
  currentQuestionIndex: number;
}

const learningSessions = new Map<string, LearningPracticeSessionMeta>();

export function getLearningPracticeSession(sessionId: string): LearningPracticeSessionMeta | undefined {
  return learningSessions.get(sessionId);
}

export function registerLearningPracticeSession(input: {
  roadmapId: string;
  lessonId: string;
  title: string;
}): LearningPracticeSessionMeta {
  const sessionId = `learning-${input.roadmapId}-${input.lessonId}-${crypto.randomUUID().slice(0, 8)}`;
  const questions: PracticeQuestion[] = LEARNING_PRACTICE_QUESTIONS.map((item) => ({
    id: item.id,
    content: item.prompt,
    timeLimitSeconds: 120,
  }));
  const meta: LearningPracticeSessionMeta = {
    sessionId,
    roadmapId: input.roadmapId,
    lessonId: input.lessonId,
    title: input.title,
    questions,
    answered: [],
    pendingQuestionId: null,
    currentQuestionIndex: 0,
  };
  learningSessions.set(sessionId, meta);
  return meta;
}

export function appendLearningAnswer(sessionId: string, entry: LearningQuestionAnswerEntry): void {
  const meta = learningSessions.get(sessionId);
  if (!meta) return;
  const withoutDup = meta.answered.filter((item) => item.questionId !== entry.questionId);
  meta.answered = [...withoutDup, entry];
  meta.pendingQuestionId = entry.questionId;
}

export function getPendingLearningAnswer(
  sessionId: string,
): LearningQuestionAnswerEntry | undefined {
  const meta = learningSessions.get(sessionId);
  if (!meta?.pendingQuestionId) return undefined;
  return meta.answered.find((item) => item.questionId === meta.pendingQuestionId);
}

export function clearLearningPending(sessionId: string): void {
  const meta = learningSessions.get(sessionId);
  if (!meta) return;
  meta.pendingQuestionId = null;
}

export function getLearningAnswered(sessionId: string): LearningQuestionAnswerEntry[] {
  return learningSessions.get(sessionId)?.answered ?? [];
}

export function getLearningQuestionIndex(sessionId: string): number {
  return learningSessions.get(sessionId)?.currentQuestionIndex ?? 0;
}

/** Advance to the next question after Continue on a per-question report. */
export function advanceLearningQuestion(sessionId: string): number {
  const meta = learningSessions.get(sessionId);
  if (!meta) return 0;
  meta.pendingQuestionId = null;
  const nextIndex = Math.min(meta.answered.length, Math.max(0, meta.questions.length - 1));
  meta.currentQuestionIndex = nextIndex;
  return nextIndex;
}

export function getLearningAnswerByQuestionId(
  sessionId: string,
  questionId: string,
): LearningQuestionAnswerEntry | undefined {
  return learningSessions.get(sessionId)?.answered.find((item) => item.questionId === questionId);
}

export function toPracticeSession(meta: LearningPracticeSessionMeta): PracticeSession {
  return {
    sessionId: meta.sessionId,
    title: meta.title,
    description: 'Learning practice session',
    status: 'ready',
    questions: meta.questions,
  };
}
