import type { CampaignQuestion, RubricCriterion } from '../types/campaignManagement.types';
import type { QuestionCoverageWarning } from '../types/questionPreview.types';

/**
 * SC2 · T9 — bao phủ tiêu chí ở bước 4, tính CỤC BỘ từ `state.questions × rubric` để cảnh báo NGAY khi HR
 * chưa lưu (server chỉ biết sau PUT — `questionBank.coverageWarnings`). Cùng luật với BE
 * `QuestionBankSummary.Build`: tiêu chí `WhenTargeted` mà KHÔNG câu nào mang id nó trong
 * `targetCriterionIds` (bất kỳ vị trí). Tiêu chí `Always` KHÔNG BAO GIỜ vào đây — nó chấm mọi câu.
 */
export function computeLocalCoverageWarnings(
  rubric: RubricCriterion[],
  questions: CampaignQuestion[],
): QuestionCoverageWarning[] {
  const targeted = new Set<string>();
  for (const question of questions) {
    for (const id of question.targetCriterionIds ?? []) targeted.add(id);
  }
  return rubric
    .filter((criterion) => criterion.scoringScope === 'WhenTargeted' && !targeted.has(criterion.id))
    .map((criterion) => ({ criterionId: criterion.id, name: criterion.name }));
}

/** Tiền tố BE đóng lên dòng warning K-rule (`QuestionBankSummary.KBelowCriteriaGroupsCode`). */
export const K_BELOW_CRITERIA_GROUPS = 'K_BELOW_CRITERIA_GROUPS';

export function isKRuleWarning(warning: string): boolean {
  return warning.trim().startsWith(K_BELOW_CRITERIA_GROUPS);
}

/**
 * Tách `questionBank.warnings` server trả: K-rule CHẶN publish (hiện như lỗi), phần còn lại là cảnh báo mềm
 * (hiện như trước SC2). Cắt tiền tố mã khỏi câu K-rule — mã là để máy nhận diện, không phải để HR đọc.
 */
export function splitQuestionBankWarnings(warnings: string[]): { blocking: string[]; soft: string[] } {
  const blocking: string[] = [];
  const soft: string[] = [];
  for (const warning of warnings) {
    if (isKRuleWarning(warning)) blocking.push(warning.trim().slice(K_BELOW_CRITERIA_GROUPS.length).replace(/^:\s*/, ''));
    else soft.push(warning);
  }
  return { blocking, soft };
}

/**
 * Số "tiêu chí CHÍNH" distinct = `targetCriterionIds[0]` của mỗi câu có nhãn (cùng định nghĩa với selector
 * rút đều của BE — một câu chỉ đếm vào MỘT rổ).
 */
export function primaryCriteriaCount(questions: CampaignQuestion[]): number {
  return primaryCriteriaOf(questions).size;
}

function primaryCriteriaOf(questions: CampaignQuestion[]): Set<string> {
  const primary = new Set<string>();
  for (const question of questions) {
    const first = question.targetCriterionIds?.[0];
    if (first) primary.add(first);
  }
  return primary;
}

/**
 * K-rule tính cục bộ — mirror BE `QuestionBankSummary.Build` (SC2 · BUG-2): câu BẮT BUỘC luôn được rút nên
 * (a) chiếm khe: khe còn lại = `K − |required|`; (b) tiêu chí chính chúng nhắm coi như ĐÃ phủ. Chặn khi
 * `K − |required| < |tiêu chí chính của câu KHÔNG bắt buộc ∖ tiêu chí chính của câu bắt buộc|`. Không có câu bắt
 * buộc ⇒ suy biến về `K < distinct tiêu chí chính`. `null` = không vi phạm (K null = thi hết bộ ⇒ mọi câu đều
 * được hỏi). Đây là lý do "K ≥ số tiêu chí" chưa đủ: một câu bắt buộc không nhãn ăn mất khe, tiêu chí còn lại
 * bị rơi cho MỌI ứng viên mà không ai báo.
 */
export function computeLocalKRule(
  questions: CampaignQuestion[],
  questionsPerSession: number | null | undefined,
): { k: number; required: number; uncovered: number } | null {
  if (questionsPerSession == null) return null;
  const required = questions.filter((question) => question.isRequired);
  const optional = questions.filter((question) => !question.isRequired);
  const covered = primaryCriteriaOf(required);
  const uncovered = [...primaryCriteriaOf(optional)].filter((id) => !covered.has(id)).length;
  const slots = questionsPerSession - required.length;
  // `uncovered === 0` ⇒ không có tiêu chí nào rơi (câu bắt buộc phủ hết) — ca `|required| > K` đã có cảnh báo
  // riêng "số câu bắt buộc nhiều hơn số câu mỗi buổi" (CAMP-22), không báo K-rule chồng lên.
  return uncovered > 0 && slots < uncovered ? { k: questionsPerSession, required: required.length, uncovered } : null;
}
