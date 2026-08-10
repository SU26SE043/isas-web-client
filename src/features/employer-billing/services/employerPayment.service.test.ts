import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { employerPaymentService } from './employerPayment.service';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const transaction = {
  id: 'transaction-id',
  delta: 10,
  reason: 1,
  sessionId: null,
  orderId: 'order-id',
  reversesTransactionId: null,
  createdAt: '2026-07-28T05:00:00Z',
};

describe('employerPaymentService.getCreditTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes the direct array response and reads the lowercase cursor header', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [transaction],
      headers: { 'x-next-cursor': 'next-cursor' },
    });

    await expect(
      employerPaymentService.getCreditTransactions({ cursor: null, limit: 5 }),
    ).resolves.toEqual({
      items: [transaction],
      nextCursor: 'next-cursor',
    });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/payment/me/credit-transactions',
      { params: { limit: 5 } },
    );
  });

  it('treats a 200 empty array as a valid empty page', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [],
      headers: {},
    });

    await expect(
      employerPaymentService.getCreditTransactions({ limit: 5 }),
    ).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
  });
});
