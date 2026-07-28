import {
  PaymentPackageType,
  PaymentOrderStatus,
  type CreateOrderRequest,
  type OrderStatusText,
} from '../types/employerPayment.types';
import { UserRole, type UserRoleType } from '@/features/auth/types/auth.types';

export const PENDING_ORDER_ID_KEY = 'pendingPaymentOrderId';
export const PENDING_PACKAGE_ID_KEY = 'pendingPaymentPackageId';
export const PENDING_PACKAGE_TYPE_KEY = 'pendingPaymentPackageType';

export function formatVnd(value: number, locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(value: string | null | undefined, locale = 'vi-VN'): string {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function formatCreditDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

export function isTerminalStatus(status: OrderStatusText): boolean {
  return status !== 'Pending';
}

export function statusTextFromEnum(status: PaymentOrderStatus): OrderStatusText {
  switch (status) {
    case PaymentOrderStatus.Paid:
      return 'Paid';
    case PaymentOrderStatus.Failed:
      return 'Failed';
    case PaymentOrderStatus.Expired:
      return 'Expired';
    case PaymentOrderStatus.Cancelled:
      return 'Cancelled';
    case PaymentOrderStatus.Refunded:
      return 'Refunded';
    default:
      return 'Pending';
  }
}

export function resolveCallbackOrderId(search: URLSearchParams): string | null {
  const queryId = search.get('orderId')?.trim() || search.get('id')?.trim();
  if (queryId) return queryId;
  return sessionStorage.getItem(PENDING_ORDER_ID_KEY);
}

export function clearPendingPayment(): void {
  sessionStorage.removeItem(PENDING_ORDER_ID_KEY);
  sessionStorage.removeItem(PENDING_PACKAGE_ID_KEY);
  sessionStorage.removeItem(PENDING_PACKAGE_TYPE_KEY);
}

export function buildCreateOrderRequest(packageId: string, origin: string): CreateOrderRequest {
  return {
    packageId,
    returnUrl: `${origin}/employer/payment/success`,
    cancelUrl: `${origin}/employer/payment/cancel`,
  };
}

export function persistPendingPayment(
  orderId: string,
  packageId: string,
  packageType: PaymentPackageType,
): void {
  sessionStorage.setItem(PENDING_ORDER_ID_KEY, orderId);
  sessionStorage.setItem(PENDING_PACKAGE_ID_KEY, packageId);
  sessionStorage.setItem(PENDING_PACKAGE_TYPE_KEY, String(packageType));
}

export function truncateId(value: string): string {
  return value.length <= 12 ? value : `${value.slice(0, 8)}…${value.slice(-4)}`;
}

export function canManageEmployerPayment(role: UserRoleType | null | undefined): boolean {
  return role === UserRole.ORG_ADMIN || role === UserRole.ADMIN;
}
