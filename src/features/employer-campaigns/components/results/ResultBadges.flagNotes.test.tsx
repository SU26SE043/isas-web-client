/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CampaignResultItem } from '../../types/campaign.api.types';
import { ResultFlagsCell } from './ResultBadges';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

describe('ResultFlagsCell note tooltip', () => {
  it('translates known anti-cheat notes in the tooltip and preserves unknown notes', () => {
    const item = {
      flags: [
        { type: 'focus_lost', count: 1, source: 'Client', note: 'Candidate lost focus from the interview window.', firstAt: null, lastAt: null },
        { type: 'other', count: 1, source: 'Client', note: 'Unknown note text', firstAt: null, lastAt: null },
      ],
    } as CampaignResultItem;
    render(<ResultFlagsCell item={item} />);
    expect(screen.getByText(/employer\.campaigns\.results\.flags\.count/)).toHaveAttribute(
      'title',
      expect.stringContaining('focus_lost: employer.campaigns.results.flagNotes.focusLost'),
    );
    expect(screen.getByText(/employer\.campaigns\.results\.flags\.count/)).toHaveAttribute(
      'title',
      expect.stringContaining('other: Unknown note text'),
    );
  });
});
