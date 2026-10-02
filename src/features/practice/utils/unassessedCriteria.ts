import type { RubricResponse } from '@/features/rubrics/types/rubric.types';
import type { PracticeLanguage, PracticeSessionResponse } from '../types/b2cPracticeSession.types';

export type UnassessedCriteriaResult =
  | { status: 'loading'; names: [] }
  | { status: 'unknown'; names: [] }
  | { status: 'known'; names: string[] };

export function getPracticeRubricLanguage(language?: PracticeLanguage): PracticeLanguage {
  return language ?? 'vi';
}

/**
 * Finds default-rubric criteria that have no score for a scored B2C session.
 * A custom rubric or an unavailable rubric catalog deliberately stays anonymous.
 */
export function getUnassessedCriteria(
  session: Pick<PracticeSessionResponse, 'result'>,
  rubric: RubricResponse | null | undefined,
  options: { isLoading?: boolean; isError?: boolean } = {},
): UnassessedCriteriaResult {
  const serverUnassessed = session.result?.unassessedCriteria;
  if (Array.isArray(serverUnassessed)) {
    return { status: 'known', names: serverUnassessed.map((item) => item.name.trim()).filter(Boolean) };
  }
  if (options.isLoading) return { status: 'loading', names: [] };
  if (session.result?.rubricSource !== 'SystemDefault') return { status: 'unknown', names: [] };
  if (options.isError || !rubric || rubric.isCustom) return { status: 'unknown', names: [] };

  const scoredNames = new Set(
    session.result.criteriaScores.map((criterion) => criterion.name.trim().toLocaleLowerCase()),
  );
  const names = rubric.criteria
    .map((criterion) => criterion.name.trim())
    .filter((name) => name && !scoredNames.has(name.toLocaleLowerCase()));

  return { status: 'known', names };
}
