/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { campaignsTranslations } from '../languages/translations';

/**
 * ATT1-F3 — khe nối: API my-campaigns/{id} (mock apiClient) → service map [C6] → hook react-query THẬT →
 * trang → nút → hộp thoại → start [C7]/[C8]. So khớp TUYỆT ĐỐI bằng chữ vi thật; fixture dùng
 * attemptsUsed / maxAttempts / n KHÁC NHAU để phép tráo biến bị bắt.
 */
const CMP = 'cmp-att1-f3';
const SESSION = 'sess-new-77';
const DETAIL_URL = `/api/v1/campaign/my-campaigns/${CMP}`;
const START_URL = `/api/v1/campaign/${CMP}/start`;

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: api.get, post: api.post } }));

const VI = campaignsTranslations.vi as Record<string, string>;
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => VI[key] ?? key }),
}));
vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) => selector({ user: { id: 'u1', role: 'Candidate' } }),
}));
vi.mock('@/features/auth/types/auth.types', () => ({ UserRole: { CANDIDATE: 'Candidate' } }));

const saveCampaignInterviewSession = vi.fn();
vi.mock('../utils/campaignInterviewSession', () => ({
  saveCampaignInterviewSession: (...args: unknown[]) => saveCampaignInterviewSession(...args),
}));
const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const { CandidateCampaignDetailPage } = await import('./CandidateCampaignDetailPage');

let detailBody: Record<string, unknown>;
const base = { campaignId: CMP, title: 'Backend Developer', criteria: [], membershipStatus: 'Joined', deadline: null };
const startBody = {
  sessionId: SESSION, campaignId: CMP, questions: [], antiCheatEnabled: true, faceEnrollRequired: false,
  adaptiveEnabled: false, deadlineAt: null, attemptNo: 1, timeLimitMinutes: 45,
};
const RESUME = 'Thoát giữa chừng vẫn quay lại được trong thời gian còn lại; hết giờ là bài tự nộp.';

