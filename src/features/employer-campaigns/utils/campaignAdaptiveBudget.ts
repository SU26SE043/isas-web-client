export const CAMPAIGN_ADAPTIVE_QUESTION_LIMIT = 20;

export interface AdaptiveQuestionBudget {
  limit: number;
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
  questionLimit?: number | null,
): AdaptiveQuestionBudget {
  const limit = Number.isFinite(questionLimit) && Number(questionLimit) > 0
    ? Math.floor(Number(questionLimit))
    : CAMPAIGN_ADAPTIVE_QUESTION_LIMIT;
  const base = Number.isFinite(baseQuestionCount) ? Math.max(0, Math.floor(baseQuestionCount)) : 0;
  const depth = adaptiveEnabled && Number.isFinite(maxDeepPerQuestion)
    ? Math.max(0, Math.floor(maxDeepPerQuestion ?? 0))
    : 0;
  const requestedTotal = base * (1 + depth);
  const maxBaseQuestionCount = Math.floor(limit / (1 + depth));
  const maxDepthAllowed = base > 0
    ? Math.max(0, Math.floor(limit / base) - 1)
    : 0;

  return {
    baseQuestionCount: base,
    maxDeepPerQuestion: depth,
    maxBaseQuestionCount,
    maxDepthAllowed,
    requestedTotal,
    limit,
    effectiveTotal: Math.min(limit, requestedTotal),
    exceedsLimit: requestedTotal > limit,
  };
}
