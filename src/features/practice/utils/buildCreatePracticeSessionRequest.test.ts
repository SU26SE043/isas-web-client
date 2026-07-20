import { describe, expect, it } from 'vitest';
import {
  buildCreatePracticeSessionRequest,
  canStartPracticeSession,
  isPracticeTimeLimitSec,
  isValidPracticeQuestionCount,
} from './buildCreatePracticeSessionRequest';
import type { PracticeSetupState } from '../types/b2cPracticeSession.types';

const baseState = (): PracticeSetupState => ({
  jobCategory: 'FE',
  cvId: null,
  jdId: null,
  jdText: '',
  timeLimitSec: 120,
  questionCount: 5,
});

describe('buildCreatePracticeSessionRequest', () => {
  it('requires jobCategory', () => {
    expect(() =>
      buildCreatePracticeSessionRequest({ ...baseState(), jobCategory: null }),
    ).toThrow(/jobCategory/i);
  });

  it('omits empty cvId and jdId', () => {
    const request = buildCreatePracticeSessionRequest({
      ...baseState(),
      cvId: '',
      jdId: '',
    });
    expect(request.cvId).toBeUndefined();
    expect(request.jdId).toBeUndefined();
    expect(request.jobCategory).toBe('FE');
    expect(request.timeLimitSec).toBe(120);
    expect(request.questionCount).toBe(5);
  });

  it('lets jdText win over jdId', () => {
    const request = buildCreatePracticeSessionRequest({
      ...baseState(),
      jdId: 'jd-1',
      jdText: '  Build APIs  ',
    });
    expect(request.jdText).toBe('Build APIs');
    expect(request.jdId).toBeUndefined();
  });

  it('uses jdId when jdText is blank', () => {
    const request = buildCreatePracticeSessionRequest({
      ...baseState(),
      jdId: 'jd-2',
      jdText: '   ',
    });
    expect(request.jdText).toBeUndefined();
    expect(request.jdId).toBe('jd-2');
  });
});

describe('canStartPracticeSession', () => {
  it('accepts valid defaults', () => {
    expect(canStartPracticeSession(baseState())).toBe(true);
  });

  it('rejects missing job category', () => {
    expect(canStartPracticeSession({ ...baseState(), jobCategory: null })).toBe(false);
  });

  it('rejects invalid question counts', () => {
    expect(isValidPracticeQuestionCount(0)).toBe(false);
    expect(isValidPracticeQuestionCount(21)).toBe(false);
    expect(isValidPracticeQuestionCount(5.5)).toBe(false);
    expect(canStartPracticeSession({ ...baseState(), questionCount: 0 })).toBe(false);
  });

  it('only allows 60 | 120 | 240', () => {
    expect(isPracticeTimeLimitSec(90)).toBe(false);
    expect(isPracticeTimeLimitSec(120)).toBe(true);
  });

  it('rejects jdText over 20000 chars', () => {
    expect(
      canStartPracticeSession({
        ...baseState(),
        jdText: 'a'.repeat(20_001),
      }),
    ).toBe(false);
  });
});
