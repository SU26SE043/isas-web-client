import type { EditableRubricCriterion, RubricValidationCode, WeightStatus } from '../types/rubric.types';

export const WEIGHT_TOLERANCE_MIN = 0.99;
export const WEIGHT_TOLERANCE_MAX = 1.01;
export const MAX_SCORE_TARGET = 100;

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

/** Total max score must equal 100 (same under/valid/over model as weight). */
export function getMaxScoreStatus(totalMaxScore: number): WeightStatus {
  if (totalMaxScore < MAX_SCORE_TARGET) return 'under';
  if (totalMaxScore > MAX_SCORE_TARGET) return 'over';
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

  const totalMaxScore = computeTotalMaxScore(criteria);
  if (totalMaxScore !== MAX_SCORE_TARGET) {
    return 'invalidTotalMaxScore';
  }

  return null;
}
