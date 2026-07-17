import { RoadmapLevel } from '@/shared/enums';

/**
 * Canonical practice interview levels.
 * API `level` uses these exact strings: Fresher · Junior · Middle · Senior.
 */
export const PRACTICE_LEVELS = [
  RoadmapLevel.Fresher,
  RoadmapLevel.Junior,
  RoadmapLevel.Middle,
  RoadmapLevel.Senior,
] as const;

export type PracticeLevel = (typeof PRACTICE_LEVELS)[number];

const LEGACY_LEVEL_LOOKUP: Record<string, PracticeLevel> = {
  fresher: RoadmapLevel.Fresher,
  junior: RoadmapLevel.Junior,
  middle: RoadmapLevel.Middle,
  senior: RoadmapLevel.Senior,
};

export function isPracticeLevel(value: string | null | undefined): value is PracticeLevel {
  return PRACTICE_LEVELS.includes(value as PracticeLevel);
}

/** Normalize API or legacy lowercase values to canonical practice level. */
export function resolvePracticeLevel(value: string | null | undefined): PracticeLevel | undefined {
  if (!value) return undefined;
  const normalized = value.trim();
  if (isPracticeLevel(normalized)) return normalized;
  return LEGACY_LEVEL_LOOKUP[normalized.toLowerCase()];
}

/** i18n key suffix — translations stay `practice.wizard.level.fresher`, etc. */
export function practiceLevelI18nKey(level: PracticeLevel): string {
  return level.toLowerCase();
}

/** Display label for API level or legacy lowercase values. */
export function formatPracticeLevelDisplay(value: string | null | undefined): string {
  return resolvePracticeLevel(value) ?? value?.trim() ?? '';
}

export function normalizePracticeLevels(values: string[]): PracticeLevel[] {
  const seen = new Set<PracticeLevel>();
  const normalized: PracticeLevel[] = [];
  for (const value of values) {
    const level = resolvePracticeLevel(value);
    if (!level || seen.has(level)) continue;
    seen.add(level);
    normalized.push(level);
  }
  return normalized.length > 0 ? normalized : [...PRACTICE_LEVELS];
}
