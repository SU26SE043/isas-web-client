export const PaymentOwnerType = { Organization: 0, User: 1 } as const;
export type PaymentOwnerType = (typeof PaymentOwnerType)[keyof typeof PaymentOwnerType];

export const PaymentOrderKind = {
  CreditPack: 0,
  InvoiceSettlement: 1,
  SubscriptionPurchase: 2,
  SubscriptionRenewal: 3,
} as const;
export type PaymentOrderKind = (typeof PaymentOrderKind)[keyof typeof PaymentOrderKind];

export const PaymentOrderStatus = {
  Pending: 1,
  Paid: 2,
  Failed: 3,
  Expired: 4,
  Cancelled: 5,
  Refunded: 6,
} as const;
export type PaymentOrderStatus = (typeof PaymentOrderStatus)[keyof typeof PaymentOrderStatus];

export const PaymentMode = { Prepaid: 0, Postpaid: 1 } as const;
export type PaymentMode = (typeof PaymentMode)[keyof typeof PaymentMode];

export const PaymentAccountStatus = { Active: 0, Suspended: 1 } as const;
export type PaymentAccountStatus = (typeof PaymentAccountStatus)[keyof typeof PaymentAccountStatus];

export const PaymentPackageType = { OneTime: 1, Subscription: 2 } as const;
export type PaymentPackageType = (typeof PaymentPackageType)[keyof typeof PaymentPackageType];

export type OrderStatusText =
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Expired'
  | 'Cancelled'
  | 'Refunded';

export interface OrderResponse {
  id: string;
  ownerType: PaymentOwnerType;
  ownerId: string;
  kind: PaymentOrderKind;
  packageId: string | null;
  invoiceId: string | null;
  status: PaymentOrderStatus;
  amountVnd: number;
  payosOrderCode: number;
  expiredAt: string;
  paidAt: string | null;
  createdAt: string;
  checkoutUrl: string | null;
}

export interface CreateOrderRequest {
  packageId: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface OrderStatusResponse {
  orderCode: number;
  status: OrderStatusText;
  paidAt: string | null;
}

export interface PaymentAccountResponse {
  ownerType: PaymentOwnerType;
  ownerId: string;
  paymentMode: PaymentMode;
  status: PaymentAccountStatus;
  remainingCredits: number;
  reservedCredits: number;
  freeCreditsGranted?: number;
  creditLimit: number | null;
  periodUsage: number | null;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  /** @deprecated v10 derives ownership from JWT and omits these fields. */
  ownerType?: PaymentOwnerType;
  /** @deprecated v10 derives ownership from JWT and omits these fields. */
  ownerId?: string;
  delta: number;
  reason: number;
  sessionId: string | null;
  orderId: string | null;
  reversesTransactionId?: string | null;
  createdAt: string;
}

export interface CreditTransactionPage {
  items: CreditTransaction[];
  nextCursor: string | null;
}

export const InvoiceStatus = { Issued: 0, Paid: 1, Overdue: 2, Void: 3 } as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export interface InvoiceResponse {
  id: string;
  ownerType: 0;
  ownerId: string;
  accountId: string | null;
  periodStart: string;
  periodEnd: string;
  interviewCount: number;
  unitPrice: number;
  amount: number;
  status: InvoiceStatus;
  createdAt: string;
}

export interface SubscriptionResponse {
  ownerType: PaymentOwnerType;
  ownerId: string;
  active: boolean;
  billingCycle: 'Monthly' | 'Annual' | null;
  startedAt: string | null;
  expiresAt: string | null;
}

export interface PackageResponse {
  id: string;
  name: string;
  type: PaymentPackageType;
  priceVnd: number;
  interviewCredits: number | null;
  durationDays: number | null;
  planId?: string | null;
  audience?: 0 | 1 | null;
  isActive: boolean;
  createdAt: string;
}

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
}

export const ORDER_STATUS_TEXT_TO_ENUM: Record<OrderStatusText, PaymentOrderStatus> = {
  Pending: PaymentOrderStatus.Pending,
  Paid: PaymentOrderStatus.Paid,
  Failed: PaymentOrderStatus.Failed,
  Expired: PaymentOrderStatus.Expired,
  Cancelled: PaymentOrderStatus.Cancelled,
  Refunded: PaymentOrderStatus.Refunded,
};
