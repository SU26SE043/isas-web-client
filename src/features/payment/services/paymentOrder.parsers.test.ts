/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { parseOrderResponse, parseOrderStatus, toPaymentOrder } from './paymentOrder.parsers';

describe('paymentOrder parsers', () => {
  it('parses create-order response with checkoutUrl', () => {
    const dto = parseOrderResponse({
      id: '11111111-1111-1111-1111-111111111111',
      packageId: '22222222-2222-2222-2222-222222222222',
      status: 'Pending',
      checkoutUrl: 'https://pay.payos.vn/web/abc',
      interviewCredits: 5,
      priceVnd: 2000,
    });

    expect(dto).toMatchObject({
      id: '11111111-1111-1111-1111-111111111111',
      checkoutUrl: 'https://pay.payos.vn/web/abc',
    });
    expect(toPaymentOrder(dto!).checkoutUrl).toBe('https://pay.payos.vn/web/abc');
  });

  it('parses order status string body', () => {
    expect(parseOrderStatus('Paid')).toBe('Paid');
    expect(parseOrderStatus({ status: 'Pending' })).toBe('Pending');
  });
});
