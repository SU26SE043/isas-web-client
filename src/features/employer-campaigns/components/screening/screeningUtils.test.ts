import { describe, expect, it } from 'vitest';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { canSelectCandidate, getCandidateRanks, verificationRiskTranslationKey } from './screeningUtils';

const candidate = (id: string, overallMatchScore: number | null): CampaignCandidateListItem => ({
  id,
  status: 'analyzed',
  overallMatchScore,
});

describe('getCandidateRanks', () => {
  it('assigns sequential ranks in the server response order', () => {
    const ranks = getCandidateRanks([
      candidate('one', 70),
      candidate('two', 70),
      candidate('three', 55),
      candidate('four', 55),
      candidate('five', 55),
    ]);

    expect([...ranks.entries()]).toEqual([
      ['one', 1],
      ['two', 2],
      ['three', 3],
      ['four', 4],
      ['five', 5],
    ]);
  });

  it('leaves unscored candidates without a rank', () => {
    const ranks = getCandidateRanks([candidate('one', 70), candidate('two', null)]);

    expect(ranks.get('one')).toBe(1);
    expect(ranks.has('two')).toBe(false);
  });
});

describe('verification risk labels', () => {
  it('uses translated keys instead of raw API labels', () => {
    expect(verificationRiskTranslationKey('High')).toBe('employer.campaigns.screening.verificationRisk.High');
  });

  it('does not reorder candidates by eligibility or score', () => {
    const ranks = getCandidateRanks([
      { ...candidate('ineligible', 99), eligible: false },
      { ...candidate('eligible', 70), eligible: true },
    ]);

    expect(ranks.get('ineligible')).toBe(1);
    expect(ranks.get('eligible')).toBe(2);
  });
});

describe('canSelectCandidate', () => {
  const withEmail = (status: string): CampaignCandidateListItem => ({ id: status, status, email: 'a@x.com', overallMatchScore: null });

  it('đang được AI sàng (Analyzing/Filtered) ⇒ KHÔNG chọn được dù đã có email', () => {
    expect(canSelectCandidate(withEmail('Analyzing'))).toBe(false);
    expect(canSelectCandidate(withEmail('Filtered'))).toBe(false);
    expect(canSelectCandidate(withEmail('Analyzed'))).toBe(true);
  });
});
