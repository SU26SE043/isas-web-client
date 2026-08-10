import { mockDelay, usesMockData } from '@/shared/mock';
import { apiClient } from '@/shared/api/apiClient';
import { cvAnalysisService } from '@/features/cv-analysis/services/cvAnalysis.service';
import type { UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import type {
  RubricCriterionResponse,
  RubricResponse,
} from '@/features/rubrics/types/rubric.types';
import {
  domainToJobCategoryEnum,
  isJobDomainId,
  resolveJobDomainFromCategory,
  type JobCategoryEnum,
} from '@/shared/domain/jobDomains';
import {
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

function resolveJobCategoryFromDomainId(domainId: string): JobCategoryEnum {
  if (domainId === 'FE' || domainId === 'BE' || domainId === 'BA') {
    return domainId;
  }
  if (isJobDomainId(domainId)) {
    return domainToJobCategoryEnum(domainId);
  }
  return resolveJobDomainFromCategory(domainId)?.jobCategoryEnum ?? 'FE';
}

function mapApiCriterionToPractice(criterion: RubricCriterionResponse): PracticeRubricCriterion {
  const weightPercent = Math.round(criterion.weight * 10000) / 100;
  return {
    id: criterion.id,
    name: criterion.name,
    description: criterion.description ?? '',
    weight: weightPercent,
    maxScore: Number.isFinite(criterion.maxScore) && criterion.maxScore > 0 ? criterion.maxScore : 10,
  };
}

function mapPracticeCriteriaToUpdatePayload(criteria: PracticeRubricCriterion[]) {
  return {
    criteria: criteria.map((criterion) => ({
      name: criterion.name.trim(),
      description: criterion.description.trim() || null,
      weight: criterion.weight / 100,
      maxScore: criterion.maxScore > 0 ? criterion.maxScore : 10,
    })),
  };
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

  /**
   * Wizard step 5: load rubric for the domain chosen in step 1.
   * Always hits live GET `/api/v1/interview/practice/rubrics/{jobCategory}` (FE|BE|BA).
   */
  async getRubric(domainId: string, signal?: AbortSignal): Promise<PracticeRubricCriterion[]> {
    const jobCategory = resolveJobCategoryFromDomainId(domainId);
    if (usesMockData('practice')) {
      await mockDelay(50);
      return [
        { id: `${jobCategory}-communication`, name: 'Communication', description: 'Clarity and structure of the answer.', weight: 50, maxScore: 10 },
        { id: `${jobCategory}-technical`, name: 'Technical depth', description: 'Accuracy and depth of the solution.', weight: 50, maxScore: 10 },
      ];
    }
    const response = await apiClient.get<RubricResponse>(practiceSetupEndpoints.rubric(jobCategory), {
      signal,
    });
    const criteria = Array.isArray(response.data?.criteria) ? response.data.criteria : [];
    return criteria.map(mapApiCriterionToPractice);
  },

  /** @deprecated Prefer getRubric — kept for callers still using generateRubric name. */
  async generateRubric(input: GenerateRubricInput): Promise<PracticeRubricCriterion[]> {
    return this.getRubric(input.domainId);
  },

  /**
   * Persist edited rubric for the domain (PUT).
   * Always live API — no mock.
   */
  async updateRubric(domainId: string, criteria: PracticeRubricCriterion[]): Promise<PracticeRubricCriterion[]> {
    const jobCategory = resolveJobCategoryFromDomainId(domainId);
    const response = await apiClient.put<RubricResponse>(
      practiceSetupEndpoints.rubric(jobCategory),
      mapPracticeCriteriaToUpdatePayload(criteria),
    );
    const next = Array.isArray(response.data?.criteria) ? response.data.criteria : [];
    return next.map(mapApiCriterionToPractice);
  },

  /**
   * Reset rubric to system default (DELETE), then reload via GET.
   * Always live API — no mock.
   */
  async resetRubric(domainId: string): Promise<PracticeRubricCriterion[]> {
    const jobCategory = resolveJobCategoryFromDomainId(domainId);
    await apiClient.delete(practiceSetupEndpoints.rubric(jobCategory), {
      validateStatus: (status) => status === 204 || (status >= 200 && status < 300),
    });
    return this.getRubric(domainId);
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
