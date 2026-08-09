/* @vitest-environment node */
import { describe, expect, it, vi } from 'vitest';
import { mockDelay } from '@/shared/mock';
import { progressService } from './progress.service';

vi.mock('@/shared/mock', () => ({
  mockDelay: vi.fn().mockResolvedValue(undefined),
}));

describe('progressService', () => {
  it('keeps the dashboard mock-backed while practice interview APIs are live', async () => {
    await expect(progressService.getDashboard()).resolves.toMatchObject({
      roadmapCompletion: { completed: 12, inProgress: 5, locked: 8 },
      skillBreakdown: expect.any(Array),
      practiceScores: expect.any(Array),
    });
    expect(mockDelay).toHaveBeenCalledWith(350);
  });
});
