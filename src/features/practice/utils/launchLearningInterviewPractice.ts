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

/**
 * Identifies a roadmap lesson across the preparation, room, and report routes.
 * The API returns a regular UUID for a practice session, so this context must
 * travel with the client route rather than being inferred from that UUID.
 */
export interface LearningSessionRouteContext {
  roadmapId: string;
  lessonId: string;
}

export function getLearningSessionRouteContext(
  params: URLSearchParams,
): LearningSessionRouteContext | null {
  const roadmapId = params.get('roadmapId')?.trim();
  const lessonId = params.get('lessonId')?.trim();
  return roadmapId && lessonId ? { roadmapId, lessonId } : null;
}

function withLearningSessionRouteContext(
  path: string,
  context?: LearningSessionRouteContext,
  extra?: Record<string, string>,
) {
  if (!context) return path;
  const params = new URLSearchParams({
    roadmapId: context.roadmapId,
    lessonId: context.lessonId,
    ...extra,
  });
  return `${path}?${params.toString()}`;
}

/** Entry into the existing shared interview UI (not a separate Learning room). */
export function learningInterviewPreparePath(
  sessionId: string,
  context?: LearningSessionRouteContext,
) {
  return withLearningSessionRouteContext(`/interview/${sessionId}/prepare`, context);
}

/** Direct path to the shared practice room (same PracticeInterviewPage as B2C). */
export function learningInterviewRoomPath(
  sessionId: string,
  context?: LearningSessionRouteContext,
  startWithCountdown = false,
) {
  return withLearningSessionRouteContext(`/interview/${sessionId}/room`, context,
    startWithCountdown ? { start: 'countdown' } : undefined);
}

export function learningPracticeReportPath(
  sessionId: string,
  context: LearningSessionRouteContext,
) {
  return `/candidate/learning/roadmaps/${encodeURIComponent(context.roadmapId)}/lessons/${encodeURIComponent(context.lessonId)}/report?sessionId=${encodeURIComponent(sessionId)}`;
}

export function learningRoadmapReportPath(roadmapId: string) {
  return `/candidate/learning/roadmaps/${roadmapId}/report`;
}

/**
 * Start (or resume) lesson practice via POST .../lessons/{lessonId}/start.
 * Session data is cached locally for backwards-compatible views only. Routing
 * uses roadmapId/lessonId in the URL, which survives a tab refresh.
 * Concurrent/Strict Mode duplicate calls share one in-flight request.
 */
export async function startLearningLessonPractice(input: {
  roadmapId: string;
  lessonId: string;
  title: string;
  /** 'retry' = luyện lại bài đã hoàn thành (POST .../retry). */
  mode?: 'start' | 'retry';
  /** Refresh the money query after the backend accepts a credit-consuming action. */
  onCreditConsumed?: () => void;
}): Promise<StartLessonResult> {
  const mode = input.mode ?? 'start';
  // Khoá gồm cả mode: start và retry tạo hai buổi khác nhau, gộp chung khoá thì
  // một lượt retry sẽ bị trả về kết quả của lượt start đang bay.
  const key = `${mode}:${input.roadmapId}:${input.lessonId}`;
  const existing = inFlightStarts.get(key);
  if (existing) return existing;

  const promise = (async (): Promise<StartLessonResult> => {
    const result = mode === 'retry'
      ? await roadmapPracticeService.retryLesson(input.roadmapId, input.lessonId)
      : await roadmapPracticeService.startLesson(input.roadmapId, input.lessonId);
    if (!result.ok) return result;

    input.onCreditConsumed?.();

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

/** Luyện LẠI bài đã hoàn thành. Cùng đường đăng ký session với lượt start. */
export async function retryLearningLessonPractice(input: {
  roadmapId: string;
  lessonId: string;
  title: string;
  onCreditConsumed?: () => void;
}): Promise<StartLessonResult> {
  return startLearningLessonPractice({ ...input, mode: 'retry' });
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
