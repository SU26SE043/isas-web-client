/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Khoá KHE NỐI giữa lifecycle giám sát và hai detector.
 *
 * `useCampaignProctoringLifecycle.test.tsx` chứng minh phép tính đúng; file này
 * chứng minh trang TRUYỀN THẲNG kết quả đó xuống detector. Thiếu file này thì
 * ai đó AND thêm `&& !currentViolation` hoặc `&& isFullscreen` tại chỗ gọi —
 * dựng lại nguyên hai lỗ AC1 vừa vá — mà không test nào đỏ.
 */

const CAMPAIGN_ID = '11111111-1111-1111-1111-111111111111';
const SESSION_ID = '22222222-2222-2222-2222-222222222222';

let storedSession: { campaignId: string; antiCheatEnabled: boolean } | null = null;
let fullscreenState = { isFullscreen: true, hasExited: false, fullscreenSupported: true };
let currentViolation: { kind: string } | null = null;

const antiCheatCalls: Array<{ enabled: boolean }> = [];
const faceCheckCalls: Array<{ enabled: boolean }> = [];

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../utils/campaignInterviewSession', () => ({
  readCampaignInterviewSession: () => storedSession,
}));

vi.mock('../hooks/useCampaignFullscreen', () => ({
  useCampaignFullscreen: () => ({
    ...fullscreenState,
    enterFullscreen: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock('../hooks/useCampaignViolationQueue', () => ({
  useCampaignViolationQueue: () => ({
    currentViolation,
    pendingCount: 0,
    enqueue: vi.fn(),
    resolveCurrent: vi.fn(),
  }),
}));

vi.mock('../hooks/useCampaignAntiCheat', () => ({
  useCampaignAntiCheat: (options: { enabled: boolean }) => {
    antiCheatCalls.push({ enabled: options.enabled });
    return { reportFullscreenExit: vi.fn() };
  },
}));

vi.mock('../hooks/useCampaignFaceCheck', () => ({
  useCampaignFaceCheck: (options: { enabled: boolean }) => {
    faceCheckCalls.push({ enabled: options.enabled });
    return { checkNow: vi.fn() };
  },
}));

vi.mock('../components/CampaignViolationDialog', () => ({
  CampaignViolationDialog: () => null,
}));

vi.mock('@/features/practice/components/B2cPracticeInterviewRoom', () => ({
  B2cPracticeInterviewRoom: (props: {
    onPhaseChange?: (phase: string) => void;
    onSessionSubmitting?: () => void;
  }) => (
    <div>
      <button type="button" onClick={() => props.onPhaseChange?.('countdown')}>phase-countdown</button>
      <button type="button" onClick={() => props.onPhaseChange?.('reading')}>phase-reading</button>
      <button type="button" onClick={() => props.onSessionSubmitting?.()}>submit-session</button>
    </div>
  ),
}));

// Import SAU khi khai vi.mock (vi.mock được hoist, nhưng giữ thứ tự cho dễ đọc).
const { CampaignInterviewPage } = await import('./CampaignInterviewPage');

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/candidate/campaigns/${CAMPAIGN_ID}/interview/${SESSION_ID}`]}>
      <Routes>
        <Route
          path="/candidate/campaigns/:campaignId/interview/:sessionId"
          element={<CampaignInterviewPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

/** `enabled` mà detector nhận ở lần render GẦN NHẤT. */
function lastEnabled() {
  return {
    antiCheat: antiCheatCalls.at(-1)?.enabled,
    faceCheck: faceCheckCalls.at(-1)?.enabled,
  };
}

beforeEach(() => {
  storedSession = { campaignId: CAMPAIGN_ID, antiCheatEnabled: true };
  fullscreenState = { isFullscreen: true, hasExited: false, fullscreenSupported: true };
  currentViolation = null;
  antiCheatCalls.length = 0;
  faceCheckCalls.length = 0;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CampaignInterviewPage — khe nối giám sát', () => {
  it('ĐANG khắc phục vi phạm thì VẪN giám sát', async () => {
    // Lỗ AC1 #1: điều kiện cũ có `&& !violations.currentViolation` ⇒ giám sát
    // tắt đúng lúc dialog vi phạm đang mở — cửa sổ dễ gian lận nhất cả buổi.
    currentViolation = { kind: 'camera_blocked' };
    renderPage();

    await userEvent.click(screen.getByText('phase-countdown'));

    expect(lastEnabled()).toEqual({ antiCheat: true, faceCheck: true });
  });

  it('THOÁT fullscreen thì VẪN giám sát', async () => {
    // Lỗ AC1 #2: điều kiện cũ có `&& fullscreen.isFullscreen` ⇒ ứng viên thoát
    // fullscreen là hết bị giám sát, trong khi thoát fullscreen chính là hành vi
    // cần ghi nhận.
    fullscreenState = { isFullscreen: false, hasExited: true, fullscreenSupported: true };
    renderPage();

    await userEvent.click(screen.getByText('phase-countdown'));

    expect(lastEnabled()).toEqual({ antiCheat: true, faceCheck: true });
  });

  it('RESUME giữa buổi (vào thẳng reading) bật giám sát', async () => {
    // Lỗ AC1 #3: điều kiện cũ đòi countdown chạy trước ⇒ buổi tải lại trang
    // không được giám sát.
    renderPage();
    expect(lastEnabled()).toEqual({ antiCheat: false, faceCheck: false });

    await userEvent.click(screen.getByText('phase-reading'));

    expect(lastEnabled()).toEqual({ antiCheat: true, faceCheck: true });
  });

  it('nộp bài xong thì thôi giám sát', async () => {
    renderPage();
    await userEvent.click(screen.getByText('phase-countdown'));
    expect(lastEnabled().antiCheat).toBe(true);

    await userEvent.click(screen.getByText('submit-session'));

    expect(lastEnabled()).toEqual({ antiCheat: false, faceCheck: false });
  });

  it('campaign KHÔNG bật chống gian lận thì không giám sát', async () => {
    storedSession = { campaignId: CAMPAIGN_ID, antiCheatEnabled: false };
    renderPage();

    await userEvent.click(screen.getByText('phase-countdown'));

    expect(lastEnabled()).toEqual({ antiCheat: false, faceCheck: false });
  });

  it('hai detector luôn nhận CÙNG một giá trị (không bỏ quên detector nào)', async () => {
    // Bật/tắt lệch nhau nghĩa là một nửa giám sát chết âm thầm.
    currentViolation = { kind: 'no_face' };
    fullscreenState = { isFullscreen: false, hasExited: true, fullscreenSupported: true };
    renderPage();

    await userEvent.click(screen.getByText('phase-reading'));
    await userEvent.click(screen.getByText('submit-session'));

    expect(antiCheatCalls.map((c) => c.enabled))
      .toEqual(faceCheckCalls.map((c) => c.enabled));
  });
});
