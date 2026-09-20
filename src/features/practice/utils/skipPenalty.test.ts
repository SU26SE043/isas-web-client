import { describe, expect, it } from 'vitest';
import type { PracticeSessionResponse } from '../types/b2cPracticeSession.types';
import { mapPracticeSessionResponse } from './mapB2cPracticeSession';
import { mapPracticeSessionResponseToViewModel } from './practiceSessionResultViewModel';

// CAMP-21 áp cả B2C (2026-09-21): màn kết quả phải GIẢI THÍCH phép nhân từ chính response
// (skipPenalty · seedAnswered · seedTotal · scoreBeforePenalty), KHÔNG tự suy từ answeredCount
// (đếm cả câu đào sâu ⇒ mẫu số sai).

function session(result: Record<string, unknown>): PracticeSessionResponse {
  return {
    id: 's1',
    status: 'Scored',
    jobCategory: 'BE',
    questionCount: 3,
    questions: [],
    answers: [],
    result: {
      overallScore: 0,
      criteriaScores: [],
      needsImprovement: [],
      overallComment: '',
      cvVsAnswer: null,
      ...result,
    } as PracticeSessionResponse['result'],
  } as PracticeSessionResponse;
}

describe('mapPracticeSessionResponse — CAMP-21 fields', () => {
  it('đọc 4 field theo đúng tên khoá BE (camelCase), số về number', () => {
    const mapped = mapPracticeSessionResponse({
      sessionId: 's1',
      status: 'Scored',
      questions: [],
      result: {
        overallScore: 53.33,
        answeredCount: 3,
        totalQuestions: 4,
        criteriaScores: [],
        needsImprovement: [],
        skipPenalty: true,
        seedAnswered: 2,
        seedTotal: 3,
        scoreBeforePenalty: 80,
      },
    });
    expect(mapped.result?.skipPenalty).toBe(true);
    expect(mapped.result?.seedAnswered).toBe(2);
    expect(mapped.result?.seedTotal).toBe(3);
    expect(mapped.result?.scoreBeforePenalty).toBe(80);
  });

  it('buổi cũ: skipPenalty vắng ⇒ false, ba số null — không bịa từ answeredCount', () => {
    const mapped = mapPracticeSessionResponse({
      sessionId: 's1',
      status: 'Scored',
      questions: [],
      result: { overallScore: 80, answeredCount: 1, totalQuestions: 3, criteriaScores: [], needsImprovement: [] },
    });
    expect(mapped.result?.skipPenalty).toBe(false);
    expect(mapped.result?.seedAnswered).toBeNull();
    expect(mapped.result?.seedTotal).toBeNull();
    expect(mapped.result?.scoreBeforePenalty).toBeNull();
  });

  it('skipPenalty là chuỗi "true" hay 1 KHÔNG được coi là bật', () => {
    const mapped = mapPracticeSessionResponse({
      sessionId: 's1',
      status: 'Scored',
      questions: [],
      result: { overallScore: 80, criteriaScores: [], needsImprovement: [], skipPenalty: 'true' },
    });
    expect(mapped.result?.skipPenalty).toBe(false);
  });
});

describe('view model — skipPenalty', () => {
  it('có luật + bỏ trống câu chính ⇒ applied=true với đúng 4 con số', () => {
    const view = mapPracticeSessionResponseToViewModel(
      session({ overallScore: 53.33, answeredCount: 3, totalQuestions: 4, skipPenalty: true, seedAnswered: 2, seedTotal: 3, scoreBeforePenalty: 80 }),
    );
    expect(view.skipPenalty).toEqual({ applied: true, seedAnswered: 2, seedTotal: 3, scoreBefore: 80, scoreAfter: 53.33 });
  });

  it('có luật + đủ câu chính ⇒ applied=false (hiện "không bị trừ")', () => {
    const view = mapPracticeSessionResponseToViewModel(
      session({ overallScore: 80, skipPenalty: true, seedAnswered: 3, seedTotal: 3, scoreBeforePenalty: 80 }),
    );
    expect(view.skipPenalty?.applied).toBe(false);
    expect(view.skipPenalty?.seedTotal).toBe(3);
  });

  it('buổi cũ (không luật) ⇒ undefined, kể cả khi answeredCount < totalQuestions', () => {
    const view = mapPracticeSessionResponseToViewModel(
      session({ overallScore: 80, answeredCount: 1, totalQuestions: 3, skipPenalty: false }),
    );
    expect(view.skipPenalty).toBeUndefined();
  });

  it('có luật nhưng thiếu số (seedTotal null) ⇒ undefined — không dựng phép chia từ số thiếu', () => {
    const view = mapPracticeSessionResponseToViewModel(
      session({ overallScore: 53.33, skipPenalty: true, seedAnswered: 2, seedTotal: null, scoreBeforePenalty: 80 }),
    );
    expect(view.skipPenalty).toBeUndefined();
  });

  it('applied dựa trên seedAnswered/seedTotal, KHÔNG dựa trên answeredCount/totalQuestions', () => {
    // answeredCount 3/4 (đếm cả đào sâu) nhưng câu chính đủ 3/3 ⇒ không trừ.
    const view = mapPracticeSessionResponseToViewModel(
      session({ overallScore: 80, answeredCount: 3, totalQuestions: 4, skipPenalty: true, seedAnswered: 3, seedTotal: 3, scoreBeforePenalty: 80 }),
    );
    expect(view.skipPenalty?.applied).toBe(false);
  });
});
