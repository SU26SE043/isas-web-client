import { describe, expect, it } from 'vitest';
import { countMainQuestionsAnswered, countUnsubmittedQuestions } from './finishSummary';

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

describe('countMainQuestionsAnswered (màn "Đã hết giờ" — ATT1-F5)', () => {
  const qs = [
    { id: 'q1', kind: 'Seed' },
    { id: 'q1a', kind: 'FollowUp' },
    { id: 'q1b', kind: 'Clarify' },
    { id: 'q2', kind: 'Seed' },
    { id: 'q2a', kind: 'FollowUp' },
    { id: 'q3', kind: 'NewQuestion' },
    { id: 'q4', kind: 'Seed' },
  ];
  const saved = { answerId: 'x' };

  it('tổng = số câu GỐC (câu đào sâu không cộng vào mẫu số)', () => {
    expect(countMainQuestionsAnswered(qs, {}, {})).toEqual({ answered: 0, total: 4 });
  });

  it('chỉ đếm câu gốc đã có câu trả lời được lưu; câu đào sâu đã trả lời không cộng vào tử số', () => {
    expect(countMainQuestionsAnswered(
      qs,
      { q1: 'submitted', q1a: 'submitted', q1b: 'submitted', q2a: 'submitted', q3: 'submitted' },
      { q1: saved, q1a: saved, q1b: saved, q2a: saved, q3: saved },
    )).toEqual({ answered: 2, total: 4 });
  });

  it('câu hết giờ từng câu được nộp thay bằng file lặng (unanswered) KHÔNG tính là đã trả lời', () => {
    expect(countMainQuestionsAnswered(qs, { q1: 'submitted', q2: 'unanswered' }, { q1: saved, q2: saved })).toEqual({ answered: 1, total: 4 });
  });

  it('trạng thái submitted mà server chưa lưu câu trả lời ⇒ không tính', () => {
    expect(countMainQuestionsAnswered(qs, { q1: 'submitted', q4: 'submitted' }, { q1: saved })).toEqual({ answered: 1, total: 4 });
  });
});
