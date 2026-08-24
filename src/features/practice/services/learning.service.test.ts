import { describe, expect, it } from 'vitest';
import { resolveApiRoadmapLevel } from './learning.service';

describe('resolveApiRoadmapLevel', () => {
  it.each([
    ['intern', 'Fresher'],
    ['fresher', 'Fresher'],
    ['junior', 'Junior'],
    ['middle', 'Middle'],
    ['senior', 'Senior'],
    ['lead', 'Senior'],
  ])('maps %s to %s', (input, expected) => {
    expect(resolveApiRoadmapLevel(input)).toBe(expected);
  });

  it('throws instead of silently defaulting an unknown level to Fresher', () => {
    expect(() => resolveApiRoadmapLevel('principal')).toThrowError(
      expect.objectContaining({ code: 'unsupported_level' }),
    );
  });
});
