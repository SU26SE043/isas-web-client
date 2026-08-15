import { describe, expect, it } from 'vitest';
import { adminApiEndpoints } from './adminApi.endpoints';

describe('adminApiEndpoints', () => {
  it('uses the v10 gateway paths for Interview admin', () => {
    expect(adminApiEndpoints.prompts).toBe('/api/v1/interview/admin/prompts');
    expect(adminApiEndpoints.promptHistory('question generation')).toBe('/api/v1/interview/admin/prompts/question%20generation/history');
    expect(adminApiEndpoints.knowledgeReindex('source/1')).toBe('/api/v1/interview/admin/knowledge/source%2F1/reindex');
  });

  it('keeps Payment enum values in the request path as numeric values', () => {
    expect(adminApiEndpoints.creditAccount(0, 'org/1')).toBe('/api/v1/payment/admin/credits/0/org%2F1');
    expect(adminApiEndpoints.creditTransactions(1, 'user/1')).toBe('/api/v1/payment/admin/credits/1/user%2F1/transactions');
  });

  it('covers every Payment admin mutation family', () => {
    expect(adminApiEndpoints.refund('order-1')).toContain('/refund');
    expect(adminApiEndpoints.refundSettle('order-1')).toContain('/refund/settle');
    expect(adminApiEndpoints.refundPayout('order-1')).toContain('/refund/payout');
    expect(adminApiEndpoints.plans).toBe('/api/v1/payment/admin/plans');
  });
});
