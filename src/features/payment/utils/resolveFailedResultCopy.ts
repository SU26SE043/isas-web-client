import type { PaymentOrderDetail } from '../types/payment.types';
import {
  getOrderPaymentStatus,
  normalizePaymentStatusToken,
  resolvePaymentOutcome,
} from './paymentOrderOutcome';

interface FailedResultCopy {
  titleKey: string;
  descriptionKey: string;
  reason?: string;
}

export function resolveFailedResultCopy(order: PaymentOrderDetail): FailedResultCopy {
  const statusToken = normalizePaymentStatusToken(getOrderPaymentStatus(order));
  const outcome = resolvePaymentOutcome(getOrderPaymentStatus(order));

  if (outcome === 'incomplete') {
    return {
      titleKey: 'payment.result.incompleteTitle',
      descriptionKey: 'payment.result.incompleteDescription',
    };
  }

  if (statusToken === 'CANCELLED' || statusToken === 'CANCELED') {
    return {
      titleKey: 'payment.result.incompleteTitle',
      descriptionKey: 'payment.result.cancelledDescription',
    };
  }

  return {
    titleKey: 'payment.result.failedTitle',
    descriptionKey: 'payment.result.failedDescription',
    reason: order.failureReason ? order.failureReason : undefined,
  };
}

export function translateFailedResultCopy(
  copy: FailedResultCopy,
  t: (key: string) => string,
): { title: string; description: string; reason?: string } {
  return {
    title: t(copy.titleKey),
    description: t(copy.descriptionKey),
    reason: copy.reason,
  };
}
