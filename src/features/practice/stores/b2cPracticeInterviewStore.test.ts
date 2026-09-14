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

describe('useB2cPracticeInterviewStore hydrateFromSession — quay lại buổi dở', () => {
  beforeEach(() => {
    useB2cPracticeInterviewStore.getState().reset();
  });

  const seeds = [makeQuestion('q-1', 1), makeQuestion('q-2', 5), makeQuestion('q-3', 9)];

  it('nạp lại câu trả lời server đã giữ và đứng ở câu ĐẦU TIÊN chưa trả lời, không phải câu 1', () => {
    // Đo trên dev 2026-09-12: buổi nộp 8/9 câu, "Tiếp tục" cho ra 9/9 câu chưa trả lời và 4 lượt nộp thêm
    // đè lên câu 1–4 (INT-3 upload lại = ghi đè, điểm cũ bị xoá). Nguyên nhân: hydrate đặt answersByQuestionId = {}.
    useB2cPracticeInterviewStore.getState().hydrateFromSession({
      ...makeSession(seeds),
      answers: [
        { questionId: 'q-1', answerId: 'a-1', status: 'Scored', transcript: 'đã nói' },
        { questionId: 'q-2', answerId: 'a-2', status: 'Scoring' },
      ],
    });

    const state = useB2cPracticeInterviewStore.getState();
    expect(state.currentQuestionId).toBe('q-3');
    expect(state.answersByQuestionId['q-1']).toMatchObject({ answerId: 'a-1', questionId: 'q-1', status: 'Scored', transcript: 'đã nói' });
    expect(state.answersByQuestionId['q-2']).toMatchObject({ answerId: 'a-2', status: 'Scoring' });
    expect(state.answersByQuestionId['q-3']).toBeUndefined();
    expect(state.questionStates).toEqual({ 'q-1': 'submitted', 'q-2': 'submitted', 'q-3': 'reading_question' });
    expect(state.interviewComplete).toBe(false);
    expect(state.stage).toBe('interviewing');
  });

  it('bỏ qua dòng answers không có answerId (câu chưa nộp mà server vẫn liệt kê)', () => {
    useB2cPracticeInterviewStore.getState().hydrateFromSession({
      ...makeSession(seeds),
      answers: [
        { questionId: 'q-1', answerId: 'a-1', status: 'Scored' },
        { questionId: 'q-2', answerId: null, status: null },
      ],
    });

    const state = useB2cPracticeInterviewStore.getState();
    expect(state.currentQuestionId).toBe('q-2');
    expect(state.answersByQuestionId['q-2']).toBeUndefined();
    expect(state.questionStates['q-2']).toBe('reading_question');
  });

  it('mọi câu đã trả lời ⇒ interviewComplete=true, đứng ở câu cuối để nút Kết thúc hiện ra', () => {
    useB2cPracticeInterviewStore.getState().hydrateFromSession({
      ...makeSession(seeds),
      answers: seeds.map((q, i) => ({ questionId: q.id, answerId: `a-${i}`, status: 'Scored' })),
    });

    const state = useB2cPracticeInterviewStore.getState();
    expect(state.interviewComplete).toBe(true);
    expect(state.stage).toBe('ready_to_finish');
    expect(state.currentQuestionId).toBe('q-3');
    expect(Object.values(state.questionStates)).toEqual(['submitted', 'submitted', 'submitted']);
  });

  it('không có answers (buổi mới / answers=null) ⇒ hành vi cũ: câu 1, chưa hoàn tất', () => {
    useB2cPracticeInterviewStore.getState().hydrateFromSession({ ...makeSession(seeds), answers: null });

    const state = useB2cPracticeInterviewStore.getState();
    expect(state.currentQuestionId).toBe('q-1');
    expect(state.answersByQuestionId).toEqual({});
    expect(state.interviewComplete).toBe(false);
    expect(state.questionStates).toEqual({ 'q-1': 'reading_question', 'q-2': 'not_started', 'q-3': 'not_started' });
  });
});
