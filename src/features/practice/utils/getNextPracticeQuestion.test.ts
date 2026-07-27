import { describe, expect, it } from 'vitest';
import { getNextPracticeQuestion } from './getNextPracticeQuestion';
import type { PracticeQuestionResponse } from '../types/b2cPracticeSession.types';

const questions: PracticeQuestionResponse[] = [
  { id: 'q1', orderNo: 1, content: 'One?', timeLimitSec: 60, kind: 'warmup' },
  { id: 'q2', orderNo: 2, content: 'Two?', timeLimitSec: 120, kind: 'question' },
  { id: 'q3', orderNo: 3, content: 'Three?', timeLimitSec: 60, kind: 'question' },
];

describe('getNextPracticeQuestion', () => {
  it('returns the next question in order', () => {
    expect(getNextPracticeQuestion(questions, 'q1')?.id).toBe('q2');
    expect(getNextPracticeQuestion(questions, 'q2')?.id).toBe('q3');
  });

  it('returns null on the last question', () => {
    expect(getNextPracticeQuestion(questions, 'q3')).toBeNull();
  });

  it('returns null for an unknown question id', () => {
    expect(getNextPracticeQuestion(questions, 'missing')).toBeNull();
  });
});
