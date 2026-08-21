import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/languages', async () => {
  const { practiceTranslations } = await import('../languages/translations');
  return {
    useLanguage: () => ({
      language: 'vi',
      t: (key: string) => practiceTranslations.vi[key] ?? key,
    }),
  };
});
vi.mock('@/features/payment/hooks/useTokenWallet', () => ({
  useTokenWallet: () => ({ available: 10 }),
}));
vi.mock('../hooks/useLearningRoadmaps', () => ({
  useLearningRoadmapDetail: vi.fn(),
  invalidateLearningRoadmaps: vi.fn(),
  updateRoadmapNameInCache: vi.fn(),
}));
vi.mock('../components/learning-path/LearningRoadmapCreditSummary', () => ({
  LearningRoadmapCreditSummary: () => <div>credit-summary</div>,
}));
vi.mock('../components/learning-path/LearningCreditWarningDialog', () => ({
  LearningCreditWarningDialog: () => null,
}));

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const retryLesson = vi.fn();
const startLesson = vi.fn();
vi.mock('../services/roadmapPractice.service', () => ({
  roadmapPracticeService: {
    retryLesson: (...a: unknown[]) => retryLesson(...a),
    startLesson: (...a: unknown[]) => startLesson(...a),
    getPracticeSession: vi.fn(),
  },
}));

import { useLearningRoadmapDetail } from '../hooks/useLearningRoadmaps';
import { LearningRoadmapDetailPage } from './LearningRoadmapDetailPage';

function roadmapFixture() {
  return {
    id: 'rm-1',
    name: 'Lộ trình BE', nameVi: 'Lộ trình BE',
    domainId: 'BE', domainLabel: 'Backend', domainLabelVi: 'Backend',
    targetLevel: 'Junior',
    status: 'in_progress',
    progressPercent: 30,
    currentMilestoneId: '', currentMilestoneTitle: '', currentMilestoneTitleVi: '',
    currentLessonId: '', currentLessonTitle: '', currentLessonTitleVi: '',
    estimatedRemainingHours: 2,
    updatedAt: '2026-08-10T00:00:00Z',
    readOnly: false,
    milestones: [{
      id: 'ms-1', title: 'M1', titleVi: 'M1', order: 1,
      status: 'current', progressPercent: 50,
      lessons: [{
        id: 'ls-1', title: 'Lesson one', titleVi: 'Bài một', order: 1,
        theoryStatus: 'completed', practiceStatus: 'completed',
        content: '', contentVi: '', status: 'completed',
        apiStatus: 'Done', sessionId: null,
        attemptCount: 2, canRetry: true,
      }],
    }],
    reports: [],
  };
}

function renderPage() {
  vi.mocked(useLearningRoadmapDetail).mockReturnValue({
    data: roadmapFixture(),
    isLoading: false, isError: false, error: null,
    refetch: vi.fn(), isFetching: false,
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

const RETRY_BUTTON = /Làm lại bài/;

async function clickRetry() {
  const buttons = screen.getAllByRole('button', { name: RETRY_BUTTON });
  await userEvent.click(buttons[0]);
}

describe('LearningRoadmapDetailPage — luyện lại bài', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    retryLesson.mockReset();
  });
  afterEach(() => cleanup());

  it('bấm nút KHÔNG gọi API ngay — phải qua hộp thoại xác nhận (thao tác tiêu credit)', async () => {
    renderPage();
    await clickRetry();

    expect(retryLesson).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toHaveTextContent('Làm lại bài học này?');
  });

  it('hộp thoại nói rõ giá, câu hỏi khác lần trước và điểm không bị đè', async () => {
    renderPage();
    await clickRetry();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('tốn 1 credit');
    expect(dialog).toHaveTextContent('Câu hỏi lần này sẽ khác lần trước.');
    expect(dialog).toHaveTextContent('không đè lên kết quả cũ');
  });

  it('huỷ hộp thoại thì không tiêu credit', async () => {
    renderPage();
    await clickRetry();
    await userEvent.click(screen.getByRole('button', { name: 'Huỷ' }));

    expect(retryLesson).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('xác nhận mới gọi đúng service retry và điều hướng vào buổi mới', async () => {
    retryLesson.mockResolvedValue({ ok: true, resumed: false, session: { sessionId: 'ses-new' } });
    renderPage();
    await clickRetry();
    await userEvent.click(screen.getByRole('button', { name: 'Làm lại bài' }));

    await waitFor(() => expect(retryLesson).toHaveBeenCalledWith('rm-1', 'ls-1'));
    expect(startLesson).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/interview/ses-new/prepare')),
    );
  });

  it('402 hiện thông điệp RIÊNG kèm lối nạp credit, không phải lỗi chung', async () => {
    retryLesson.mockResolvedValue({ ok: false, code: 'insufficient_credits' });
    renderPage();
    await clickRetry();
    await userEvent.click(screen.getByRole('button', { name: 'Làm lại bài' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Không đủ credit để làm lại bài này');
    expect(alert).not.toHaveTextContent('Không thể tạo buổi luyện lại');
    expect(screen.getByRole('link', { name: 'Mua credit' })).toHaveAttribute(
      'href',
      '/candidate/credits',
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  it('không đóng được hộp thoại khi buổi đang được tạo — giữ trạng thái đang chạy', async () => {
    // Chỗ giữ thật chống hai buổi là nút trong danh sách + bản đồ in-flight;
    // guard này giữ phần PHẢN HỒI: nhấn Esc giữa chừng mà hộp thoại biến mất
    // thì người học không còn thấy gì đang chạy, và bấm lại là chuyện hiển nhiên.
    let release!: (v: unknown) => void;
    retryLesson.mockReturnValue(new Promise((r) => { release = r; }));
    renderPage();
    await clickRetry();
    await userEvent.click(screen.getByRole('button', { name: 'Làm lại bài' }));

    await screen.findByRole('button', { name: /Đang tạo buổi luyện/ });
    await userEvent.keyboard('{Escape}');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đang tạo buổi luyện/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Huỷ' })).toBeDisabled();

    // Thả request ra để hộp thoại đóng — không để modal treo rò sang test sau.
    release({ ok: false, code: 'generic' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('lỗi khác 402 dùng thông điệp lỗi chung, KHÔNG dẫn nhầm sang trang nạp credit', async () => {
    retryLesson.mockResolvedValue({ ok: false, code: 'ai_failed' });
    renderPage();
    await clickRetry();
    await userEvent.click(screen.getByRole('button', { name: 'Làm lại bài' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Không thể tạo buổi luyện lại');
    expect(screen.queryByRole('link', { name: 'Mua credit' })).not.toBeInTheDocument();
  });
});
