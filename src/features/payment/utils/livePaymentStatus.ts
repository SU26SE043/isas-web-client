/** Backend status strings from GET /order/{id}/status — keep as-is (PascalCase). */
export type LivePaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Expired' | 'Cancelled' | string;

export function normalizeLivePaymentStatus(status: string): string {
  const trimmed = status.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (lower === 'canceled') return 'Cancelled';
  if (lower === 'pending') return 'Pending';
  if (lower === 'paid') return 'Paid';
  if (lower === 'failed') return 'Failed';
  if (lower === 'expired') return 'Expired';
  if (lower === 'cancelled') return 'Cancelled';
  return trimmed;
}

export function livePaymentStatusLabelKey(status: string): string {
  switch (normalizeLivePaymentStatus(status)) {
    case 'Pending':
      return 'payment.orders.statusPending';
    case 'Paid':
      return 'payment.orders.statusPaid';
    case 'Failed':
      return 'payment.orders.statusFailed';
    case 'Expired':
      return 'payment.orders.statusExpired';
    case 'Cancelled':
      return 'payment.orders.statusCancelled';
    default:
      return 'payment.orders.statusUnknown';
  }
}

export function isLivePendingStatus(status: string): boolean {
  return normalizeLivePaymentStatus(status) === 'Pending';
}

export function getLiveStatusBadgeClass(status: string): string {
  const normalized = normalizeLivePaymentStatus(status);
  if (normalized === 'Paid') return 'border-success/30 bg-success-bg text-success';
  if (normalized === 'Failed' || normalized === 'Expired') {
    return 'border-error/30 bg-error-bg text-error';
  }
  if (normalized === 'Pending' || normalized === 'Cancelled') {
    return 'border-warning/30 bg-warning-bg text-warning';
  }
  return 'border-subtle bg-surface-overlay text-foreground';
}
