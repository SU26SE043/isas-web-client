import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { navigateMock, createRoadmapMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  createRoadmapMock: vi.fn().mockResolvedValue({ id: 'created-roadmap', milestones: [] }),
}));

vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }));
const { prefetchQueryMock } = vi.hoisted(() => ({
  prefetchQueryMock: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ prefetchQuery: prefetchQueryMock }),
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

describe('useRoadmapWizardFlow — prefetch bài 1', () => {
  /**
   * Prefetch chỉ để làm ấm cache (backend đã prewarm bài 1 + single-flight). `retry: false` là
   * chủ đích: mặc định toàn cục (3 lần) sẽ bắn lại một lượt sinh AI ~20–50s tới ba lần nữa khi 502
   * mà không ai nhìn. Mutation: bỏ `retry: false` → ĐỎ.
   */
  it('prefetch bài đầu với retry: false', async () => {
    createRoadmapMock.mockResolvedValue({
      id: 'created-roadmap',
      milestones: [{ id: 'm1', lessons: [{ id: 'lesson-1' }, { id: 'lesson-2' }] }],
    });
    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('frontend'));
    await act(async () => {
      await result.current.handleCreate();
    });
    await waitFor(() => expect(prefetchQueryMock).toHaveBeenCalledTimes(1));
    expect(prefetchQueryMock.mock.calls[0][0]).toMatchObject({ retry: false, staleTime: 60_000 });
  });
});

