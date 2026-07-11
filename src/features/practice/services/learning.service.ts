import { mockDelay, usesMockData } from '@/shared/mock';
import type {
  CertificateRecord,
  LearningModule,
  LearningModuleContent,
  RoadmapResponse,
} from '../types/learning.types';
import {
  MOCK_CERTIFICATES,
  MOCK_LEARNING_MODULES,
  MOCK_MODULE_CONTENT,
  MOCK_ROADMAP,
} from '../mocks/learning.fixtures';

let roadmapRegenerateCount = MOCK_ROADMAP.regenerateCount;

export const learningService = {
  async getRoadmap(): Promise<RoadmapResponse> {
    if (!usesMockData('practice')) {
      throw new Error('Practice learning API is not wired yet. Keep usesMockData("practice") true.');
    }

    await mockDelay(400);
    return {
      ...MOCK_ROADMAP,
      regenerateCount: roadmapRegenerateCount,
    };
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
    return MOCK_LEARNING_MODULES;
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
};
