import { describe, expect, it } from 'vitest';

const sources = import.meta.glob('/src/features/employer-campaigns/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

describe('employer campaigns production source guard', () => {
  it('does not import production state from mocks', () => {
    const offenders = Object.entries(sources)
      .filter(([path]) => path.endsWith('/hooks/useCampaignWizard.ts'))
      .filter(([, source]) => /from ['"].*\/mocks\//.test(source))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });
});
