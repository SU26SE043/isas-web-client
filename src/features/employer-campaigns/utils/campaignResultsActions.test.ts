import { describe, expect, it } from 'vitest';
import type { CampaignResultItem } from '../types/campaign.api.types';
import {
  defaultExportFileName,
  filterAndSortResults,
  formatResultClock,
  formatResultScore,
  getResultFlagCount,
  hasResultOverride,
  parseOverrideScoreInput,
  spansMultipleDays,
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

  it('counts warning events rather than flag categories', () => {
    expect(
      getResultFlagCount([
        { type: 'TabSwitch', count: 1, source: 'Client' },
        { type: 'FocusLoss', count: 1, source: 'Client' },
      ]),
    ).toBe(2);
    expect(getResultFlagCount([{ type: 'TabSwitch', count: -1, source: 'Client' }])).toBe(0);
  });

  it('filters and sorts results', () => {
    const rows = [
      sample({ rank: 2, sessionId: 's2', totalScore: 70, result: 'Fail', fullName: 'B' }),
      sample({
        rank: 1,
        sessionId: 's1',
        totalScore: 90,
        flags: [{ type: 'TabSwitch', count: 1, source: 'Client' }],
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
    expect(parseOverrideScoreInput('101').error).toBe(true);
    expect(parseOverrideScoreInput('100')).toEqual({ score: 100, error: false });
  });

  it('formats result scores on the shared percentage scale', () => {
    expect(formatResultScore(72)).toBe('72%');
    expect(formatResultScore(72.5)).toBe('72.5%');
    expect(formatResultScore(null)).toBe('—');
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

describe('flag clock helpers', () => {
  // Không ghim múi giờ của máy chạy test: so với chính Intl cùng tham số, và chọn mốc cách nhau đủ xa.
  const fmt = (iso: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', ...options }).format(new Date(iso));

  it('formats seconds and the date only when asked', () => {
    const iso = '2026-10-05T01:39:07Z';
    expect(formatResultClock(iso, 'vi')).toBe(fmt(iso, {}));
    expect(formatResultClock(iso, 'vi', { seconds: true })).toBe(fmt(iso, { second: '2-digit' }));
    expect(formatResultClock(iso, 'vi', { date: true })).toBe(fmt(iso, { day: '2-digit', month: '2-digit' }));
    expect(formatResultClock('not a date', 'vi')).toBeNull();
    expect(formatResultClock(null, 'vi')).toBeNull();
  });

  it('detects events spanning more than one local day', () => {
    expect(spansMultipleDays(['2026-10-04T12:00:00Z', '2026-10-05T13:00:00Z'])).toBe(true);
    expect(spansMultipleDays(['2026-10-05T12:00:00Z', '2026-10-05T12:00:30Z', null])).toBe(false);
    expect(spansMultipleDays([])).toBe(false);
  });
});
