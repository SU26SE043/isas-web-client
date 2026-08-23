// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InterviewHistoryPage } from './InterviewHistoryPage';
import { getPracticeSessionHistory } from '../services/history.service';
import type { GetPracticeSessionHistoryParams } from '../types/history.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));
vi.mock('../services/history.service', () => ({
  getPracticeSessionHistory: vi.fn(),
}));

function page(nextCursor: string | null) {
  return {
    items: [
      {
        id: 'session-1',
        status: 'Scored',
        jobCategory: 'BE',
        createdAt: '2026-08-20T07:00:00Z',
        completedAt: '2026-08-20T07:20:00Z',
        overallScore: 70,
        seniority: 'Junior',
        lessonTitle: null,
      },
    ],
    nextCursor,
  };
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <InterviewHistoryPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const calls = () =>
  vi.mocked(getPracticeSessionHistory).mock.calls.map(
    ([params]) => (params ?? {}) as GetPracticeSessionHistoryParams,
  );
const lastCall = () => calls()[calls().length - 1];

beforeEach(() => {
  vi.mocked(getPracticeSessionHistory).mockResolvedValue(page('cursor-2'));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/**
 * Bảng và ô lọc đều có test riêng, nhưng CHỖ ĐẤU DÂY giữa chúng thì không — mà đó đúng là nơi bộ
 * lọc chết lặng: ô select đổi giá trị, người dùng thấy "đang lọc", còn request đi ra vẫn y nguyên.
 */
describe('InterviewHistoryPage — ô lọc nguồn đi tới tận request', () => {
  it('mặc định KHÔNG gửi `source` (tất cả)', async () => {
    renderPage();

    await waitFor(() => expect(getPracticeSessionHistory).toHaveBeenCalled());
    expect(lastCall().source).toBeUndefined();
  });

  it('chọn "theo lộ trình" ⇒ request mang `source=lesson`', async () => {
    renderPage();
    await waitFor(() => expect(getPracticeSessionHistory).toHaveBeenCalled());

    await userEvent.selectOptions(
      screen.getByLabelText('practice.history.filterSource'),
      'lesson',
    );

    await waitFor(() => expect(lastCall().source).toBe('lesson'));
  });

  it('chọn "tự do" ⇒ request mang `source=free`', async () => {
    renderPage();
    await waitFor(() => expect(getPracticeSessionHistory).toHaveBeenCalled());

    await userEvent.selectOptions(screen.getByLabelText('practice.history.filterSource'), 'free');

    await waitFor(() => expect(lastCall().source).toBe('free'));
  });

  it('quay lại "tất cả" ⇒ thôi gửi `source`, KHÔNG gửi chuỗi rỗng', async () => {
    renderPage();
    await waitFor(() => expect(getPracticeSessionHistory).toHaveBeenCalled());
    const select = screen.getByLabelText('practice.history.filterSource');

    await userEvent.selectOptions(select, 'lesson');
    await waitFor(() => expect(lastCall().source).toBe('lesson'));
    await userEvent.selectOptions(select, 'all');

    await waitFor(() => expect(lastCall().source).toBeUndefined());
    // `all` và `''` KHÔNG nằm trong kiểu `PracticeSessionSource`, nên TypeScript đã chặn đường
    // hợp lệ; đọc qua `string` để vẫn bắt được ca lọt qua một phép ép kiểu.
    const rawSources = calls().map((params) => params.source as string | undefined);
    expect(rawSources).not.toContain('all');
    expect(rawSources).not.toContain('');
  });

  /**
   * 🔴 Con trỏ trang thuộc về TẬP KẾT QUẢ cũ. Mang nó sang tập vừa lọc là mở "trang 2" của một danh
   * sách khác — trang trắng hoặc một cửa sổ dữ liệu lệch, và không có gì báo lỗi.
   */
  it('đổi nguồn khi đang ở trang 2 ⇒ trả con trỏ về đầu danh sách', async () => {
    renderPage();
    await waitFor(() => expect(getPracticeSessionHistory).toHaveBeenCalled());

    // Chờ BẢNG render xong rồi mới bấm — `waitFor` ở trên chỉ khẳng định request đã đi, lúc đó
    // trang còn đang hiện khung xương và thanh phân trang chưa tồn tại.
    const next = await screen.findByLabelText('ds.pagination.next');
    await userEvent.click(next);
    await waitFor(() => expect(lastCall().cursor).toBe('cursor-2'));

    await userEvent.selectOptions(
      screen.getByLabelText('practice.history.filterSource'),
      'lesson',
    );

    await waitFor(() => expect(lastCall().source).toBe('lesson'));
    expect(lastCall().cursor).toBeUndefined();
  });

  it('nút xoá bộ lọc cũng trả nguồn về "tất cả" và con trỏ về đầu', async () => {
    vi.mocked(getPracticeSessionHistory).mockResolvedValue({ items: [], nextCursor: null });
    renderPage();
    await waitFor(() => expect(getPracticeSessionHistory).toHaveBeenCalled());

    await userEvent.selectOptions(
      screen.getByLabelText('practice.history.filterSource'),
      'lesson',
    );
    await waitFor(() => expect(lastCall().source).toBe('lesson'));

    // Lọc không ra gì thì phải là ô "không tìm thấy phiên phù hợp" kèm nút xoá lọc — KHÔNG phải
    // "bạn chưa có buổi luyện nào".
    expect(screen.getByText('practice.history.emptyFilteredTitle')).toBeInTheDocument();
    await userEvent.click(screen.getByText('practice.history.clearFilters'));

    await waitFor(() => expect(lastCall().source).toBeUndefined());
    expect(lastCall().cursor).toBeUndefined();
  });
});
