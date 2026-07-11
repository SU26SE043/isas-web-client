export type PaymentOrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export type TransactionType = 'purchase' | 'consumption' | 'subscription' | 'refund';

export interface CreditPackage {
  id: string;
  name: string;
  nameVi: string;
  credits: number;
  priceUsd: number;
  description: string;
  descriptionVi: string;
  popular?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameVi: string;
  creditsPerMonth: number;
  priceUsdMonthly: number;
  description: string;
  descriptionVi: string;
}

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  creditsDelta: number;
  description: string;
  descriptionVi: string;
  createdAt: string;
  status: PaymentOrderStatus | 'completed';
}

export interface WalletSnapshot {
  balance: number;
  transactions: WalletTransaction[];
}

export interface PaymentOrder {
  orderId: string;
  packageId: string;
  packageName: string;
  packageNameVi: string;
  credits: number;
  amountUsd: number;
  status: PaymentOrderStatus;
  checkoutUrl: string;
  createdAt: string;
}

export interface CreateOrderResult {
  order: PaymentOrder;
}

export interface CompleteOrderResult {
  order: PaymentOrder;
  wallet: WalletSnapshot;
}
