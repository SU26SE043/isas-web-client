import { mockDelay, usesMockData } from '@/shared/mock';
import { apiClient } from '@/shared/api/apiClient';
import {
  domainToJobCategoryEnum,
  isJobDomainId,
  resolveJobDomainFromCategory,
  type JobCategoryEnum,
} from '@/shared/domain/jobDomains';
import { resolvePracticeLevel, type PracticeLevel } from '@/shared/domain/practiceLevels';
import type {
  Achievement,
  CertificateRecord,
  CreateRoadmapApiRequest,
  CreateRoadmapInput,
  LeaderboardEntry,
  LearningModule,
  LearningModuleContent,
  LearningPracticeSession,
  ProgressDashboardData,
  RoadmapResponse,
  RoadmapStep,
} from '../types/learning.types';
import {
  MOCK_CERTIFICATES,
  MOCK_LEARNING_MODULES,
  MOCK_MODULE_CONTENT,
  MOCK_ROADMAP,
} from '../mocks/learning.fixtures';
import {
  MOCK_ACHIEVEMENTS,
  MOCK_LEADERBOARD,
  MOCK_PRACTICE_SESSIONS,
  MOCK_PROGRESS_DASHBOARD,
} from '../mocks/progress.fixtures';
import { learningPathService } from './learningPath.service';
import { learningEndpoints } from './learning.endpoints';
import { CreateRoadmapError, mapCreateRoadmapError } from '../utils/roadmapCreateErrors';

let roadmapRegenerateCount = MOCK_ROADMAP.regenerateCount;
let latestCreatedRoadmap: RoadmapResponse | null = null;

function resolveJobCategoryFromDomainId(domainId: string): JobCategoryEnum {
  if (domainId === 'FE' || domainId === 'BE' || domainId === 'BA') {
    return domainId;
  }
  if (isJobDomainId(domainId)) {
    return domainToJobCategoryEnum(domainId);
  }
  return resolveJobDomainFromCategory(domainId)?.jobCategoryEnum ?? 'FE';
}

/** Map wizard UI levels (incl. intern/lead) → API Fresher|Junior|Middle|Senior. */
function resolveApiRoadmapLevel(targetLevel: string): PracticeLevel {
  const mapped: Record<string, PracticeLevel> = {
    intern: 'Fresher',
    fresher: 'Fresher',
    junior: 'Junior',
    middle: 'Middle',
    senior: 'Senior',
    lead: 'Senior',
  };
  const key = targetLevel.trim().toLowerCase();
  return mapped[key] ?? resolvePracticeLevel(targetLevel) ?? 'Fresher';
}

function normalizeRoadmapSteps(raw: unknown): RoadmapStep[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const step = (item ?? {}) as Partial<RoadmapStep> & Record<string, unknown>;
    return {
      id: String(step.id ?? `step-${index + 1}`),
      title: String(step.title ?? ''),
      titleVi: String(step.titleVi ?? step.title ?? ''),
      description: String(step.description ?? ''),
      descriptionVi: String(step.descriptionVi ?? step.description ?? ''),
      skillTag: String(step.skillTag ?? ''),
      skillTagVi: String(step.skillTagVi ?? step.skillTag ?? ''),
      estimatedWeeks: Number(step.estimatedWeeks ?? 1),
      moduleId: typeof step.moduleId === 'string' ? step.moduleId : undefined,
      completed: Boolean(step.completed),
    };
  });
}

function normalizeCreateRoadmapResponse(
  data: Record<string, unknown> | null | undefined,
  input: CreateRoadmapInput,
): RoadmapResponse {
  const payload = data ?? {};
  const id =
    (typeof payload.id === 'string' && payload.id) ||
    (typeof payload.roadmapId === 'string' && payload.roadmapId) ||
    undefined;
  const steps = normalizeRoadmapSteps(payload.steps);
  return {
    id,
    steps: steps.length > 0 ? steps : MOCK_ROADMAP.steps,
    regenerateCount: Number(payload.regenerateCount ?? 0),
    regenerateLimit: Number(payload.regenerateLimit ?? MOCK_ROADMAP.regenerateLimit),
    domainId: input.domainId,
    targetLevel: input.targetLevel,
    // Reports are not sent to the API yet — keep UI selection locally only.
    sourceReportIds: input.reportIds ? [...input.reportIds] : [],
  };
}

