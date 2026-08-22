// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => key }),
}));
vi.mock('../hooks/useLearningRoadmaps', () => ({
  useLearningRoadmapDetail: vi.fn(),
  useLearningLesson: vi.fn(),
}));
vi.mock('../components/learning-path/LessonHtmlContent', () => ({
  LessonHtmlContent: () => <div>theory-html</div>,
}));
vi.mock('../components/learning-path/LearningTheoryActions', () => ({
  LearningTheoryActions: () => <div>actions</div>,
}));

import { useLearningLesson, useLearningRoadmapDetail } from '../hooks/useLearningRoadmaps';
import { LearningTheoryPage } from './LearningTheoryPage';

type Citation = { chunkId: string; sourceUrl: string; sourceTitle: string };

function renderPage(citations: Citation[] | null) {
  vi.mocked(useLearningRoadmapDetail).mockReturnValue({
    data: { id: 'rm-1', milestones: [] },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
  } as unknown as ReturnType<typeof useLearningRoadmapDetail>);

  vi.mocked(useLearningLesson).mockReturnValue({
    data: {
      id: 'ls-1',
      orderNo: 1,
      title: 'Lesson 1',
      titleVi: 'Bài 1',
      theoryContent: '# Nội dung',
      theoryContentVi: '# Nội dung',
      sessionId: null,
      apiStatus: 'Theory',
      theoryStatus: 'available',
      practiceStatus: 'locked',
      pathStatus: 'in_progress',
      resources: [],
      citations,
      canRetry: false,
      attemptCount: 0,
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
  } as unknown as ReturnType<typeof useLearningLesson>);

  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/candidate/learning/roadmaps/rm-1/lessons/ls-1']}>
        <Routes>
          <Route
            path="/candidate/learning/roadmaps/:roadmapId/lessons/:lessonId"
            element={<LearningTheoryPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/**
 * Khe nối giữa trang và khối nguồn: component có test riêng rồi, nhưng nếu trang
 * quên render nó thì mọi test kia vẫn xanh mà người học vẫn không thấy nguồn nào.
 */
describe('LearningTheoryPage — khối nguồn kiểm chứng', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it('bài CÓ nguồn → trang hiện link kiểm chứng', () => {
    renderPage([
      { chunkId: 'c1', sourceUrl: 'https://developer.mozilla.org/aria', sourceTitle: 'MDN — ARIA' },
    ]);
    expect(screen.getByRole('link', { name: 'MDN — ARIA' })).toHaveAttribute(
      'href',
      'https://developer.mozilla.org/aria',
    );
  });

  it('bài KHÔNG có nguồn → trang nói rõ, không bỏ trống', () => {
    renderPage(null);
    expect(screen.getByText('practice.learningPath.citationsEmpty')).toBeInTheDocument();
  });
});
