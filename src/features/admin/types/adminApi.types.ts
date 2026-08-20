export type AdminApiPage<T> = { items: T[]; nextCursor: string | null };

export type AdminCampaignAnalytics = {
  from: string; to: string; granularity: string;
  totals: { byStatus: Array<{ status: string; count: number }>; invitationsSent: number; invitationsUnsent: number; flagsBySignal: Array<{ signalType: string; count: number }> };
  buckets: Array<{ periodStart: string; campaignsCreated: number; invitationsCreated: number; joins: number; interviewsStarted: number }>;
};

export type InterviewAdminAnalytics = {
  from: string; to: string; granularity: string;
  activeSessions: { b2c: number; b2b: number };
  totals: { answersUploaded: number; answersNeedsReview: number; byJobCategory: Array<{ jobCategory: string; count: number }> };
  buckets: Array<{ periodStart: string; created: number; scored: number; failed: number; abandoned: number }>;
};

export type PromptTemplate = { key: string; version: number; body: string | null; updatedBy?: string | null; changeNote?: string | null; createdAt?: string | null };
export type UpdatePromptInput = { body: string; changeNote?: string };

export type RubricLevel = { score: number; description: string };
export type RubricCriterion = { id?: string; key: string; name?: string; levels: RubricLevel[] };
export type RubricSet = { category: string; language: 'vi' | 'en'; version: number; criteria: RubricCriterion[]; updatedAt?: string | null; updatedBy?: string | null };
export type RubricPreviewInput = { criterionKey: string; answer: string };

export type KnowledgeSource = { id: string; title: string; jobCategory?: string | null; sourceType: 'Context7' | 'Url' | 'Manual' | string; sourceRef?: string | null; reputation?: string | null; status: 'Active' | 'Archived' | string; chunkCount: number; createdAt: string };
export type CreateKnowledgeInput = { title: string; jobCategory?: string; sourceType: 'Url' | 'Manual'; url?: string; content?: string };
export type Context7Library = { id: string; title: string; reputation?: string | null; snippets: number };
export type IngestContext7Input = { libraryId: string; topics: string[]; jobCategory: string };

export type AdminOrder = { id: string; ownerType: number; ownerId: string; kind: number; packageId?: string | null; invoiceId?: string | null; status: number; amountVnd: number; payosOrderCode: number; expiredAt: string; paidAt?: string | null; createdAt: string; refundedAt?: string | null; refundReason?: string | null; refundGatewayRef?: string | null; refundSettledAt?: string | null; payoutStatus?: string | null; payoutFailureReason?: string | null };
export type AdminOrderParams = { status?: number; ownerType?: number; refundSettlement?: number; cursor?: string; limit?: number };
export type Package = { id: string; name: string; type: number; priceVnd: number; interviewCredits?: number | null; durationDays?: number | null; planId?: string | null; audience?: number | null; isActive: boolean; createdAt: string };
export type PackageInput = Omit<Package, 'id' | 'createdAt' | 'isActive'> & { isActive?: boolean };
export type Plan = { id: string; audience: number; code: string; name: string; rank: number; interviewFunding: number; monthlyQuota?: number | null; adaptiveEnabled: boolean; adaptiveMaxQuestions?: number | null; adaptiveMaxFollowups?: number | null; groundingEnabled: boolean; selfConsistencyN: number; cvAnalysisIncluded: boolean; repoAnalysisIncluded: boolean; roadmapEnabled: boolean; maxQuestionsCap?: number | null; maxActiveCampaigns?: number | null; maxCandidatesCap?: number | null; postpaidEligible: boolean; seatCount?: number | null; entitlementsVersion: number; isActive: boolean };
export type PlanInput = Omit<Plan, 'id' | 'entitlementsVersion'> & { entitlementsJson: string };
export type RefundInput = { reason: string; gatewayRef?: string; allowPartialClawback: boolean; settledNow: boolean };
export type RefundSettleInput = { gatewayRef?: string };
export type CreditGrantInput = { ownerType: number; ownerId: string; credits: number; note: string; idempotencyKey?: string };
export type PaymentModeInput = { ownerType: number; ownerId: string; paymentMode: number; creditLimit?: number; note: string; allowStrandedCredits: boolean };
export type SubscriptionGrantInput = { ownerType: number; ownerId: string; planId: string; durationDays: number; activatedAt?: string; idempotencyKey: string };
export type CreditAccount = Record<string, unknown>;
export type CreditTransaction = Record<string, unknown>;
export type AdminRevenueBucket = { periodStart: string; amountVnd: number; orderCount: number };
export type AdminRevenueFunnel = {
  createdCount: number; paidCount: number; failedCount: number; expiredCount: number;
  cancelledCount: number; pendingCount: number; conversionRatePct: number;
};
export type AdminRevenueAnalytics = {
  from: string; to: string; granularity: string; grossRevenueVnd: number; paidOrderCount: number;
  refundedVnd: number; refundedOrderCount: number; netRevenueVnd: number;
  aiCostUsd: number; aiCostVnd: number; grossMarginVnd: number; refundRatePct: number;
  payingOwnerCount: number; arpuVnd: number; buckets: AdminRevenueBucket[]; funnel: AdminRevenueFunnel;
};
export type AdminFinanceSnapshot = {
  asOf: string;
  outstandingReceivables: { issuedVnd: number; issuedCount: number; overdueVnd: number; overdueCount: number; totalVnd: number };
  mrrVnd: number; activeSubscriptionCount: number;
};
export type AdminAiUsageAnalytics = Record<string, unknown>;
export type AdminTrafficAnalytics = Record<string, unknown>;
