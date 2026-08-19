import type { PracticeSessionResponse } from '../types/b2cPracticeSession.types';

/** Answer statuses that will not move again: the question is done being scored. */
const SETTLED_ANSWER_STATUSES = new Set(['scored', 'skipped', 'failed']);

/** Scoring finishes in ~19s at p50, so poll tightly before easing off. */
export const PRACTICE_SCORING_FAST_POLL_UNTIL_MS = 10_000;
/** Past this point the wait screen switches to its "still working" notice. */
export const PRACTICE_SCORING_SLOW_POLL_AFTER_MS = 120_000;

const FAST_POLL_INTERVAL_MS = 1_000;
const DEFAULT_POLL_INTERVAL_MS = 3_000;
const SLOW_POLL_INTERVAL_MS = 8_000;

export interface PracticeScoringProgress {
  /** Answers whose scoring has settled (scored, skipped or failed). */
  settled: number;
  /** Questions that actually carry an answer. */
  total: number;
  percent: number;
}

function normalizeAnswerStatus(status?: string | null): string {
  return (status ?? '').trim().toLowerCase().replaceAll('_', '');
}

/**
 * Real per-question scoring progress. The API exposes it as
 * `questions[].answer.status`, which `mapPracticeSessionResponse` flattens into
 * `session.answers`; entries without an answer carry no status and no answerId,
 * so they stay out of the total.
 */
export function getPracticeScoringProgress(
  session?: PracticeSessionResponse | null,
): PracticeScoringProgress {
  const answers = (session?.answers ?? []).filter(
    (answer) => normalizeAnswerStatus(answer.status) !== '' || answer.answerId != null,
  );
  const total = answers.length;
  const settled = answers.filter((answer) =>
    SETTLED_ANSWER_STATUSES.has(normalizeAnswerStatus(answer.status)),
  ).length;
  return {
    settled,
    total,
    percent: total > 0 ? Math.round((settled / total) * 100) : 0,
  };
}

/**
 * Poll cadence for the scoring wait screen. Never returns `false`: a slow
 * session still reports back, so the screen must keep listening instead of
 * stranding the candidate.
 */
export function getPracticeScoringPollIntervalMs(elapsedMs: number): number {
  if (elapsedMs < PRACTICE_SCORING_FAST_POLL_UNTIL_MS) return FAST_POLL_INTERVAL_MS;
  if (elapsedMs < PRACTICE_SCORING_SLOW_POLL_AFTER_MS) return DEFAULT_POLL_INTERVAL_MS;
  return SLOW_POLL_INTERVAL_MS;
}
