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

  it('can mark a rescued need as a must-have', () => {
    expect(buildJobNeedsRescuePayload('  Must know React  ', 'Technical', true)).toEqual([
      { category: 'Technical', text: 'Must know React', isMustHave: true },
    ]);
  });
});

