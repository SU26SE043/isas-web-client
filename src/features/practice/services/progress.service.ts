import { mockDelay, usesMockData } from '@/shared/mock';
import { buildProgressMinimalDashboard } from '../mocks/progress.fixtures';
import type { ProgressMinimalDashboard } from '../types/progress.types';

export const progressService = {
  async getDashboard(): Promise<ProgressMinimalDashboard> {
    if (!usesMockData('practice')) {
      throw new Error('Progress API is not wired yet. Keep usesMockData("practice") true.');
    }
    await mockDelay(350);
    return buildProgressMinimalDashboard();
  },
};
