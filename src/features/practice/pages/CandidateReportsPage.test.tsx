// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CandidateReportsPage } from './CandidateReportsPage';
import { fetchCandidateReportsHub } from '../services/candidateReports.service';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));

vi.mock('@/features/cv-analysis/components/report/CvAnalysisReportsSection', () => ({
  CvAnalysisReportsSection: () => <div>cv-section</div>,
}));

vi.mock('../services/candidateReports.service', () => ({
  fetchCandidateReportsHub: vi.fn(),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <CandidateReportsPage />
    </MemoryRouter>,
  );
}

afterEach(cleanup);

/**
 * 🔴 Ca thật (23/08): mục "Luyện tập theo lộ trình" hiện 0 vì nguồn dữ liệu NÉM ("chưa nối API")
 * và lỗi bị nuốt ở hai lớp — `Promise.allSettled` trong service, rồi `catch` của page. Người dùng
 * vừa học xong một bài nhìn thấy 0 và kết luận hệ thống không ghi nhận.
 *
 * "Chưa tải được" và "chưa có gì" PHẢI hiện ra khác nhau.
 */
describe('CandidateReportsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('tải hỏng ⇒ hiện báo lỗi, KHÔNG hiện danh sách rỗng', async () => {
    vi.mocked(fetchCandidateReportsHub).mockRejectedValue(new Error('boom'));

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('practice.reports.error');
    // Không được trình bày lỗi thành "chưa có báo cáo nào".
    expect(screen.queryByText('practice.reports.empty.learning')).not.toBeInTheDocument();
    expect(screen.queryByText('practice.reports.category.learning')).not.toBeInTheDocument();
  });

  it('bấm "Thử lại" gọi lại nguồn dữ liệu và hiện được kết quả', async () => {
    vi.mocked(fetchCandidateReportsHub)
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ interview: [], learning: [], cv: [] });

    renderPage();
    await screen.findByRole('alert');

    await userEvent.click(screen.getByRole('button', { name: 'practice.reports.retry' }));

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(fetchCandidateReportsHub).toHaveBeenCalledTimes(2);
    expect(screen.getByText('practice.reports.category.learning')).toBeInTheDocument();
  });

  it('tải được nhưng thật sự chưa có buổi nào ⇒ hiện mục rỗng, KHÔNG hiện báo lỗi', async () => {
    vi.mocked(fetchCandidateReportsHub).mockResolvedValue({
      interview: [],
      learning: [],
      cv: [],
    });

    renderPage();

    expect(await screen.findByText('practice.reports.category.learning')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
