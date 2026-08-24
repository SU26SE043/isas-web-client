// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LearningTheoryActions } from './LearningTheoryActions';
import type { LearningRoadmapDetail } from '../../types/learningPath.types';
import type { OpenedLearningLesson } from '../../utils/roadmapMapper';

/**
 * Dùng BỘ DỊCH THẬT (không phải `t: (k) => k`) để test đồng thời chứng minh khoá có trong
 * bundle vi: thiếu khoá thì `getTranslation` trả nguyên chuỗi `practice.learningPath.*` ra
 * cho người dùng — hỏng im lặng, không lỗi nào nổ.
 */
vi.mock('@/shared/languages', async () => {
  const { practiceTranslations } = await import('../../languages/translations');
  return {
    useLanguage: () => ({
      language: 'vi',
      t: (key: string) => practiceTranslations.vi[key] ?? key,
    }),
  };
});

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

vi.mock('@/features/payment/hooks/useTokenWallet', () => ({
  useTokenWallet: () => ({ available: 5 }),
}));

const retryCall = vi.fn();
vi.mock('../../utils/launchLearningInterviewPractice', () => ({
  learningInterviewPreparePath: (sessionId: string) => `/prepare/${sessionId}`,
  startLearningLessonPractice: vi.fn(),
  retryLearningLessonPractice: (...args: unknown[]) => retryCall(...args),
}));

afterEach(cleanup);
beforeEach(() => {
  navigate.mockReset();
  retryCall.mockReset();
});

const RETRY = /Làm lại bài/;

function opened(over: Partial<OpenedLearningLesson> = {}): OpenedLearningLesson {
  return {
    id: 'ls-1',
    orderNo: 1,
    title: 'Lesson one',
    titleVi: 'Bài một',
    theoryContent: '',
    theoryContentVi: '',
    sessionId: null,
    apiStatus: 'Done',
    theoryStatus: 'completed',
    practiceStatus: 'completed',
    pathStatus: 'completed',
    resources: [],
    citations: null,
    canRetry: true,
    attemptCount: 1,
    ...over,
  };
}

function roadmap(): LearningRoadmapDetail {
  return {
    id: 'rm-1',
    title: 'Roadmap',
    titleVi: 'Lộ trình',
    domain: 'BA',
    targetLevel: 'junior',
    status: 'completed',
    readOnly: true,
    progressPercent: 100,
    milestones: [],
  } as unknown as LearningRoadmapDetail;
}

function renderActions(over: Partial<OpenedLearningLesson> = {}) {
  return render(
    <MemoryRouter>
      <LearningTheoryActions roadmap={roadmap()} opened={opened(over)} />
    </MemoryRouter>,
  );
}

describe('LearningTheoryActions — luyện lại bài', () => {
  it('hiện nút làm lại cho bài đã xong khi server cho phép', () => {
    renderActions();
    expect(screen.getByRole('button', { name: RETRY })).toBeInTheDocument();
  });

  // Quyền quyết định nằm ở SERVER — giao diện không tự suy từ trạng thái bài/lộ trình.
  it('server nói không thì không hiện, dù bài đã Done', () => {
    renderActions({ canRetry: false });
    expect(screen.queryByRole('button', { name: RETRY })).not.toBeInTheDocument();
  });

  // Lộ trình đã hoàn thành là `readOnly` — mà đó chính là lúc cần nút này nhất.
  // Backend được thiết kế theo hướng đó: làm lại một bài sẽ MỞ LẠI lộ trình đã hoàn thành.
  it('lộ trình đã hoàn thành VẪN cho làm lại', () => {
    renderActions();
    expect(screen.getByRole('button', { name: RETRY })).toBeEnabled();
  });

  it('báo giá 1 credit ngay trên nút, không đợi server trả 402', () => {
    renderActions();
    expect(screen.getByRole('button', { name: RETRY })).toHaveTextContent(/credit/i);
  });

  // Thao tác này tiêu credit thật ⇒ phải có một lần xác nhận chen vào giữa.
  it('bấm nút chỉ MỞ hộp thoại, KHÔNG gọi API', async () => {
    renderActions();
    await userEvent.click(screen.getByRole('button', { name: RETRY }));
    expect(retryCall).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('hiện số lần đã luyện khi > 1', () => {
    renderActions({ attemptCount: 3 });
    expect(screen.getByText(/Đã luyện 3 lần/)).toBeInTheDocument();
  });

  it('KHÔNG hiện số lần khi mới làm 1 lần', () => {
    renderActions({ attemptCount: 1 });
    expect(screen.queryByText(/Đã luyện/)).not.toBeInTheDocument();
  });

  // ── Chuyển từ bộ test cũ gắn với trang danh sách; nút đã dời sang trang chi tiết bài,
  //    nhưng những hành vi dưới đây vẫn phải giữ nguyên vì chúng canh đường TIÊU CREDIT. ──

  it('hộp thoại nói rõ giá, câu hỏi khác lần trước và điểm không bị đè', async () => {
    renderActions();
    await userEvent.click(screen.getByRole('button', { name: RETRY }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('tốn 1 credit');
    expect(dialog).toHaveTextContent('Câu hỏi lần này sẽ khác lần trước.');
    expect(dialog).toHaveTextContent('không đè lên kết quả cũ');
  });

  it('huỷ hộp thoại thì không tiêu credit', async () => {
    renderActions();
    await userEvent.click(screen.getByRole('button', { name: RETRY }));
    await userEvent.click(screen.getByRole('button', { name: 'Huỷ' }));
    expect(retryCall).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('xác nhận mới gọi service retry và điều hướng vào buổi mới', async () => {
    retryCall.mockResolvedValue({ ok: true, resumed: false, session: { sessionId: 'ses-new' } });
    renderActions();
    await userEvent.click(screen.getByRole('button', { name: RETRY }));
    await userEvent.click(screen.getAllByRole('button', { name: RETRY }).at(-1)!);
    await waitFor(() => expect(retryCall).toHaveBeenCalled());
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/prepare/ses-new'));
  });

  it('402 hiện thông điệp RIÊNG kèm lối nạp credit, không phải lỗi chung', async () => {
    retryCall.mockResolvedValue({ ok: false, code: 'insufficient_credits' });
    renderActions();
    await userEvent.click(screen.getByRole('button', { name: RETRY }));
    await userEvent.click(screen.getAllByRole('button', { name: RETRY }).at(-1)!);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Không đủ credit để làm lại bài này');
    expect(alert).not.toHaveTextContent('Không thể tạo buổi luyện lại');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('lỗi khác 402 dùng thông điệp chung, KHÔNG dẫn nhầm sang trang nạp credit', async () => {
    retryCall.mockResolvedValue({ ok: false, code: 'ai_failed' });
    renderActions();
    await userEvent.click(screen.getByRole('button', { name: RETRY }));
    await userEvent.click(screen.getAllByRole('button', { name: RETRY }).at(-1)!);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Không thể tạo buổi luyện lại');
    expect(screen.queryByRole('link', { name: 'Mua credit' })).not.toBeInTheDocument();
  });
});
