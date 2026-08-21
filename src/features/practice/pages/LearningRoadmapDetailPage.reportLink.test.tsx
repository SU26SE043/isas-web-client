import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => key }),
}));
vi.mock('@/features/payment/hooks/useTokenWallet', () => ({
  useTokenWallet: () => ({ available: 10 }),
}));
vi.mock('../hooks/useLearningRoadmaps', () => ({
  useLearningRoadmapDetail: vi.fn(),
  invalidateLearningRoadmaps: vi.fn(),
  updateRoadmapNameInCache: vi.fn(),
}));
vi.mock('../components/learning-path/LearningRoadmapMilestones', () => ({
  LearningRoadmapMilestones: () => <div>milestones</div>,
}));
vi.mock('../components/learning-path/LearningRoadmapCreditSummary', () => ({
  LearningRoadmapCreditSummary: () => <div>credit-summary</div>,
}));
vi.mock('../components/learning-path/LearningCreditWarningDialog', () => ({
  LearningCreditWarningDialog: () => null,
}));

import { useLearningRoadmapDetail } from '../hooks/useLearningRoadmaps';
import { LearningRoadmapDetailPage } from './LearningRoadmapDetailPage';

function roadmapFixture(status: string) {
  return {
    id: 'rm-1',
    name: 'Lộ trình BE',
    nameVi: 'Lộ trình BE',
    domainId: 'BE',
    domainLabel: 'Backend',
    domainLabelVi: 'Backend',
    targetLevel: 'Junior',
    status,
    progressPercent: status === 'completed' ? 100 : 30,
    currentMilestoneId: '',
    currentMilestoneTitle: '',
    currentMilestoneTitleVi: '',
    currentLessonId: '',
    currentLessonTitle: '',
    currentLessonTitleVi: '',
    estimatedRemainingHours: 2,
    updatedAt: '2026-08-10T00:00:00Z',
    readOnly: false,
    milestones: [],
    reports: [],
  };
}

function renderWith(status: string) {
  vi.mocked(useLearningRoadmapDetail).mockReturnValue({
    data: roadmapFixture(status),
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
  } as unknown as ReturnType<typeof useLearningRoadmapDetail>);

  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/candidate/learning/roadmaps/rm-1']}>
        <Routes>
          <Route path="/candidate/learning/roadmaps/:roadmapId" element={<LearningRoadmapDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LearningRoadmapDetailPage — lối vào báo cáo', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it('lộ trình ĐANG HỌC vẫn xem được báo cáo (tạm thời), không bị khoá', () => {
    renderWith('in_progress');
    const link = screen.getByRole('link', { name: 'practice.learningPath.viewRoadmapReportInterim' });
    expect(link).toHaveAttribute('href', '/candidate/learning/roadmaps/rm-1/report');
  });

  it('lộ trình đã hoàn thành dùng nhãn báo cáo đầy đủ', () => {
    renderWith('completed');
    expect(
      screen.getByRole('link', { name: 'practice.learningPath.viewRoadmapReport' }),
    ).toHaveAttribute('href', '/candidate/learning/roadmaps/rm-1/report');
    expect(
      screen.queryByRole('link', { name: 'practice.learningPath.viewRoadmapReportInterim' }),
    ).not.toBeInTheDocument();
  });

  it('lộ trình mới tạo (chưa bắt đầu) cũng có lối vào báo cáo', () => {
    renderWith('not_started');
    expect(
      screen.getByRole('link', { name: 'practice.learningPath.viewRoadmapReportInterim' }),
    ).toBeInTheDocument();
  });
});
