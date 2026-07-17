import type { PaymentOrderDetail } from '../types/payment.types';

/** Backend payment status tokens observed from PaymentService (`GET /order/{id}` + `/status`). */
export const PAYMENT_SUCCESS_STATUSES = ['PAID', 'SUCCESS', 'COMPLETED', 'SUCCEEDED'] as const;
export const PAYMENT_FAILED_STATUSES = ['FAILED', 'CANCELLED', 'CANCELED', 'EXPIRED'] as const;
export const PAYMENT_INCOMPLETE_STATUSES = ['PENDING', 'UNPAID', 'CREATED', 'PROCESSING'] as const;

export type PaymentOutcome = 'success' | 'failed' | 'incomplete' | 'unknown';

export function normalizePaymentStatusToken(status: string): string {
  return status.trim().toUpperCase();
}

/** Prefer `paymentStatus` from OrderResponse; fall back to `status` when absent. */
export function getOrderPaymentStatus(order: Pick<PaymentOrderDetail, 'paymentStatus' | 'status'>): string {
  return order.paymentStatus ?? order.status ?? '';
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
