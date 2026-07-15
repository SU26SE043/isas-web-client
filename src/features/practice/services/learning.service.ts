import { mockDelay, usesMockData } from '@/shared/mock';
import type {
  Achievement,
  CertificateRecord,
  CreateRoadmapInput,
  LeaderboardEntry,
  LearningModule,
  LearningModuleContent,
  LearningPracticeSession,
  ProgressDashboardData,
  RoadmapResponse,
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

let roadmapRegenerateCount = MOCK_ROADMAP.regenerateCount;
let latestCreatedRoadmap: RoadmapResponse | null = null;

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

  async createRoadmap(input: CreateRoadmapInput): Promise<RoadmapResponse> {
    if (!usesMockData('practice')) {
      throw new Error('Practice learning API is not wired yet. Keep usesMockData("practice") true.');
    }

    if (!input.domainId || !input.targetLevel || input.reportIds.length === 0) {
      throw new Error('INVALID_ROADMAP_INPUT');
    }

    await mockDelay(1200);

    const created: RoadmapResponse = {
      ...MOCK_ROADMAP,
      regenerateCount: 0,
      domainId: input.domainId,
      targetLevel: input.targetLevel,
      sourceReportIds: [...input.reportIds],
      steps: MOCK_ROADMAP.steps.map((step, index) => ({
        ...step,
        title: `${step.title} (${input.targetLevel})`,
        titleVi: `${step.titleVi} (${input.targetLevel})`,
        estimatedWeeks: step.estimatedWeeks + (index === 0 ? 0 : Math.min(input.reportIds.length, 3)),
      })),
    };

    latestCreatedRoadmap = created;
    roadmapRegenerateCount = 0;
    await learningPathService.registerCreatedRoadmap(input);
    return created;
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
