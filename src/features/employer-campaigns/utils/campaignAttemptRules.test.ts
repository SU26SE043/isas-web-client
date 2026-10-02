import { describe, expect, it } from 'vitest';
import {
  CAMPAIGN_DEFAULT_MAX_ATTEMPTS,
  CAMPAIGN_MAX_ATTEMPT_OPTIONS,
  estimateCampaignSitting,
  isValidCampaignTimeLimit,
} from './campaignAttemptRules';

/**
 * ATT1-F1 — luật làm bài: biên thời lượng [5,180] khớp hợp đồng [C1]/[C4], số lần 1–3 mặc định 1,
 * và ước tính ceil(K × (1 + d) × 2) — K/d phải là ĐẦU VÀO thật, không phải hằng.
 */
describe('isValidCampaignTimeLimit — biên [5,180] số nguyên', () => {
  it.each([5, 6, 30, 179, 180])('%s phút ⇒ hợp lệ', (value) => {
    expect(isValidCampaignTimeLimit(value)).toBe(true);
  });

  it.each([4, 181, 0, -5, 30.5, Number.NaN, Number.POSITIVE_INFINITY])('%s ⇒ không hợp lệ', (value) => {
    expect(isValidCampaignTimeLimit(value)).toBe(false);
  });

  it('không phải số (chuỗi "30", null, undefined) ⇒ không hợp lệ', () => {
    expect(isValidCampaignTimeLimit('30')).toBe(false);
    expect(isValidCampaignTimeLimit(null)).toBe(false);
    expect(isValidCampaignTimeLimit(undefined)).toBe(false);
  });
});

describe('số lần làm bài', () => {
  it('chỉ cho chọn 1 / 2 / 3, mặc định 1 ([C1] vắng = 1)', () => {
    expect([...CAMPAIGN_MAX_ATTEMPT_OPTIONS]).toEqual([1, 2, 3]);
    expect(CAMPAIGN_DEFAULT_MAX_ATTEMPTS).toBe(1);
  });
});

describe('estimateCampaignSitting — ceil(K × (1 + d) × 2)', () => {
  it('adaptive TẮT ⇒ d = 0 dù maxDeepPerQuestion còn giá trị cũ: 5 câu ⇒ 10 phút', () => {
    expect(estimateCampaignSitting(5, false, 3)).toEqual({ minutes: 10, baseQuestionCount: 5, depth: 0 });
  });

  it('adaptive BẬT ⇒ d = maxDeepPerQuestion: 5 câu × (1 + 2) × 2 = 30 phút', () => {
    expect(estimateCampaignSitting(5, true, 2)).toEqual({ minutes: 30, baseQuestionCount: 5, depth: 2 });
  });

  it('bật adaptive làm ước tính ĐỔI (cùng K)', () => {
    expect(estimateCampaignSitting(4, true, 3).minutes).toBe(32);
    expect(estimateCampaignSitting(4, false, 3).minutes).toBe(8);
  });

  it('đổi K làm ước tính ĐỔI (cùng d)', () => {
    expect(estimateCampaignSitting(3, true, 1).minutes).toBe(12);
    expect(estimateCampaignSitting(8, true, 1).minutes).toBe(32);
  });

  it('K không hợp lệ / âm ⇒ 0; d vắng khi bật adaptive ⇒ 0', () => {
    expect(estimateCampaignSitting(Number.NaN, true, 2).minutes).toBe(0);
    expect(estimateCampaignSitting(-3, true, 2).minutes).toBe(0);
    expect(estimateCampaignSitting(6, true, undefined)).toEqual({ minutes: 12, baseQuestionCount: 6, depth: 0 });
  });
});
