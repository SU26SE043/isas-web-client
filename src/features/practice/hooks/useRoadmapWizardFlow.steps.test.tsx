import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { navigateMock, fetchHistoryMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  fetchHistoryMock: vi.fn(),
}));

vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({}) }));
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('../services/history.service', () => ({ fetchInterviewHistory: fetchHistoryMock }));
vi.mock('../services/learning.service', () => ({ learningService: { createRoadmap: vi.fn() } }));
vi.mock('../services/roadmap.service', () => ({ roadmapService: { getLesson: vi.fn() } }));
vi.mock('./useLearningRoadmaps', () => ({ invalidateLearningRoadmaps: vi.fn() }));

import { ROADMAP_WIZARD_STEP_ORDER, useRoadmapWizardFlow } from './useRoadmapWizardFlow';

beforeEach(() => {
  vi.clearAllMocks();
  fetchHistoryMock.mockResolvedValue({ interviews: [] });
});

describe('thứ tự bước của wizard lộ trình', () => {
  it('chỉ giữ đúng bốn bước đã chốt', () => {
    expect([...ROADMAP_WIZARD_STEP_ORDER]).toEqual(['domain', 'nameFocus', 'reports', 'confirm']);
  });

  it('steps chạy đúng cùng thứ tự và không chứa bước legacy', () => {
    const { result } = renderHook(() => useRoadmapWizardFlow());
    expect(result.current.steps).toEqual(['domain', 'nameFocus', 'reports', 'confirm']);
    expect(result.current).not.toHaveProperty('currentLevel');
    expect(result.current).not.toHaveProperty('cvFiles');
    expect(result.current).not.toHaveProperty('completedRoadmaps');
  });

  it('vào reports lần đầu vẫn nạp danh sách buổi luyện', async () => {
    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('frontend'));
    act(() => result.current.goToStep('reports'));

    await waitFor(() => expect(fetchHistoryMock).toHaveBeenCalledWith(expect.objectContaining({
      status: 'Scored',
      excludeCampaign: true,
    })));
    expect(result.current.step).toBe('reports');
  });

  it('điều hướng next/back theo bốn bước', () => {
    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('frontend'));
    act(() => result.current.goNext());
    expect(result.current.step).toBe('nameFocus');
    act(() => result.current.goNext());
    expect(result.current.step).toBe('reports');
    act(() => result.current.goBack());
    expect(result.current.step).toBe('nameFocus');
  });
});

describe('badge số buổi trên lưới domain', () => {
  // `beforeEach` chung trả danh sách RỖNG (đủ cho các test thứ-tự-bước). Test này cần dữ liệu
  // thật vì nó khoá hành vi F6: lưới ngành phải có số buổi TRƯỚC khi người dùng chọn ngành.
  const beReport = { id: 's1', status: 'completed', domainId: 'backend', date: '2026-08-20T07:32:00Z' };

  it('có số buổi trước khi người dùng chọn domain', async () => {
    fetchHistoryMock.mockResolvedValue({ interviews: [beReport] });
    const { result } = renderHook(() => useRoadmapWizardFlow());
    await waitFor(() => expect(result.current.loadingReports).toBe(false));
    expect(result.current.reportCounts.backend).toBe(1);
  });
});
