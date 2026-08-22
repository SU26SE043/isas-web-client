import { describe, expect, it } from 'vitest';
import { buildCreateRoadmapRequest } from './buildCreateRoadmapRequest';

describe('buildCreateRoadmapRequest', () => {
  it('builds minimal payload with jobCategory and level only', () => {
    const result = buildCreateRoadmapRequest('FE', 'Junior', {});
    expect(result).toEqual({
      ok: true,
      body: { jobCategory: 'FE', level: 'Junior', language: 'vi' },
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
        language: 'vi',
        cvId: 'cv-1',
        sessionIds: ['s1', 's2'],
        cvAnalysisId: 'analysis-1',
        priorRoadmapId: 'roadmap-old',
        focus: 'Improve system design',
      },
    });
  });

  it('omits name when the optional input is blank', () => {
    const result = buildCreateRoadmapRequest('FE', 'Junior', { name: '   ' });
    expect(result).toEqual({
      ok: true,
      body: { jobCategory: 'FE', level: 'Junior', language: 'vi' },
    });
  });

  it('includes the selected roadmap mode', () => {
    const result = buildCreateRoadmapRequest('BE', 'Junior', { mode: 'Reinforce' });
    expect(result).toEqual({
      ok: true,
      body: { jobCategory: 'BE', level: 'Junior', language: 'vi', mode: 'Reinforce' },
    });
  });

  it('trims and includes a non-empty roadmap name', () => {
    const result = buildCreateRoadmapRequest('FE', 'Junior', { name: '  My path  ' });
    expect(result).toEqual({
      ok: true,
      body: { jobCategory: 'FE', level: 'Junior', language: 'vi', name: 'My path' },
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
