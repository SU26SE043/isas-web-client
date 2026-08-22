import { describe, expect, it } from 'vitest';
import { resolveApiRoadmapLevel } from './learning.service';

describe('resolveApiRoadmapLevel', () => {
  it('normalizes current-level values to the backend casing', () => {
    expect(resolveApiRoadmapLevel('fresher')).toBe('Fresher');
    expect(resolveApiRoadmapLevel('junior')).toBe('Junior');
  });
});
