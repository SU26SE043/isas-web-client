import { mockDelay, usesMockData } from '@/shared/mock';
import { profileService } from '@/features/profile/services/profile.service';
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
    if (!usesMockData('practice')) {
      throw new Error('Practice session API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(1000);
    return MOCK_PRACTICE_SESSIONS[sessionId] ?? { ...DEFAULT_PRACTICE_SESSION, sessionId };
  },

  async startSession(sessionId: string): Promise<SessionStartResult> {
    if (!usesMockData('practice')) {
      throw new Error('Practice session API is not wired yet. Keep usesMockData("practice") true.');
    }

    const creditsRemaining = await profileService.reservePracticeCredit(sessionId);
    startedSessions.add(sessionId);
    chunkCounts.set(sessionId, 0);
    proctoringCounts.set(sessionId, 0);

    return {
      sessionId,
      creditsRemaining,
      startedAt: new Date().toISOString(),
    };
  },

  async pollQuestions(sessionId: string): Promise<PracticeQuestion[]> {
    if (!usesMockData('practice')) {
      throw new Error('Practice questions API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(800);

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