export const learningService = {
  async getRoadmap(): Promise<RoadmapResponse> {
    if (!usesMockData('practice')) {
      throw new Error('Practice learning API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(400);
    if (latestCreatedRoadmap) {
      return {
        ...latestCreatedRoadmap,
        regenerateCount: roadmapRegenerateCount,
      };
    }
    return {
      ...MOCK_ROADMAP,
      regenerateCount: roadmapRegenerateCount,
    };
  },

  /**
   * Create personalized roadmap.
   * Always calls live POST `/api/v1/interview/practice/roadmaps`.
   * Body: `{ jobCategory, level, cvId? }` — reportIds intentionally omitted until API supports them.
   */
  async createRoadmap(input: CreateRoadmapInput): Promise<RoadmapResponse> {
    if (!input.domainId || !input.targetLevel) {
      throw new CreateRoadmapError('invalid_input');
    }

    const level = resolveApiRoadmapLevel(input.targetLevel);

    const body: CreateRoadmapApiRequest = {
      jobCategory: resolveJobCategoryFromDomainId(input.domainId),
      level,
    };
    if (input.cvId) {
      body.cvId = input.cvId;
    }

    try {
      const response = await apiClient.post<Record<string, unknown>>(
        learningEndpoints.createRoadmap,
        body,
        { validateStatus: (status) => status === 201 || (status >= 200 && status < 300) },
      );

      const created = normalizeCreateRoadmapResponse(response.data, {
        ...input,
        targetLevel: level,
      });

      latestCreatedRoadmap = created;
      roadmapRegenerateCount = created.regenerateCount;
      await learningPathService.registerCreatedRoadmap({
        ...input,
        targetLevel: level,
        roadmapId: created.id,
        reportIds: input.reportIds ?? [],
      });
      return created;
    } catch (error) {
      throw mapCreateRoadmapError(error);
    }
  },

  async regenerateRoadmap(): Promise<RoadmapResponse> {
    if (!usesMockData('practice')) {
      throw new Error('Practice learning API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(800);

    if (roadmapRegenerateCount >= MOCK_ROADMAP.regenerateLimit) {
      throw new Error('ROADMAP_REGEN_LIMIT');
    }

    roadmapRegenerateCount += 1;
    return {
      ...MOCK_ROADMAP,
      regenerateCount: roadmapRegenerateCount,
      steps: MOCK_ROADMAP.steps.map((step, index) => ({
        ...step,
        estimatedWeeks: step.estimatedWeeks + (index === 0 ? 0 : 1),
      })),
    };
  },

  async listModules(): Promise<LearningModule[]> {
    if (!usesMockData('practice')) {
      throw new Error('Practice learning API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(350);
    return MOCK_LEARNING_MODULES.map((module) => ({ ...module }));
  },

  async getModule(moduleId: string): Promise<LearningModule> {
    if (!usesMockData('practice')) {
      throw new Error('Practice learning API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(250);
    const module = MOCK_LEARNING_MODULES.find((item) => item.id === moduleId);
    if (!module) {
      throw new Error('MODULE_NOT_FOUND');
    }
    return { ...module };
  },

  async getModuleContent(moduleId: string): Promise<LearningModuleContent> {
    if (!usesMockData('practice')) {
      throw new Error('Practice learning API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(300);
    const content = MOCK_MODULE_CONTENT[moduleId];
    if (!content) {
      throw new Error('MODULE_NOT_FOUND');
    }
    return content;
  },

  async completeModule(moduleId: string, progressPercent: number): Promise<LearningModule> {
    if (!usesMockData('practice')) {
      throw new Error('Practice learning API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(400);
    const module = MOCK_LEARNING_MODULES.find((item) => item.id === moduleId);
    if (!module) {
      throw new Error('MODULE_NOT_FOUND');
    }

    const nextProgress = Math.max(module.progressPercent, progressPercent);
    const status =
      nextProgress >= module.passThreshold
        ? 'completed'
        : nextProgress > 0
          ? 'in_progress'
          : module.status;

    return {
      ...module,
      progressPercent: nextProgress,
      status,
    };
  },

  async getCertificate(certificateId: string): Promise<CertificateRecord> {
    if (!usesMockData('practice')) {
      throw new Error('Practice learning API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(300);
    const certificate = MOCK_CERTIFICATES[certificateId];
    if (!certificate) {
      throw new Error('CERTIFICATE_NOT_FOUND');
    }
    return certificate;
  },

  async getProgressDashboard(): Promise<ProgressDashboardData> {
    if (!usesMockData('practice')) {
      throw new Error('Practice learning API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(350);
    return MOCK_PROGRESS_DASHBOARD;
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (!usesMockData('practice')) {
      throw new Error('Practice learning API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(300);
    return MOCK_LEADERBOARD;
  },

  async getAchievements(): Promise<Achievement[]> {
    if (!usesMockData('practice')) {
      throw new Error('Practice learning API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(300);
    return MOCK_ACHIEVEMENTS;
  },

  async startPracticeSession(moduleId: string): Promise<LearningPracticeSession> {
    if (!usesMockData('practice')) {
      throw new Error('Practice learning API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(400);
    const session = MOCK_PRACTICE_SESSIONS[moduleId];
    if (!session) {
      throw new Error('PRACTICE_SESSION_NOT_FOUND');
    }
    return session;
  },

  async submitPracticeAnswer(
    moduleId: string,
    progressPercent: number,
  ): Promise<LearningModule> {
    const boosted = Math.min(progressPercent + 25, 100);
    return this.completeModule(moduleId, boosted);
  },
};
