/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Khoá đường RESUME của chiến dịch B2B.
 *
 * Bộ chuyển hướng B2B/B2C nhận ra phiên campaign bằng marker trong `sessionStorage`, mà
 * `sessionStorage` MẤT khi đóng tab. Trước bản vá, "Tiếp tục" chỉ là một `<Link>` nên resume ở
 * tab mới không có marker ⇒ ứng viên rơi vào phòng luyện tập B2C: không face-verify, và
 * `createCampaignFlag` không tồn tại ở đó ⇒ không cờ nào tới HR, không lỗi, không cảnh báo.
 */

const CAMPAIGN_ID = '11111111-1111-1111-1111-111111111111';
const SESSION_ID = '22222222-2222-2222-2222-222222222222';

const startCampaignInterview = vi.fn();
const saveCampaignInterviewSession = vi.fn();
const navigate = vi.fn();
let detail: Record<string, unknown>;

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => key }),
}));

vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) =>
    selector({ user: { id: 'u1', role: 'Candidate' } }),
}));

vi.mock('@/features/auth/types/auth.types', () => ({
  UserRole: { CANDIDATE: 'Candidate' },
}));

vi.mock('../hooks/useMyCampaignDetail', () => ({
  useMyCampaignDetail: () => ({
    data: detail,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
  }),
  myCampaignDetailQueryKey: (id: string) => ['campaign-candidate', 'my-campaign', id],
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn().mockResolvedValue(undefined) }),
}));

vi.mock('../services/campaignCandidate.service', () => ({
  CampaignCandidateError: class extends Error {},
  campaignCandidateService: {
    startCampaignInterview: (...args: unknown[]) => startCampaignInterview(...args),
  },
}));

vi.mock('../utils/campaignInterviewSession', () => ({
  saveCampaignInterviewSession: (...args: unknown[]) => saveCampaignInterviewSession(...args),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const { CandidateCampaignDetailPage } = await import('./CandidateCampaignDetailPage');

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/candidate/campaigns/${CAMPAIGN_ID}`]}>
      <Routes>
        <Route path="/candidate/campaigns/:id" element={<CandidateCampaignDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  detail = {
    campaignId: CAMPAIGN_ID,
    title: 'Chiến dịch',
    started: true,               // đã bắt đầu ⇒ nút hiện là "Tiếp tục"
    sessionId: SESSION_ID,
    interviewStatus: 'InProgress',
    deadline: null,
    criteria: [],
  };
  startCampaignInterview.mockReset();
  startCampaignInterview.mockResolvedValue({
    campaignId: CAMPAIGN_ID,
    sessionId: SESSION_ID,
    antiCheatEnabled: true,
    faceEnrollRequired: true,
    adaptiveEnabled: false,
    deadlineAt: null,
    questions: [],
  });
  saveCampaignInterviewSession.mockReset();
  navigate.mockReset();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CandidateCampaignDetailPage — resume giữ được giám sát', () => {
  it('bấm "Tiếp tục" GHI LẠI marker chiến dịch trước khi vào phòng', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /campaigns.detail.continue/ }));

    expect(startCampaignInterview).toHaveBeenCalledWith(CAMPAIGN_ID);
    expect(saveCampaignInterviewSession).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: SESSION_ID, antiCheatEnabled: true }),
    );
  });

  it('"Tiếp tục" KHÔNG còn là link trần — link trần bỏ qua bước ghi marker', () => {
    renderPage();

    const control = screen.getByRole('button', { name: /campaigns.detail.continue/ });
    expect(control.tagName).toBe('BUTTON');
    expect(screen.queryByRole('link', { name: /campaigns.detail.continue/ })).toBeNull();
  });

  it('vào phòng bằng sessionId server trả về, không phải sessionId đang hiển thị', async () => {
    // Phiên hiển thị có thể đã cũ (ứng viên mở tab từ hôm trước); nguồn đúng là phản hồi start.
    startCampaignInterview.mockResolvedValue({
      campaignId: CAMPAIGN_ID,
      sessionId: '33333333-3333-3333-3333-333333333333',
      antiCheatEnabled: true,
      faceEnrollRequired: false,
      adaptiveEnabled: false,
      deadlineAt: null,
      questions: [],
    });
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /campaigns.detail.continue/ }));

    expect(navigate).toHaveBeenCalledWith('/interview/33333333-3333-3333-3333-333333333333/prepare');
  });
});
