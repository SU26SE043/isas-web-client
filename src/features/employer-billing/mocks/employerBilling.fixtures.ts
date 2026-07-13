import type {
  CampaignTokenUsage,
  EmployerBillingAccount,
  EmployerInvoice,
  MonthlyUsagePeriod,
  SessionTokenUsage,
  SubscriptionPlan,
} from '../types/employerBilling.types';

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
  monthlyTokensAccrued: 186,
  billingPeriodStart: '2026-07-01T00:00:00.000Z',
  billingPeriodEnd: '2026-07-31T23:59:59.999Z',
};

export const MOCK_CAMPAIGN_TOKEN_USAGE: CampaignTokenUsage[] = [
  {
    campaignId: 'frontend-engineer-remote',
    campaignName: 'Frontend Engineer Assessment',
    campaignNameVi: 'Danh gia Ky su Frontend',
    sessionCount: 8,
    tokensAccrued: 112,
    lastSessionAt: '2026-07-09T14:20:00.000Z',
  },
  {
    campaignId: 'data-analyst-screening',
    campaignName: 'Data Analyst Screening',
    campaignNameVi: 'Sang loc Phan tich Du lieu',
    sessionCount: 5,
    tokensAccrued: 74,
    lastSessionAt: '2026-07-08T09:45:00.000Z',
  },
];

export const MOCK_SESSION_TOKEN_USAGE: SessionTokenUsage[] = [
  {
    id: 'sess-001',
    campaignId: 'frontend-engineer-remote',
    candidateLabel: 'CND-1042',
    completedAt: '2026-07-09T14:20:00.000Z',
    tokensUsed: 16,
  },
  {
    id: 'sess-002',
    campaignId: 'frontend-engineer-remote',
    candidateLabel: 'CND-1088',
    completedAt: '2026-07-08T11:05:00.000Z',
    tokensUsed: 14,
  },
  {
    id: 'sess-003',
    campaignId: 'frontend-engineer-remote',
    candidateLabel: 'CND-1101',
    completedAt: '2026-07-07T16:30:00.000Z',
    tokensUsed: 15,
  },
  {
    id: 'sess-004',
    campaignId: 'data-analyst-screening',
    candidateLabel: 'CND-2010',
    completedAt: '2026-07-08T09:45:00.000Z',
    tokensUsed: 17,
  },
  {
    id: 'sess-005',
    campaignId: 'data-analyst-screening',
    candidateLabel: 'CND-2033',
    completedAt: '2026-07-06T10:15:00.000Z',
    tokensUsed: 13,
  },
];

export const MOCK_MONTHLY_USAGE: MonthlyUsagePeriod[] = [
  {
    monthKey: '2026-07',
    label: 'July 2026',
    labelVi: 'Thang 7/2026',
    totalTokens: 186,
    sessionCount: 13,
    status: 'current',
    invoiceNumber: null,
  },
  {
    monthKey: '2026-06',
    label: 'June 2026',
    labelVi: 'Thang 6/2026',
    totalTokens: 240,
    sessionCount: 18,
    status: 'invoiced',
    invoiceNumber: 'ISAS-B2B-2026-008',
  },
  {
    monthKey: '2026-05',
    label: 'May 2026',
    labelVi: 'Thang 5/2026',
    totalTokens: 120,
    sessionCount: 9,
    status: 'invoiced',
    invoiceNumber: 'ISAS-B2B-2026-007',
  },
];

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
