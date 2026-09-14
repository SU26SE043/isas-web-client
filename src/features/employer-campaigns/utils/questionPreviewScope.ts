import type { CampaignQuestion, RubricCriterion } from '../types/campaignManagement.types';
import type { RubricPreviewRun } from '../types/rubricPreview.types';
import { scopedCriteriaForQuestion } from './rubricPreviewVerdict';

/**
 * SC2 · T9 — tập id tiêu chí THỰC SỰ được chấm trong một lượt chấm thử theo câu, để lọc bảng kết quả.
 * Ưu tiên `run.scopedCriterionIds` (BE T6 trả kèm lượt — sự thật đã chấm). Lượt cũ/BE chưa deploy không mang
 * field (mảng rỗng) ⇒ suy cục bộ từ nhãn câu hỏi hiện tại (`scopedCriteriaForQuestion`). `null` = không thu
 * hẹp gì (câu chưa gắn nhãn ⇒ chấm ĐỦ rubric — INT-18 `null` ≠ `[]`).
 */
export function scopedCriterionIdsForRun(
  run: RubricPreviewRun,
  rubric: RubricCriterion[],
  question: CampaignQuestion | null | undefined,
): string[] | null {
  if (run.scopedCriterionIds && run.scopedCriterionIds.length > 0) return run.scopedCriterionIds;
  if (question?.targetCriterionIds == null) return null;
  return scopedCriteriaForQuestion(rubric, question).map((criterion) => criterion.id);
}

/**
 * Chiếu lượt chấm thử xuống tập tiêu chí đang xem: lọc `rubric` snapshot + `samples[].scores` theo id.
 * I6 — chấm thử = chấm thật: CHỈ lọc thứ HIỂN THỊ, KHÔNG động vào `actualWeightedPct`/`expectedWeightedPct`
 * (điểm gộp là của BE). `ids` null ⇒ trả nguyên lượt. Bộ lọc mà làm rỗng cả rubric ⇒ cũng trả nguyên
 * (id lệch phiên bản — thà hiện thừa còn hơn hiện bảng trống).
 */
export function projectRunToCriteria(run: RubricPreviewRun, ids: string[] | null): RubricPreviewRun {
  if (ids == null) return run;
  const keep = new Set(ids);
  const rubric = run.rubric.filter((criterion) => keep.has(criterion.criterionId));
  if (run.rubric.length > 0 && rubric.length === 0) return run;
  return {
    ...run,
    rubric,
    samples: run.samples.map((sample) => ({
      ...sample,
      scores: sample.scores.filter((score) => keep.has(score.criterionId)),
    })),
  };
}
