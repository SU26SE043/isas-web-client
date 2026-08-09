import { apiClient } from '@/shared/api/apiClient';
import { getApiStatusCode } from '@/shared/api/apiError';
import { mockDelay, usesMockData } from '@/shared/mock';
import type {
  CreatePracticeSessionRequest,
  PracticeSessionResponse,
  SubmitPracticeAnswerInput,
  SubmitPracticeAnswerResponse,
  PracticeJobCategory,
  PracticeLanguage,
  PracticeSessionOptions,
} from '../types/b2cPracticeSession.types';
import { PRACTICE_ANSWER_AUDIO_MAX_BYTES } from '../types/b2cPracticeSession.types';
import { b2cPracticeSessionEndpoints } from './b2cPracticeSession.endpoints';
import {
  extractSessionIdFromCreateResponse,
  applyRubricCatalogToSession,
  mapPracticeSessionResponse,
  mapSubmitPracticeAnswerResponse,
  sessionNeedsRubricEnrichment,
} from '../utils/mapB2cPracticeSession';
import { multipartFormDataConfig } from '../utils/multipartFormDataConfig';
import { practiceSetupEndpoints } from './practiceSetup.endpoints';
import { resolveJobDomainFromCategory } from '@/shared/domain/jobDomains';
import type { RubricResponse } from '@/features/rubrics/types/rubric.types';
import type { PracticeRubricCriterionRef } from '../types/b2cPracticeSession.types';
import { isValidPracticeSessionId } from '../utils/practiceSessionId';
import { paymentService } from '@/features/payment/services/payment.service';

const mockSessions = new Map<string, PracticeSessionResponse>();
const mockScoringPollCounts = new Map<string, number>();

function buildMockSession(payload: CreatePracticeSessionRequest): PracticeSessionResponse {
  const sessionId = `session-${crypto.randomUUID().slice(0, 8)}`;
  const count = payload.questionCount ?? 5;
  const timeLimitSec = payload.timeLimitSec ?? 120;
  const questions = Array.from({ length: count }, (_, index) => ({
    id: `${sessionId}-q${index + 1}`,
    orderNo: index + 1,
    content: `Question ${index + 1} for ${payload.jobCategory}: describe a relevant experience.`,
    timeLimitSec,
    kind: 'question',
  }));

  const session: PracticeSessionResponse = {
    id: sessionId,
    status: 'InProgress',
    jobCategory: payload.jobCategory,
    timeLimitSec,
    questionCount: count,
    cvId: payload.cvId ?? null,
    jdId: payload.jdId ?? null,
    questions,
    result: null,
    answers: [],
  };
  mockSessions.set(sessionId, session);
  return session;
}

export async function createPracticeSession(
  payload: CreatePracticeSessionRequest,
): Promise<PracticeSessionResponse> {
  if (usesMockData('practice')) {
    await mockDelay(400);
    const session = buildMockSession(payload);
    await paymentService.reserveTokens(session.id);
    return session;
  }

  const response = await apiClient.post<unknown>(b2cPracticeSessionEndpoints.sessions, payload, {
    validateStatus: (status) => status === 201 || (status >= 200 && status < 300),
  });
  const mapped = mapPracticeSessionResponse(response.data);
  const id = mapped.id || extractSessionIdFromCreateResponse(response.data);
  if (!id) {
    throw new Error('Create practice session response missing session id');
  }
  return { ...mapped, id };
}

