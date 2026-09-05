import { describe, expect, it } from 'vitest';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { isUnreadable } from './CandidateRankingTable';

const candidate = (id: string, score: number | null): CampaignCandidateListItem => ({ id, status: 'analyzed', overallMatchScore: score, mustHaveTotal: 1 });

describe('candidate screening grouping rules', () => {
  it('marks analyzing and unscored candidates as unreadable', () => {
    expect(isUnreadable({ ...candidate('one', null), status: 'Analyzing' })).toBe(true);
    expect(isUnreadable(candidate('two', null))).toBe(true);
    expect(isUnreadable(candidate('three', 80))).toBe(false);
  });
});
