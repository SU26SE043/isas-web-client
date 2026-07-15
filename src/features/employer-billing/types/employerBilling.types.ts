export type BillingCycle = 'monthly' | 'annual';
export type OrgPlanId = 'starter' | 'growth' | 'enterprise';
export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'grace_period' | 'past_due';
export type InvoiceStatus = 'paid' | 'open' | 'past_due' | 'void';

export interface SubscriptionPlan {
  id: OrgPlanId;
  nameKey: string;
  descriptionKey: string;
  monthlyPrice: number;
  annualPrice: number;
  seats: number;
  campaignCredits: number;
  featureKeys: string[];
}

export interface BillingPaymentMethod {
  brand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiry: string;
  holderName: string;
}

export interface EmployerInvoice {
  id: string;
  number: string;
  issuedAt: string;
  amount: number;
  tokenUsage: number;
  status: InvoiceStatus;
  pdfReady: boolean;
}

export interface EmployerBillingAccount {
  organizationName: string;
  subscriptionStatus: SubscriptionStatus;
  planId: OrgPlanId | null;
  cycle: BillingCycle;
  seatsUsed: number;
  seatsLimit: number;
  creditBalance: number;
  creditLowThreshold: number;
  graceEndsAt: string | null;
  nextRenewalAt: string | null;
  paymentMethod: BillingPaymentMethod | null;
  monthlyTokensAccrued: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
}

export interface CampaignTokenUsage {
  campaignId: string;
  campaignName: string;
  campaignNameVi: string;
  sessionCount: number;
  tokensAccrued: number;
  lastSessionAt: string;
}

export interface SessionTokenUsage {
  id: string;
  campaignId: string;
  candidateLabel: string;
  completedAt: string;
  tokensUsed: number;
}

export interface MonthlyUsagePeriod {
  monthKey: string;
  label: string;
  labelVi: string;
  totalTokens: number;
  sessionCount: number;
  status: 'current' | 'closed' | 'invoiced';
  invoiceNumber: string | null;
}

export interface PaymentMethodInput {
  holderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

export interface BillingCheckoutResult {
  account: EmployerBillingAccount;
  invoice: EmployerInvoice;
  messageKey: string;
}

export interface InvoiceGenerationResult {
  invoice: EmployerInvoice;
  generatedAt: string;
  messageKey: string;
}
