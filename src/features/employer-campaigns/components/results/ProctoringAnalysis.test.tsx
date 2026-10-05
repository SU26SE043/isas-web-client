// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProctoringAnalysis } from './ProctoringAnalysis';
import type { CampaignResultFlag, CampaignResultFlagEvent } from '../../types/campaign.api.types';

// t trả KHUÔN cho các khoá có số để test đọc được con số thật (khoá khác trả nguyên khoá).
const TEMPLATES: Record<string, string> = {
  'employer.campaigns.results.proctoring.records': 'records={{count}}',
  'employer.campaigns.results.proctoring.incidents': 'incidents={{count}}',
  'employer.campaigns.results.proctoring.checks': 'checks={{count}}',
  'employer.campaigns.results.proctoring.summary': 'summary {{incidents}}/{{records}}',
  'employer.campaigns.results.proctoring.span': 'span={{duration}}',
};
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => TEMPLATES[key] ?? key, language: 'vi' }),
}));

afterEach(() => cleanup());

const f = (type: string, count: number, extra: Partial<CampaignResultFlag> = {}): CampaignResultFlag => (
  { type, count, source: 'Client', note: null, firstAt: null, lastAt: null, ...extra }
);
const ev = (signalType: string, detectedAt: string, note: string | null = null): CampaignResultFlagEvent => (
  { signalType, detectedAt, note }
);

// Buổi THẬT trên prod 05/10 (`5902855c`, "tuyển dụng Bussiness analysyst quý 01"): 13 dòng cờ.
const REAL_EVENTS: CampaignResultFlagEvent[] = [
  ...['08:39:07', '08:39:19', '08:39:31', '08:39:43', '08:39:57', '08:40:09', '08:40:21', '08:40:33']
    .map((time) => ev('no_face', `2026-10-05T01:${time.slice(3)}Z`)),
  ev('tab_switch', '2026-10-05T01:39:46Z', 'Candidate switched away from the interview tab.'),
  ev('tab_switch', '2026-10-05T01:41:06Z', 'Candidate switched away from the interview tab.'),
  ev('focus_lost', '2026-10-05T01:41:27Z', 'Candidate lost focus from the interview window.'),
  ev('tab_switch', '2026-10-05T01:41:27Z', 'Candidate switched away from the interview tab.'),
  ev('tab_switch', '2026-10-05T01:42:32Z', 'Candidate left the interview window using Alt+Tab or window switching.'),
];
const REAL_FLAGS = [f('no_face', 8), f('tab_switch', 4), f('focus_lost', 1)];

const tier = (name: string) => document.querySelector(`[data-tier="${name}"]`) as HTMLElement;

describe('ProctoringAnalysis — gỡ ô chết', () => {
  it('không còn ô "Vi phạm thời gian" (đếm loại cờ backend không bao giờ ghi) lẫn ô "Vi phạm cửa sổ"', () => {
    const { container } = render(<ProctoringAnalysis flags={REAL_FLAGS} events={REAL_EVENTS} timelineStatus="ready" />);
    for (const key of ['timeViolations', 'windowViolations', 'proctoring.minutes']) {
      expect(container).not.toHaveTextContent(key);
    }
  });
});

