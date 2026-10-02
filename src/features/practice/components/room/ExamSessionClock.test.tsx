/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExamClockReminder, ExamSessionClock } from './ExamSessionClock';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

afterEach(cleanup);

function clock() {
  return screen.getByTestId('exam-session-clock');
}
function value() {
  return screen.getByTestId('exam-session-clock-value');
}

describe('ExamSessionClock', () => {
  it('hiện "Thời gian bài thi mm:ss (theo giờ hệ thống)"', () => {
    render(<ExamSessionClock remainingSeconds={24 * 60 + 13} />);
    expect(value()).toHaveTextContent('24:13');
    expect(screen.getByText('practice.examClock.label')).toBeInTheDocument();
    expect(screen.getByText('practice.examClock.serverTime')).toBeInTheDocument();
  });

  it.each([
    [301, 'normal', 'text-foreground'],
    [300, 'warning', 'text-warning'],
    [61, 'warning', 'text-warning'],
    [60, 'critical', 'text-error'],
    [0, 'critical', 'text-error'],
  ])('%is ⇒ %s (%s)', (seconds, severity, textClass) => {
    render(<ExamSessionClock remainingSeconds={seconds} />);
    expect(clock()).toHaveAttribute('data-severity', severity);
    expect(value()).toHaveClass(textClass);
  });

  it('số chạy từng giây KHÔNG live; vùng status chỉ có chữ ở mốc 5 phút / 1 phút / 0', () => {
    const { rerender } = render(<ExamSessionClock remainingSeconds={301} />);
    expect(value()).toHaveAttribute('aria-live', 'off');
    const status = screen.getByRole('status');
    // So khớp TUYỆT ĐỐI: chữ của vùng status không được đổi theo từng giây trong cùng một mốc —
    // đổi là trình đọc màn hình đọc lại mỗi giây.
    expect(status.textContent).toBe('');

    rerender(<ExamSessionClock remainingSeconds={300} />);
    expect(status.textContent).toBe('practice.examClock.announce.fiveMinutes');
    rerender(<ExamSessionClock remainingSeconds={200} />);
    expect(status.textContent).toBe('practice.examClock.announce.fiveMinutes');
    rerender(<ExamSessionClock remainingSeconds={61} />);
    expect(status.textContent).toBe('practice.examClock.announce.fiveMinutes');

    rerender(<ExamSessionClock remainingSeconds={60} />);
    expect(status.textContent).toBe('practice.examClock.announce.oneMinute');
    rerender(<ExamSessionClock remainingSeconds={35} />);
    expect(status.textContent).toBe('practice.examClock.announce.oneMinute');
    rerender(<ExamSessionClock remainingSeconds={1} />);
    expect(status.textContent).toBe('practice.examClock.announce.oneMinute');

    rerender(<ExamSessionClock remainingSeconds={0} />);
    expect(status.textContent).toBe('practice.examClock.announce.timeUp');
  });
});

describe('ExamClockReminder', () => {
  const reminder = () => screen.getByTestId('exam-clock-reminder');

  it('chỉ hiện khi 0 < còn lại ≤ 5 phút', () => {
    const { rerender } = render(<ExamClockReminder remainingSeconds={301} />);
    expect(screen.queryByTestId('exam-clock-reminder')).not.toBeInTheDocument();

    rerender(<ExamClockReminder remainingSeconds={300} />);
    expect(reminder()).toHaveClass('text-warning');

    rerender(<ExamClockReminder remainingSeconds={60} />);
    expect(reminder()).toHaveClass('text-error');

    rerender(<ExamClockReminder remainingSeconds={0} />);
    expect(screen.queryByTestId('exam-clock-reminder')).not.toBeInTheDocument();
  });

  it('chữ đúng mức: ≤ 5 phút ⇒ "Còn 5 phút"; ≤ 1 phút ⇒ "Còn dưới 1 phút" (không còn ghi 5 phút lúc 00:35)', () => {
    const { rerender } = render(<ExamClockReminder remainingSeconds={300} />);
    expect(reminder().textContent).toBe('practice.examClock.reminder');
    rerender(<ExamClockReminder remainingSeconds={61} />);
    expect(reminder().textContent).toBe('practice.examClock.reminder');

    rerender(<ExamClockReminder remainingSeconds={60} />);
    expect(reminder().textContent).toBe('practice.examClock.reminderCritical');
    rerender(<ExamClockReminder remainingSeconds={35} />);
    expect(reminder().textContent).toBe('practice.examClock.reminderCritical');
  });
});
