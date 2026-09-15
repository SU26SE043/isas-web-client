/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { SessionResultHeader } from './SessionResultHeader';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'en' }) }));

const base: PracticeSessionResultViewModel = { id: 's1', title: 'Practice', status: 'Scored', maxScore: 100, answeredCount: 1, skippedCount: 0, totalQuestions: 1, strengths: [], improvements: [], nextSteps: [], criteria: [], questions: [], hasResult: true, focusTrackingEnabled: true, focusEvents: null };
function renderHeader(focusEvents: PracticeSessionResultViewModel['focusEvents']) { return render(<MemoryRouter><SessionResultHeader view={{ ...base, focusEvents, focusLeaveCount: 3 }} /></MemoryRouter>); }

afterEach(() => cleanup());

describe('SessionResultHeader focus tracking', () => {
  it('wires the button and dialog for recorded events', async () => {
    const user = userEvent.setup();
    renderHeader([{ signalType: 'tab_switch', count: 3, firstAt: '2026-01-01T09:00:00Z', lastAt: '2026-01-01T09:01:00Z' }]);
    await user.click(screen.getByRole('button', { name: /practice\.result\.focusTracking\.button/ }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('practice.result.focusTracking.type.tab_switch');
  });
  it('uses the empty badge without a button and keeps null silent', () => {
    renderHeader([]);
    expect(screen.getByText('practice.result.focusTracking.none')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    cleanup();
    renderHeader(null);
    expect(screen.queryByText('practice.result.focusTracking.none')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