describe('ProctoringAnalysis — có dòng thời gian: đếm theo SỰ VIỆC', () => {
  it('buổi thật 5902855c: 13 lượt ghi nhận = 6 sự việc; vắng mặt ~1 phút 26 giây là MỘT lần (8 lượt kiểm)', () => {
    render(<ProctoringAnalysis flags={REAL_FLAGS} events={REAL_EVENTS} timelineStatus="ready" />);
    expect(screen.getByTestId('proctoring-summary')).toHaveTextContent('summary 6/13');

    const behavior = tier('behavior');
    const noFace = behavior.querySelector('[data-flag-type="noface"]') as HTMLElement;
    expect(noFace).toHaveTextContent('incidents=1');
    expect(noFace).toHaveTextContent('span=1 phút 26 giây (checks=8)');
    expect(behavior.querySelector('[data-flag-type="tabswitch"]')).toHaveTextContent('incidents=4');
    expect(behavior.querySelector('[data-flag-type="focuslost"]')).toHaveTextContent('incidents=1');
    // Tầng trống vẫn hiện "Không có" — HR cần biết tầng danh tính đã được xét và sạch.
    expect(tier('identity')).toHaveTextContent('employer.campaigns.results.proctoring.tier.empty');
    expect(tier('environment')).toHaveTextContent('employer.campaigns.results.proctoring.tier.empty');
  });

  it('dòng thời gian: 6 dòng theo thứ tự, mỗi dòng giữ ghi chú RIÊNG (Alt+Tab không bị nuốt thành "chuyển tab")', () => {
    render(<ProctoringAnalysis flags={REAL_FLAGS} events={REAL_EVENTS} timelineStatus="ready" />);
    const rows = within(screen.getByRole('list', { name: 'employer.campaigns.results.proctoring.timeline.title' }))
      .getAllByRole('listitem');
    expect(rows.map((row) => row.getAttribute('data-flag-type')))
      .toEqual(['noface', 'tabswitch', 'tabswitch', 'focuslost', 'tabswitch', 'tabswitch']);
    expect(rows[0]).toHaveTextContent('checks=8');
    expect(rows[5]).toHaveTextContent('employer.campaigns.results.flagNotes.windowSwitch');
    expect(rows[5]).not.toHaveTextContent('employer.campaigns.results.flagNotes.tabSwitch');
  });

  it('một lượt kiểm lẻ (dễ là nhiễu) hiện khác một chuỗi lượt kiểm liên tiếp', () => {
    render(<ProctoringAnalysis flags={[f('face_mismatch', 1)]} events={[ev('face_mismatch', '2026-10-05T08:51:00Z')]} timelineStatus="ready" />);
    const mismatch = tier('identity').querySelector('[data-flag-type="facemismatch"]') as HTMLElement;
    expect(mismatch).toHaveTextContent('incidents=1');
    expect(mismatch).toHaveTextContent('employer.campaigns.results.proctoring.singleCheck');
  });

  it('cờ do server suy ra: bỏ marker [gap#…] khỏi ghi chú, nói rõ mốc giờ là lúc quét, giữ nhãn "Hệ thống ghi nhận"', () => {
    const note = 'Khoảng trống 300s giữa 2 lượt kiểm mặt [gap#638950000000000000]';
    render(
      <ProctoringAnalysis
        flags={[f('monitoring_gap', 1, { source: 'Server', note })]}
        events={[ev('monitoring_gap', '2026-10-05T08:00:00Z', note)]}
        timelineStatus="ready"
      />,
    );
    expect(screen.queryByText(/gap#/)).not.toBeInTheDocument();
    expect(screen.getByText('Khoảng trống 300s giữa 2 lượt kiểm mặt')).toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.results.proctoring.timeline.serverRecorded')).toBeInTheDocument();
    expect(tier('environment')).toHaveTextContent('employer.campaigns.results.flags.recordedBySystem');
  });

  it('sự kiện trải qua hai ngày ⇒ có tiêu đề ngày; trong cùng một ngày ⇒ không', () => {
    const twoDays = [ev('tab_switch', '2026-10-04T12:00:00Z'), ev('tab_switch', '2026-10-05T13:00:00Z')];
    const { unmount } = render(<ProctoringAnalysis flags={[f('tab_switch', 2)]} events={twoDays} timelineStatus="ready" />);
    const day = (iso: string) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .format(new Date(iso));
    expect(screen.getByText(day('2026-10-04T12:00:00Z'))).toBeInTheDocument();
    expect(screen.getByText(day('2026-10-05T13:00:00Z'))).toBeInTheDocument();
    unmount();

    const sameDay = [ev('tab_switch', '2026-10-05T12:00:00Z'), ev('tab_switch', '2026-10-05T12:00:30Z')];
    render(<ProctoringAnalysis flags={[f('tab_switch', 2)]} events={sameDay} timelineStatus="ready" />);
    expect(screen.queryByText(day('2026-10-05T12:00:00Z'))).not.toBeInTheDocument();
  });
});

describe('ProctoringAnalysis — chưa có dòng thời gian: dự phòng bằng dữ liệu gộp, KHÔNG bao giờ trắng', () => {
  it.each([
    ['loading', 'employer.campaigns.results.proctoring.timeline.loading'],
    ['error', 'employer.campaigns.results.proctoring.timeline.error'],
  ] as const)('%s ⇒ danh sách gộp theo LƯỢT GHI NHẬN + dòng trạng thái', (status, message) => {
    render(<ProctoringAnalysis flags={REAL_FLAGS} timelineStatus={status} />);
    expect(screen.getByRole('status')).toHaveTextContent(message);
    expect(screen.getByText('employer.campaigns.results.flags.type.no_face · records=8')).toBeInTheDocument();
    expect(screen.queryByTestId('proctoring-summary')).not.toBeInTheDocument();
  });

  it('tải xong mà dòng thời gian RỖNG trong khi vẫn có cờ ⇒ không nói "không có vi phạm", dùng dữ liệu gộp', () => {
    render(<ProctoringAnalysis flags={REAL_FLAGS} events={[]} timelineStatus="ready" />);
    expect(screen.queryByText('employer.campaigns.results.proctoring.none')).not.toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.results.flags.type.tab_switch · records=4')).toBeInTheDocument();
  });

  it('loại cờ lạ (backend thêm sau) vẫn hiện bằng khoá thô — không nuốt, ở cả hai chế độ', () => {
    const { unmount } = render(<ProctoringAnalysis flags={[f('weird_new_signal', 2)]} timelineStatus="error" />);
    expect(screen.getByText('weird_new_signal · records=2')).toBeInTheDocument();
    unmount();
    render(
      <ProctoringAnalysis flags={[f('weird_new_signal', 1)]} events={[ev('weird_new_signal', '2026-10-05T08:00:00Z')]} timelineStatus="ready" />,
    );
    expect(tier('environment').querySelector('[data-flag-type="weirdnewsignal"]')).toHaveTextContent('weird_new_signal');
  });

  it('dịch note anti-cheat đã biết và biến thể đang khắc phục thiết bị', () => {
    render(<ProctoringAnalysis flags={[f('focus_lost', 1, { note: 'Candidate lost focus from the interview window. (đang khắc phục thiết bị)' })]} timelineStatus="error" />);
    expect(screen.getByText('employer.campaigns.results.flagNotes.focusLost employer.campaigns.results.flagNotes.recoverySuffix')).toBeInTheDocument();
  });
});
