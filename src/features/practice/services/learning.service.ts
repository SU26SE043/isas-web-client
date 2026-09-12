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
  CreateRoadmapInput,
  RoadmapResponse,
  RoadmapApiMilestone,
  RoadmapStep,
} from '../types/learning.types';
import { MOCK_ROADMAP } from '../mocks/learning.fixtures';
import { learningPathService } from './learningPath.service';
import { learningEndpoints } from './learning.endpoints';
import { CreateRoadmapError, mapCreateRoadmapError } from '../utils/roadmapCreateErrors';
import { buildCreateRoadmapRequest } from '../utils/buildCreateRoadmapRequest';

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

/** Map wizard UI levels to API levels; unsupported values must be handled explicitly. */
export function resolveApiRoadmapLevel(targetLevel: string): PracticeLevel {
  const mapped: Record<string, PracticeLevel> = {
    intern: 'Fresher',
    fresher: 'Fresher',
    junior: 'Junior',
    middle: 'Middle',
    senior: 'Senior',
    lead: 'Senior',
  };
  const key = targetLevel.trim().toLowerCase();
  const resolved = mapped[key] ?? resolvePracticeLevel(targetLevel);
  if (!resolved) {
    throw new CreateRoadmapError('unsupported_level');
  }
  return resolved;
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
  const raw = data ?? {};
  const payload = raw.data && typeof raw.data === 'object' ? (raw.data as Record<string, unknown>) : raw;
  const id =
    (typeof payload.id === 'string' && payload.id) ||
    (typeof payload.roadmapId === 'string' && payload.roadmapId) ||
    undefined;
  const steps = normalizeRoadmapSteps(payload.steps);
  const milestones = Array.isArray(payload.milestones)
    ? payload.milestones.map((milestone, milestoneIndex) => {
        const item = (milestone ?? {}) as Record<string, unknown>;
        return {
          id: String(item.id ?? `milestone-${milestoneIndex + 1}`),
          orderNo: Number(item.orderNo ?? milestoneIndex + 1),
          title: String(item.title ?? ''),
          status: String(item.status ?? 'Pending'),
          mistakeCount: typeof item.mistakeCount === 'number' ? item.mistakeCount : undefined,
          improvement: Array.isArray(item.improvement) ? item.improvement as Array<{ criterionName: string; deltaPct: number }> : null,
          lessons: Array.isArray(item.lessons) ? item.lessons as RoadmapApiMilestone['lessons'] : [],
        };
      })
    : undefined;
  return {
    id,
    steps: steps.length > 0 ? steps : MOCK_ROADMAP.steps,
    regenerateCount: Number(payload.regenerateCount ?? 0),
    regenerateLimit: Number(payload.regenerateLimit ?? MOCK_ROADMAP.regenerateLimit),
    domainId: input.domainId,
    targetLevel: input.currentLevel ?? input.targetLevel,
    name: typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : input.name?.trim() || undefined,
    // Keep selected scored sessions available to the wizard/history UI as well.
    sourceReportIds: input.reportIds ? [...input.reportIds] : [],
    jobCategory: typeof payload.jobCategory === 'string' ? payload.jobCategory : undefined,
    language: typeof payload.language === 'string' ? payload.language : input.language ?? 'vi',
    level: typeof payload.level === 'string' ? payload.level : input.currentLevel ?? input.targetLevel,
    mode: payload.mode === 'Reinforce' ? 'Reinforce' : 'LevelUp',
    status: typeof payload.status === 'string' ? payload.status : 'Active',
    createdAt: typeof payload.createdAt === 'string' ? payload.createdAt : undefined,
    completedAt: typeof payload.completedAt === 'string' ? payload.completedAt : null,
    milestones,
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
   * Live: POST `/api/v1/interview/practice/roadmaps`.
   * Mock / Playwright: in-app fixture so E2E can finish without a gateway.
   */
  async createRoadmap(input: CreateRoadmapInput): Promise<RoadmapResponse> {
    if (!input.domainId) {
      throw new CreateRoadmapError('invalid_input');
    }

    const jobCategory = resolveJobCategoryFromDomainId(input.domainId);
    const payload = buildCreateRoadmapRequest(jobCategory, input);
    if (!payload.ok) {
      throw new CreateRoadmapError(
        payload.reason === 'sessions_required' ? 'sessions_required' : 'invalid_input',
      );
    }

    if (usesMockData('practice')) {
      await mockDelay(500);
      const created = normalizeCreateRoadmapResponse(
        {
          id: `roadmap-${crypto.randomUUID().slice(0, 8)}`,
          regenerateCount: 0,
          regenerateLimit: MOCK_ROADMAP.regenerateLimit,
        },
        input,
      );
      latestCreatedRoadmap = created;
      roadmapRegenerateCount = created.regenerateCount;
      await learningPathService.registerCreatedRoadmap({
        ...input,
        roadmapId: created.id ?? `roadmap-mock`,
        reportIds: payload.body.sessionIds ?? input.reportIds ?? [],
      });
      return created;
    }

    try {
      const response = await apiClient.post<Record<string, unknown>>(
        learningEndpoints.createRoadmap,
        payload.body,
        { validateStatus: (status) => status === 201 || (status >= 200 && status < 300) },
      );

      const created = normalizeCreateRoadmapResponse(response.data, input);

      latestCreatedRoadmap = created;
      roadmapRegenerateCount = created.regenerateCount;
      await learningPathService.registerCreatedRoadmap({
        ...input,
        roadmapId: created.id,
        reportIds: payload.body.sessionIds ?? input.reportIds ?? [],
      });
      return created;
    } catch (error) {
      throw mapCreateRoadmapError(error);
    }
  },
};
