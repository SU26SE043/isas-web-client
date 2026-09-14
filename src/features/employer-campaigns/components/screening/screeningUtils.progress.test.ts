import { describe, expect, it } from 'vitest';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { getCandidateAnalysisProgress } from './screeningUtils';

const candidate = (id: string, status: string): CampaignCandidateListItem => ({ id, status });

describe('getCandidateAnalysisProgress', () => {
  it('counts analyzing, filtered, analyzed, and failed independently', () => {
    expect(
      getCandidateAnalysisProgress([
        candidate('a', 'Analyzing'),
        candidate('b', 'Filtered'),
        candidate('c', 'Analyzed'),
        candidate('d', 'AnalysisFailed'),
      ]),
    ).toEqual({ total: 4, pending: 2, completed: 1, errors: 1 });
  });

  it('does not count an analyzing candidate as completed', () => {
    expect(getCandidateAnalysisProgress([candidate('a', 'Analyzing')])).toMatchObject({
      pending: 1,
      completed: 0,
    });
  });
});
