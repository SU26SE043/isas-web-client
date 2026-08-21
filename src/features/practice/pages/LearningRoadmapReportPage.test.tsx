import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('recharts', async () => await import('../components/__rechartsStub'));
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => key }),
}));
vi.mock('../services/roadmapPractice.service', () => ({
  roadmapPracticeService: { getRoadmapReport: vi.fn() },
}));

import { roadmapPracticeService } from '../services/roadmapPractice.service';
import { LearningRoadmapReportPage } from './LearningRoadmapReportPage';
import type { RoadmapPracticeReport } from '../types/roadmapPractice.api.types';

function baseReport(overrides: Partial<RoadmapPracticeReport> = {}): RoadmapPracticeReport {
  return {
    roadmapId: 'rm-1',
    kind: 'interim',
    roadmapStatus: 'Active',
    levelEvaluation: [],
    strengths: [],
    strengthsVi: [],
    weaknesses: [],
    weaknessesVi: [],
    improvements: [],
    improvementsVi: [],
    radarData: [],
    progress: [],
    ...overrides,
  };
}

function filledReport(overrides: Partial<RoadmapPracticeReport> = {}): RoadmapPracticeReport {
  return baseReport({
    radarData: [
      { subject: 'Giao tiếp', subjectVi: 'Giao tiếp', A: 72, B: 60, fullMark: 100, C: 40 },
    ],
    levelEvaluation: [
      { criterionName: 'Giao tiếp', percentage: 72, levelThreshold: 60, passed: true },
    ],
    progress: [
      { order: 1, lessonTitle: 'Bài 1', completedAt: null, overallPercentage: 40, scores: [] },
      { order: 2, lessonTitle: 'Bài 2', completedAt: null, overallPercentage: 72, scores: [] },
    ],
    ...overrides,
  });
}

async function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/candidate/learning/roadmaps/rm-1/report']}>
        <Routes>
          <Route
            path="/candidate/learning/roadmaps/:roadmapId/report"
            element={<LearningRoadmapReportPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  await screen.findByText('practice.learningPath.roadmapReportTitle');
}

describe('LearningRoadmapReportPage', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it('lộ trình chưa chấm buổi nào (mọi mảng RỖNG) ⇒ trạng thái trống có giải thích, KHÔNG biểu đồ nào', async () => {
    vi.mocked(roadmapPracticeService.getRoadmapReport).mockResolvedValue(baseReport());
    await renderPage();

    expect(screen.getByTestId('report-empty-state')).toBeInTheDocument();
    expect(screen.getByText('practice.learningPath.reportEmptyDesc')).toBeInTheDocument();
    // Vế quyết định: radar/line rỗng vẽ ra chấm hoặc hình méo, người dùng đọc thành
    // "hệ thống hỏng" chứ không đọc thành "chưa có dữ liệu". Hai thứ phải phân biệt được.
    expect(document.querySelector('[data-stub="RadarChart"]')).toBeNull();
    expect(document.querySelector('[data-stub="LineChart"]')).toBeNull();
    expect(screen.queryByTestId('roadmap-progress-chart')).not.toBeInTheDocument();
  });

  it('có dữ liệu ⇒ vẽ cả radar lẫn biểu đồ đường, không hiện trạng thái trống', async () => {
    vi.mocked(roadmapPracticeService.getRoadmapReport).mockResolvedValue(filledReport());
    await renderPage();

    expect(screen.queryByTestId('report-empty-state')).not.toBeInTheDocument();
    expect(document.querySelector('[data-stub="RadarChart"]')).not.toBeNull();
    expect(screen.getByTestId('roadmap-progress-chart')).toBeInTheDocument();
  });

  it('CHỈ MỘT buổi vẫn vẽ radar — ca này khác hẳn ca rỗng hoàn toàn', async () => {
    vi.mocked(roadmapPracticeService.getRoadmapReport).mockResolvedValue(
      filledReport({
        progress: [
          { order: 1, lessonTitle: 'Bài 1', completedAt: null, overallPercentage: 40, scores: [] },
        ],
      }),
    );
    await renderPage();

    expect(screen.queryByTestId('report-empty-state')).not.toBeInTheDocument();
    expect(document.querySelector('[data-stub="RadarChart"]')).not.toBeNull();
    // ...nhưng biểu đồ xu hướng thì không: một điểm không phải một đường.
    expect(document.querySelector('[data-stub="LineChart"]')).toBeNull();
    expect(screen.getByText('practice.learningPath.progressChartTooFew')).toBeInTheDocument();
  });

  it('lộ trình đang học ⇒ banner nói rõ đây là báo cáo giữa chừng và thiếu nhận xét AI', async () => {
    vi.mocked(roadmapPracticeService.getRoadmapReport).mockResolvedValue(filledReport());
    await renderPage();

    expect(screen.getByTestId('report-interim-banner')).toBeInTheDocument();
    expect(screen.getByText('practice.learningPath.reportInterimDesc')).toBeInTheDocument();
  });

  it('lộ trình đã hoàn thành ⇒ KHÔNG có banner tạm thời', async () => {
    vi.mocked(roadmapPracticeService.getRoadmapReport).mockResolvedValue(
      filledReport({ kind: 'snapshot', roadmapStatus: 'Completed' }),
    );
    await renderPage();

    expect(screen.queryByTestId('report-interim-banner')).not.toBeInTheDocument();
  });

  it('truyền ngưỡng xuống biểu đồ đường thay vì bịa ra 0%', async () => {
    vi.mocked(roadmapPracticeService.getRoadmapReport).mockResolvedValue(filledReport());
    await renderPage();

    expect(document.querySelector('[data-stub="ReferenceLine"]')!.getAttribute('data-y')).toBe('60');
  });

  it('ô "Đã tiến bộ" rỗng ⇒ có câu giải thích riêng, không phải dấu gạch trơ', async () => {
    vi.mocked(roadmapPracticeService.getRoadmapReport).mockResolvedValue(filledReport());
    await renderPage();

    expect(screen.getByText('practice.learningPath.improvementsEmpty')).toBeInTheDocument();
  });
});
