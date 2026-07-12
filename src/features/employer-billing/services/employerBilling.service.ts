import { mockDelay, usesMockData } from '@/shared/mock';
import { MOCK_EMPLOYER_BILLING_ACCOUNT, MOCK_EMPLOYER_INVOICES, ORG_SUBSCRIPTION_PLANS } from '../mocks/employerBilling.fixtures';
import type {
  BillingCheckoutResult,
  BillingCycle,
  EmployerBillingAccount,
  EmployerInvoice,
  InvoiceGenerationResult,
  OrgPlanId,
  PaymentMethodInput,
  SubscriptionPlan,
} from '../types/employerBilling.types';

let account: EmployerBillingAccount = structuredClone(MOCK_EMPLOYER_BILLING_ACCOUNT);
let invoices: EmployerInvoice[] = structuredClone(MOCK_EMPLOYER_INVOICES);

function ensureMock() {
  if (!usesMockData('enterprise')) {
    throw new Error('Employer billing API is not wired yet. Keep usesMockData("enterprise") true.');
  }
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function detectBrand(cardNumber: string): PaymentMethodInput extends never ? never : 'visa' | 'mastercard' | 'amex' {
  const digits = digitsOnly(cardNumber);
  if (digits.startsWith('34') || digits.startsWith('37')) return 'amex';
  if (digits.startsWith('5')) return 'mastercard';
  return 'visa';
}

function createInvoice(plan: SubscriptionPlan, cycle: BillingCycle): EmployerInvoice {
  const amount = cycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  return {
    id: `inv_${Date.now()}`,
    number: `ISAS-B2B-${new Date().getFullYear()}-${String(invoices.length + 10).padStart(3, '0')}`,
    issuedAt: new Date().toISOString(),
    amount,
    tokenUsage: plan.campaignCredits,
    status: 'paid',
    pdfReady: true,
  };
}

export const employerBillingService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    ensureMock();
    await mockDelay(180);
    return structuredClone(ORG_SUBSCRIPTION_PLANS);
  },

  async getBillingAccount(): Promise<EmployerBillingAccount> {
    ensureMock();
    await mockDelay(220);
    return structuredClone(account);
  },

  async selectPlan(planId: OrgPlanId, cycle: BillingCycle): Promise<BillingCheckoutResult> {
    ensureMock();
    await mockDelay(520);
    const plan = ORG_SUBSCRIPTION_PLANS.find((item) => item.id === planId);
    if (!plan) throw new Error('PLAN_NOT_FOUND');

    const invoice = createInvoice(plan, cycle);
    account = {
      ...account,
      planId,
      cycle,
      subscriptionStatus: 'active',
      seatsLimit: plan.seats,
      creditBalance: account.creditBalance + plan.campaignCredits,
      graceEndsAt: null,
      nextRenewalAt: '2027-07-01T00:00:00.000Z',
    };
    invoices = [invoice, ...invoices];
    return { account: structuredClone(account), invoice: structuredClone(invoice), messageKey: 'employerBilling.subscription.success' };
  },

  async savePaymentMethod(input: PaymentMethodInput): Promise<EmployerBillingAccount> {
    ensureMock();
    await mockDelay(420);
    const digits = digitsOnly(input.cardNumber);
    account = {
      ...account,
      paymentMethod: {
        brand: detectBrand(input.cardNumber),
        holderName: input.holderName.trim(),
        last4: digits.slice(-4),
        expiry: input.expiry,
      },
    };
    return structuredClone(account);
  },

  async listInvoices(): Promise<EmployerInvoice[]> {
    ensureMock();
    await mockDelay(220);
    return structuredClone(invoices);
  },

  async generateInvoicePdf(invoiceId: string): Promise<InvoiceGenerationResult> {
    ensureMock();
    await mockDelay(900);
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) throw new Error('INVOICE_NOT_FOUND');
    invoice.pdfReady = true;
    return {
      invoice: structuredClone(invoice),
      generatedAt: new Date().toISOString(),
      messageKey: 'employerBilling.invoices.generated',
    };
  },
};
