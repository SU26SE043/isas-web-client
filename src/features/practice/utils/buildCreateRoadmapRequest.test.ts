import { describe, expect, it } from 'vitest';
import { buildCreateRoadmapRequest } from './buildCreateRoadmapRequest';

describe('buildCreateRoadmapRequest', () => {
  it('builds minimal payload with jobCategory and level only', () => {
    const result = buildCreateRoadmapRequest('FE', 'Junior', {});
    expect(result).toEqual({
      ok: true,
      body: { jobCategory: 'FE', level: 'Junior' },
    });
  });

  it('includes only non-empty optional fields and dedupes sessionIds', () => {
    const result = buildCreateRoadmapRequest('BE', 'Senior', {
      cvId: 'cv-1',
      sessionIds: ['s1', 's1', '', 's2'],
      cvAnalysisId: 'analysis-1',
      priorRoadmapId: 'roadmap-old',
      focus: '  Improve system design  ',
    });
    expect(result).toEqual({
      ok: true,
      body: {
        jobCategory: 'BE',
        level: 'Senior',
        cvId: 'cv-1',
        sessionIds: ['s1', 's2'],
        cvAnalysisId: 'analysis-1',
        priorRoadmapId: 'roadmap-old',
        focus: 'Improve system design',
      },
    });
  });

  it('rejects focus longer than 2000 characters', () => {
    const result = buildCreateRoadmapRequest('BA', 'Fresher', {
      focus: 'x'.repeat(2001),
    });
    expect(result).toEqual({ ok: false, reason: 'focus_too_long' });
  });

  it('rejects missing jobCategory or level', () => {
    expect(buildCreateRoadmapRequest('', 'Junior', {})).toEqual({
      ok: false,
      reason: 'invalid_input',
    });
  });
});
