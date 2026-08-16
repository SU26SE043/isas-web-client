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

/**
 * Khoá i18n cho lỗi khi bấm "Thanh toán" một hoá đơn.
 *
 * `POST /invoices/{id}/pay` nay trả **409** ở hai tình huống: hoá đơn không còn thanh toán được
 * (đã Paid/Void) và — mới từ PP6 — đã có một đơn PayOS còn sống cho chính hoá đơn này. Trước PP6
 * lần bấm thứ hai đẻ ra link PayOS **thứ hai cho cùng khoản tiền**; server chặn là đúng, nhưng
 * mutation phía này không có `onError` nên nút trở thành **bấm-không-có-gì-xảy-ra**.
 *
 * Gộp chung một câu cho cả hai nhánh 409 là CỐ Ý: phân biệt chúng chỉ làm được bằng cách khớp
 * chuỗi tiếng Anh trong body hoặc dò sự có mặt của `order` — cả hai đều vỡ âm thầm khi server đổi
 * câu chữ, mà hành động người dùng cần làm thì giống nhau: tải lại để xem trạng thái thật.
 * Server KHÔNG trả lại link cũ (`checkoutUrl = null` — PayOS không cấp lại), nên không có gì để
 * redirect tới.
 */
export function getPayInvoiceErrorKey(status: number | undefined): string {
  if (status === 409) return 'employerBilling.invoices.errors.conflict';
  if (status === 502) return 'employerBilling.errors.gateway';
  return 'employerBilling.invoices.errors.payFailed';
}
