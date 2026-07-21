import { roadmapPracticeService } from '../services/roadmapPractice.service';
import {
  getLearningPracticeSession,
  registerFromPracticeSessionResponse,
  registerLearningPracticeSession,
  updateLearningSessionQuestions,
} from '../services/learningPracticeSession.registry';
import type { PracticeQuestion } from '../mocks/session.fixtures';
import type { StartLessonResult } from '../types/roadmapPractice.api.types';

const inFlightStarts = new Map<string, Promise<StartLessonResult>>();

/** Entry into the existing shared interview UI (not a separate Learning room). */
export function learningInterviewPreparePath(sessionId: string) {
  return `/interview/${sessionId}/prepare`;
}

/** Direct path to the shared practice room (same PracticeInterviewPage as B2C). */
export function learningInterviewRoomPath(sessionId: string) {
  return `/interview/${sessionId}/room`;
}

export function learningRoadmapReportPath(roadmapId: string) {
  return `/candidate/learning/roadmaps/${roadmapId}/report`;
}

/**
 * Start (or resume) lesson practice via POST .../lessons/{lessonId}/start.
 * Registers the session locally so shared interview room treats it as learning.
 * Concurrent/Strict Mode duplicate calls share one in-flight request.
 */
export async function startLearningLessonPractice(input: {
  roadmapId: string;
  lessonId: string;
  title: string;
}): Promise<StartLessonResult> {
  const key = `${input.roadmapId}:${input.lessonId}`;
  const existing = inFlightStarts.get(key);
  if (existing) return existing;

  const promise = (async (): Promise<StartLessonResult> => {
    const result = await roadmapPracticeService.startLesson(input.roadmapId, input.lessonId);
    if (!result.ok) return result;

    registerFromPracticeSessionResponse({
      roadmapId: input.roadmapId,
      lessonId: input.lessonId,
      title: input.title,
      session: result.session,
    });

    if (!result.session.questions?.length) {
      try {
        const detail = await roadmapPracticeService.getPracticeSession(result.session.sessionId);
        if (detail.questions?.length) {
          const questions: PracticeQuestion[] = detail.questions.map((item) => ({
            id: item.id,
            content: item.content || item.prompt || item.title || 'Question',
            timeLimitSeconds: item.timeLimitSeconds ?? item.durationSec ?? 120,
          }));
          updateLearningSessionQuestions(result.session.sessionId, questions);
          registerLearningPracticeSession({
            sessionId: result.session.sessionId,
            roadmapId: input.roadmapId,
            lessonId: input.lessonId,
            title: detail.title || input.title,
            questions,
            currentQuestionIndex: detail.currentQuestionIndex,
          });
        }
      } catch {
        // Room may still poll questions later.
      }
    }

    return result;
  })().finally(() => {
    inFlightStarts.delete(key);
  });

  inFlightStarts.set(key, promise);
  return promise;
}

/** Legacy helper — throws on failure. Prefer startLearningLessonPractice. */
export async function launchLearningInterviewPractice(input: {
  roadmapId: string;
  lessonId: string;
  title: string;
}): Promise<string> {
  const result = await startLearningLessonPractice(input);
  if (!result.ok) {
    throw new Error(result.code);
  }
  return result.session.sessionId;
}

export function ensureLearningSessionRegistered(sessionId: string): boolean {
  return Boolean(getLearningPracticeSession(sessionId));
}
