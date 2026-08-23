import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { navigateMock, fetchHistoryMock, listRoadmapsMock, listCvsMock, listAnalysesMock } = vi.hoisted(
  () => ({
    navigateMock: vi.fn(),
    fetchHistoryMock: vi.fn(),
    listRoadmapsMock: vi.fn(),
    listCvsMock: vi.fn(),
    listAnalysesMock: vi.fn(),
  }),
);

vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({}) }));
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('../services/history.service', () => ({ fetchInterviewHistory: fetchHistoryMock }));
vi.mock('@/features/cv-analysis/services/cvAnalysis.service', () => ({
  cvAnalysisService: { listUploadedCvs: listCvsMock, listAnalyses: listAnalysesMock },
}));
vi.mock('../services/learningPath.service', () => ({
  learningPathService: { listRoadmaps: listRoadmapsMock },
}));
vi.mock('../services/learning.service', () => ({ learningService: { createRoadmap: vi.fn() } }));
vi.mock('./useLearningRoadmaps', () => ({ invalidateLearningRoadmaps: vi.fn() }));

import { resolveOrphanStepFallback, useRoadmapWizardFlow } from './useRoadmapWizardFlow';

const beReport = { id: 's1', status: 'completed', domainId: 'backend', date: '2026-08-20T07:32:00Z' };
const completedRoadmap = { id: '2929e93c', name: 'BE', nameVi: 'BE', status: 'completed', hasFinalReport: true };

beforeEach(() => {
  vi.clearAllMocks();
  fetchHistoryMock.mockResolvedValue({ interviews: [beReport] });
  listCvsMock.mockResolvedValue([{ id: 'cv1' }]);
  listAnalysesMock.mockResolvedValue([]);
  listRoadmapsMock.mockResolvedValue([completedRoadmap]);
});

/** Đi hết wizard tới bước cuối cùng đang có trong `steps`. */
function walkTo(result: { current: ReturnType<typeof useRoadmapWizardFlow> }, target: string) {
  for (let guard = 0; guard < 10 && result.current.step !== target; guard += 1) {
    act(() => result.current.goNext());
  }
}

describe('bước mồ côi khi `steps` co lại', () => {
  it('resolveOrphanStepFallback lùi về bước hợp lệ gần nhất phía TRƯỚC', () => {
    const shrunk = ['domain', 'nameFocus', 'cv', 'currentLevel', 'reports', 'targetLevel', 'confirm'] as const;
    expect(resolveOrphanStepFallback('priorRoadmap', shrunk)).toBe('targetLevel');
    // Bước còn trong danh sách ⇒ không đụng vào.
    expect(resolveOrphanStepFallback('targetLevel', shrunk)).toBeNull();
    // Không còn bước nào phía trước ⇒ về bước đầu, không trả undefined.
    expect(resolveOrphanStepFallback('reports', ['confirm'])).toBe('confirm');
  });

  // 🔴 Ca thật: bấm Tiếp nhanh trong lúc danh sách còn đang tải ⇒ đứng ở "Roadmap đã hoàn tất";
  // tải xong mà không có roadmap nào ⇒ `steps` bỏ bước đó nhưng page VẪN render nhánh đó, còn
  // stepper `indexOf` = -1 nên sáng đèn bước 1.
  it('dữ liệu về rỗng thì rời khỏi bước đã biến mất, không kẹt lại', async () => {
    let release: (value: unknown) => void = () => {};
    listRoadmapsMock.mockReturnValue(new Promise((resolve) => { release = resolve; }));

    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('backend'));
    walkTo(result, 'priorRoadmap');
    expect(result.current.step).toBe('priorRoadmap');
    expect(result.current.steps).toContain('priorRoadmap');

    await act(async () => { release([]); });
    await waitFor(() => expect(result.current.loadingReports).toBe(false));

    expect(result.current.steps).not.toContain('priorRoadmap');
    expect(result.current.step).toBe('targetLevel');
    expect(result.current.steps).toContain(result.current.step);
  });

  it('có roadmap đã hoàn tất thì giữ nguyên bước, không lùi oan', async () => {
    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('backend'));
    walkTo(result, 'priorRoadmap');
    await waitFor(() => expect(result.current.loadingReports).toBe(false));

    expect(result.current.step).toBe('priorRoadmap');
    expect(result.current.completedRoadmaps).toHaveLength(1);
  });
});

describe('một lời gọi hỏng không được xoá cả mẻ dữ liệu', () => {
  // `fetchInterviewHistory` từng là lời gọi DUY NHẤT không có `.catch`: nó hỏng thì `Promise.all`
  // reject ⇒ vứt luôn file CV + bản phân tích + roadmap đã hoàn tất dù cả ba đã về thành công.
  it('lịch sử lỗi ⇒ vẫn giữ CV và roadmap đã hoàn tất', async () => {
    fetchHistoryMock.mockRejectedValue(new Error('history 500'));

    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('backend'));
    act(() => result.current.goToStep('cv'));
    await waitFor(() => expect(result.current.loadingReports).toBe(false));

    expect(result.current.cvFiles).toHaveLength(1);
    expect(result.current.completedRoadmaps).toHaveLength(1);
    expect(result.current.steps).toContain('priorRoadmap');
  });
});

describe('danh sách roadmap cho wizard không kéo theo N+1', () => {
  it('gọi listRoadmaps với enrichCurrentPointers=false', async () => {
    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('backend'));
    act(() => result.current.goToStep('cv'));
    await waitFor(() => expect(listRoadmapsMock).toHaveBeenCalled());

    expect(listRoadmapsMock).toHaveBeenCalledWith(
      { status: 'completed' },
      { enrichCurrentPointers: false },
    );
  });
});