export async function getPracticeSessionOptions(
  jobCategory: PracticeJobCategory,
  language: PracticeLanguage = 'vi',
): Promise<PracticeSessionOptions> {
  if (usesMockData('practice')) {
    await mockDelay(100);
    return {
      adaptiveEnabled: true,
      maxDeepPerQuestion: 3,
      contentCriteriaCount: 6,
      questionCountMin: 1,
      questionCountMax: 20,
      defaultQuestionCount: 5,
      presets: [
        { key: 'short', questionCount: 5, seedCount: 2, coversAllCriteria: false },
        { key: 'medium', questionCount: 10, seedCount: 4, coversAllCriteria: true },
        { key: 'long', questionCount: 15, seedCount: 6, coversAllCriteria: true },
      ],
      preview: Array.from({ length: 20 }, (_, index) => ({
        questionCount: index + 1,
        seedCount: Math.max(1, Math.ceil((index + 1) / 3)),
      })),
    };
  }

  const response = await apiClient.get<PracticeSessionOptions>(
    b2cPracticeSessionEndpoints.sessionOptions,
    { params: { jobCategory, language } },
  );
  return response.data;
}

/** Alias for session detail / report screens. Same endpoint as `getPracticeSession`. */
export async function getPracticeSessionDetail(
  sessionId: string,
): Promise<PracticeSessionResponse> {
  return getPracticeSession(sessionId);
}

export async function getPracticeSession(sessionId: string): Promise<PracticeSessionResponse> {
  if (usesMockData('practice')) {
    await mockDelay(250);
    const existing = mockSessions.get(sessionId);
    if (existing) {
      if (existing.status === 'Scoring') {
        const polls = (mockScoringPollCounts.get(sessionId) ?? 0) + 1;
        mockScoringPollCounts.set(sessionId, polls);
        if (polls >= 2) {
          existing.status = 'Scored';
          existing.result = {
            overallScore: 78,
            criteriaScores: [
              { name: 'Communication', score: 80, maxScore: 100, comment: null },
              { name: 'Technical', score: 75, maxScore: 100, comment: null },
            ],
            needsImprovement: ['Provide more concrete examples.'],
            overallComment: 'Solid practice session with room to deepen technical answers.',
            cvVsAnswer: existing.cvId
              ? { summary: 'Answers generally align with the provided CV.', consistencyScore: 72 }
              : null,
          };
          mockSessions.set(sessionId, existing);
        }
      }
      return structuredClone(existing);
    }
    return {
      id: sessionId,
      status: 'Scoring',
      questions: [],
      result: null,
      answers: [],
    };
  }

  if (!isValidPracticeSessionId(sessionId)) {
    throw new Error('INVALID_PRACTICE_SESSION_ID');
  }

  const response = await apiClient.get<unknown>(b2cPracticeSessionEndpoints.session(sessionId));
  let mapped = mapPracticeSessionResponse(response.data);
  mapped = { ...mapped, id: mapped.id || sessionId };
  return enrichSessionWithRubricCatalog(mapped);
}

async function enrichSessionWithRubricCatalog(
  session: PracticeSessionResponse,
): Promise<PracticeSessionResponse> {
  if (!sessionNeedsRubricEnrichment(session)) return session;
  const jobCategory =
    resolveJobDomainFromCategory(String(session.jobCategory ?? ''))?.jobCategoryEnum ??
    (session.jobCategory === 'FE' || session.jobCategory === 'BE' || session.jobCategory === 'BA'
      ? session.jobCategory
      : null);
  if (!jobCategory) return session;
  try {
    const response = await apiClient.get<RubricResponse>(
      practiceSetupEndpoints.rubric(jobCategory),
    );
    const rubric: PracticeRubricCriterionRef[] = (response.data?.criteria ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      maxScore: item.maxScore,
      description: item.description ?? null,
    }));
    return applyRubricCatalogToSession(session, rubric);
  } catch {
    return session;
  }
}

export async function getQuestionSpeech(sessionId: string, questionId: string): Promise<Blob> {
  if (usesMockData('practice')) {
    await mockDelay(200);
    // Minimal silent-ish mpeg placeholder bytes (not a real frame) — room handles play errors.
    return new Blob([new Uint8Array([0xff, 0xfb, 0x90, 0x00])], { type: 'audio/mpeg' });
  }

  const response = await apiClient.get<Blob>(
    b2cPracticeSessionEndpoints.speech(sessionId, questionId),
    { responseType: 'blob' },
  );
  return response.data;
}

