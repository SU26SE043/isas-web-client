/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { parseOrderResponse, parseOrderStatus, toPaymentOrder, toPaymentOrderDetail } from './paymentOrder.parsers';
import { mapPaymentOrderFetchError } from './paymentOrder.parsers';
import { HttpStatus } from '@/shared/constants/http-status';
import axios from 'axios';

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
    expect(parseOrderStatus({ status: 2 })).toBe('2');
  });

  it('parses extended order detail fields', () => {
    const dto = parseOrderResponse({
      id: '11111111-1111-1111-1111-111111111111',
      packageId: '22222222-2222-2222-2222-222222222222',
      status: 'Paid',
      checkoutUrl: null,
      packageName: 'Starter',
      priceVnd: 99000,
      paymentStatus: 'Paid',
      orderStatus: 'Completed',
      paidAt: '2026-07-16T08:00:00Z',
      paymentMethod: 'PayOS',
      transactionId: 'txn-123',
    });

    expect(toPaymentOrderDetail(dto!)).toMatchObject({
      orderId: '11111111-1111-1111-1111-111111111111',
      paymentMethod: 'PayOS',
      transactionId: 'txn-123',
    });
  });

  it('maps fetch 404 to order not found', () => {
    const error = new axios.AxiosError('Not found', HttpStatus.NOT_FOUND.toString(), undefined, undefined, {
      status: HttpStatus.NOT_FOUND,
      data: {},
      statusText: 'Not Found',
      headers: {},
      config: {} as never,
    });

    expect(mapPaymentOrderFetchError(error, 'fallback').message).toBe('PAYMENT_ORDER_NOT_FOUND');
  });
});
