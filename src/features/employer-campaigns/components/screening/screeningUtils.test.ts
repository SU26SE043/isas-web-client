import { describe, expect, it } from 'vitest';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { canSelectCandidate, getCandidateRanks, shouldIncludeIneligible } from './screeningUtils';

const candidate = (id: string, overallMatchScore: number | null): CampaignCandidateListItem => ({
  id,
  status: 'analyzed',
  overallMatchScore,
});

describe('candidate invitation eligibility', () => {
  it('allows an eligible candidate with an email', () => {
    expect(canSelectCandidate({ ...candidate('one', 70), email: 'one@example.com' })).toBe(true);
  });

  it('allows an ineligible candidate with an email for explicit invitation', () => {
    expect(canSelectCandidate({ ...candidate('one', 70), email: 'one@example.com', eligible: false })).toBe(true);
  });

  it('keeps rejected candidates unselectable', () => {
    expect(canSelectCandidate({ ...candidate('one', 70), email: 'one@example.com', status: 'Rejected' })).toBe(false);
  });

  it('adds includeIneligible only when a selected candidate is ineligible', () => {
    expect(shouldIncludeIneligible([{ ...candidate('one', 70), eligible: true }])).toBe(false);
    expect(shouldIncludeIneligible([{ ...candidate('two', 70), eligible: false }])).toBe(true);
  });
});

describe('getCandidateRanks', () => {
  it('assigns the same rank to equal percentages and skips occupied ranks', () => {
    const ranks = getCandidateRanks([
      candidate('one', 70),
      candidate('two', 70),
      candidate('three', 55),
      candidate('four', 55),
      candidate('five', 55),
    ]);

    expect([...ranks.entries()]).toEqual([
      ['one', 1],
      ['two', 1],
      ['three', 3],
      ['four', 3],
      ['five', 3],
    ]);
  });

  it('leaves unscored candidates without a rank', () => {
    const ranks = getCandidateRanks([candidate('one', 70), candidate('two', null)]);

    expect(ranks.get('one')).toBe(1);
    expect(ranks.has('two')).toBe(false);
  });
});
