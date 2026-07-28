import {
  PaymentAccountStatus,
  PaymentMode,
  PaymentOrderKind,
  PaymentOrderStatus,
  PaymentOwnerType,
  PaymentPackageType,
  type CreditTransactionResponse,
  type OrderResponse,
  type OrderStatusResponse,
  type OrderStatusText,
  type PackageResponse,
  type PaymentAccountResponse,
  type SubscriptionResponse,
} from '../types/employerPayment.types';

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('INVALID_PAYMENT_RESPONSE');
  }
  const raw = value as Record<string, unknown>;
  const nested = raw.data;
  return nested && typeof nested === 'object' && !Array.isArray(nested)
    ? (nested as Record<string, unknown>)
    : raw;
}

export function unwrapList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  const raw = value as Record<string, unknown>;
  if (Array.isArray(raw.data)) return raw.data;
  if (raw.data && typeof raw.data === 'object') {
    const nested = raw.data as Record<string, unknown>;
    if (Array.isArray(nested.items)) return nested.items;
  }
  if (Array.isArray(raw.items)) return raw.items;
  return [];
}

const text = (value: unknown) => (value == null ? '' : String(value));
const number = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error('INVALID_PAYMENT_RESPONSE');
  return parsed;
};
const nullableNumber = (value: unknown) => (value == null ? null : number(value));
const nullableText = (value: unknown) => (value == null || value === '' ? null : String(value));

export function parsePackage(value: unknown): PackageResponse {
  const raw = record(value);
  return {
    id: text(raw.id),
    name: text(raw.name),
    type: number(raw.type) as PaymentPackageType,
    priceVnd: number(raw.priceVnd),
    interviewCredits: nullableNumber(raw.interviewCredits),
    durationDays: nullableNumber(raw.durationDays),
    isActive: raw.isActive !== false,
    createdAt: text(raw.createdAt),
  };
}

export function parseOrder(value: unknown): OrderResponse {
  const raw = record(value);
  return {
    id: text(raw.id),
    ownerType: number(raw.ownerType) as PaymentOwnerType,
    ownerId: text(raw.ownerId),
    kind: number(raw.kind) as PaymentOrderKind,
    packageId: nullableText(raw.packageId),
    invoiceId: nullableText(raw.invoiceId),
    status: number(raw.status) as PaymentOrderStatus,
    amountVnd: number(raw.amountVnd),
    payosOrderCode: number(raw.payosOrderCode),
    expiredAt: text(raw.expiredAt),
    paidAt: nullableText(raw.paidAt),
    createdAt: text(raw.createdAt),
    checkoutUrl: nullableText(raw.checkoutUrl),
  };
}

const STATUS_TEXTS = new Set<OrderStatusText>([
  'Pending',
  'Paid',
  'Failed',
  'Expired',
  'Cancelled',
  'Refunded',
]);

export function parseOrderStatus(value: unknown): OrderStatusResponse {
  const raw = record(value);
  const status = text(raw.status) as OrderStatusText;
  if (!STATUS_TEXTS.has(status)) throw new Error('INVALID_PAYMENT_RESPONSE');
  return {
    orderCode: number(raw.orderCode),
    status,
    paidAt: nullableText(raw.paidAt),
  };
}

export function parseAccount(value: unknown): PaymentAccountResponse {
  const raw = record(value);
  return {
    ownerType: number(raw.ownerType) as PaymentOwnerType,
    ownerId: text(raw.ownerId),
    paymentMode: number(raw.paymentMode) as PaymentMode,
    status: number(raw.status) as PaymentAccountStatus,
    remainingCredits: number(raw.remainingCredits),
    reservedCredits: number(raw.reservedCredits),
    creditLimit: nullableNumber(raw.creditLimit),
    periodUsage: nullableNumber(raw.periodUsage),
    updatedAt: text(raw.updatedAt),
  };
}

export function parseTransaction(value: unknown): CreditTransactionResponse {
  const raw = record(value);
  return {
    id: text(raw.id),
    ownerType: number(raw.ownerType) as PaymentOwnerType,
    ownerId: text(raw.ownerId),
    delta: number(raw.delta),
    reason: number(raw.reason),
    sessionId: nullableText(raw.sessionId),
    orderId: nullableText(raw.orderId),
    createdAt: text(raw.createdAt),
  };
}

export function parseSubscription(value: unknown): SubscriptionResponse {
  const raw = record(value);
  const cycle = nullableText(raw.billingCycle);
  if (cycle !== null && cycle !== 'Monthly' && cycle !== 'Annual') {
    throw new Error('INVALID_PAYMENT_RESPONSE');
  }
  return {
    ownerType: number(raw.ownerType) as PaymentOwnerType,
    ownerId: text(raw.ownerId),
    active: raw.active === true,
    billingCycle: cycle,
    startedAt: nullableText(raw.startedAt),
    expiresAt: nullableText(raw.expiresAt),
  };
}

export function readNextCursor(headers: unknown): string | null {
  if (!headers || typeof headers !== 'object') return null;
  const source = headers as Record<string, unknown> & { get?: (key: string) => unknown };
  const value =
    typeof source.get === 'function'
      ? source.get('x-next-cursor') ?? source.get('X-Next-Cursor')
      : source['x-next-cursor'] ?? source['X-Next-Cursor'];
  return typeof value === 'string' && value.trim() ? value : null;
}

