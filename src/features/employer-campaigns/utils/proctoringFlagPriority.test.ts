import { describe, expect, it } from 'vitest';
import { getReviewPriority } from './proctoringFlagPriority';

describe('proctoring flag review priority', () => {
  it('keeps identity_unverified in the environment tier', () => {
    expect(getReviewPriority('identity_unverified')).toBe('environment');
  });

  it('normalizes PascalCase and separators before resolving a tier', () => {
    expect(getReviewPriority('FaceMismatch')).toBe('identity');
    expect(getReviewPriority('TabSwitch')).toBe('behavior');
    expect(getReviewPriority('MonitoringGap')).toBe('environment');
  });
});
