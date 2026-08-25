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

import {
  ROADMAP_WIZARD_STEP_ORDER,
  resolveOrphanStepFallback,
  useRoadmapWizardFlow,
} from './useRoadmapWizardFlow';

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
    // Thứ tự khớp `ROADMAP_WIZARD_STEP_ORDER` sau F4 (mục tiêu TRƯỚC báo cáo); đây là `steps` đã
    // co lại vì không có roadmap đã hoàn tất nào.
    const shrunk = ['domain', 'nameFocus', 'cv', 'currentLevel', 'reports', 'confirm'] as const;
    expect(resolveOrphanStepFallback('priorRoadmap', shrunk)).toBe('reports');
    // Bước còn trong danh sách ⇒ không đụng vào.
    expect(resolveOrphanStepFallback('currentLevel', shrunk)).toBeNull();
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
    // Bước hợp lệ gần nhất phía TRƯỚC `priorRoadmap` nay là `reports` (F4 đổi thứ tự: mục tiêu
    // trước báo cáo). Tiền đề đổi, ý định của test không đổi — vẫn là "không kẹt ở bước đã biến
    // mất, và không nhảy TỚI một bước người dùng chưa xem".
    expect(result.current.step).toBe('reports');
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

/**
 * F5 đổi tiền đề sản phẩm: chỉ giữ một bước trình độ hiện tại để chỉnh độ khó; nội dung luôn
 * lấy từ lỗi trong session đã chọn. Khoá đủ danh sách để không vô tình đưa lại ô mục tiêu.
 */
describe('thứ tự bước của wizard lộ trình', () => {
  it('giữ đúng thứ tự đã chốt với sản phẩm', () => {
    expect([...ROADMAP_WIZARD_STEP_ORDER]).toEqual([
      'domain',
      'nameFocus',
      'cv',
      'currentLevel',
      'reports',
      'priorRoadmap',
      'confirm',
    ]);
  });

  // `steps` là mảng ĐỘNG (hai bước tuỳ chọn tự ẩn). Nó phải là tập con GIỮ THỨ TỰ của danh sách
  // trên — nếu nó tự sắp lại thì thanh tiến trình và điều hướng next/back nói hai chuyện khác nhau.
  it('steps lúc chạy là tập con giữ nguyên thứ tự của danh sách khai báo', async () => {
    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('backend'));
    act(() => result.current.goToStep('cv'));
    await waitFor(() => expect(result.current.loadingReports).toBe(false));

    const indexes = result.current.steps.map((step) => ROADMAP_WIZARD_STEP_ORDER.indexOf(step));
    expect(indexes).toEqual([...indexes].sort((a, b) => a - b));
    expect(indexes).not.toContain(-1);
    expect(result.current.steps).not.toContain('targetLevel');
  });

  // Điều hướng phải DẪN XUẤT từ `steps`. Ghi cứng next/back ở từng bước là cách lỗi thứ tự sinh
  // ra: một lần đổi thứ tự phải sửa đúng 8 chỗ, sót một chỗ thì wizard nhảy sai mà không lỗi nào nổ.
  it('goNext đi đúng theo thứ tự đó, không nhảy cóc', async () => {
    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('backend'));
    act(() => result.current.goToStep('cv'));
    await waitFor(() => expect(result.current.loadingReports).toBe(false));

    act(() => result.current.goToStep('currentLevel'));
    act(() => result.current.goNext());
    expect(result.current.step).toBe('reports');
    act(() => result.current.goBack());
    expect(result.current.step).toBe('currentLevel');
  });
});
