/** CampaignService.cs:3231 validates questionsPerSession in [1, 20]. */
export const QUESTIONS_PER_SESSION_MAX = 20;

/** Number of base questions the candidate actually receives (QuestionPoolSelector.Select). */
export function questionsReceived(k: number | null, fixed: number, total: number): number {
  if (k == null || k >= total) return total;
  return Math.max(fixed, k);
}

/** The draw input describes only questions selected from the optional pool. */
export function drawFromK(k: number | null, fixed: number, total: number): number {
  return Math.max(0, questionsReceived(k, fixed, total) - fixed);
}

export function drawBounds(fixed: number, total: number): { min: number; max: number } {
  return {
    min: fixed === 0 ? 1 : 0,
    max: Math.max(0, Math.min(total - fixed, QUESTIONS_PER_SESSION_MAX - fixed)),
  };
}

export function kFromDraw(draw: number, fixed: number, total: number): number {
  const { min, max } = drawBounds(fixed, total);
  return fixed + Math.min(Math.max(draw, min), max);
}

/** Keep K as a total while removing values that trigger avoidable bank warnings. */
export function normalizeK(k: number, fixed: number, total: number): number {
  const lo = Math.max(fixed, 1);
  const hi = Math.min(total, QUESTIONS_PER_SESSION_MAX);
  return lo > hi ? hi : Math.min(Math.max(k, lo), hi);
}
