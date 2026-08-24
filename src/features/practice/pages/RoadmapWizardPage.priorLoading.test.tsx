import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const flow = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => key }),
}));
vi.mock('../hooks/useRoadmapWizardFlow', () => ({ useRoadmapWizardFlow: () => flow.value }));

import { RoadmapWizardPage } from './RoadmapWizardPage';

afterEach(cleanup);

function renderAtPriorStep(loadingReports: boolean) {
  flow.value = {
    step: 'priorRoadmap',
    steps: ['domain', 'nameFocus', 'cv', 'currentLevel', 'reports', 'targetLevel', 'priorRoadmap', 'confirm'],
    domains: [],
    completedRoadmaps: [],
    loadingReports,
    priorRoadmapId: undefined,
    setPriorRoadmapId: vi.fn(),
    goBack: vi.fn(),
    goNext: vi.fn(),
    isSubmitting: false,
    submitError: null,
  };
  render(
    <MemoryRouter>
      <RoadmapWizardPage />
    </MemoryRouter>,
  );
}

/**
 * Khoá đúng sợi dây `isLoading={flow.loadingReports}`. Thiếu nó thì trang vẫn biên dịch, vẫn chạy,
 * và người dùng thấy đúng triệu chứng đã quan sát: dropdown chỉ có "Bỏ qua" trong lúc dữ liệu còn
 * đang về, không có gì nói ra điều đó.
 */
describe('RoadmapWizardPage đấu dây trạng thái tải cho bước Roadmap đã hoàn tất', () => {
  it('đang tải ⇒ bước hiện chú thích đang tải', () => {
    renderAtPriorStep(true);
    expect(screen.getByText('practice.roadmapWizard.prior.loading')).toBeInTheDocument();
  });

  it('tải xong ⇒ hiện chú thích rỗng, không còn chú thích đang tải', () => {
    renderAtPriorStep(false);
    expect(screen.getByText('practice.roadmapWizard.prior.empty')).toBeInTheDocument();
    expect(screen.queryByText('practice.roadmapWizard.prior.loading')).not.toBeInTheDocument();
  });
});
