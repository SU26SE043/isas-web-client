export const CAMPAIGN_ADAPTIVE_QUESTION_LIMIT = 20;

export interface AdaptiveQuestionBudget {
  baseQuestionCount: number;
  maxDeepPerQuestion: number;
  maxBaseQuestionCount: number;
  maxDepthAllowed: number;
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
  const maxBaseQuestionCount = Math.floor(CAMPAIGN_ADAPTIVE_QUESTION_LIMIT / (1 + depth));
  const maxDepthAllowed = base > 0
    ? Math.max(0, Math.floor(CAMPAIGN_ADAPTIVE_QUESTION_LIMIT / base) - 1)
    : 0;

  return {
    baseQuestionCount: base,
    maxDeepPerQuestion: depth,
    maxBaseQuestionCount,
    maxDepthAllowed,
    requestedTotal,
    effectiveTotal: Math.min(CAMPAIGN_ADAPTIVE_QUESTION_LIMIT, requestedTotal),
    exceedsLimit: requestedTotal > CAMPAIGN_ADAPTIVE_QUESTION_LIMIT,
  };
}
