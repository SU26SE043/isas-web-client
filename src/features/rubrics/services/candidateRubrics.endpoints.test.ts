import { describe, expect, it } from 'vitest';
import { candidateRubricsEndpoints } from './candidateRubrics.endpoints';

describe('candidateRubricsEndpoints', () => {
  it('adds the default Vietnamese language query', () => {
    expect(candidateRubricsEndpoints.rubric('FE')).toBe(
      '/api/v1/interview/practice/rubrics/FE?language=vi',
    );
  });

  it('keeps rubric language isolated in the request URL', () => {
    expect(candidateRubricsEndpoints.rubric('BE', 'en')).toBe(
      '/api/v1/interview/practice/rubrics/BE?language=en',
    );
  });
});
