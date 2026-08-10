import { mockDelay, usesMockData } from '@/shared/mock';
import { resultService } from './result.service';
import { isCampaignSessionId } from '../types/interviewFlow.types';
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
import { getPracticeSession } from './b2cPracticeSession.service';
import { readCampaignInterviewSession } from '@/features/campaigns/utils/campaignInterviewSession';

let asyncQuestionPollCount = 0;
const startedSessions = new Set<string>();
const chunkCounts = new Map<string, number>();
const proctoringCounts = new Map<string, number>();

function requireSessionId(value: string): string {
  const sessionId = value.trim();
  if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
    throw new Error('SESSION_ID_REQUIRED');
  }
  return sessionId;
}

function toLegacySessionStatus(
  status: string,
  hasQuestions: boolean,
): PracticeSession['status'] {
  const normalized = status.toLowerCase();
  if (normalized === 'inprogress' || normalized === 'in_progress') return 'in_progress';
  if (
    normalized === 'completed' ||
    normalized === 'submitted' ||
    normalized === 'scoring' ||
    normalized === 'scored'
  ) {
    return 'completed';
  }
  if (normalized === 'generatingquestions' || normalized === 'created') return 'initializing';
  return hasQuestions ? 'ready' : 'initializing';
}

export const practiceSessionService = {
  getProctoringConfig(sessionId: string): ProctoringConfig {
    return isCampaignSessionId(sessionId) ? B2B_PROCTORING_CONFIG : B2C_PROCTORING_CONFIG;
  },

  async acceptTerms(sessionId: string): Promise<void> {
    // The live campaign gateway currently has no terms endpoint. The terms gate
    // remains client-side until that contract is added; B2C behavior is unchanged.
    if (isCampaignSessionId(sessionId)) return;
    if (!usesMockData('practice')) {
      throw new Error('Practice session API is not wired yet. Keep usesMockData("practice") true.');
    }
    await mockDelay(200);
    void sessionId;
  },

  async getSession(sessionId: string): Promise<PracticeSession> {
    const normalizedSessionId = requireSessionId(sessionId);
    const campaignSession = readCampaignInterviewSession(normalizedSessionId);
    if (campaignSession) {
      return {
        sessionId: normalizedSessionId,
        title: '',
        description: '',
        status: campaignSession.questions.length > 0 ? 'ready' : 'initializing',
        questions: campaignSession.questions.map((question) => ({
          id: question.id,
          content: question.content,
          timeLimitSeconds: question.timeLimitSec,
        })),
      };
    }
    const learning = getLearningPracticeSession(normalizedSessionId);
    if (learning) {
      if (learning.questions.length === 0) {
        try {
          const detail = await roadmapPracticeService.getPracticeSession(normalizedSessionId);
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
      const detail = await getPracticeSession(normalizedSessionId);
      return {
        sessionId: detail.id || normalizedSessionId,
        title: '',
        description: '',
        jobCategory: detail.jobCategory ? String(detail.jobCategory) : undefined,
        status: toLegacySessionStatus(detail.status, detail.questions.length > 0),
        questions: detail.questions.map((question) => ({
          id: question.id,
          content: question.content,
          timeLimitSeconds: question.timeLimitSec,
        })),
      };
    }

    await mockDelay(1000);
    return (
      getDynamicPracticeSession(normalizedSessionId) ??
      MOCK_PRACTICE_SESSIONS[normalizedSessionId] ??
      { ...DEFAULT_PRACTICE_SESSION, sessionId: normalizedSessionId }
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
        tokensAvailable: 0,
        reservedTokens: 0,
        startedAt: new Date().toISOString(),
      };
    }

    if (!usesMockData('practice')) {
      throw new Error('Practice session API is not wired yet. Keep usesMockData("practice") true.');
    }

    startedSessions.add(sessionId);
    chunkCounts.set(sessionId, 0);
    proctoringCounts.set(sessionId, 0);

    return {
      sessionId,
      tokensAvailable: 0,
      reservedTokens: 0,
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
      const detail = await getPracticeSession(sessionId);
      return detail.questions.map((question) => ({
        id: question.id,
        content: question.content,
        timeLimitSeconds: question.timeLimitSec,
      }));
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

    const assessmentId = sessionId;
    resultService.registerPendingAssessment(assessmentId);

    return {
      sessionId,
      assessmentId,
      uploadComplete: (chunkCounts.get(sessionId) ?? 0) > 0,
    };
  },
};

export type { PracticeQuestion, PracticeSession };
