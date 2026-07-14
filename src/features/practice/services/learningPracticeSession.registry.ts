import type { PracticeQuestion, PracticeSession } from '../mocks/session.fixtures';
import { LEARNING_PRACTICE_QUESTIONS } from '../mocks/learningPath.fixtures';

export interface LearningPracticeSessionMeta {
  sessionId: string;
  roadmapId: string;
  lessonId: string;
  title: string;
  questions: PracticeQuestion[];
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
  };
  learningSessions.set(sessionId, meta);
  return meta;
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
