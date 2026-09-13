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
 * rút đều của BE). K (số câu mỗi buổi) nhỏ hơn số này ⇒ mỗi buổi chắc chắn có tiêu chí không câu nào hỏi.
 */
export function primaryCriteriaCount(questions: CampaignQuestion[]): number {
  const primary = new Set<string>();
  for (const question of questions) {
    const first = question.targetCriterionIds?.[0];
    if (first) primary.add(first);
  }
  return primary.size;
}

/** K-rule tính cục bộ; `null` = không vi phạm (K null = thi hết bộ ⇒ mọi câu đều được hỏi). */
export function computeLocalKRule(
  questions: CampaignQuestion[],
  questionsPerSession: number | null | undefined,
): { k: number; primary: number } | null {
  if (questionsPerSession == null) return null;
  const primary = primaryCriteriaCount(questions);
  return questionsPerSession < primary ? { k: questionsPerSession, primary } : null;
}