beforeEach(() => {
  api.get.mockImplementation(async (url: string) => {
    if (url === DETAIL_URL) return { data: { data: detailBody } };
    throw new Error(`unexpected GET ${url}`);
  });
  api.post.mockResolvedValue({ data: startBody });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function renderPage(body: Record<string, unknown>) {
  detailBody = { ...base, ...body };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/candidate/campaigns/${CMP}`]}>
        <Routes><Route path="/candidate/campaigns/:id" element={<CandidateCampaignDetailPage />} /></Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  await screen.findByRole('heading', { level: 1, name: 'Backend Developer' });
  return { invalidate };
}

const buttonTexts = () => screen.queryAllByRole('button').map((button) => button.textContent);
const text = (testId: string) => screen.getByTestId(testId).textContent;

async function openDialogLines(buttonName: string) {
  await userEvent.click(screen.getByRole('button', { name: buttonName }));
  const dialog = await screen.findByRole('dialog');
  const lines = within(within(dialog).getByTestId('start-confirm-rules')).getAllByRole('listitem').map((li) => li.textContent);
  return { dialog, lines };
}

function conflict(data: Record<string, unknown>) {
  return { isAxiosError: true, response: { status: 409, data, headers: {} } };
}

describe('CandidateCampaignDetailPage — bốn trạng thái lượt (ATT1-F3)', () => {
  it('① chưa làm: thời lượng · số lần · luật đồng hồ; hộp thoại lần đầu KHÔNG có dòng lượt n/N; xác nhận ⇒ start ⇒ bước chuẩn bị', async () => {
    await renderPage({ interviewStatus: 'NotStarted', started: false, timeLimitMinutes: 45, maxAttempts: 3, attemptsUsed: 0, lastAttemptAbandoned: false });

    expect(text('campaign-rule-duration')).toBe('Thời lượng 45 phút');
    expect(text('campaign-rule-attempts')).toBe('3 lần làm');
    expect(text('campaign-clock-rule')).toBe(VI['campaigns.detail.attempt.clockRule']);
    expect(buttonTexts()).toEqual(['Bắt đầu bài phỏng vấn']);

    const { dialog, lines } = await openDialogLines('Bắt đầu bài phỏng vấn');
    expect(lines).toEqual(['Bài thi 45 phút, tính từ lúc vào phòng.', `Bạn có 3 lượt. ${RESUME}`]);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Vào bước chuẩn bị' }));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith(`/interview/${SESSION}/prepare`));
    expect(api.post).toHaveBeenCalledWith(START_URL);
    expect(saveCampaignInterviewSession).toHaveBeenCalledWith(expect.objectContaining({ sessionId: SESSION, attemptNo: 1, timeLimitMinutes: 45 }));
  });

  it('② đang làm dở (InProgress, kể cả lượt cuối 1/1): "Đang làm dở" + Tiếp tục, KHÔNG hết lượt, KHÔNG đếm ngược, không qua hộp thoại', async () => {
    await renderPage({ interviewStatus: 'InProgress', started: true, sessionId: 'sess-old', timeLimitMinutes: 30, maxAttempts: 1, attemptsUsed: 1, lastAttemptAbandoned: false });

    expect(text('campaign-attempt-in-progress')).toBe('Đang làm dở');
    expect(buttonTexts()).toEqual(['Tiếp tục bài phỏng vấn']);
    expect(screen.queryByTestId('campaign-attempt-exhausted')).toBeNull();
    expect(document.body.textContent).not.toMatch(/\b\d{1,2}:\d{2}\b/);

    await userEvent.click(screen.getByRole('button', { name: 'Tiếp tục bài phỏng vấn' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(`/interview/${SESSION}/prepare`));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it.each([
    { used: 1, max: 3, n: 2, remaining: 2 },
    { used: 2, max: 3, n: 3, remaining: 1 },
  ])('③ bỏ ngang lượt $used, còn $remaining/$max ⇒ "Làm lại lượt $n"; hộp thoại có "Đây là lượt $n/$max"', async ({ used, max, n, remaining }) => {
    // started + sessionId của lượt bỏ ngang VẪN còn — logic cũ sẽ hiện "Tiếp tục" (gọi start không qua hộp thoại).
    await renderPage({ interviewStatus: 'NotStarted', started: true, sessionId: 'sess-abandoned', timeLimitMinutes: 20, maxAttempts: max, attemptsUsed: used, lastAttemptAbandoned: true });

    expect(text('campaign-attempt-retry-ended')).toBe(`Lượt ${used} đã kết thúc mà chưa có câu trả lời nào được chấm.`);
    expect(text('campaign-attempt-retry-remaining')).toBe(`Còn ${remaining}/${max} lượt — lượt mới có bộ câu hỏi khác.`);
    expect(buttonTexts()).toEqual([`Làm lại lượt ${n}`]);

    const { dialog, lines } = await openDialogLines(`Làm lại lượt ${n}`);
    expect(lines).toEqual([
      'Bài thi 20 phút, tính từ lúc vào phòng.',
      `Bạn có ${max} lượt. ${RESUME}`,
      `Đây là lượt ${n}/${max} — bộ câu khác.`,
    ]);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Vào bước chuẩn bị' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(`/interview/${SESSION}/prepare`));
    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it('④ hết lượt (2/2, bỏ ngang, NotStarted): câu hết lượt + liên hệ nhà tuyển dụng, KHÔNG có nút nào', async () => {
    await renderPage({ interviewStatus: 'NotStarted', started: true, sessionId: 'sess-abandoned', timeLimitMinutes: 30, maxAttempts: 2, attemptsUsed: 2, lastAttemptAbandoned: true });

    expect(text('campaign-attempt-exhausted-text')).toBe('Bạn đã dùng hết 2/2 lượt làm bài của chiến dịch này.');
    expect(screen.getByTestId('campaign-attempt-exhausted')).toHaveTextContent('Liên hệ nhà tuyển dụng nếu buổi thi gặp sự cố.');
    expect(buttonTexts()).toEqual([]);
    expect(api.post).not.toHaveBeenCalled();
  });
});

describe('CandidateCampaignDetailPage — header + "Thông tin bài thi" không tự mâu thuẫn với ③/④', () => {
  const header = () => document.querySelector('header') as HTMLElement;
  const NOT_STARTED = VI['campaigns.my.interview.notStarted'];
  const STARTED_YES = VI['campaigns.detail.startedYes'];
  const STARTED_NO = VI['campaigns.detail.startedNo'];
  const abandoned = { interviewStatus: 'NotStarted', started: true, sessionId: 'sess-abandoned', timeLimitMinutes: 20, lastAttemptAbandoned: true };

  it.each([
    { name: '③ làm lại (1/3)', body: { ...abandoned, maxAttempts: 3, attemptsUsed: 1 }, block: 'campaign-attempt-retry' },
    { name: '④ hết lượt (1/1)', body: { ...abandoned, maxAttempts: 1, attemptsUsed: 1 }, block: 'campaign-attempt-exhausted' },
  ])('$name: KHÔNG có badge "Chưa bắt đầu" lẫn dòng "Bài thi đã/chưa bắt đầu"', async ({ body, block }) => {
    await renderPage(body);
    expect(screen.getByTestId(block)).toBeInTheDocument();
    expect(within(header()).getByText(VI['campaigns.detail.badge'])).toBeInTheDocument();
    expect(screen.queryByText(NOT_STARTED)).toBeNull();
    expect(screen.queryByText(STARTED_YES)).toBeNull();
    expect(screen.queryByText(STARTED_NO)).toBeNull();
  });

  it.each([
    { name: '① chưa làm', body: { interviewStatus: 'NotStarted', started: false, timeLimitMinutes: 45, maxAttempts: 3, attemptsUsed: 0, lastAttemptAbandoned: false }, badge: NOT_STARTED, line: STARTED_NO },
    { name: '② đang làm dở', body: { interviewStatus: 'InProgress', started: true, sessionId: 'sess-old', timeLimitMinutes: 30, maxAttempts: 1, attemptsUsed: 1, lastAttemptAbandoned: false }, badge: VI['campaigns.my.interview.inProgress'], line: STARTED_YES },
    { name: 'Backend cũ, chưa start', body: { interviewStatus: 'NotStarted', started: false }, badge: NOT_STARTED, line: STARTED_NO },
    { name: 'Backend cũ, NotStarted đã start', body: { interviewStatus: 'NotStarted', started: true, sessionId: 'sess-1' }, badge: NOT_STARTED, line: STARTED_YES },
  ])('$name: badge header + dòng bắt đầu GIỮ NGUYÊN', async ({ body, badge, line }) => {
    await renderPage(body);
    expect(within(header()).getByText(badge)).toBeInTheDocument();
    expect(screen.getByText(line)).toBeInTheDocument();
  });
});

const ATT1_TEST_IDS = [
  'campaign-rule-duration', 'campaign-rule-attempts', 'campaign-clock-rule', 'campaign-attempt-in-progress',
  'campaign-attempt-retry', 'campaign-attempt-exhausted',
];

describe('CandidateCampaignDetailPage — Backend cũ (field vắng) ⇒ y hệt hôm nay', () => {
  it.each([
    { name: 'chưa start', body: { interviewStatus: 'NotStarted', started: false }, buttons: ['Bắt đầu bài phỏng vấn'] },
    { name: 'NotStarted nhưng đã start (lượt bỏ ngang kiểu cũ)', body: { interviewStatus: 'NotStarted', started: true, sessionId: 'sess-1' }, buttons: ['Tiếp tục bài phỏng vấn'] },
    { name: 'InProgress', body: { interviewStatus: 'InProgress', started: true, sessionId: 'sess-1' }, buttons: ['Tiếp tục bài phỏng vấn'] },
    { name: 'Completed', body: { interviewStatus: 'Completed', started: true, sessionId: 'sess-1' }, buttons: [] },
  ])('$name ⇒ nút như trước ATT1, không có chữ lượt / thời lượng', async ({ body, buttons }) => {
    await renderPage(body);
    expect(buttonTexts()).toEqual(buttons);
    for (const id of ATT1_TEST_IDS) expect(screen.queryByTestId(id)).toBeNull();
  });

  it('hộp thoại Bắt đầu như hôm nay: không có dòng luật, nút "Bắt đầu" ⇒ start chạy được', async () => {
    await renderPage({ interviewStatus: 'NotStarted', started: false });
    await userEvent.click(screen.getByRole('button', { name: 'Bắt đầu bài phỏng vấn' }));
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).queryByTestId('start-confirm-rules')).toBeNull();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Bắt đầu' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(`/interview/${SESSION}/prepare`));
  });
});

describe('CandidateCampaignDetailPage — 409 ATTEMPT_LIMIT_REACHED [C8]', () => {
  const MY_CAMPAIGNS = { queryKey: ['campaign-candidate', 'my-campaigns'] };
  const MY_DETAIL = { queryKey: ['campaign-candidate', 'my-campaign', CMP] };
  const LIMIT = conflict({ code: 'ATTEMPT_LIMIT_REACHED', error: 'Attempt limit reached (server)', attemptsUsed: 1, maxAttempts: 1 });

  it('trong hộp thoại: câu riêng (không phải lời server) + invalidate danh sách và chi tiết ⇒ trang chuyển sang ④', async () => {
    const { invalidate } = await renderPage({ interviewStatus: 'NotStarted', started: false, timeLimitMinutes: 45, maxAttempts: 1, attemptsUsed: 0, lastAttemptAbandoned: false });
    api.post.mockImplementationOnce(async () => {
      detailBody = { ...detailBody, attemptsUsed: 1, lastAttemptAbandoned: true };
      throw LIMIT;
    });

    const { dialog } = await openDialogLines('Bắt đầu bài phỏng vấn');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Vào bước chuẩn bị' }));

    await waitFor(() => expect(within(dialog).getByRole('alert').textContent).toBe(VI['campaigns.detail.startAttemptLimitReached']));
    expect(invalidate).toHaveBeenCalledWith(MY_CAMPAIGNS);
    expect(invalidate).toHaveBeenCalledWith(MY_DETAIL);
    expect(await screen.findByTestId('campaign-attempt-exhausted-text')).toHaveTextContent('Bạn đã dùng hết 1/1 lượt làm bài của chiến dịch này.');
    expect(navigate).not.toHaveBeenCalled();
    expect(saveCampaignInterviewSession).not.toHaveBeenCalled();
  });

  it('sau ATTEMPT_LIMIT_REACHED: nút "Vào bước chuẩn bị" bị vô hiệu (không bấm lại để nhận thêm 409); Huỷ đóng ⇒ trang ④', async () => {
    await renderPage({ interviewStatus: 'NotStarted', started: false, timeLimitMinutes: 45, maxAttempts: 1, attemptsUsed: 0, lastAttemptAbandoned: false });
    api.post.mockImplementationOnce(async () => {
      detailBody = { ...detailBody, attemptsUsed: 1, lastAttemptAbandoned: true };
      throw LIMIT;
    });

    const { dialog } = await openDialogLines('Bắt đầu bài phỏng vấn');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Vào bước chuẩn bị' }));
    await waitFor(() => expect(within(dialog).getByRole('alert').textContent).toBe(VI['campaigns.detail.startAttemptLimitReached']));
    await screen.findByTestId('campaign-attempt-exhausted-text');

    // Nhãn còn "Vào bước chuẩn bị" (không phải "Đang bắt đầu…") ⇒ bị vô hiệu vì hết lượt, không phải vì đang gửi.
    expect(within(dialog).getByRole('button', { name: 'Vào bước chuẩn bị' })).toBeDisabled();
    expect(api.post).toHaveBeenCalledTimes(1);

    await userEvent.click(within(dialog).getByRole('button', { name: VI['campaigns.detail.startCancel'] }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(buttonTexts()).toEqual([]);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('đường "Tiếp tục" (không có hộp thoại): câu riêng hiện ngay dưới nút + làm mới trang', async () => {
    const { invalidate } = await renderPage({ interviewStatus: 'InProgress', started: true, sessionId: 'sess-old', timeLimitMinutes: 30, maxAttempts: 1, attemptsUsed: 1, lastAttemptAbandoned: false });
    api.post.mockRejectedValueOnce(LIMIT);

    await userEvent.click(screen.getByRole('button', { name: 'Tiếp tục bài phỏng vấn' }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe(VI['campaigns.detail.startAttemptLimitReached']));
    expect(invalidate).toHaveBeenCalledWith(MY_DETAIL);
    expect(invalidate).toHaveBeenCalledWith(MY_CAMPAIGNS);
  });

  it('409 mã khác ⇒ lời server như trước, KHÔNG invalidate', async () => {
    const { invalidate } = await renderPage({ interviewStatus: 'NotStarted', started: false, maxAttempts: 2, attemptsUsed: 0 });
    api.post.mockRejectedValueOnce(conflict({ code: 'OTHER', error: 'Phiên đang bận.' }));

    const { dialog } = await openDialogLines('Bắt đầu bài phỏng vấn');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Vào bước chuẩn bị' }));

    await waitFor(() => expect(within(dialog).getByRole('alert').textContent).toBe('Phiên đang bận.'));
    expect(invalidate).not.toHaveBeenCalled();
    // Lỗi khác hết lượt ⇒ vẫn cho thử lại.
    expect(within(dialog).getByRole('button', { name: 'Vào bước chuẩn bị' })).toBeEnabled();
  });
});
