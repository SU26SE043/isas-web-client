/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { FocusEventsButton } from './FocusEventsButton';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    // Khoá nút trả TEMPLATE thật để `{{n}}` được thay — mock trả key khiến mutation "đếm sai" (dùng
    // focusEvents.length thay focusLeaveCount) XANH vì replace() không có gì để thay.
    t: (key: string) => (key === 'practice.result.focusTracking.button' ? 'Left the session · {{n}}' : key),
    language: 'en',
  }),
}));

function makeView(focusEvents: PracticeSessionResultViewModel['focusEvents']): PracticeSessionResultViewModel {
  return { id: 's1', title: 'Practice', status: 'Scored', maxScore: 100, answeredCount: 1, skippedCount: 0, totalQuestions: 1, strengths: [], improvements: [], nextSteps: [], criteria: [], questions: [], hasResult: true, focusTrackingEnabled: true, focusEvents, focusLeaveCount: 6, focusLeavePlacement: 'spread' };
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

  it('opens details only after clicking and keeps groups separate', async () => {
    const user = userEvent.setup();
    render(<FocusEventsButton view={makeView([
      { signalType: 'tab_switch', count: 3, firstAt: '2026-01-01T09:01:00Z', lastAt: '2026-01-01T09:03:00Z' },
      { signalType: 'focus_lost', count: 1, firstAt: '2026-01-01T09:04:00Z', lastAt: '2026-01-01T09:04:00Z' },
      { signalType: 'paste', count: 2, firstAt: '2026-01-01T09:05:00Z', lastAt: '2026-01-01T09:06:00Z' },
    ])} />);
    // Nút đếm focusLeaveCount (6) chứ KHÔNG phải số loại sự kiện (3) — fixture cố ý khác nhau.
    const button = screen.getByRole('button', { name: 'Left the session · 6' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(button);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('practice.result.focusTracking.type.tab_switch: 3');
    expect(dialog).toHaveTextContent('practice.result.focusTracking.type.focus_lost: 1');
    expect(dialog).toHaveTextContent('practice.result.focusTracking.type.paste: 2');
    // Đọc ĐÚNG ô metric, không đọc cả dialog: `toHaveTextContent('04')` trên dialog từng khớp vào giờ "16:04"
    // của dòng focus_lost ⇒ gộp/bỏ nhóm (ra 06/03) vẫn xanh. Regex neo đầu-cuối nên 06 ≠ 04.
    expect(within(dialog).getByTestId('focus-metric-window')).toHaveTextContent(/^04$/);
    expect(within(dialog).getByTestId('focus-metric-paste')).toHaveTextContent(/^02$/);
    expect(dialog).toHaveTextContent('practice.result.focusTracking.firstAt');
    expect(dialog).toHaveTextContent('practice.result.focusTracking.lastAt');
    // Giờ phải là HH:mm đã format, không phải chuỗi ISO thô (regex không phụ thuộc múi giờ máy chạy test).
    expect(dialog.textContent).toMatch(/\d{2}:\d{2}/);
    expect(dialog.textContent).not.toContain('2026-01-01T');
  });
});
