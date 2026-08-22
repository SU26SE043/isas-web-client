import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { filterCompletedRoadmapsForWizard, useRoadmapWizardFlow } from './useRoadmapWizardFlow';

const { navigateMock, createRoadmapMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  createRoadmapMock: vi.fn().mockResolvedValue({ id: 'created-roadmap' }),
}));

vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({}) }));
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('../services/history.service', () => ({
  fetchInterviewHistory: vi.fn().mockResolvedValue({ interviews: [] }),
}));
vi.mock('@/features/cv-analysis/services/cvAnalysis.service', () => ({
  cvAnalysisService: {
    listUploadedCvs: vi.fn().mockResolvedValue([]),
    listAnalyses: vi.fn().mockResolvedValue([]),
  },
}));
vi.mock('../services/learningPath.service', () => ({
  learningPathService: { listRoadmaps: vi.fn().mockResolvedValue([]) },
}));
vi.mock('../services/learning.service', () => ({
  learningService: { createRoadmap: createRoadmapMock },
}));
vi.mock('./useLearningRoadmaps', () => ({
  invalidateLearningRoadmaps: vi.fn().mockResolvedValue(undefined),
}));

describe('useRoadmapWizardFlow source wiring', () => {
  it('hides completed roadmaps without a final report', () => {
    expect(filterCompletedRoadmapsForWizard([
      { id: 'with-report', status: 'completed', hasFinalReport: true },
      { id: 'without-report', status: 'completed', hasFinalReport: false },
    ] as never).map((item) => item.id)).toEqual(['with-report']);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    createRoadmapMock.mockResolvedValue({ id: 'created-roadmap' });
  });

  it('passes selected analysis and prior roadmap through the real flow to createRoadmap', async () => {
    const { result } = renderHook(() => useRoadmapWizardFlow());

    act(() => {
      result.current.handleSelectDomain('frontend');
      result.current.setTargetLevel('junior');
      result.current.setCvAnalysisId('analysis-1');
      result.current.setPriorRoadmapId('roadmap-1');
    });

    await act(async () => {
      await result.current.handleCreate();
    });

    await waitFor(() => expect(createRoadmapMock).toHaveBeenCalledTimes(1));
    expect(createRoadmapMock).toHaveBeenCalledWith(
      expect.objectContaining({
        cvAnalysisId: 'analysis-1',
        priorRoadmapId: 'roadmap-1',
      }),
    );
  });
});
