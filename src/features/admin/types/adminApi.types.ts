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

/**
 * Bộ chuẩn B2C do admin quản (BC-8) — hợp đồng KHỚP `AdminRubric.cs` + `AdminRubricPreview.cs`
 * (InterviewService, camelCase, enum `JobCategory` là chuỗi `FE|BE|BA`).
 *
 * Bản trước của các type này viết theo tưởng tượng (`level.description`, `criterion.key`,
 * `category`) trong khi BE trả `descriptor`, `id`, `jobCategory` ⇒ bảng mốc luôn trống, PUT gửi
 * `descriptor` cũ nguyên xi nên BE thấy không đổi gì và trả 200 `changed:false` — admin tưởng đã
 * lưu. Từ đây mọi tên trường phải lấy từ DTO BE, không đặt tên "cho dễ đọc".
 */
export type AdminRubricLanguage = 'vi' | 'en';
export type AdminRubricJobCategory = 'FE' | 'BE' | 'BA';
export type AdminRubricLevel = { score: number; descriptor: string };
export type AdminRubricCriterion = {
  id: string;
  name: string;
  description: string | null;
  weight: number;
  maxScore: number;
  /** `Always` = chấm mọi câu · `WhenTargeted` = chỉ khi câu hỏi nhắm tới (INT-18). */
  scoringScope: string;
  /** `[]` = CHƯA khai mốc ⇒ chấm theo dải mặc định (hợp lệ, không phải lỗi). */
  levels: AdminRubricLevel[];
};
export type AdminSampleQuestion = { id: string; text: string };
export type AdminRubricSet = {
  jobCategory: AdminRubricJobCategory;
  language: AdminRubricLanguage;
  version: number;
  /** `false` sau PUT = nội dung y như bản đang chạy nên KHÔNG tạo phiên bản mới. */
  changed: boolean;
  criteria: AdminRubricCriterion[];
  /** Câu mẫu để chấm thử — client CHỌN từ đây rồi gửi `sampleQuestionId` (không hardcode phía FE). */
  sampleQuestions: AdminSampleQuestion[];
};
export type AdminRubricMatrixRow = { jobCategory: AdminRubricJobCategory; language: AdminRubricLanguage; version: number; criteriaCount: number; withLevelsCount: number };
export type AdminRubricVersionItem = { version: number; isActive: boolean; criteriaCount: number; withLevelsCount: number };
/** Body của `PUT /admin/rubrics/{jobCategory}` — CHỈ ba trường admin được sửa (name/weight/maxScore/scope khoá bằng cấu trúc ở BE). */
export type AdminRubricCriterionInput = { id: string; description: string | null; levels: AdminRubricLevel[] | null };
export type AdminRubricUpsertInput = { criteria: AdminRubricCriterionInput[] };
export type AdminSuggestedCriterionLevels = { criterionId: string; name: string; maxScore: number; levels: AdminRubricLevel[] };
export type AdminSuggestLevelsResponse = { jobCategory: AdminRubricJobCategory; language: AdminRubricLanguage; rubricVersion: number; criteria: AdminSuggestedCriterionLevels[] };
export type AdminRubricPreviewRequest = { question?: string | null; customAnswer?: string | null; seniority?: string | null; sampleQuestionId?: string | null };
export type AdminRubricPreviewStatus = 'Running' | 'Succeeded' | 'Failed';
export type AdminRubricPreviewBand = 'Weak' | 'Good' | 'Excellent' | 'Custom';
export type AdminRubricPreviewScore = { criterionId: string; criterionName: string; maxScore: number; expectedLevel: number; actualScore: number; levelMatched: number | null; reasoning: string | null };
/** `expectedPct/actualPct` = TRUNG BÌNH CỘNG các tiêu chí (INT-10, B2C) — KHÔNG phải weighted như B2B. */
export type AdminRubricPreviewSample = { band: AdminRubricPreviewBand; answerText: string; wordCount: number; expectedPct: number; actualPct: number; scores: AdminRubricPreviewScore[] };
export type AdminRubricPreviewCriterion = { criterionId: string; name: string; weight: number; maxScore: number; levels: AdminRubricLevel[] };
export type AdminRubricPreviewRun = {
  id: string;
  status: AdminRubricPreviewStatus;
  jobCategory: AdminRubricJobCategory;
  language: AdminRubricLanguage;
  rubricVersion: number;
  questionText: string;
  rubricFingerprint: string;
  promptVersion: number | null;
  deliveryMetricsAvailable: boolean;
  lengthParityWarning: boolean;
  /** Lượt miễn phí còn lại cho (nghề, ngôn ngữ, phiên bản) — trần 5, hết ⇒ BE 429. */
  freeRunsRemaining: number;
  rubric: AdminRubricPreviewCriterion[];
  samples: AdminRubricPreviewSample[];
  errorReason: string | null;
  createdAt: string;
  completedAt: string | null;
};

/**
 * Ngưỡng ĐẠT của lộ trình theo cấp độ. Backend luôn trả một phần tử cho MỌI cấp độ.
 *
 * `isOverridden` do server nói, KHÔNG suy từ `effectivePct !== defaultPct`: admin đặt
 * override trùng giá trị mặc định vẫn LÀ override (và vẫn phải hiện nút trả-về-mặc-định).
 * `isKnownLevel === false` = hàng mồ côi, cấp độ đã bị gỡ khỏi hệ nhưng override còn sót.
 */
export type RoadmapThreshold = { level: string; effectivePct: number; defaultPct: number; isOverridden: boolean; updatedBy?: string | null; updatedAt?: string | null; isKnownLevel: boolean };
export type RoadmapThresholdUpdateInput = { thresholds: Record<string, number> };

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
/**
 * Payment serialize enum thành SỐ (không JsonStringEnumConverter): `OwnerType` 0=Org 1=User ·
 * `PaymentMode` 0=Prepaid 1=Postpaid · `CreditAccountStatus` 0=Active 1=Suspended · `InvoiceStatus`
 * 0=Issued 1=Paid 2=Overdue 3=Void. Bảng tra ở `adminBilling.ts`; đừng in số thô ra màn hình.
 */
export type CreditAccount = { ownerType: number; ownerId: string; paymentMode: number; status: number; remainingCredits: number; reservedCredits: number; freeCreditsGranted: number; walletExists: boolean };
export type SetPaymentModeResult = { ownerType: number; ownerId: string; paymentMode: number; creditLimit: number | null; remainingCredits: number; reservedCredits: number };
export type InvoiceResult = { id: string; ownerType: number; ownerId: string; periodStart: string; periodEnd: string; interviewCount: number; unitPrice: number; amount: number; status: number; createdAt: string };
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
