import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { navigateMock, createRoadmapMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  createRoadmapMock: vi.fn().mockResolvedValue({ id: 'created-roadmap', milestones: [] }),
}));

vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ prefetchQuery: vi.fn().mockResolvedValue(undefined) }),
}));
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('../services/learning.service', () => ({ learningService: { createRoadmap: createRoadmapMock } }));
vi.mock('../services/history.service', () => ({ fetchInterviewHistory: vi.fn().mockResolvedValue({ interviews: [] }) }));
vi.mock('../services/roadmap.service', () => ({ roadmapService: { getLesson: vi.fn() } }));
vi.mock('./useLearningRoadmaps', () => ({
  invalidateLearningRoadmaps: vi.fn().mockResolvedValue(undefined),
  learningLessonQueryKey: vi.fn(() => ['learning-lesson']),
}));

import { useRoadmapWizardFlow } from './useRoadmapWizardFlow';

beforeEach(() => {
  vi.clearAllMocks();
  createRoadmapMock.mockResolvedValue({ id: 'created-roadmap', milestones: [] });
});

describe('useRoadmapWizardFlow', () => {
  it('không còn state CV, trình độ hoặc roadmap trước', () => {
    const { result } = renderHook(() => useRoadmapWizardFlow());
    expect(result.current).not.toHaveProperty('currentLevel');
    expect(result.current).not.toHaveProperty('cvId');
    expect(result.current).not.toHaveProperty('priorRoadmapId');
  });

  it('tạo roadmap khi có domain và không yêu cầu currentLevel', async () => {
    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('frontend'));

    await act(async () => { await result.current.handleCreate(); });

    await waitFor(() => expect(createRoadmapMock).toHaveBeenCalledWith(expect.objectContaining({
      domainId: 'frontend',
      sessionIds: [],
    })));
    expect(createRoadmapMock.mock.calls[0][0]).not.toHaveProperty('currentLevel');
    expect(createRoadmapMock.mock.calls[0][0]).not.toHaveProperty('cvId');
    expect(createRoadmapMock.mock.calls[0][0]).not.toHaveProperty('priorRoadmapId');
  });

  it('đánh dấu fewerLessons khi số bài thấp hơn cap của scope', async () => {
    createRoadmapMock.mockResolvedValueOnce({
      id: 'created-roadmap',
      milestones: [{ lessons: [{ id: 'lesson-1' }, { id: 'lesson-2' }] }],
    });
    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('frontend'));
    await waitFor(() => expect(result.current.domainId).toBe('frontend'));

    await act(async () => { await result.current.handleCreate(); });

    expect(navigateMock).toHaveBeenCalledWith('/candidate/learning', {
      replace: true,
      state: { fewerLessons: true },
    });
  });

  it('không đánh dấu fewerLessons khi số bài đúng bằng cap của scope', async () => {
    createRoadmapMock.mockResolvedValueOnce({
      id: 'created-roadmap',
      milestones: [{ lessons: [
        { id: 'lesson-1' }, { id: 'lesson-2' }, { id: 'lesson-3' }, { id: 'lesson-4' },
      ] }],
    });
    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('frontend'));
    await waitFor(() => expect(result.current.domainId).toBe('frontend'));

    await act(async () => { await result.current.handleCreate(); });

    expect(navigateMock).toHaveBeenCalledWith('/candidate/learning', {
      replace: true,
      state: { fewerLessons: false },
    });
  });
});
