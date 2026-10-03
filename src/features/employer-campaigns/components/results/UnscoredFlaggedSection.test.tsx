/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignUnscoredFlaggedResult } from '../../types/campaign.api.types';
import { UnscoredFlaggedSection } from './UnscoredFlaggedSection';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'en' }) }));
afterEach(cleanup);

const K = 'employer.campaigns.results.unscoredFlagged';

function item(overrides: Partial<CampaignUnscoredFlaggedResult> = {}): CampaignUnscoredFlaggedResult {
  return {
    candidateId: 'candidate-1', sessionId: 'session-guid-should-not-display', fullName: 'Candidate One',
    email: 'candidate@example.com', flags: [], ...overrides,
  };
}

function layout(container: HTMLElement, name: 'table' | 'cards') {
  return within(container.querySelector(`[data-layout="${name}"]`) as HTMLElement);
}

describe('UnscoredFlaggedSection', () => {
  it('renders every requested status and note translation without exposing the session GUID', () => {
    const { container } = render(<UnscoredFlaggedSection items={[
      item({ interviewStatus: 'Abandoned', abandonReason: 'generation_failed', interviewStartedAt: '2026-09-03T09:07:00Z', flags: [{ type: 'focus_lost', count: 1, source: 'Client', note: 'Candidate lost focus from the interview window.', firstAt: null, lastAt: null }] }),
      item({ candidateId: 'c2', sessionId: 's2', interviewStatus: 'Abandoned', abandonReason: 'no_scored_answer' }),
      item({ candidateId: 'c3', sessionId: 's3', interviewStatus: 'Abandoned', abandonReason: 'expired_no_answer' }),
      item({ candidateId: 'c4', sessionId: 's4', interviewStatus: 'Abandoned', abandonReason: 'other' }),
      item({ candidateId: 'c5', sessionId: 's5', interviewStatus: 'InProgress' }),
      item({ candidateId: 'c6', sessionId: 's6', interviewStatus: 'Completed', isLatestAttempt: false }),
      item({ candidateId: 'c7', sessionId: 's7' }),
    ]} />);

    expect(screen.getByText(`${K}.interviewStatus`)).toBeInTheDocument();
    for (const view of ['table', 'cards'] as const) {
      const region = layout(container, view);
      for (const key of ['generationFailed', 'notCandidateFault', 'noScoredAnswer', 'expiredNoAnswer', 'abandoned', 'inProgress', 'previousAttempt', 'noScore']) {
        expect(region.getAllByText(`${K}.${key}`)).toHaveLength(1);
      }
      expect(region.getByText('employer.campaigns.results.flagNotes.focusLost')).toBeInTheDocument();
    }
    expect(document.body).not.toHaveTextContent('session-guid-should-not-display');
    const desktopBadge = layout(container, 'table').getByText(`${K}.generationFailed`);
    expect(desktopBadge.closest('td')).toHaveAttribute('title', 'session-guid-should-not-display');
  });

  // Sau một lượt làm lại, backend vẫn trả giờ bắt đầu của lượt 1 ⇒ hiện ra là HR đọc sai giờ.
  it('does not show a start time even when the backend sends one', () => {
    const { container } = render(<UnscoredFlaggedSection items={[
      item({ interviewStatus: 'Abandoned', abandonReason: 'no_scored_answer', interviewStartedAt: '2026-09-03T09:07:00Z' }),
    ]} />);
    expect(container).not.toHaveTextContent(/startedAt|\d{2}:\d{2} \d{2}\/\d{2}/);
  });

  it('marks a system fault in warning colour, not as the candidate\'s fault, and lets long labels wrap', () => {
    const { container } = render(<UnscoredFlaggedSection items={[
      item({ interviewStatus: 'Abandoned', abandonReason: 'generation_failed' }),
      item({ candidateId: 'c2', sessionId: 's2', interviewStatus: 'Abandoned', abandonReason: 'no_scored_answer' }),
    ]} />);
    const table = layout(container, 'table');
    const systemFault = table.getByText(`${K}.generationFailed`);
    expect(systemFault.className).toMatch(/text-warning/);
    expect(systemFault.className).not.toMatch(/text-destructive/);
    // Badge gốc là h-5 + whitespace-nowrap + overflow-hidden ⇒ nhãn dài bị cắt cụt.
    const longLabel = table.getByText(`${K}.noScoredAnswer`);
    expect(longLabel.className).toMatch(/whitespace-normal/);
    expect(longLabel.className).toMatch(/h-auto/);
  });

  it('shows the same first/last time on mobile cards as in the desktop table', () => {
    const { container } = render(<UnscoredFlaggedSection items={[
      item({ interviewStatus: 'Abandoned', flags: [{ type: 'multiple_faces', count: 3, source: 'Client', note: null, firstAt: '2026-10-03T04:12:52Z', lastAt: '2026-10-03T04:13:14Z' }] }),
    ]} />);
    for (const view of ['table', 'cards'] as const) {
      const region = layout(container, view);
      expect(region.getByText(/employer\.campaigns\.results\.proctoring\.firstAt .+ · employer\.campaigns\.results\.proctoring\.lastAt .+/)).toBeInTheDocument();
    }
  });

  it('uses the legacy no-score label when the new fields are missing', () => {
    const { container } = render(<UnscoredFlaggedSection items={[item()]} />);
    for (const view of ['table', 'cards'] as const) {
      expect(layout(container, view).getAllByText(`${K}.noScore`)).toHaveLength(1);
    }
  });
});
