import { describe, expect, it } from 'vitest';
import type { CampaignResultItem } from '../types/campaign.api.types';
import {
  defaultExportFileName,
  filterAndSortResults,
  hasResultOverride,
  parseOverrideScoreInput,
} from './campaignResultsActions';
import { parseContentDispositionFilename } from './campaignFiles';

const sample = (overrides: Partial<CampaignResultItem> = {}): CampaignResultItem => ({
  rank: 1,
  candidateId: 'c1',
  sessionId: 's1',
  fullName: 'Nguyen Van A',
  email: 'a@example.com',
  totalScore: 88,
  aiScore: 84,
  overrideScore: null,
  overrideResult: null,
  overrideNote: null,
  overriddenAt: null,
  result: 'Pass',
  scoredAt: '2026-07-25T09:30:00Z',
  flags: [],
  ...overrides,
});

describe('campaignResultsActions', () => {
  it('detects override presence', () => {
    expect(hasResultOverride(sample())).toBe(false);
    expect(hasResultOverride(sample({ overrideScore: 90 }))).toBe(true);
  });

  it('filters and sorts results', () => {
    const rows = [
      sample({ rank: 2, sessionId: 's2', totalScore: 70, result: 'Fail', fullName: 'B' }),
      sample({
        rank: 1,
        sessionId: 's1',
        totalScore: 90,
        flags: [{ type: 'TabSwitch', count: 1 }],
      }),
    ];
    const filtered = filterAndSortResults(rows, {
      search: 'a@',
      outcome: 'pass',
      review: 'flagged',
      sort: 'scoreDesc',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.sessionId).toBe('s1');
  });

  it('parses override score input', () => {
    expect(parseOverrideScoreInput('')).toEqual({ score: null, error: false });
    expect(parseOverrideScoreInput('85.5')).toEqual({ score: 85.5, error: false });
    expect(parseOverrideScoreInput('-1').error).toBe(true);
  });

  it('builds export fallback filenames for csv and pdf', () => {
    expect(defaultExportFileName('camp-1', 'csv')).toBe('campaign_camp-1_results.csv');
    expect(defaultExportFileName('camp-1', 'pdf')).toBe('campaign_camp-1_results.pdf');
  });

  it('reads export filename from content-disposition when present', () => {
    expect(
      parseContentDispositionFilename(
        'attachment; filename="campaign_camp-1_results.pdf"',
      ),
    ).toBe('campaign_camp-1_results.pdf');
    expect(parseContentDispositionFilename(undefined)).toBeUndefined();
  });
});
