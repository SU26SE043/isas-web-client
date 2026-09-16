/** Bảng tra enum SỐ của PaymentService → khoá i18n. Payment không dùng JsonStringEnumConverter. */
export const OWNER_TYPE_ORG = 0;
export const PAYMENT_MODE_PREPAID = 0;
export const PAYMENT_MODE_POSTPAID = 1;

export function paymentModeKey(mode: number): string {
  return mode === PAYMENT_MODE_POSTPAID ? 'admin.billing.postpaid' : 'admin.billing.prepaid';
}
export function accountStatusKey(status: number): string {
  return status === 1 ? 'admin.billing.wallet.suspended' : 'admin.billing.wallet.active';
}
export function invoiceStatusKey(status: number): string {
  return ['admin.billing.invoice.status.issued', 'admin.billing.invoice.status.paid', 'admin.billing.invoice.status.overdue', 'admin.billing.invoice.status.void'][status] ?? 'admin.billing.invoice.status.unknown';
}

/** Mã lỗi `adminPaymentService.setPaymentMode` ném TRƯỚC khi gọi mạng (không phải AxiosError ⇒ `getApiErrorMessage` không đọc được). */
export const PAYMENT_MODE_CLIENT_ERRORS: Record<string, string> = {
  PAYMENT_MODE_ORG_ONLY: 'admin.billing.error.orgOnly',
  OWNER_ID_REQUIRED: 'admin.billing.orgRequired',
  PAYMENT_MODE_NOTE_REQUIRED: 'admin.billing.error.noteRequired',
  CREDIT_LIMIT_REQUIRED: 'admin.billing.error.creditLimitRequired',
};

export function isGuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
}

export function formatVnd(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}
