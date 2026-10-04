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

  it('tải hỏng ⇒ tab học tập hiện báo lỗi, KHÔNG hiện danh sách rỗng hay số 0', async () => {
    vi.mocked(fetchCandidateReportsHub).mockRejectedValue(new Error('boom'));

    renderPage();

    // Phỏng vấn + học tập cùng một nguồn hub ⇒ cả hai tab mang dấu lỗi, không tab nào hiện số 0.
    expect(await screen.findAllByRole('tab', { name: /practice\.reports\.error/ })).toHaveLength(2);
    expect(screen.queryByText('0')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: /practice\.reports\.category\.learning/ }));

    expect(screen.getByRole('alert')).toHaveTextContent('practice.reports.error');
    // Không được trình bày lỗi thành "chưa có báo cáo nào".
    expect(screen.queryByText('practice.reports.empty.learning')).not.toBeInTheDocument();
  });

  it('hub đang tải hoặc tải hỏng vẫn KHÔNG che báo cáo CV (nguồn riêng)', async () => {
    let rejectHub: (error: Error) => void = () => undefined;
    vi.mocked(fetchCandidateReportsHub).mockReturnValue(new Promise((_, reject) => { rejectHub = reject; }));

    renderPage();

    expect(screen.getByText('cv-section')).toBeInTheDocument();
    rejectHub(new Error('boom'));
    await screen.findAllByRole('tab', { name: /practice\.reports\.error/ });
    expect(screen.getByText('cv-section')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('bấm "Thử lại" gọi lại nguồn dữ liệu và hiện được kết quả', async () => {
    vi.mocked(fetchCandidateReportsHub)
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ interview: [], learning: [], cv: [] });

    renderPage();
    await userEvent.click(await screen.findByRole('tab', { name: /practice\.reports\.category\.learning/ }));
    await screen.findByRole('alert');

    await userEvent.click(screen.getByRole('button', { name: 'practice.reports.retry' }));

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(fetchCandidateReportsHub).toHaveBeenCalledTimes(2);
    expect(await screen.findByText('practice.reports.empty.learning')).toBeInTheDocument();
  });

  it('tải được nhưng thật sự chưa có buổi nào ⇒ hiện mục rỗng, KHÔNG hiện báo lỗi', async () => {
    vi.mocked(fetchCandidateReportsHub).mockResolvedValue({
      interview: [],
      learning: [],
      cv: [],
    });

    renderPage();

    const learningTab = await screen.findByRole('tab', { name: /practice\.reports\.category\.learning/ });
    await waitFor(() => expect(learningTab).toHaveTextContent('0'));
    await userEvent.click(learningTab);
    expect(screen.getByText('practice.reports.empty.learning')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('đổi tab để chỉ hiển thị danh sách report của hạng mục đang chọn', async () => {
    vi.mocked(fetchCandidateReportsHub).mockResolvedValue({
      interview: [],
      learning: [{
        id: 'lesson-report',
        category: 'learning',
        title: 'Lesson report',
        titleVi: 'Báo cáo bài học',
        href: '/candidate/practice/history/lesson-report',
        createdAt: '2026-09-30T00:00:00Z',
      }],
      cv: [],
    });

    renderPage();

    const learningTab = await screen.findByRole('tab', { name: /practice\.reports\.category\.learning/ });
    await userEvent.click(learningTab);

    expect(learningTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Báo cáo bài học')).toBeInTheDocument();
  });
});
