import { Ban, CheckCircle2, Clock3, XCircle, type LucideIcon } from 'lucide-react';
import { normalizeLivePaymentStatus } from './livePaymentStatus';

export function getOrderStatusVisual(status: string): {
  icon: LucideIcon;
  iconWrap: string;
  hintKey:
    | 'payment.orders.hintPending'
    | 'payment.orders.hintPaid'
    | 'payment.orders.hintFailed'
    | 'payment.orders.hintExpired'
    | 'payment.orders.hintCancelled';
} {
  const normalized = normalizeLivePaymentStatus(status);
  if (normalized === 'Paid') {
    return {
      icon: CheckCircle2,
      iconWrap: 'bg-success/15 text-success',
      hintKey: 'payment.orders.hintPaid',
    };
  }
  if (normalized === 'Failed') {
    return {
      icon: XCircle,
      iconWrap: 'bg-error/15 text-error',
      hintKey: 'payment.orders.hintFailed',
    };
  }
  if (normalized === 'Expired') {
    return {
      icon: XCircle,
      iconWrap: 'bg-error/15 text-error',
      hintKey: 'payment.orders.hintExpired',
    };
  }
  if (normalized === 'Cancelled') {
    return {
      icon: Ban,
      iconWrap: 'bg-warning/15 text-warning',
      hintKey: 'payment.orders.hintCancelled',
    };
  }
  return {
    icon: Clock3,
    iconWrap: 'bg-warning/15 text-warning',
    hintKey: 'payment.orders.hintPending',
  };
}
