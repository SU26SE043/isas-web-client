import type { CriterionLevelsValidation } from '../../../utils/criterionLevelRules';

type Translate = (key: string) => string;

const K = 'employer.campaigns.wizard.levelsEditor.error';

/**
 * Câu lỗi (đã dịch) cho một vi phạm luật mốc. Mỗi mã có đúng MỘT câu và câu đó nói rõ hậu
 * quả (thiếu mốc 0 ⇒ bài trống vẫn có điểm) — đó là lý do luật tồn tại, không phải "sai định
 * dạng".
 */
export function levelsErrorMessage(
  t: Translate,
  error: Exclude<CriterionLevelsValidation, { ok: true }>,
  context: { maxScore: number; count: number; descriptorLength?: number },
): string {
  switch (error.code) {
    case 'count':
      return t(`${K}.count`).replace('{{count}}', String(context.count));
    case 'integer':
      return t(`${K}.integer`);
    case 'duplicate':
      return t(`${K}.duplicate`).replace('{{score}}', String(error.score));
    case 'range':
      return t(`${K}.range`).replace('{{max}}', String(context.maxScore));
    case 'missingZero':
      return t(`${K}.missingZero`);
    case 'missingMax':
      return t(`${K}.missingMax`).replace('{{max}}', String(context.maxScore));
    case 'descriptor':
      return t(`${K}.descriptor`).replace('{{count}}', String(context.descriptorLength ?? 0));
    default:
      return t(`${K}.count`);
  }
}

/** Lỗi gắn với MỘT hàng cụ thể (có `index`) — hiện ngay dưới hàng đó; còn lại hiện ở cuối bảng. */
export function isRowLevelError(error: Exclude<CriterionLevelsValidation, { ok: true }>): boolean {
  return typeof error.index === 'number';
}
