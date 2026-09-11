import type { EditableRubricCriterion, RubricValidationCode, WeightStatus } from '../types/rubric.types';

export const WEIGHT_TOLERANCE_MIN = 0.99;
export const WEIGHT_TOLERANCE_MAX = 1.01;

export function computeTotalWeightDecimal(criteria: EditableRubricCriterion[]): number {
  return criteria.reduce((sum, criterion) => sum + criterion.weightPercent / 100, 0);
}

export function computeTotalMaxScore(criteria: EditableRubricCriterion[]): number {
  return criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);
}

export function getWeightStatus(totalWeight: number): WeightStatus {
  if (totalWeight < WEIGHT_TOLERANCE_MIN) return 'under';
  if (totalWeight > WEIGHT_TOLERANCE_MAX) return 'over';
  return 'valid';
}

export function formatWeightPercentFromDecimal(totalWeight: number): string {
  const percent = totalWeight * 100;
  const rounded = Math.round(percent * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

export function validateRubric(criteria: EditableRubricCriterion[]): RubricValidationCode | null {
  if (criteria.length === 0) return 'empty';

  for (const criterion of criteria) {
    if (!criterion.name.trim()) return 'missingName';
    if (criterion.maxScore <= 0) return 'invalidMaxScore';
    if (criterion.weightPercent < 0) return 'negativeWeight';
  }

  const totalWeight = computeTotalWeightDecimal(criteria);
  if (totalWeight < WEIGHT_TOLERANCE_MIN || totalWeight > WEIGHT_TOLERANCE_MAX) {
    return 'invalidWeight';
  }

  // KHÔNG có luật "Σ điểm tối đa = 100": backend chỉ đòi maxScore ≥ 1 (RubricLibraryService.NormalizeAndValidate),
  // và điểm tổng INT-10 = trung bình (điểm/maxScore×100) TỪNG tiêu chí ⇒ tổng maxScore không tham gia công thức nào.
  // Bộ chuẩn 7 tiêu chí × 5 = 35 từng bị luật bịa đó khoá nút Lưu vĩnh viễn.
  return null;
}
