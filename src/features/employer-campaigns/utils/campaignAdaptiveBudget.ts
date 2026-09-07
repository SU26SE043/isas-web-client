export const CAMPAIGN_ADAPTIVE_QUESTION_LIMIT = 20;

export interface AdaptiveQuestionBudget {
  baseQuestionCount: number;
  maxDeepPerQuestion: number;
  requestedTotal: number;
  effectiveTotal: number;
  exceedsLimit: boolean;
}

export function calculateAdaptiveQuestionBudget(
  baseQuestionCount: number,
  maxDeepPerQuestion: number | null | undefined,
  adaptiveEnabled: boolean,
): AdaptiveQuestionBudget {
  const base = Number.isFinite(baseQuestionCount) ? Math.max(0, Math.floor(baseQuestionCount)) : 0;
  const depth = adaptiveEnabled && Number.isFinite(maxDeepPerQuestion)
    ? Math.max(0, Math.floor(maxDeepPerQuestion ?? 0))
    : 0;
  const requestedTotal = base * (1 + depth);

  return {
    baseQuestionCount: base,
    maxDeepPerQuestion: depth,
    requestedTotal,
    effectiveTotal: Math.min(CAMPAIGN_ADAPTIVE_QUESTION_LIMIT, requestedTotal),
    exceedsLimit: requestedTotal > CAMPAIGN_ADAPTIVE_QUESTION_LIMIT,
  };
}
