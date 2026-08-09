import { mockDelay } from '@/shared/mock';
import { buildProgressMinimalDashboard } from '../mocks/progress.fixtures';
import type { ProgressMinimalDashboard } from '../types/progress.types';

export const progressService = {
  async getDashboard(): Promise<ProgressMinimalDashboard> {
    // Progress remains mock-backed until a dedicated Progress API is available.
    // The broader practice domain is live for interview sessions, so it cannot
    // be used as the data-source switch for this dashboard.
    await mockDelay(350);
    return buildProgressMinimalDashboard();
  },
};
