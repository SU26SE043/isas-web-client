import { describe, expect, it } from 'vitest';
import { formatProfileFileDate, formatProfileFileSize } from './profileFileUtils';

describe('profileFileUtils', () => {
  it('never renders NaN file sizes', () => {
    expect(formatProfileFileSize(Number.NaN)).toBe('—');
    expect(formatProfileFileSize(Number.POSITIVE_INFINITY)).toBe('—');
  });

  it('never renders Invalid Date', () => {
    expect(formatProfileFileDate('', 'vi')).toBe('—');
    expect(formatProfileFileDate('not-a-date', 'en')).toBe('—');
  });
});
