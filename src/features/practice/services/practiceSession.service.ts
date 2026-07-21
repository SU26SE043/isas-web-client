import { mockDelay, usesMockData } from '@/shared/mock';
import { paymentService } from '@/features/payment/services/payment.service';
import { resultService } from './result.service';
import { isCampaignSessionId, isLearningSessionId } from '../types/interviewFlow.types';
import {
  B2B_PROCTORING_CONFIG,
  B2C_PROCTORING_CONFIG,
  type ProctoringConfig,
} from '../types/proctoring.types';
import {
  DEFAULT_PRACTICE_SESSION,
  MOCK_ASYNC_QUESTIONS,
  MOCK_PRACTICE_SESSIONS,
  type PracticeQuestion,
  type PracticeSession,
} from '../mocks/session.fixtures';
import type {
  ChunkUploadResult,
  ProctoringEventPayload,
  SessionCompleteResult,
  SessionStartResult,
} from '../types/practiceSession.api.types';
import { getDynamicPracticeSession } from './practiceSetup.service';
import {
  getLearningPracticeSession,
  toPracticeSession,
  updateLearningSessionQuestions,
} from './learningPracticeSession.registry';
import { roadmapPracticeService } from './roadmapPractice.service';

let asyncQuestionPollCount = 0;
const startedSessions = new Set<string>();
const chunkCounts = new Map<string, number>();
const proctoringCounts = new Map<string, number>();

export const practiceSessionService = {
  getProctoringConfig(sessionId: string): ProctoringConfig {
    return isCampaignSessionId(sessionId) ? B2B_PROCTORING_CONFIG : B2C_PROCTORING_CONFIG;
  },

  async acceptTerms(sessionId: string): Promise<void> {
    if (!usesMockData('practice')) {
      throw new Error('Practice session API is not wired yet. Keep usesMockData("practice") true.');
    }
    await mockDelay(200);
    void sessionId;
  },

  async getSession(sessionId: string): Promise<PracticeSession> {
    const learning = getLearningPracticeSession(sessionId);
    if (learning) {
      if (learning.questions.length === 0) {
        try {
          const detail = await roadmapPracticeService.getPracticeSession(sessionId);
          if (detail.questions?.length) {
            const questions = detail.questions.map((item) => ({
              id: item.id,
              content: item.content || item.prompt || item.title || 'Question',
              timeLimitSeconds: item.timeLimitSeconds ?? item.durationSec ?? 120,
            }));
            updateLearningSessionQuestions(sessionId, questions);
            return toPracticeSession({ ...learning, questions, title: detail.title || learning.title });
          }
        } catch {
          // Fall through to registry / mock.
        }
      }
      return toPracticeSession(learning);
    }

    if (!usesMockData('practice')) {
      throw new Error('Practice session API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(1000);
    return (
      getDynamicPracticeSession(sessionId) ??
      MOCK_PRACTICE_SESSIONS[sessionId] ??
      { ...DEFAULT_PRACTICE_SESSION, sessionId }
    );
  },

  async startSession(sessionId: string): Promise<SessionStartResult> {
    const learning = getLearningPracticeSession(sessionId);
    if (learning) {
      startedSessions.add(sessionId);
      chunkCounts.set(sessionId, 0);
      proctoringCounts.set(sessionId, 0);
      return {
        sessionId,
        tokensAvailable: paymentService.getAvailableBalance(),
        reservedTokens: 0,
        startedAt: new Date().toISOString(),
      };
    }

    if (!usesMockData('practice')) {
      throw new Error('Practice session API is not wired yet. Keep usesMockData("practice") true.');
    }

    if (
      !isCampaignSessionId(sessionId) &&
      !isLearningSessionId(sessionId) &&
      !paymentService.hasReservation(sessionId)
    ) {
      throw new Error('no_reservation');
    }

    startedSessions.add(sessionId);
    chunkCounts.set(sessionId, 0);
    proctoringCounts.set(sessionId, 0);

    return {
      sessionId,
      tokensAvailable: paymentService.getAvailableBalance(),
      reservedTokens: paymentService.getReservationAmount(sessionId),
      startedAt: new Date().toISOString(),
    };
  },

  async pollQuestions(sessionId: string): Promise<PracticeQuestion[]> {
    const learning = getLearningPracticeSession(sessionId);
    if (learning) {
      if (learning.questions.length > 0) return learning.questions;
      const detail = await roadmapPracticeService.getPracticeSession(sessionId);
      const questions = (detail.questions ?? []).map((item) => ({
        id: item.id,
        content: item.content || item.prompt || item.title || 'Question',
        timeLimitSeconds: item.timeLimitSeconds ?? item.durationSec ?? 120,
      }));
      if (questions.length) updateLearningSessionQuestions(sessionId, questions);
      return questions;
    }

    if (!usesMockData('practice')) {
      throw new Error('Practice questions API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(800);

    const dynamicSession = getDynamicPracticeSession(sessionId);
    if (dynamicSession && dynamicSession.questions.length > 0) {
      return dynamicSession.questions;
    }

    const session = MOCK_PRACTICE_SESSIONS[sessionId];
    if (session?.status === 'ready') {
      return session.questions;
    }

    asyncQuestionPollCount += 1;
    if (asyncQuestionPollCount < 3) {
      return [];
    }

    asyncQuestionPollCount = 0;
    return MOCK_ASYNC_QUESTIONS;
  },

  async uploadRecordingChunk(sessionId: string, chunkIndex: number, blob: Blob): Promise<ChunkUploadResult> {
    if (!usesMockData('practice')) {
      throw new Error('Practice session API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(300);
    chunkCounts.set(sessionId, Math.max(chunkCounts.get(sessionId) ?? 0, chunkIndex + 1));
    void blob;

    return {
      chunkIndex,
      receivedAt: new Date().toISOString(),
    };
  },

  async reportProctoringEvent(sessionId: string, event: ProctoringEventPayload): Promise<void> {
    if (!usesMockData('practice')) {
      throw new Error('Practice session API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(100);
    proctoringCounts.set(sessionId, (proctoringCounts.get(sessionId) ?? 0) + 1);
    void event;
  },

  getUploadedChunkCount(sessionId: string): number {
    return chunkCounts.get(sessionId) ?? 0;
  },

  async completeSession(sessionId: string): Promise<SessionCompleteResult> {
    if (!usesMockData('practice')) {
      throw new Error('Practice session API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(1200);
    startedSessions.delete(sessionId);

    const assessmentId = `assessment-${sessionId}`;
    resultService.registerPendingAssessment(assessmentId);

    return {
      sessionId,
      assessmentId,
      uploadComplete: (chunkCounts.get(sessionId) ?? 0) > 0,
    };
  },
};

export type { PracticeQuestion, PracticeSession };
