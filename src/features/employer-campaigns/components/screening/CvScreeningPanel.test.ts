import { describe, expect, it } from 'vitest';
import { hasScoredCandidate } from './CvScreeningPanel';

describe('hasScoredCandidate', () => {
  it('matches the server predicate: any non-null match score locks job needs', () => {
    expect(hasScoredCandidate([{ overallMatchScore: null }, { overallMatchScore: 82 }])).toBe(true);
    expect(hasScoredCandidate([{ overallMatchScore: null }, {}])).toBe(false);
  });
});
