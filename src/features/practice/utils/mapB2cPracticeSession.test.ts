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
