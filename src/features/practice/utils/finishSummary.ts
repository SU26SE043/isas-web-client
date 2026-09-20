import type { QuestionAnswerState } from '../types/b2cPracticeSession.types';

/**
 * Số liệu cho hộp thoại Kết thúc buổi (CAMP-21 — bỏ trống câu chính = mất điểm).
 *
 * "Chưa trả lời" = MỌI câu chưa nộp: chưa đụng tới (`not_started`), đang đọc, đang thu, hết giờ
 * (`unanswered`)… — chỉ trừ `'submitted'`. Đếm hẹp hơn (chỉ `unanswered` = hết giờ) từng làm hộp
 * thoại báo "Chưa trả lời: 0" khi người luyện thoát giữa chừng với cả bộ câu còn nguyên.
 */
export function countUnsubmittedQuestions(
  questions: ReadonlyArray<{ id: string }>,
  states: Readonly<Record<string, QuestionAnswerState | undefined>>,
): number {
  return questions.filter((q) => states[q.id] !== 'submitted').length;
}
