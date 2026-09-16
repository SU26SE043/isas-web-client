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

// ── Bảng tra enum SỐ của Payment → khoá i18n (đợt D). Giá trị lạ → `admin.money.unknown`, KHÔNG in số thô. ──
const lookup = (table: Record<number, string>) => (value: number | null | undefined): string =>
  value === null || value === undefined ? 'admin.money.unknown' : table[value] ?? 'admin.money.unknown';

export const OWNER_TYPE_USER = 1;
export const ownerTypeKey = lookup({ 0: 'admin.money.owner.org', 1: 'admin.money.owner.user' });
/** `OrderStatus` bắt đầu từ 1 (Pending) — không có 0. */
export const orderStatusKey = lookup({ 1: 'admin.money.orderStatus.pending', 2: 'admin.money.orderStatus.paid', 3: 'admin.money.orderStatus.failed', 4: 'admin.money.orderStatus.expired', 5: 'admin.money.orderStatus.cancelled', 6: 'admin.money.orderStatus.refunded' });
export const ORDER_STATUS_REFUNDED = 6;
export const orderKindKey = lookup({ 0: 'admin.money.orderKind.creditPack', 1: 'admin.money.orderKind.invoiceSettlement', 2: 'admin.money.orderKind.subscriptionPurchase', 3: 'admin.money.orderKind.subscriptionRenewal' });
export const creditReasonKey = lookup({ 0: 'admin.money.reason.purchase', 1: 'admin.money.reason.consume', 2: 'admin.money.reason.refund', 3: 'admin.money.reason.freeGrant', 4: 'admin.money.reason.promoGrant' });
export const PLAN_AUDIENCE_B2C = 0;
export const PLAN_AUDIENCE_B2B = 1;
export const planAudienceKey = lookup({ 0: 'admin.money.audience.b2c', 1: 'admin.money.audience.b2b' });
export const INTERVIEW_FUNDING_METERED = 1;
export const interviewFundingKey = lookup({ 0: 'admin.money.funding.credit', 1: 'admin.money.funding.metered', 2: 'admin.money.funding.unlimited' });
export const PACKAGE_TYPE_ONE_TIME = 1;
export const PACKAGE_TYPE_SUBSCRIPTION = 2;
/** `PackageType` bắt đầu từ 1 (OneTime). */
export const packageTypeKey = lookup({ 1: 'admin.money.packageType.oneTime', 2: 'admin.money.packageType.subscription' });
export const subscriptionStatusKey = lookup({ 0: 'admin.money.subscriptionStatus.active', 1: 'admin.money.subscriptionStatus.expired', 2: 'admin.money.subscriptionStatus.cancelled' });
export const subscriptionSourceKey = lookup({ 0: 'admin.money.source.purchase', 1: 'admin.money.source.adminGrant' });
export const POSTPAID_ALERT_OVERDUE = 4;
/** `PostpaidAlertLevel` — vắng (BE cũ) ⇒ None; số càng lớn càng khẩn nên sort trực tiếp bằng `alertLevel ?? 0`. */
export const postpaidAlertKey = (level: number | null | undefined) => lookup({ 0: 'admin.money.alert.none', 1: 'admin.money.alert.approachingLimit', 2: 'admin.money.alert.invoiceIssued', 3: 'admin.money.alert.dueSoon', 4: 'admin.money.alert.overdue' })(level ?? 0);
export const refundSettlementKey = lookup({ 1: 'admin.money.refundSettlement.pending', 2: 'admin.money.refundSettlement.settled' });
/** `payoutStatus` là CHUỖI (`InFlight|Succeeded|Failed|null`) — khác mọi enum số ở trên. */
export function payoutStatusKey(status: string | null | undefined): string {
  switch (status) {
    case 'InFlight': return 'admin.money.payout.inFlight';
    case 'Succeeded': return 'admin.money.payout.succeeded';
    case 'Failed': return 'admin.money.payout.failed';
    default: return 'admin.money.payout.none';
  }
}
export function shortId(id: string): string { return id.length > 8 ? `${id.slice(0, 8)}…` : id; }
