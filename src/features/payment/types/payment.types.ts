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
  isActive: boolean;
  createdAt: string;
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
  status: PaymentOrderStatus;
  checkoutUrl: string | null;
  createdAt: string;
}

/** PaymentService order DTO (`POST/GET /api/v1/payment/order`). */
export interface OrderResponse {
  id: string;
  packageId: string;
  status: string;
  checkoutUrl: string | null;
  packageName?: string;
  priceVnd?: number;
  interviewCredits?: number | null;
  createdAt?: string;
  paymentStatus?: string;
  orderStatus?: string;
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
  failureReason?: string;
}

/** Normalized order detail for payment result screens (`GET /api/v1/payment/order/{id}`). */
export interface PaymentOrderDetail {
  orderId: string;
  packageId: string;
  packageName?: string;
  status: string;
  paymentStatus?: string;
  orderStatus?: string;
  priceVnd?: number;
  interviewCredits?: number | null;
  createdAt?: string;
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
  failureReason?: string;
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
