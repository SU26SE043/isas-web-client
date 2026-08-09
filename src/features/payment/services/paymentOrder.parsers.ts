import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { HttpStatus } from '@/shared/constants/http-status';
import type {
  OrderResponse,
  PaymentOrder,
  PaymentOrderDetail,
  PaymentOrderStatus,
  PaymentOrderStatusResult,
} from '../types/payment.types';

function toInt(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toNullableInt(value: unknown): number | null {
  if (value == null || value === '') return null;
  const parsed = toInt(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function pickString(record: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

function unwrapPayload(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const hasOrderKeys = 'id' in record || 'orderId' in record || 'packageId' in record;
  if ('data' in record && !hasOrderKeys) {
    const inner = record.data;
    if (inner && typeof inner === 'object') return inner as Record<string, unknown>;
  }
  return record;
}

export function unwrapOrderList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const nested = (raw as { data: unknown }).data;
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

export function normalizeOrderStatus(status: string): PaymentOrderStatus {
  const lower = status.trim().toLowerCase();
  if (lower === 'paid') return 'paid';
  if (lower === 'failed') return 'failed';
  if (lower === 'cancelled' || lower === 'canceled') return 'cancelled';
  return 'pending';
}

export function parseOrderResponse(raw: unknown): OrderResponse | null {
  const data = unwrapPayload(raw);
  if (!data) return null;

  const id = pickString(data, 'id', 'orderId', 'Id', 'OrderId');
  const packageId = pickString(data, 'packageId', 'PackageId');
  if (!id || !packageId) return null;

  const checkoutUrlRaw = data.checkoutUrl ?? data.CheckoutUrl;
  const checkoutUrl =
    typeof checkoutUrlRaw === 'string' && checkoutUrlRaw.length > 0 ? checkoutUrlRaw : null;

  return {
    id,
    ownerType: toInt(data.ownerType ?? data.OwnerType, 0) as 0 | 1,
    ownerId: pickString(data, 'ownerId', 'OwnerId'),
    kind: toInt(data.kind ?? data.Kind, 0) as 0 | 1 | 2 | 3,
    invoiceId: pickString(data, 'invoiceId', 'InvoiceId') ?? null,
    amountVnd: toInt(data.amountVnd ?? data.AmountVnd, 0),
    payosOrderCode: toInt(data.payosOrderCode ?? data.PayOSOrderCode, 0),
    expiredAt: pickString(data, 'expiredAt', 'ExpiredAt'),
    packageId,
    status: typeof (data.status ?? data.Status) === 'number' ? String(data.status ?? data.Status) : (pickString(data, 'status', 'Status') ?? 'Pending'),
    checkoutUrl,
    packageName: pickString(data, 'packageName', 'PackageName'),
    priceVnd: toInt(data.priceVnd ?? data.PriceVnd, 0) || undefined,
    interviewCredits: toNullableInt(data.interviewCredits ?? data.InterviewCredits),
    createdAt: pickString(data, 'createdAt', 'CreatedAt'),
    paymentStatus: pickString(data, 'paymentStatus', 'PaymentStatus'),
    orderStatus: pickString(data, 'orderStatus', 'OrderStatus'),
    paidAt: pickString(data, 'paidAt', 'PaidAt'),
    paymentMethod: pickString(data, 'paymentMethod', 'PaymentMethod'),
    transactionId: pickString(data, 'transactionId', 'TransactionId'),
    failureReason: pickString(data, 'failureReason', 'FailureReason'),
  };
}

export function toPaymentOrderDetail(dto: OrderResponse): PaymentOrderDetail {
  return {
    orderId: dto.id,
    packageId: dto.packageId,
    packageName: dto.packageName,
    status: dto.status,
    paymentStatus: dto.paymentStatus,
    orderStatus: dto.orderStatus,
    priceVnd: dto.priceVnd,
    interviewCredits: dto.interviewCredits,
    createdAt: dto.createdAt,
    paidAt: dto.paidAt,
    paymentMethod: dto.paymentMethod,
    transactionId: dto.transactionId,
    failureReason: dto.failureReason,
    checkoutUrl: dto.checkoutUrl,
    ownerType: dto.ownerType,
    ownerId: dto.ownerId,
    kind: dto.kind,
    invoiceId: dto.invoiceId,
    amountVnd: dto.amountVnd,
    payosOrderCode: dto.payosOrderCode,
    expiredAt: dto.expiredAt,
  };
}

export function toPaymentOrder(dto: OrderResponse): PaymentOrder {
  return {
    orderId: dto.id,
    packageId: dto.packageId,
    packageName: dto.packageName ?? dto.packageId,
    packageNameVi: dto.packageName ?? dto.packageId,
    tokens: dto.interviewCredits ?? 0,
    amountUsd: 0,
    priceVnd: dto.priceVnd,
    status: normalizeOrderStatus(dto.status),
    checkoutUrl: dto.checkoutUrl,
    createdAt: dto.createdAt ?? new Date().toISOString(),
  };
}

export function parseOrderStatus(raw: unknown): string {
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    const inner = unwrapPayload(raw);
    const status = pickString(inner ?? record, 'status', 'Status');
    if (status) return status;
  }
  return '';
}

export function parseOrderStatusResult(raw: unknown): PaymentOrderStatusResult {
  const data = unwrapPayload(raw);
  if (!data) {
    throw new Error('INVALID_ORDER_STATUS_RESPONSE');
  }

  return {
    orderCode: toInt(data.orderCode ?? data.OrderCode),
    status: pickString(data, 'status', 'Status') ?? '',
    paidAt: pickString(data, 'paidAt', 'PaidAt') ?? null,
  };
}

export function mapPaymentOrderError(error: unknown, fallback: string): Error {
  const status = getApiStatusCode(error);
  const message = getApiErrorMessage(error, fallback);

  if (status === HttpStatus.FORBIDDEN) {
    return new Error('PAYMENT_FORBIDDEN');
  }
  if (status === HttpStatus.NOT_FOUND) {
    return new Error('PAYMENT_PACKAGE_NOT_FOUND');
  }
  if (status === HttpStatus.BAD_REQUEST) {
    return new Error('PAYMENT_PACKAGE_INACTIVE');
  }
  if (status === HttpStatus.BAD_GATEWAY) {
    return new Error('PAYMENT_GATEWAY_ERROR');
  }

  return new Error(message || fallback);
}

export function mapPaymentOrderFetchError(error: unknown, fallback: string): Error {
  const status = getApiStatusCode(error);
  const message = getApiErrorMessage(error, fallback);

  if (status === HttpStatus.FORBIDDEN) {
    return new Error('PAYMENT_FORBIDDEN');
  }
  if (status === HttpStatus.NOT_FOUND) {
    return new Error('PAYMENT_ORDER_NOT_FOUND');
  }

  return new Error(message || fallback);
}

export function mapPaymentOrderCancelError(error: unknown, fallback: string): Error {
  const status = getApiStatusCode(error);
  const message = getApiErrorMessage(error, fallback);

  if (status === HttpStatus.FORBIDDEN) {
    return new Error('PAYMENT_FORBIDDEN');
  }
  if (status === HttpStatus.NOT_FOUND) {
    return new Error('PAYMENT_ORDER_NOT_FOUND');
  }
  if (status === HttpStatus.BAD_REQUEST) {
    return new Error('PAYMENT_ORDER_NOT_PENDING');
  }

  return new Error(message || fallback);
}
