import { describe, expect, it } from 'vitest';
import { median, summarizeAnalyticsScores } from './analyticsScoreUtils';

describe('analytics score summaries', () => {
  it('keeps interview, screening, and pending populations separate', () => {
    expect(
      summarizeAnalyticsScores([
        { interviewScore: 80, screeningScore: null },
        { interviewScore: null, screeningScore: 60 },
        { interviewScore: null, screeningScore: null },
      ]),
    ).toEqual({
      interviewMedianScore: 80,
      screeningMedianScore: 60,
      pendingScoreCount: 1,
    });
  });

  it('uses the middle value rather than the arithmetic mean', () => {
    expect(median([1, 2, 100])).toBe(2);
    expect(median([10, 30])).toBe(20);
    expect(median([])).toBeNull();
  });
});
