import type { EmployerBillingAccount, EmployerInvoice, SubscriptionPlan } from '../types/employerBilling.types';

export const ORG_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    nameKey: 'employerBilling.plan.starter.name',
    descriptionKey: 'employerBilling.plan.starter.description',
    monthlyPrice: 149,
    annualPrice: 1490,
    seats: 5,
    campaignCredits: 240,
    featureKeys: [
      'employerBilling.plan.feature.campaigns',
      'employerBilling.plan.feature.basicReports',
      'employerBilling.plan.feature.emailSupport',
    ],
  },
  {
    id: 'growth',
    nameKey: 'employerBilling.plan.growth.name',
    descriptionKey: 'employerBilling.plan.growth.description',
    monthlyPrice: 349,
    annualPrice: 3490,
    seats: 15,
    campaignCredits: 720,
    featureKeys: [
      'employerBilling.plan.feature.campaigns',
      'employerBilling.plan.feature.analytics',
      'employerBilling.plan.feature.prioritySupport',
    ],
  },
  {
    id: 'enterprise',
    nameKey: 'employerBilling.plan.enterprise.name',
    descriptionKey: 'employerBilling.plan.enterprise.description',
    monthlyPrice: 899,
    annualPrice: 8990,
    seats: 60,
    campaignCredits: 2400,
    featureKeys: [
      'employerBilling.plan.feature.analytics',
      'employerBilling.plan.feature.audit',
      'employerBilling.plan.feature.successManager',
    ],
  },
];

export const MOCK_EMPLOYER_BILLING_ACCOUNT: EmployerBillingAccount = {
  organizationName: 'NovaWorks AI',
  subscriptionStatus: 'active',
  planId: 'growth',
  cycle: 'annual',
  seatsUsed: 11,
  seatsLimit: 15,
  creditBalance: 720,
  creditLowThreshold: 120,
  graceEndsAt: null,
  nextRenewalAt: '2026-09-30T00:00:00.000Z',
  paymentMethod: {
    brand: 'visa',
    last4: '4242',
    expiry: '11/28',
    holderName: 'NovaWorks Finance',
  },
};

export const MOCK_EMPLOYER_INVOICES: EmployerInvoice[] = [
  {
    id: 'inv_2026_009',
    number: 'ISAS-B2B-2026-009',
    issuedAt: '2026-07-01T09:00:00.000Z',
    amount: 3490,
    tokenUsage: 720,
    status: 'paid',
    pdfReady: true,
  },
  {
    id: 'inv_2026_008',
    number: 'ISAS-B2B-2026-008',
    issuedAt: '2026-06-01T09:00:00.000Z',
    amount: 349,
    tokenUsage: 240,
    status: 'paid',
    pdfReady: true,
  },
  {
    id: 'inv_2026_007',
    number: 'ISAS-B2B-2026-007',
    issuedAt: '2026-05-01T09:00:00.000Z',
    amount: 149,
    tokenUsage: 120,
    status: 'paid',
    pdfReady: true,
  },
];
