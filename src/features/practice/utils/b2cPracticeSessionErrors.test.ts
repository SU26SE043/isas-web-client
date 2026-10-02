import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { isSessionAlreadySubmittedError, mapSubmitPracticeAnswerErrorKey } from './b2cPracticeSessionErrors';

function httpError(status: number, data: unknown) {
  return new AxiosError(String(status), String(status), undefined, undefined, {
    status, statusText: 'x', data, headers: {}, config: { headers: new AxiosHeaders() },
  });
}

describe('mapSubmitPracticeAnswerErrorKey — đọc `code` TRƯỚC status (ATT1 [I3])', () => {
  it.each([
    ['SESSION_NOT_BEGUN', 'practice.errors.sessionNotBegun'],
    ['SESSION_TIME_UP', 'practice.errors.sessionTimeUp'],
    ['SESSION_ENDED', 'practice.errors.sessionEnded'],
  ])('409 { code: %s } ⇒ %s (không phải câu 409 chung)', (code, key) => {
    expect(mapSubmitPracticeAnswerErrorKey(httpError(409, { code, error: 'x' }))).toBe(key);
  });

  it('code nằm trong lớp bọc `data` của gateway vẫn đọc được', () => {
    expect(mapSubmitPracticeAnswerErrorKey(httpError(409, { data: { code: 'SESSION_TIME_UP' } }))).toBe('practice.errors.sessionTimeUp');
  });

  it('code thắng status dù status không phải 409', () => {
    expect(mapSubmitPracticeAnswerErrorKey(httpError(400, { code: 'SESSION_ENDED' }))).toBe('practice.errors.sessionEnded');
  });

  it('409 KHÔNG có code (Backend cũ) ⇒ giữ câu cũ "practice.errors.conflict"', () => {
    expect(mapSubmitPracticeAnswerErrorKey(httpError(409, { error: 'conflict' }))).toBe('practice.errors.conflict');
  });

  it('409 với code lạ ⇒ vẫn câu 409 cũ', () => {
    expect(mapSubmitPracticeAnswerErrorKey(httpError(409, { code: 'SOMETHING_ELSE' }))).toBe('practice.errors.conflict');
  });

  it.each([
    [400, 'practice.errors.audioRequired'],
    [403, 'practice.errors.forbidden'],
    [404, 'practice.errors.questionNotFound'],
    [500, 'practice.errors.submitAnswerFailed'],
    [502, 'practice.errors.submitAnswerFailed'],
  ])('status %i không code ⇒ %s như trước', (status, key) => {
    expect(mapSubmitPracticeAnswerErrorKey(httpError(status, { error: 'x' }))).toBe(key);
  });

  it('lỗi không phải HTTP (mạng, file quá lớn) ⇒ submitAnswerFailed', () => {
    expect(mapSubmitPracticeAnswerErrorKey(new Error('network'))).toBe('practice.errors.submitAnswerFailed');
    expect(mapSubmitPracticeAnswerErrorKey(Object.assign(new Error('ANSWER_FILE_TOO_LARGE'), { code: 'audio_too_large' }))).toBe('practice.errors.submitAnswerFailed');
  });
});

describe('isSessionAlreadySubmittedError', () => {
  it('400 "already submitted" / "đã submit" ⇒ đã nộp', () => {
    expect(isSessionAlreadySubmittedError(httpError(400, { error: 'Session already submitted' }))).toBe(true);
    expect(isSessionAlreadySubmittedError(httpError(400, { error: 'Buổi đã submit' }))).toBe(true);
  });

  it('400 khác, 409 "already", lỗi mạng ⇒ không', () => {
    expect(isSessionAlreadySubmittedError(httpError(400, { error: 'No answers' }))).toBe(false);
    expect(isSessionAlreadySubmittedError(httpError(409, { error: 'already submitted' }))).toBe(false);
    expect(isSessionAlreadySubmittedError(new Error('already submitted'))).toBe(false);
  });
});
