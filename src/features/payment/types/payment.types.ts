export type PaymentOrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export type TransactionType = 'purchase' | 'consumption' | 'subscription' | 'refund' | 'reserve' | 'settlement';

/**
 * PaymentService package catalog DTO (`GET /api/v1/payment/package`).
 * `type` is serialized as integer in live gateway responses (1 = OneTime).
 */
export interface PackageResponse {
  id: string;
  name: string;
  type: number | string;
  priceVnd: number;
  interviewCredits: number | null;
  durationDays: number | null;
  planId?: string | null;
  audience?: 0 | 1 | null;
  isActive: boolean;
  createdAt: string;
}

export type PaymentOwnerType = 0 | 1;
export type PaymentMode = 0 | 1;
export type PaymentAccountStatus = 0 | 1;

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

export interface SubscriptionResponse {
  ownerType: PaymentOwnerType;
  ownerId: string;
  active: boolean;
  billingCycle: 'Monthly' | 'Annual' | null;
  startedAt: string | null;
  expiresAt: string | null;
}

export interface CreditTransactionResponse {
  id: string;
  delta: number;
  reason: number;
  sessionId: string | null;
  orderId: string | null;
  reversesTransactionId?: string | null;
  createdAt: string;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface TokenPackage {
  id: string;
  name: string;
  nameVi: string;
  tokens: number;
  priceUsd: number;
  description: string;
  descriptionVi: string;
  popular?: boolean;
}

/** @deprecated Use TokenPackage — kept as alias for gradual migration */
export type CreditPackage = TokenPackage;

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameVi: string;
  tokensPerMonth: number;
  priceUsdMonthly: number;
  description: string;
  descriptionVi: string;
}

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  tokensDelta: number;
  description: string;
  descriptionVi: string;
  createdAt: string;
  status: PaymentOrderStatus | 'completed';
  sessionId?: string;
  orderId?: string;
  ownerType?: number;
  ownerId?: string;
  reason?: number;
}

export interface WalletSnapshot {
  balance: number;
  reserved: number;
  available: number;
  transactions: WalletTransaction[];
}

export interface TokenUsageRecord {
  id: string;
  sessionId: string;
  sessionTitle: string;
  sessionTitleVi: string;
  reservedTokens: number;
  actualTokens: number;
  settledAt: string;
  status: 'settled' | 'reserved';
}

export interface PaymentOrder {
  orderId: string;
  packageId: string;
  packageName: string;
  packageNameVi: string;
  tokens: number;
  amountUsd: number;
  priceVnd?: number;
  amountVnd?: number;
  status: PaymentOrderStatus;
  checkoutUrl: string | null;
  createdAt: string;
}

/** PaymentService order DTO (`POST/GET /api/v1/payment/order`). */
export interface OrderResponse {
  id: string;
  ownerType?: PaymentOwnerType;
  ownerId?: string;
  kind?: 0 | 1 | 2 | 3;
  invoiceId?: string | null;
  amountVnd?: number;
  payosOrderCode?: number;
  expiredAt?: string;
  packageId: string;
  status: string;
  checkoutUrl: string | null;
  packageName?: string;
  interviewCredits?: number | null;
  createdAt?: string;
  paidAt?: string;
}

/** Normalized order detail for payment result screens (`GET /api/v1/payment/order/{id}`). */
export interface PaymentOrderDetail {
  orderId: string;
  packageId: string;
  packageName?: string;
  status: string;
  /** @deprecated Compatibility for legacy fixtures; live parser uses status only. */
  paymentStatus?: string;
  /** @deprecated Compatibility for legacy fixtures; live parser uses status only. */
  orderStatus?: string;
  /** @deprecated Compatibility for legacy fixtures; live parser uses amountVnd. */
  priceVnd?: number;
  interviewCredits?: number | null;
  createdAt?: string;
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
  failureReason?: string;
  checkoutUrl?: string | null;
  ownerType?: PaymentOwnerType;
  ownerId?: string;
  kind?: 0 | 1 | 2 | 3;
  invoiceId?: string | null;
  amountVnd?: number;
  payosOrderCode?: number;
  expiredAt?: string;
}

export interface PaymentOrderStatusResult {
  orderCode: number;
  status: string;
  paidAt: string | null;
}

export interface CreateOrderResult {
  order: PaymentOrder;
}

export interface CompleteOrderResult {
  order: PaymentOrder;
  wallet: WalletSnapshot;
}

export interface ReserveTokensResult {
  wallet: WalletSnapshot;
  reservedAmount: number;
}

export interface SettleTokensResult {
  wallet: WalletSnapshot;
  usage: TokenUsageRecord;
}
