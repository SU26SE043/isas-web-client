import type { PaymentOrderDetail } from '../types/payment.types';

/** Backend payment status tokens observed from PaymentService (`GET /order/{id}` + `/status`). */
export const PAYMENT_SUCCESS_STATUSES = ['PAID', 'SUCCESS', 'COMPLETED', 'SUCCEEDED'] as const;
export const PAYMENT_FAILED_STATUSES = ['FAILED', 'CANCELLED', 'CANCELED', 'EXPIRED', 'REFUNDED'] as const;
export const PAYMENT_INCOMPLETE_STATUSES = ['PENDING', 'UNPAID', 'CREATED', 'PROCESSING'] as const;

export type PaymentOutcome = 'success' | 'failed' | 'incomplete' | 'unknown';

export function normalizePaymentStatusToken(status: string): string {
  const token = status.trim().toUpperCase();
  // PaymentService serializes its PaymentOrderStatus enum as numbers.
  // 1 = Pending, 2 = Paid, 3 = Failed, 4 = Expired, 5 = Cancelled, 6 = Refunded.
  return ({
    '1': 'PENDING',
    '2': 'PAID',
    '3': 'FAILED',
    '4': 'EXPIRED',
    '5': 'CANCELLED',
    '6': 'REFUNDED',
  } as Record<string, string>)[token] ?? token;
}

export function getOrderPaymentStatus(order: Pick<PaymentOrderDetail, 'status' | 'paymentStatus'>): string {
  // The live contract has one status; the fallback keeps legacy preview data readable.
  return order.status ?? order.paymentStatus ?? '';
}

export function resolvePaymentOutcome(status: string): PaymentOutcome {
  const token = normalizePaymentStatusToken(status);
  if (!token) return 'unknown';

  if ((PAYMENT_SUCCESS_STATUSES as readonly string[]).includes(token)) {
    return 'success';
  }
  if ((PAYMENT_FAILED_STATUSES as readonly string[]).includes(token)) {
    return 'failed';
  }
  if ((PAYMENT_INCOMPLETE_STATUSES as readonly string[]).includes(token)) {
    return 'incomplete';
  }

  return 'unknown';
}

export function isPaymentSuccessStatus(status: string): boolean {
  return resolvePaymentOutcome(status) === 'success';
}

export function isPaymentTerminalStatus(status: string): boolean {
  const outcome = resolvePaymentOutcome(status);
  return outcome === 'success' || outcome === 'failed';
}
