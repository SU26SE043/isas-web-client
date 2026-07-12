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
  credits: number;
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
