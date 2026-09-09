import { describe, expect, it } from 'vitest';

const sources = import.meta.glob('./CampaignJdStep.tsx', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;

describe('campaign JD step contract', () => {
  it('keeps criteria and hard-filter state available without rendering those controls on the JD step', () => {
    const source = Object.values(sources)[0];

    expect(source).not.toContain('CampaignCriteriaTextField');
    expect(source).not.toContain('CampaignHardFilterSection');
    expect(source).toContain("jdDescription");
    expect(source).toContain('previewText={jd.extractedText');
  });
});
