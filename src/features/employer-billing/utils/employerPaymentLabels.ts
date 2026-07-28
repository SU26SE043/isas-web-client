import {
  PaymentOrderKind,
  type OrderStatusText,
} from '../types/employerPayment.types';

export function statusLabelKey(status: OrderStatusText): string {
  return `employerBilling.status.${status.toLowerCase()}`;
}

export function orderKindLabelKey(kind: PaymentOrderKind): string {
  switch (kind) {
    case PaymentOrderKind.CreditPack:
      return 'employerBilling.orders.creditPack';
    case PaymentOrderKind.InvoiceSettlement:
      return 'employerBilling.orders.invoice';
    case PaymentOrderKind.SubscriptionPurchase:
      return 'employerBilling.orders.subscriptionPurchase';
    case PaymentOrderKind.SubscriptionRenewal:
      return 'employerBilling.orders.subscriptionRenewal';
    default:
      return 'employerBilling.orders.packageFallback';
  }
}

export function transactionReasonLabelKey(reason: number): string {
  switch (reason) {
    case 0:
    case 1:
      return 'employerBilling.transactions.purchase';
    case 2:
    case 3:
      return 'employerBilling.transactions.usage';
    case 4:
      return 'employerBilling.transactions.refund';
    case 5:
      return 'employerBilling.transactions.grant';
    default:
      return 'employerBilling.transactions.generic';
  }
}

export function statusBadgeClass(status: OrderStatusText): string {
  if (status === 'Paid') return 'border-success/30 bg-success-bg text-success';
  if (status === 'Pending') return 'border-warning/30 bg-warning-bg text-warning';
  if (status === 'Refunded') return 'border-info/30 bg-info-bg text-info';
  return 'border-error/30 bg-error-bg text-error';
}

