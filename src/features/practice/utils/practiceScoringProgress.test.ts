import { describe, expect, it } from 'vitest';
import {
  getPracticeScoringPollIntervalMs,
  getPracticeScoringProgress,
} from './practiceScoringProgress';
import type {
  PracticeAnswerReview,
  PracticeSessionResponse,
} from '../types/b2cPracticeSession.types';

function buildSession(answers: PracticeAnswerReview[] | null): PracticeSessionResponse {
  return {
    id: '685d10e7-af3c-4971-a207-54abfb6d7dee',
    status: 'Scoring',
    questions: [],
    result: null,
    answers,
  };
}

function answer(overrides: Partial<PracticeAnswerReview>): PracticeAnswerReview {
  return { questionId: 'q1', answerId: 'a1', ...overrides };
}

describe('getPracticeScoringProgress', () => {
  it('counts scored, skipped and failed answers as settled', () => {
    const progress = getPracticeScoringProgress(
      buildSession([
        answer({ questionId: 'q1', answerId: 'a1', status: 'Scored' }),
        answer({ questionId: 'q2', answerId: 'a2', status: 'Skipped' }),
        answer({ questionId: 'q3', answerId: 'a3', status: 'Failed' }),
        answer({ questionId: 'q4', answerId: 'a4', status: 'Scoring' }),
        answer({ questionId: 'q5', answerId: 'a5', status: 'Uploaded' }),
      ]),
    );

    expect(progress).toEqual({ settled: 3, total: 5, percent: 60 });
  });

  it('compares statuses case-insensitively', () => {
    const progress = getPracticeScoringProgress(
      buildSession([
        answer({ questionId: 'q1', answerId: 'a1', status: 'scored' }),
        answer({ questionId: 'q2', answerId: 'a2', status: ' SKIPPED ' }),
        answer({ questionId: 'q3', answerId: 'a3', status: 'scoring' }),
      ]),
    );

    expect(progress.settled).toBe(2);
    expect(progress.total).toBe(3);
  });

  it('ignores questions that carry no answer', () => {
    const progress = getPracticeScoringProgress(
      buildSession([
        answer({ questionId: 'q1', answerId: 'a1', status: 'Scored' }),
        answer({ questionId: 'q2', answerId: null, status: null }),
      ]),
    );

    expect(progress).toEqual({ settled: 1, total: 1, percent: 100 });
  });

  it('reports an empty progress instead of 0/0 arithmetic', () => {
    expect(getPracticeScoringProgress(buildSession([]))).toEqual({
      settled: 0,
      total: 0,
      percent: 0,
    });
    expect(getPracticeScoringProgress(buildSession(null)).total).toBe(0);
    expect(getPracticeScoringProgress(null).total).toBe(0);
    expect(getPracticeScoringProgress(undefined).percent).toBe(0);
  });
});

describe('getPracticeScoringPollIntervalMs', () => {
  it('polls every second for the first 10 seconds', () => {
    expect(getPracticeScoringPollIntervalMs(0)).toBe(1_000);
    expect(getPracticeScoringPollIntervalMs(9_999)).toBe(1_000);
  });

  it('falls back to 3 seconds until the 120 second mark', () => {
    expect(getPracticeScoringPollIntervalMs(10_000)).toBe(3_000);
    expect(getPracticeScoringPollIntervalMs(119_999)).toBe(3_000);
  });

  it('keeps polling every 8 seconds past 120 seconds', () => {
    expect(getPracticeScoringPollIntervalMs(120_000)).toBe(8_000);
    expect(getPracticeScoringPollIntervalMs(15 * 60_000)).toBe(8_000);
  });
});
