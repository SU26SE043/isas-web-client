/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignUnscoredFlaggedResult } from '../../types/campaign.api.types';
import { UnscoredFlaggedSection } from './UnscoredFlaggedSection';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'en' }) }));
afterEach(cleanup);

function item(overrides: Partial<CampaignUnscoredFlaggedResult> = {}): CampaignUnscoredFlaggedResult {
  return {
    candidateId: 'candidate-1', sessionId: 'session-guid-should-not-display', fullName: 'Candidate One',
    email: 'candidate@example.com', flags: [], ...overrides,
  };
}

describe('UnscoredFlaggedSection', () => {
  it('renders every requested status, start time, and note translation without exposing the session GUID', () => {
    render(<UnscoredFlaggedSection items={[
      item({ interviewStatus: 'Abandoned', abandonReason: 'generation_failed', interviewStartedAt: '2026-09-03T09:07:00Z', flags: [{ type: 'focus_lost', count: 1, source: 'Client', note: 'Candidate lost focus from the interview window.', firstAt: null, lastAt: null }] }),
      item({ candidateId: 'c2', sessionId: 's2', interviewStatus: 'Abandoned', abandonReason: 'no_scored_answer' }),
      item({ candidateId: 'c3', sessionId: 's3', interviewStatus: 'Abandoned', abandonReason: 'expired_no_answer' }),
      item({ candidateId: 'c4', sessionId: 's4', interviewStatus: 'Abandoned', abandonReason: 'other' }),
      item({ candidateId: 'c5', sessionId: 's5', interviewStatus: 'InProgress' }),
      item({ candidateId: 'c6', sessionId: 's6', interviewStatus: 'Completed', isLatestAttempt: false }),
      item({ candidateId: 'c7', sessionId: 's7' }),
    ]} />);

    expect(screen.getByText('employer.campaigns.results.unscoredFlagged.interviewStatus')).toBeInTheDocument();
    for (const key of ['generationFailed', 'notCandidateFault', 'noScoredAnswer', 'expiredNoAnswer', 'abandoned', 'inProgress', 'previousAttempt', 'noScore']) {
      expect(screen.getAllByText(`employer.campaigns.results.unscoredFlagged.${key}`).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText('employer.campaigns.results.flagNotes.focusLost').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/employer\.campaigns\.results\.unscoredFlagged\.startedAt/).some((node) => /\d{2}:\d{2} \d{2}\/\d{2}/.test(node.textContent ?? ''))).toBe(true);
    expect(document.body).not.toHaveTextContent('session-guid-should-not-display');
    const desktopBadge = screen.getAllByText('employer.campaigns.results.unscoredFlagged.generationFailed').find((node) => node.closest('td'));
    expect(desktopBadge?.closest('td')).toHaveAttribute('title', 'session-guid-should-not-display');
  });

  it('uses the legacy no-score label when the new fields are missing', () => {
    render(<UnscoredFlaggedSection items={[item()]} />);
    expect(screen.getAllByText('employer.campaigns.results.unscoredFlagged.noScore')).toHaveLength(2);
  });
});
