/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { FocusEventsButton } from './FocusEventsButton';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    // Khoá nút trả TEMPLATE thật để `{{n}}` được thay — mock trả key khiến mutation "đếm sai" XANH vì
    // replace() không có gì để thay.
    t: (key: string) => ({
      'practice.result.focusTracking.short.leave': 'Left session {{n}}',
      'practice.result.focusTracking.short.face': 'Face {{n}}',
      'practice.result.focusTracking.message': 'LEFT {{n}}{{placement}}.',
      'practice.result.focusTracking.short.camera': 'Camera covered {{n}}',
    } as Record<string, string>)[key] ?? key,
    language: 'en',
  }),
}));

function makeView(
  focusEvents: PracticeSessionResultViewModel['focusEvents'],
  over: Partial<PracticeSessionResultViewModel> = {},
): PracticeSessionResultViewModel {
  return { id: 's1', title: 'Practice', status: 'Scored', maxScore: 100, answeredCount: 1, skippedCount: 0, totalQuestions: 1, strengths: [], improvements: [], nextSteps: [], criteria: [], questions: [], hasResult: true, focusTrackingEnabled: true, focusEvents, focusLeavePlacement: 'spread', ...over };
}

afterEach(() => cleanup());

describe('FocusEventsButton', () => {
  it('renders the distinct null and empty states', () => {
    const { rerender } = render(<FocusEventsButton view={makeView(null)} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(<FocusEventsButton view={makeView([])} />);
    expect(screen.getByText('practice.result.focusTracking.none')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens details only after clicking; exactly 3 groups, no paste card', async () => {
    const user = userEvent.setup();
    render(<FocusEventsButton view={makeView([
      { signalType: 'tab_switch', count: 3, firstAt: '2026-01-01T09:01:00Z', lastAt: '2026-01-01T09:03:00Z' },
      { signalType: 'focus_lost', count: 1, firstAt: '2026-01-01T09:04:00Z', lastAt: '2026-01-01T09:04:00Z' },
    ])} />);
    // Nút đếm TỔNG lần mỗi nhóm (rời 3+1 = 4) chứ KHÔNG phải số loại sự kiện.
    const button = screen.getByRole('button', { name: 'Left session 4' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(button);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByTestId('focus-event-tab_switch')).toHaveTextContent('practice.result.focusTracking.type.tab_switch');
    expect(within(dialog).getByTestId('focus-event-tab_switch')).toHaveTextContent('×3');
    expect(within(dialog).getByTestId('focus-event-focus_lost')).toHaveTextContent('×1');
    // Đọc ĐÚNG ô metric, không đọc cả dialog: `toHaveTextContent('04')` trên dialog từng khớp vào giờ "16:04"
    // của dòng focus_lost ⇒ gộp/bỏ nhóm vẫn xanh. Regex neo đầu-cuối.
    expect(within(dialog).getByTestId('focus-metric-window')).toHaveTextContent(/^04$/);
    expect(within(dialog).getByTestId('focus-metric-face')).toHaveTextContent(/^00$/);
    expect(within(dialog).getByTestId('focus-metric-camera')).toHaveTextContent(/^00$/);
    // Ô "Dán nội dung" đã bỏ (2026-10-04): phòng trả lời bằng giọng, dán vô nghĩa.
    expect(within(dialog).queryByTestId('focus-metric-paste')).not.toBeInTheDocument();
    expect(dialog).toHaveTextContent('LEFT 4, practice.result.focusTracking.spread.');
    // Khoảng thời gian (khác giờ) → "Lần đầu … · Lần cuối …"; một mốc (cùng giờ) → "Lúc …", không lặp giờ hai lần.
    expect(within(dialog).getByTestId('focus-event-tab_switch')).toHaveTextContent(/practice\.result\.focusTracking\.firstAt \d{2}:\d{2} · practice\.result\.focusTracking\.lastAt \d{2}:\d{2}/);
    expect(within(dialog).getByTestId('focus-event-focus_lost')).toHaveTextContent(/^practice\.result\.focusTracking\.type\.focus_lostpractice\.result\.focusTracking\.at \d{2}:\d{2}×1$/);
    // Giờ phải là HH:mm đã format, không phải chuỗi ISO thô (regex không phụ thuộc múi giờ máy chạy test).
    expect(dialog.textContent).not.toContain('2026-01-01T');
  });

  it('dòng chi tiết theo thứ tự ô số (rời buổi → khuôn mặt → che cam), không theo thứ tự server trả', async () => {
    const user = userEvent.setup();
    render(<FocusEventsButton view={makeView([
      { signalType: 'focus_lost', count: 1, firstAt: '2026-01-01T09:01:00Z', lastAt: '2026-01-01T09:01:00Z' },
      { signalType: 'no_face', count: 2, firstAt: '2026-01-01T09:02:00Z', lastAt: '2026-01-01T09:03:00Z' },
      { signalType: 'tab_switch', count: 2, firstAt: '2026-01-01T09:04:00Z', lastAt: '2026-01-01T09:05:00Z' },
    ])} />);
    await user.click(screen.getByRole('button'));
    const dialog = await screen.findByRole('dialog');
    const order = within(dialog).getAllByTestId(/^focus-event-/).map((row) => row.dataset.testid);
    expect(order).toEqual(['focus-event-tab_switch', 'focus-event-focus_lost', 'focus-event-no_face']);
  });

  it('chỉ có khung hình → nhãn chỉ nhóm khuôn mặt, KHÔNG có "Left session 0"', async () => {
    const user = userEvent.setup();
    render(<FocusEventsButton view={makeView([
      { signalType: 'no_face', count: 7, firstAt: '2026-01-01T09:01:00Z', lastAt: '2026-01-01T09:20:00Z' },
    ], { focusLeavePlacement: undefined })} />);
    const button = screen.getByRole('button', { name: 'Face 7' });
    expect(screen.queryByRole('button', { name: /Left session/ })).not.toBeInTheDocument();
    await user.click(button);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByTestId('focus-metric-face')).toHaveTextContent(/^07$/);
    expect(within(dialog).getByTestId('focus-metric-window')).toHaveTextContent(/^00$/);
    expect(dialog).toHaveTextContent('practice.result.focusTracking.frameOnly');
    expect(dialog).not.toHaveTextContent(/LEFT/);
  });

  it('có đủ ba nhóm (rời buổi · 2 khuôn mặt · che cam) → nhãn nút nêu CẢ BA, che cam đếm riêng', async () => {
    // Đúng ca user báo 2026-10-03: trong buổi thấy đủ 3 thông báo, xong buổi chỉ thấy "Rời khỏi buổi · 1".
    const user = userEvent.setup();
    render(<FocusEventsButton view={makeView([
      { signalType: 'focus_lost', count: 1, firstAt: '2026-01-01T09:01:00Z', lastAt: '2026-01-01T09:01:00Z' },
      { signalType: 'multiple_faces', count: 2, firstAt: '2026-01-01T09:05:00Z', lastAt: '2026-01-01T09:06:00Z' },
      { signalType: 'camera_blocked', count: 3, firstAt: '2026-01-01T09:08:00Z', lastAt: '2026-01-01T09:09:00Z' },
    ])} />);
    await user.click(screen.getByRole('button', { name: 'Left session 1 · Face 2 · Camera covered 3' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByTestId('focus-metric-window')).toHaveTextContent(/^01$/);
    expect(within(dialog).getByTestId('focus-metric-face')).toHaveTextContent(/^02$/);
    expect(within(dialog).getByTestId('focus-metric-camera')).toHaveTextContent(/^03$/);
    expect(within(dialog).getByTestId('focus-event-camera_blocked')).toHaveTextContent('×3');
  });
});
