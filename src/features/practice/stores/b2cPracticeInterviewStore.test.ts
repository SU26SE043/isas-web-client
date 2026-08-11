import { beforeEach, describe, expect, it } from 'vitest';
import { useB2cPracticeInterviewStore } from './b2cPracticeInterviewStore';
import type { PracticeQuestionResponse, PracticeSessionResponse } from '../types/b2cPracticeSession.types';

function makeQuestion(id: string, orderNo: number): PracticeQuestionResponse {
  return { id, orderNo, content: `Question ${orderNo}`, timeLimitSec: 120, kind: 'question' };
}

function makeSession(questions: PracticeQuestionResponse[]): PracticeSessionResponse {
  return {
    id: 'session-1',
    status: 'InProgress',
    timeLimitSec: 120,
    questions,
    result: null,
    answers: [],
  };
}

describe('useB2cPracticeInterviewStore appendQuestion', () => {
  beforeEach(() => {
    useB2cPracticeInterviewStore.getState().reset();
  });

  it('inserts a follow-up question right after the question it follows, not at the end', () => {
    // Session start pre-loads all seed questions (sparse orderNo, e.g. 1, 5, 9, 13, 17)
    // the way the real API does — this reproduces the "jumps from question 1 to 4/5"
    // bug: without ordered insertion, currentIndex used to jump straight to the tail.
    const seeds = [
      makeQuestion('seed-1', 1),
      makeQuestion('seed-2', 5),
      makeQuestion('seed-3', 9),
    ];
    useB2cPracticeInterviewStore.getState().hydrateFromSession(makeSession(seeds));

    const followUp = makeQuestion('follow-up-1', 2);
    useB2cPracticeInterviewStore.getState().appendQuestion(followUp);
    useB2cPracticeInterviewStore.getState().setCurrentQuestion(followUp.id);

    const state = useB2cPracticeInterviewStore.getState();
    const currentIndex = state.questions.findIndex((q) => q.id === state.currentQuestionId);

    // The follow-up must land at array index 1 (right after seed-1), so the
    // "question X of Y" progress display reads "2 of 4", not "4 of 4".
    expect(currentIndex).toBe(1);
    expect(state.questions.map((q) => q.id)).toEqual([
      'seed-1',
      'follow-up-1',
      'seed-2',
      'seed-3',
    ]);
  });

  it('keeps inserting subsequent follow-ups in chronological order', () => {
    const seeds = [makeQuestion('seed-1', 1), makeQuestion('seed-2', 5)];
    useB2cPracticeInterviewStore.getState().hydrateFromSession(makeSession(seeds));

    useB2cPracticeInterviewStore.getState().appendQuestion(makeQuestion('follow-up-1', 2));
    useB2cPracticeInterviewStore.getState().setCurrentQuestion('follow-up-1');
    useB2cPracticeInterviewStore.getState().appendQuestion(makeQuestion('follow-up-2', 3));
    useB2cPracticeInterviewStore.getState().setCurrentQuestion('follow-up-2');

    const state = useB2cPracticeInterviewStore.getState();
    expect(state.questions.map((q) => q.id)).toEqual([
      'seed-1',
      'follow-up-1',
      'follow-up-2',
      'seed-2',
    ]);
  });

  it('does not duplicate a question that is appended twice', () => {
    const seeds = [makeQuestion('seed-1', 1)];
    useB2cPracticeInterviewStore.getState().hydrateFromSession(makeSession(seeds));
    const followUp = makeQuestion('follow-up-1', 2);
    useB2cPracticeInterviewStore.getState().appendQuestion(followUp);
    useB2cPracticeInterviewStore.getState().appendQuestion(followUp);

    expect(useB2cPracticeInterviewStore.getState().questions).toHaveLength(2);
  });
});
