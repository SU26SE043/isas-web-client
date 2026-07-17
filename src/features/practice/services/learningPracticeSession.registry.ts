import type { PracticeQuestion, PracticeSession } from '../mocks/session.fixtures';
import { LEARNING_PRACTICE_QUESTIONS } from '../mocks/learningPath.fixtures';
import type { LearningPracticeReport } from '../types/learningPath.types';
import type { PracticeSessionResponse } from '../types/roadmapPractice.api.types';

export type LearningQuestionAnswerEntry = LearningPracticeReport['questionFeedback'][number] & {
  transcript?: string | null;
  scoringStatus?: string;
};

export interface LearningPracticeSessionMeta {
  sessionId: string;
  roadmapId: string;
  lessonId: string;
  title: string;
  questions: PracticeQuestion[];
  answered: LearningQuestionAnswerEntry[];
  pendingQuestionId: string | null;
  currentQuestionIndex: number;
}

const STORAGE_KEY = 'isas.learningPracticeSessions';
const learningSessions = new Map<string, LearningPracticeSessionMeta>();

function readStorage(): Record<string, LearningPracticeSessionMeta> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LearningPracticeSessionMeta>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorage() {
  try {
    const payload: Record<string, LearningPracticeSessionMeta> = {};
    learningSessions.forEach((value, key) => {
      payload[key] = value;
    });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota / private mode.
  }
}

function hydrateFromStorage(sessionId: string): LearningPracticeSessionMeta | undefined {
  if (learningSessions.has(sessionId)) return learningSessions.get(sessionId);
  const stored = readStorage()[sessionId];
  if (!stored) return undefined;
  learningSessions.set(sessionId, stored);
  return stored;
}

function persist(meta: LearningPracticeSessionMeta) {
  learningSessions.set(meta.sessionId, meta);
  writeStorage();
}

export function getLearningPracticeSession(sessionId: string): LearningPracticeSessionMeta | undefined {
  return hydrateFromStorage(sessionId);
}

export function hasLearningPracticeSession(sessionId: string): boolean {
  return Boolean(getLearningPracticeSession(sessionId));
}

export function registerLearningPracticeSession(input: {
  sessionId?: string;
  roadmapId: string;
  lessonId: string;
  title: string;
  questions?: PracticeQuestion[];
  currentQuestionIndex?: number;
}): LearningPracticeSessionMeta {
  const sessionId =
    input.sessionId ??
    `learning-${input.roadmapId}-${input.lessonId}-${crypto.randomUUID().slice(0, 8)}`;
  const existing = getLearningPracticeSession(sessionId);
  const meta: LearningPracticeSessionMeta = {
    sessionId,
    roadmapId: input.roadmapId,
    lessonId: input.lessonId,
    title: input.title || existing?.title || 'Learning practice',
    questions: input.questions?.length ? input.questions : existing?.questions ?? [],
    answered: existing?.answered ?? [],
    pendingQuestionId: existing?.pendingQuestionId ?? null,
    currentQuestionIndex:
      input.currentQuestionIndex ?? existing?.currentQuestionIndex ?? existing?.answered.length ?? 0,
  };
  persist(meta);
  return meta;
}

/** Local-only practice open (no start API) — uses fixture questions for the shared room. */
export function openLocalLearningPracticeSession(input: {
  roadmapId: string;
  lessonId: string;
  title: string;
}): LearningPracticeSessionMeta {
  const questions: PracticeQuestion[] = LEARNING_PRACTICE_QUESTIONS.map((item) => ({
    id: item.id,
    content: item.prompt,
    timeLimitSeconds: 120,
  }));
  return registerLearningPracticeSession({
    roadmapId: input.roadmapId,
    lessonId: input.lessonId,
    title: input.title,
    questions,
    currentQuestionIndex: 0,
  });
}

export function registerFromPracticeSessionResponse(input: {
  roadmapId: string;
  lessonId: string;
  title: string;
  session: PracticeSessionResponse;
}): LearningPracticeSessionMeta {
  const questions: PracticeQuestion[] = (input.session.questions ?? []).map((item) => ({
    id: item.id,
    content: item.content || item.prompt || item.title || 'Question',
    timeLimitSeconds: item.timeLimitSeconds ?? item.durationSec ?? 120,
  }));
  return registerLearningPracticeSession({
    sessionId: input.session.sessionId,
    roadmapId: input.roadmapId,
    lessonId: input.lessonId,
    title: input.session.title || input.title,
    questions,
    currentQuestionIndex: input.session.currentQuestionIndex,
  });
}

export function updateLearningSessionQuestions(
  sessionId: string,
  questions: PracticeQuestion[],
): void {
  const meta = getLearningPracticeSession(sessionId);
  if (!meta) return;
  meta.questions = questions;
  persist(meta);
}

export function appendLearningAnswer(sessionId: string, entry: LearningQuestionAnswerEntry): void {
  const meta = getLearningPracticeSession(sessionId);
  if (!meta) return;
  const withoutDup = meta.answered.filter((item) => item.questionId !== entry.questionId);
  meta.answered = [...withoutDup, entry];
  meta.pendingQuestionId = entry.questionId;
  persist(meta);
}

export function getPendingLearningAnswer(
  sessionId: string,
): LearningQuestionAnswerEntry | undefined {
  const meta = getLearningPracticeSession(sessionId);
  if (!meta?.pendingQuestionId) return undefined;
  return meta.answered.find((item) => item.questionId === meta.pendingQuestionId);
}

export function clearLearningPending(sessionId: string): void {
  const meta = getLearningPracticeSession(sessionId);
  if (!meta) return;
  meta.pendingQuestionId = null;
  persist(meta);
}

export function getLearningAnswered(sessionId: string): LearningQuestionAnswerEntry[] {
  return getLearningPracticeSession(sessionId)?.answered ?? [];
}

export function getLearningQuestionIndex(sessionId: string): number {
  return getLearningPracticeSession(sessionId)?.currentQuestionIndex ?? 0;
}

/** Advance to the next question after Continue on a per-question report. */
export function advanceLearningQuestion(sessionId: string): number {
  const meta = getLearningPracticeSession(sessionId);
  if (!meta) return 0;
  meta.pendingQuestionId = null;
  const nextIndex = Math.min(meta.answered.length, Math.max(0, meta.questions.length - 1));
  meta.currentQuestionIndex = nextIndex;
  persist(meta);
  return nextIndex;
}

export function getLearningAnswerByQuestionId(
  sessionId: string,
  questionId: string,
): LearningQuestionAnswerEntry | undefined {
  return getLearningPracticeSession(sessionId)?.answered.find((item) => item.questionId === questionId);
}

export function isLastLearningQuestion(sessionId: string, questionId: string): boolean {
  const meta = getLearningPracticeSession(sessionId);
  if (!meta || meta.questions.length === 0) return false;
  return meta.questions[meta.questions.length - 1]?.id === questionId;
}

export function toPracticeSession(meta: LearningPracticeSessionMeta): PracticeSession {
  return {
    sessionId: meta.sessionId,
    title: meta.title,
    description: 'Learning practice session',
    status: meta.questions.length > 0 ? 'ready' : 'initializing',
    questions: meta.questions,
  };
}
