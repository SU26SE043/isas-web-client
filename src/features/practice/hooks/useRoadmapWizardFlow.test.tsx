import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { filterCompletedRoadmapsForWizard, useRoadmapWizardFlow } from './useRoadmapWizardFlow';

const { navigateMock, createRoadmapMock, fetchHistoryMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  createRoadmapMock: vi.fn().mockResolvedValue({ id: 'created-roadmap' }),
  fetchHistoryMock: vi.fn().mockResolvedValue({ interviews: [] }),
}));

vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({}) }));
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('../services/history.service', () => ({
  fetchInterviewHistory: fetchHistoryMock,
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
      result.current.setCurrentLevel('junior');
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

// Danh sách báo cáo được nạp ngay khi chọn lĩnh vực để badge và bước Báo cáo đều có dữ liệu.
//
// Vì sao cần khoá bằng test: khi chèn bước "Tên & mục tiêu" vào giữa, bước Báo cáo dời từ 1 sang 2.
// Điều kiện cũ ghim số 1 sẽ lặng lẽ không bao giờ khớp nữa ⇒ vào bước Báo cáo thấy danh sách TRỐNG,
// không lỗi, không cảnh báo. Đã xác nhận bằng đột biến: ghim lại số cũ thì toàn bộ suite VẪN XANH.
describe('nạp báo cáo theo đúng số bước', () => {
  beforeEach(() => vi.clearAllMocks());

  it('vào bước Báo cáo thì nạp danh sách của lĩnh vực đã chọn', async () => {
    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('frontend'));

    act(() => result.current.goToStep('reports'));

    await waitFor(() => expect(fetchHistoryMock).toHaveBeenCalled());
    expect(fetchHistoryMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'Scored', excludeCampaign: true }));
  });

  it('lọc lịch sử theo Scored và loại campaign ngay từ API', async () => {
    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('frontend'));
    act(() => result.current.goToStep('reports'));
    await waitFor(() => expect(fetchHistoryMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'Scored', excludeCampaign: true })));
  });

  it('chọn lĩnh vực thì nạp ngay cả khi chưa đi tới bước Báo cáo', async () => {
    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('frontend'));
    await waitFor(() => expect(fetchHistoryMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'Scored', excludeCampaign: true })));
  });
});
