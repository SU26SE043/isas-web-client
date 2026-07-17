import { mockDelay, usesMockData } from '@/shared/mock';
import { apiClient } from '@/shared/api/apiClient';
import { cvAnalysisService } from '@/features/cv-analysis/services/cvAnalysis.service';
import type { UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import {
  DEFAULT_PRACTICE_RUBRIC,
  PRACTICE_DOMAINS,
  PRACTICE_LEVELS_LIST,
} from '../mocks/practiceSetup.fixtures';
import type { PracticeQuestion, PracticeSession } from '../mocks/session.fixtures';
import type {
  GenerateRubricInput,
  PracticeDomain,
  PracticeLevel,
  PracticeRubricCriterion,
  PracticeSessionCreateInput,
  PracticeSessionCreateResult,
} from '../types/practiceSetup.types';
import { normalizePracticeLevels } from '@/shared/domain/practiceLevels';
import { practiceSetupEndpoints } from './practiceSetup.endpoints';

const dynamicSessions = new Map<string, PracticeSession>();

export function getDynamicPracticeSession(sessionId: string): PracticeSession | undefined {
  return dynamicSessions.get(sessionId);
}

function findDomain(domainId: string): PracticeDomain | undefined {
  return PRACTICE_DOMAINS.find((item) => item.id === domainId);
}

function buildSessionTitle(domainId: string, level: PracticeLevel): string {
  const domain = findDomain(domainId);
  const domainName = domain?.nameVi ?? domain?.name ?? domainId;
  return `Phỏng vấn ${domainName} — ${level}`;
}

function buildMockQuestions(sessionId: string, count: number, title: string): PracticeQuestion[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${sessionId}-q${index + 1}`,
    content: `Question ${index + 1}: Share your experience relevant to ${title}.`,
    timeLimitSeconds: 120,
  }));
}

export const practiceSetupService = {
  async listDomains(): Promise<PracticeDomain[]> {
    if (!usesMockData('practice')) {
      const response = await apiClient.get<PracticeDomain[]>(practiceSetupEndpoints.domains);
      return response.data;
    }

    await mockDelay(300);
    return structuredClone(PRACTICE_DOMAINS);
  },

  async listLevels(): Promise<PracticeLevel[]> {
    if (!usesMockData('practice')) {
      const response = await apiClient.get<string[]>(practiceSetupEndpoints.levels);
      return normalizePracticeLevels(response.data);
    }

    await mockDelay(150);
    return [...PRACTICE_LEVELS_LIST];
  },

  async listUploadedCvs(): Promise<UploadedCvFile[]> {
    return cvAnalysisService.listUploadedCvs();
  },

  async uploadCv(file: File, language: 'vi' | 'en'): Promise<UploadedCvFile> {
    if (!usesMockData('practice')) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);
      const response = await apiClient.post<UploadedCvFile>(practiceSetupEndpoints.uploadCv, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    const record = await cvAnalysisService.uploadCv(file);
    return {
      id: record.id,
      fileName: record.originalName,
      fileSizeBytes: record.fileSize,
      mimeType: record.mimeType,
      uploadedAt: record.createdAt,
      pdfUrl: '',
    };
  },

  async generateRubric(input: GenerateRubricInput): Promise<PracticeRubricCriterion[]> {
    if (!usesMockData('practice')) {
      const response = await apiClient.post<PracticeRubricCriterion[]>(
        practiceSetupEndpoints.generateRubric,
        input,
      );
      return response.data;
    }

    await mockDelay(600);
    const domain = findDomain(input.domainId);
    const domainLabel = domain?.name ?? input.domainId;
    return DEFAULT_PRACTICE_RUBRIC.map((item) => ({
      ...item,
      description: `${item.description} (${domainLabel}, ${input.level})`,
    }));
  },

  async createSession(input: PracticeSessionCreateInput): Promise<PracticeSessionCreateResult> {
    if (!usesMockData('practice')) {
      const response = await apiClient.post<PracticeSessionCreateResult>(
        practiceSetupEndpoints.createSession,
        input,
      );
      return response.data;
    }

    await mockDelay(500);
    const sessionId = `session-${crypto.randomUUID().slice(0, 8)}`;
    const title = buildSessionTitle(input.domainId, input.level);
    const domain = findDomain(input.domainId);

    dynamicSessions.set(sessionId, {
      sessionId,
      title,
      description: domain?.descriptionVi ?? domain?.description ?? 'B2C practice session',
      status: 'initializing',
      questions: buildMockQuestions(sessionId, input.questionCount, title),
    });

    return { sessionId, title };
  },
};
