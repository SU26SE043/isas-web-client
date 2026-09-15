/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { FocusEventsButton } from './FocusEventsButton';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'en' }) }));

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
    const button = screen.getByRole('button', { name: 'practice.result.focusTracking.button' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(button);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('practice.result.focusTracking.type.tab_switch: 3');
    expect(dialog).toHaveTextContent('practice.result.focusTracking.type.focus_lost: 1');
    expect(dialog).toHaveTextContent('practice.result.focusTracking.type.paste: 2');
    expect(dialog).toHaveTextContent('04');
    expect(dialog).toHaveTextContent('02');
    expect(dialog).toHaveTextContent('practice.result.focusTracking.firstAt');
    expect(dialog).toHaveTextContent('practice.result.focusTracking.lastAt');
  });
});
