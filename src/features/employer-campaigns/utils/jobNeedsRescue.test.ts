import { describe, expect, it } from 'vitest';
import { buildJobNeedsRescuePayload } from './jobNeedsRescue';

describe('buildJobNeedsRescuePayload', () => {
  it('trims the rescue need and never sends source', () => {
    expect(buildJobNeedsRescuePayload('  Build accessible React interfaces  ')).toEqual([
      { category: 'Technical', text: 'Build accessible React interfaces' },
    ]);
  });

  it('returns an empty replacement payload for blank input', () => {
    expect(buildJobNeedsRescuePayload(' \n ')).toEqual([]);
  });
});

