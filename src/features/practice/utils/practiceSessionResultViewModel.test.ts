import { describe, expect, it } from 'vitest';
import type { PracticeSessionResponse } from '../types/b2cPracticeSession.types';
import { mapPracticeSessionResponseToViewModel } from './practiceSessionResultViewModel';
import {
  formatScore,
  getQuestionStatusGroup,
  getSessionStatusGroup,
} from './practiceSessionResultFormat';

describe('practiceSessionResultViewModel', () => {
  it('maps session detail into a safe view model', () => {
    const session: PracticeSessionResponse = {
      id: 's1',
      status: 'Scored',
      jobCategory: 'Backend (BE)',
      level: 'Senior',
      questionCount: 2,
      completedAt: '2026-07-26T10:00:00Z',
      durationSeconds: 750,
      questions: [
        {
          id: 'q1',
          orderNo: 1,
          content: 'Describe REST API flow.',
          timeLimitSec: 120,
          kind: 'technical',
        },
        {
          id: 'q2',
          orderNo: 2,
          content: 'Explain transactions.',
          timeLimitSec: 120,
          kind: 'technical',
        },
      ],
      answers: [
        {
          questionId: 'q1',
          transcript: 'Thank you.',
          status: 'Scored',
          durationSec: 20,
          criteriaScores: [
            { name: 'Technical depth', score: 0, maxScore: 5, comment: 'No depth.' },
          ],
          suggestedAnswer: 'Sample answer',
        },
        {
          questionId: 'q2',
          status: 'Skipped',
        },
      ],
      result: {
        overallScore: 5.7,
        maxScore: 100,
        passThreshold: 50,
        criteriaScores: [
          { name: 'Technical depth', score: 0, maxScore: 5 },
          { name: 'Grammar', score: 1, maxScore: 5 },
          { name: 'Fluency', score: 1, maxScore: 5 },
        ],
        strengths: [],
        needsImprovement: ['Need more depth'],
        overallComment: 'Needs improvement',
        cvVsAnswer: null,
      },
    };

    const view = mapPracticeSessionResponseToViewModel(session);
    expect(view.hasResult).toBe(true);
    expect(view.answeredCount).toBe(1);
    expect(view.skippedCount).toBe(1);
    expect(view.passThresholdPct).toBe(50);
    expect(view.questions[0]?.suggestedAnswer).toBe('Sample answer');
    expect(view.questions[1]?.skipped).toBe(true);
  });
});

describe('practiceSessionResultFormat', () => {
  it('formats scores and status groups safely', () => {
    expect(formatScore(null, 100)).toBe('—');
    expect(formatScore(5.7, 100)).toBe('5.7/100');
    expect(getSessionStatusGroup('Scored')).toBe('graded');
    expect(getQuestionStatusGroup('Skipped')).toBe('skipped');
  });
});
