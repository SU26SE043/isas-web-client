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
  rubricCriterionIds: [],
  language: 'vi',
  seniority: 'Junior',
  adaptiveEnabled: true,
  maxDeepPerQuestion: null,
});

describe('buildCreatePracticeSessionRequest', () => {
  it('requires jobCategory', () => {
    expect(() =>
      buildCreatePracticeSessionRequest({ ...baseState(), jobCategory: null }),
    ).toThrow(/jobCategory/i);
  });

  it('requires seniority — bỏ trống thì server tự điền Junior, đúng bug đang gỡ', () => {
    expect(() =>
      buildCreatePracticeSessionRequest({ ...baseState(), seniority: null }),
    ).toThrow(/seniority/i);
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
    expect(request.language).toBe('vi');
    expect(request.seniority).toBe('Junior');
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

  it('rejects missing seniority', () => {
    expect(canStartPracticeSession({ ...baseState(), seniority: null })).toBe(false);
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

describe('chế độ và độ sâu đào sâu', () => {
  it('không gửi adaptiveEnabled khi bật — server mặc định đã bật, gửi true không đổi được gì', () => {
    const request = buildCreatePracticeSessionRequest(baseState());
    expect(request.adaptiveEnabled).toBeUndefined();
  });

  it('gửi adaptiveEnabled=false khi ứng viên chọn buổi tĩnh', () => {
    const request = buildCreatePracticeSessionRequest({
      ...baseState(),
      adaptiveEnabled: false,
      maxDeepPerQuestion: 3,
    });
    expect(request.adaptiveEnabled).toBe(false);
    // Tắt đào sâu thì độ sâu vô nghĩa — gửi kèm chỉ làm payload tự mâu thuẫn.
    expect(request.maxDeepPerQuestion).toBeUndefined();
  });

  it('gửi độ sâu đã chọn khi bật đào sâu', () => {
    const request = buildCreatePracticeSessionRequest({
      ...baseState(),
      maxDeepPerQuestion: 2,
    });
    expect(request.maxDeepPerQuestion).toBe(2);
  });

  it('không gửi khoá độ sâu khi chưa biết dải server cho phép', () => {
    const request = buildCreatePracticeSessionRequest(baseState());
    expect(request.maxDeepPerQuestion).toBeUndefined();
  });

  // Server KHÔNG có trường `RubricCriterionIds` — System.Text.Json bỏ qua member lạ trong im lặng,
  // nên nó đã được gửi đi vô ích suốt. Test này chặn việc ai đó thêm lại.
  it('không gửi rubricCriterionIds — server không có trường đó', () => {
    const request = buildCreatePracticeSessionRequest({
      ...baseState(),
      rubricCriterionIds: ['a', 'b'],
    });
    expect(request).not.toHaveProperty('rubricCriterionIds');
  });
});
