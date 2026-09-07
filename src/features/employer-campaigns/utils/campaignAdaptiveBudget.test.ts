import { describe, expect, it } from 'vitest';
import {
  calculateAdaptiveQuestionBudget,
  CAMPAIGN_ADAPTIVE_QUESTION_LIMIT,
} from './campaignAdaptiveBudget';

describe('calculateAdaptiveQuestionBudget', () => {
  it('keeps a static interview at its base count', () => {
    expect(calculateAdaptiveQuestionBudget(5, 3, false)).toMatchObject({
      requestedTotal: 5,
      effectiveTotal: 5,
      exceedsLimit: false,
    });
  });

  it('calculates five questions at depth two as fifteen', () => {
    expect(calculateAdaptiveQuestionBudget(5, 2, true).requestedTotal).toBe(15);
  });

  it('flags six questions at depth three as over the limit', () => {
    expect(calculateAdaptiveQuestionBudget(6, 3, true)).toMatchObject({
      requestedTotal: 24,
      effectiveTotal: CAMPAIGN_ADAPTIVE_QUESTION_LIMIT,
      exceedsLimit: true,
    });
  });

  it('shows only the number when adaptive depth is zero', () => {
    expect(calculateAdaptiveQuestionBudget(5, 0, true).requestedTotal).toBe(5);
  });

  it('normalizes invalid negative inputs before calculating', () => {
    expect(calculateAdaptiveQuestionBudget(-2, -3, true)).toMatchObject({
      baseQuestionCount: 0,
      maxDeepPerQuestion: 0,
      requestedTotal: 0,
    });
  });
});
