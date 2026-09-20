import { describe, expect, it } from 'vitest';
import { countUnsubmittedQuestions } from './finishSummary';

describe('countUnsubmittedQuestions (hộp thoại Kết thúc — CAMP-21)', () => {
  const qs = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  it('câu chưa đụng tới (not_started) và đang đọc đều tính là chưa trả lời', () => {
    expect(countUnsubmittedQuestions(qs, { a: 'submitted', b: 'reading_question', c: 'not_started' })).toBe(2);
  });

  it('hết giờ (unanswered) vẫn tính', () => {
    expect(countUnsubmittedQuestions(qs, { a: 'submitted', b: 'unanswered', c: 'submitted' })).toBe(1);
  });

  it('thoát ngay khi vào phòng: cả bộ chưa nộp ⇒ đếm đủ, KHÔNG phải 0', () => {
    expect(countUnsubmittedQuestions(qs, { a: 'reading_question', b: 'not_started', c: 'not_started' })).toBe(3);
  });

  it('thiếu state (câu mới được append) cũng tính là chưa nộp', () => {
    expect(countUnsubmittedQuestions(qs, { a: 'submitted' })).toBe(2);
  });

  it('nộp hết ⇒ 0', () => {
    expect(countUnsubmittedQuestions(qs, { a: 'submitted', b: 'submitted', c: 'submitted' })).toBe(0);
  });
});
