import { describe, expect, it } from 'vitest';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { getCandidateRanks } from './screeningUtils';

const candidate = (id: string, overallMatchScore: number | null): CampaignCandidateListItem => ({
  id,
  status: 'analyzed',
  overallMatchScore,
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
