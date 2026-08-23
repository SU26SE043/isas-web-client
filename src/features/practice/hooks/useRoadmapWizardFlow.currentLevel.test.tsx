import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { navigateMock, fetchHistoryMock, listRoadmapsMock, listCvsMock, listAnalysesMock } =
  vi.hoisted(() => ({
    navigateMock: vi.fn(),
    fetchHistoryMock: vi.fn(),
    listRoadmapsMock: vi.fn(),
    listCvsMock: vi.fn(),
    listAnalysesMock: vi.fn(),
  }));

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

import { inferCurrentLevelFromAnalyses, useRoadmapWizardFlow } from './useRoadmapWizardFlow';
import { ROADMAP_TARGET_LEVELS } from '../mocks/practiceSetup.fixtures';
import type { CvAnalysisResult } from '@/features/cv-analysis/types/cvAnalysis.types';

const analysis = (over: Partial<CvAnalysisResult>) =>
  ({ id: 'a1', jobCategory: 'BE', currentLevel: null, ...over }) as CvAnalysisResult;

beforeEach(() => {
  vi.clearAllMocks();
  fetchHistoryMock.mockResolvedValue({ interviews: [] });
  listCvsMock.mockResolvedValue([]);
  listAnalysesMock.mockResolvedValue([]);
  listRoadmapsMock.mockResolvedValue([]);
});

describe('inferCurrentLevelFromAnalyses', () => {
  it('lấy trình độ từ bản phân tích CÙNG lĩnh vực', () => {
    expect(
      inferCurrentLevelFromAnalyses([analysis({ jobCategory: 'BE', currentLevel: 'Middle' })], 'backend'),
    ).toBe('middle');
  });

  // Trình độ suy từ CV Business Analyst mà điền vào lộ trình Backend là sai nền, và nó đi thẳng
  // vào prompt làm SÀN (bỏ phần nhập môn) — hỏng âm thầm, không lỗi nào nổ.
  it('BỎ QUA bản phân tích của lĩnh vực khác', () => {
    expect(
      inferCurrentLevelFromAnalyses([analysis({ jobCategory: 'BA', currentLevel: 'Senior' })], 'backend'),
    ).toBeNull();
  });

  // `null` là giá trị HỢP LỆ (CV không đủ căn cứ) — phải bỏ qua nó và đi tiếp, không dừng ở bản
  // phân tích đầu tiên rồi kết luận "không suy ra được".
  it('bỏ qua bản null rồi lấy bản kế tiếp có giá trị', () => {
    expect(
      inferCurrentLevelFromAnalyses(
        [analysis({ id: 'a1', currentLevel: null }), analysis({ id: 'a2', currentLevel: 'Junior' })],
        'backend',
      ),
    ).toBe('junior');
  });

  // 🔑 Ca then chốt. Ô chọn của bước này CHỈ có 4 option; `'lead'` không khớp option nào nên trình
  // duyệt sáng đèn option ĐẦU TIÊN ("Mới tốt nghiệp"), trong khi `resolveApiRoadmapLevel` lại nén
  // `'lead'` thành `Senior` lúc gửi ⇒ người dùng thấy Fresher, hệ thống gửi Senior. Loại nó ra
  // ngay tại đây, không để nó vào state.
  it('loại giá trị ngoài 4 cấp mà ô chọn có — không để lệch hiển thị với payload', () => {
    expect(inferCurrentLevelFromAnalyses([analysis({ currentLevel: 'Lead' })], 'backend')).toBeNull();
    expect(inferCurrentLevelFromAnalyses([analysis({ currentLevel: 'Intern' })], 'backend')).toBeNull();
    expect(inferCurrentLevelFromAnalyses([analysis({ currentLevel: 'Staff' })], 'backend')).toBeNull();
  });

  it('mọi cấp mà ô chọn chào bán đều suy được, không sót cái nào', () => {
    for (const level of ROADMAP_TARGET_LEVELS) {
      const capitalised = level[0].toUpperCase() + level.slice(1);
      expect(inferCurrentLevelFromAnalyses([analysis({ currentLevel: capitalised })], 'backend')).toBe(level);
    }
  });
});

describe('wizard điền trình độ hiện tại từ phân tích CV', () => {
  it('có dữ liệu CV ⇒ đặt đúng cấp và ghi nguồn là "cv"', async () => {
    listAnalysesMock.mockResolvedValue([analysis({ jobCategory: 'BE', currentLevel: 'Senior' })]);

    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('backend'));
    act(() => result.current.goToStep('cv'));
    await waitFor(() => expect(result.current.loadingReports).toBe(false));

    expect(result.current.currentLevel).toBe('senior');
    expect(result.current.currentLevelSource).toBe('cv');
  });

  // Nguồn phải nói THẬT: "suy từ CV" và "mặc định vì không suy ra được" là hai câu khác nhau trên
  // màn hình (`currentLevel.fromCv` vs `currentLevel.default`).
  it('không suy ra được ⇒ Fresher và ghi nguồn là "default"', async () => {
    listAnalysesMock.mockResolvedValue([analysis({ jobCategory: 'BE', currentLevel: null })]);

    const { result } = renderHook(() => useRoadmapWizardFlow());
    act(() => result.current.handleSelectDomain('backend'));
    act(() => result.current.goToStep('cv'));
    await waitFor(() => expect(result.current.loadingReports).toBe(false));

    expect(result.current.currentLevel).toBe('fresher');
    expect(result.current.currentLevelSource).toBe('default');
  });
});