/** Authenticated audio replay; callers must create an object URL from the returned Blob. */
export async function getPracticeAnswerAudio(sessionId: string, answerId: string): Promise<Blob> {
  if (usesMockData('practice')) {
    await mockDelay(100);
    return new Blob([], { type: 'audio/webm' });
  }

  const response = await apiClient.get<Blob>(
    b2cPracticeSessionEndpoints.answerAudio(sessionId, answerId),
    { responseType: 'blob' },
  );
  return response.data;
}

export async function submitPracticeAnswer(
  input: SubmitPracticeAnswerInput,
): Promise<SubmitPracticeAnswerResponse> {
  if (input.file.size > PRACTICE_ANSWER_AUDIO_MAX_BYTES) {
    throw Object.assign(new Error('ANSWER_FILE_TOO_LARGE'), { code: 'audio_too_large' });
  }

  if (usesMockData('practice')) {
    await mockDelay(400);
    const session = mockSessions.get(input.sessionId);
    const currentIndex =
      session?.questions.findIndex((q) => q.id === input.questionId) ?? -1;
    const next =
      session && currentIndex >= 0 && currentIndex < session.questions.length - 1
        ? session.questions[currentIndex + 1]
        : null;
    const interviewComplete = !next;

    if (session) {
      session.answers = [
        ...(session.answers ?? []).filter((a) => a.questionId !== input.questionId),
        {
          questionId: input.questionId,
          answerId: `ans-${crypto.randomUUID().slice(0, 6)}`,
          status: 'submitted',
          transcript: null,
        },
      ];
      mockSessions.set(input.sessionId, session);
    }

    return {
      answerId: `ans-${crypto.randomUUID().slice(0, 6)}`,
      questionId: input.questionId,
      status: 'submitted',
      transcript: null,
      nextAction: interviewComplete ? 'end' : 'new_question',
      nextQuestion: next,
      interviewComplete,
    };
  }

  const formData = new FormData();
  formData.append('questionId', input.questionId);
  formData.append('file', input.file);
  formData.append('durationSec', String(Math.max(0, Math.round(input.durationSec))));

  const response = await apiClient.post<unknown>(
    b2cPracticeSessionEndpoints.answers(input.sessionId),
    formData,
    multipartFormDataConfig,
  );
  return mapSubmitPracticeAnswerResponse(response.data);
}

export async function submitPracticeSession(sessionId: string): Promise<void> {
  if (usesMockData('practice')) {
    await mockDelay(300);
    const session = mockSessions.get(sessionId);
    if (session) {
      session.status = 'Scoring';
      mockScoringPollCounts.set(sessionId, 0);
      mockSessions.set(sessionId, session);
    }
    return;
  }

  // Empty body: do not send JSON `null` with Content-Type application/json —
  // ASP.NET often responds 400 for that on no-body POST endpoints.
  await apiClient.post(b2cPracticeSessionEndpoints.submit(sessionId), undefined, {
    validateStatus: (status) => status === 204,
    transformRequest: [
      (data, headers) => {
        if (headers && typeof headers === 'object') {
          if ('delete' in headers && typeof (headers as { delete: (key: string) => void }).delete === 'function') {
            (headers as { delete: (key: string) => void }).delete('Content-Type');
          } else {
            delete (headers as Record<string, unknown>)['Content-Type'];
          }
        }
        return data;
      },
    ],
  });
}

export function isPracticeSessionAlreadySubmittedError(error: unknown): boolean {
  const status = getApiStatusCode(error);
  if (status !== 400) return false;
  return true;
}

/** Test/helper: seed mock session store when mock mode is on. */
export function __setMockPracticeSessionForTests(session: PracticeSessionResponse): void {
  mockSessions.set(session.id, session);
}
