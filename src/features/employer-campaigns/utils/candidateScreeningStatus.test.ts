import { describe, expect, it } from 'vitest';
import { candidateScreeningStatusLabelKey } from './candidateScreeningStatus';

describe('candidateScreeningStatusLabelKey', () => {
  it.each([
    ['Pending', 'employer.campaigns.screening.status.Pending'],
    ['Filtered', 'employer.campaigns.screening.status.Filtered'],
    ['Rejected', 'employer.campaigns.screening.status.Rejected'],
    ['Analyzing', 'employer.campaigns.screening.status.Analyzing'],
    ['Analyzed', 'employer.campaigns.screening.status.Analyzed'],
    ['AnalysisFailed', 'employer.campaigns.screening.status.AnalysisFailed'],
    ['Invited', 'employer.campaigns.screening.status.Invited'],
  ])('maps %s to its translation key', (status, expected) => {
    expect(candidateScreeningStatusLabelKey(status)).toBe(expected);
  });

  it('keeps an unknown status visible', () => {
    expect(candidateScreeningStatusLabelKey('QueuedForReview')).toBe('QueuedForReview');
  });
});
