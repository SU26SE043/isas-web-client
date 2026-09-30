import { describe, expect, it } from 'vitest';
import type { RubricResponse } from '@/features/rubrics/types/rubric.types';
import type { PracticeSessionResponse } from '../types/b2cPracticeSession.types';
import { getUnassessedCriteria } from './unassessedCriteria';

const rubric: RubricResponse = {
  jobCategory: 'FE',
  isCustom: false,
  criteria: ['Communication', 'Fluency', 'Technical depth', 'Problem solving', 'System design', 'Grammar', 'Terminology']
    .map((name, index) => ({ id: `c${index}`, name, weight: 1 / 7, maxScore: 5 })),
};

function session(source: 'SystemDefault' | 'Custom' | null, names: string[]): PracticeSessionResponse {
  return {
    id: 's1',
    status: 'Scored',
    questions: [],
    result: {
      overallScore: 70,
      criteriaScores: names.map((name) => ({ name, score: 4, maxScore: 5 })),
      needsImprovement: [],
      overallComment: '',
      cvVsAnswer: null,
      rubricSource: source,
    },
  };
}

describe('getUnassessedCriteria', () => {
  it('finds missing default criteria by trimmed, case-insensitive name', () => {
    const result = getUnassessedCriteria(
      session('SystemDefault', [' communication ', 'FLUENCY', 'Technical depth', 'Problem solving', 'System design']),
      rubric,
    );
    expect(result).toEqual({ status: 'known', names: ['Grammar', 'Terminology'] });
  });

  it('returns no block when every default criterion is scored', () => {
    expect(getUnassessedCriteria(session('SystemDefault', rubric.criteria.map((item) => item.name)), rubric)).toEqual({
      status: 'known',
      names: [],
    });
  });

  it.each([
    ['Custom source', session('Custom', ['Communication']), rubric, {}],
    ['legacy null source', session(null, ['Communication']), rubric, {}],
    ['custom rubric', session('SystemDefault', ['Communication']), { ...rubric, isCustom: true }, {}],
    ['rubric request error', session('SystemDefault', ['Communication']), undefined, { isError: true }],
  ])('%s falls back to the anonymous state', (_label, inputSession, inputRubric, options) => {
    expect(getUnassessedCriteria(inputSession, inputRubric, options)).toEqual({ status: 'unknown', names: [] });
  });

  it('does not render a block while the default rubric is loading', () => {
    expect(getUnassessedCriteria(session('SystemDefault', ['Communication']), undefined, { isLoading: true })).toEqual({
      status: 'loading',
      names: [],
    });
  });
});
