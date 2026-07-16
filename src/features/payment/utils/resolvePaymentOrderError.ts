import { getApiErrorMessage } from '@/shared/api/apiError';

export type PaymentOrderErrorKind = 'not-found' | 'forbidden' | 'generic';

export function classifyPaymentOrderError(error: unknown): PaymentOrderErrorKind {
  if (error instanceof Error) {
    if (error.message === 'PAYMENT_ORDER_NOT_FOUND') return 'not-found';
    if (error.message === 'PAYMENT_FORBIDDEN') return 'forbidden';
  }
  return 'generic';
}

export function resolvePaymentOrderErrorMessage(
  error: unknown,
  t: (key: string) => string,
): string {
  const kind = classifyPaymentOrderError(error);
  if (kind === 'not-found') return t('payment.result.orderNotFound');
  if (kind === 'forbidden') return t('payment.result.orderForbidden');
  return getApiErrorMessage(error, t('payment.result.loadError'));
}
