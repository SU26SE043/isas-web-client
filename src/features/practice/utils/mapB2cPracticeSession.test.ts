import { describe, expect, it } from 'vitest';
import {
  mapPracticeSessionResponse,
  mapSubmitPracticeAnswerResponse,
} from './mapB2cPracticeSession';

describe('mapPracticeSessionResponse', () => {
  it('maps session id, questions, and result fields', () => {
    const mapped = mapPracticeSessionResponse({
      sessionId: 's1',
      status: 'Scored',
      questions: [
        { id: 'q1', orderNo: 1, content: 'Hello?', timeLimitSec: 60, kind: 'warmup' },
      ],
      result: {
        overallScore: 82,
        criteriaScores: [{ name: 'Comm', score: 80, maxScore: 100 }],
        needsImprovement: ['Be concise'],
        overallComment: 'Good',
        cvVsAnswer: { consistencyScore: 70, summary: 'Aligned' },
      },
    });

    expect(mapped.id).toBe('s1');
    expect(mapped.status).toBe('Scored');
    expect(mapped.questions[0]?.content).toBe('Hello?');
    expect(mapped.result?.overallScore).toBe(82);
    expect(mapped.result?.criteriaScores[0]?.name).toBe('Comm');
    expect(mapped.result?.cvVsAnswer?.summary).toBe('Aligned');
  });

  it('preserves full AI evaluation details for each answer', () => {
    const mapped = mapPracticeSessionResponse({
      id: 'session-1',
      status: 'Scored',
      createdAt: '2026-07-22T23:57:00Z',
      completedAt: '2026-07-22T23:58:00Z',
      questions: [
        {
          id: 'q1',
          orderNo: 1,
          content: 'Describe your API design process.',
          timeLimitSec: 120,
        },
      ],
      answers: [
        {
          answerId: 'a1',
          questionId: 'q1',
          transcript: 'My answer',
          status: 'Scored',
          evaluation: {
            score: 7,
            comment: 'Clear but brief.',
            criteriaScores: [
              { name: 'Communication', score: 3, maxScore: 5, comment: 'Well structured.' },
            ],
            speakingMetrics: {
              syllablesPerMinute: 220,
              longestPauseSeconds: 1.2,
              hesitationCount: 2,
              silenceRatio: 4,
              fillerWordsCount: 1,
            },
            suggestedAnswer: 'A stronger sample answer.',
          },
        },
      ],
      result: {
        overallScore: 70,
        criteriaScores: [],
        needsImprovement: [],
      },
    });

    expect(mapped.createdAt).toBe('2026-07-22T23:57:00Z');
    expect(mapped.completedAt).toBe('2026-07-22T23:58:00Z');
    expect(mapped.answers?.[0]).toMatchObject({
      score: 7,
      comment: 'Clear but brief.',
      suggestedAnswer: 'A stronger sample answer.',
      speakingMetrics: {
        speechRate: 220,
        longestPauseSec: 1.2,
        hesitationCount: 2,
        silenceRatio: 4,
        fillerWordCount: 1,
      },
    });
    expect(mapped.answers?.[0]?.criteriaScores?.[0]).toMatchObject({
      name: 'Communication',
      score: 3,
      maxScore: 5,
      comment: 'Well structured.',
    });
  });
});

describe('mapSubmitPracticeAnswerResponse', () => {
  it('maps nextQuestion and nextAction', () => {
    const mapped = mapSubmitPracticeAnswerResponse({
      answerId: 'a1',
      questionId: 'q1',
      status: 'ok',
      transcript: null,
      nextAction: 'follow_up',
      nextQuestion: {
        id: 'q2',
        orderNo: 2,
        content: 'Follow up?',
        timeLimitSec: 120,
        kind: 'follow_up',
      },
      interviewComplete: false,
    });

    expect(mapped.answerId).toBe('a1');
    expect(mapped.nextAction).toBe('follow_up');
    expect(mapped.nextQuestion?.id).toBe('q2');
    expect(mapped.interviewComplete).toBe(false);
  });
});
