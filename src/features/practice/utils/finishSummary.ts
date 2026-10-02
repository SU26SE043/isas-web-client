import { groupQuestionsByRoot } from '@/shared/utils/questionNumbering';
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

/**
 * ATT1-F5 — số liệu màn "Đã hết giờ": "Đã trả lời x/y câu chính".
 *
 * - y = số câu GỐC (không tính câu đào sâu FollowUp/Clarify) — CÙNG luật gom nhóm với số hiệu "Câu hỏi N / M"
 *   của phòng (`groupQuestionsByRoot` / `numberQuestions`), nên hai con số không bao giờ lệch nhau.
 * - x = câu gốc đã có câu trả lời được server lưu (`answers` có bản ghi) VÀ ở trạng thái `'submitted'`.
 *   Câu hết giờ từng câu được hệ thống nộp thay bằng file lặng (`'unanswered'`) KHÔNG tính là đã trả lời —
 *   nó vẫn bị tính 0 điểm. Câu đào sâu đã trả lời không cộng vào x.
 */
export function countMainQuestionsAnswered(
  questions: ReadonlyArray<{ id: string; kind?: string | null }>,
  states: Readonly<Record<string, QuestionAnswerState | undefined>>,
  answers: Readonly<Record<string, unknown>>,
): { answered: number; total: number } {
  const roots = groupQuestionsByRoot(questions, (question) => question.kind).map((group) => group.root);
  const answered = roots.filter((root) => Boolean(answers[root.id]) && states[root.id] === 'submitted').length;
  return { answered, total: roots.length };
}
