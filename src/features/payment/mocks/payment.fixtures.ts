import type { TokenPackage, SubscriptionPlan, TokenUsageRecord, WalletTransaction } from '../types/payment.types';

export const MOCK_TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'pkg-starter',
    name: 'Starter',
    nameVi: 'Khởi đầu',
    tokens: 5_000,
    priceUsd: 9,
    description: 'Try a few practice interviews.',
    descriptionVi: 'Thử vài phiên luyện phỏng vấn.',
  },
  {
    id: 'pkg-standard',
    name: 'Standard',
    nameVi: 'Tiêu chuẩn',
    tokens: 15_000,
    priceUsd: 19,
    description: 'Best value for weekly practice.',
    descriptionVi: 'Phù hợp luyện tập hàng tuần.',
    popular: true,
  },
  {
    id: 'pkg-pro',
    name: 'Pro',
    nameVi: 'Chuyên nghiệp',
    tokens: 40_000,
    priceUsd: 39,
    description: 'Intensive interview preparation.',
    descriptionVi: 'Chuẩn bị phỏng vấn chuyên sâu.',
  },
];

/** @deprecated Use MOCK_TOKEN_PACKAGES */
export const MOCK_CREDIT_PACKAGES = MOCK_TOKEN_PACKAGES;

export const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'sub-basic',
    name: 'Monthly Basic',
    nameVi: 'Cơ bản hàng tháng',
    tokensPerMonth: 10_000,
    priceUsdMonthly: 12,
    description: '10,000 tokens renewed every month.',
    descriptionVi: '10.000 token được cấp lại mỗi tháng.',
  },
  {
    id: 'sub-pro',
    name: 'Monthly Pro',
    nameVi: 'Pro hàng tháng',
    tokensPerMonth: 30_000,
    priceUsdMonthly: 29,
    description: 'For active candidates practicing daily.',
    descriptionVi: 'Dành cho ứng viên luyện tập thường xuyên.',
  },
];

export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-1',
    type: 'purchase',
    amount: 19,
    tokensDelta: 15_000,
    description: 'Standard token package',
    descriptionVi: 'Gói token Tiêu chuẩn',
    createdAt: '2026-06-01T08:00:00.000Z',
    status: 'completed',
  },
  {
    id: 'tx-2',
    type: 'settlement',
    amount: 0,
    tokensDelta: -620,
    description: 'Practice interview settlement',
    descriptionVi: 'Quyết toán phiên luyện phỏng vấn',
    createdAt: '2026-06-12T10:15:00.000Z',
    status: 'completed',
    sessionId: 'session-past-001',
  },
];

export const MOCK_TOKEN_USAGE: TokenUsageRecord[] = [
  {
    id: 'usage-1',
    sessionId: 'session-past-001',
    sessionTitle: 'Frontend Developer Mock',
    sessionTitleVi: 'Phỏng vấn thử Frontend Developer',
    reservedTokens: 800,
    actualTokens: 620,
    settledAt: '2026-06-12T10:15:00.000Z',
    status: 'settled',
  },
];

export const INITIAL_WALLET_BALANCE = 2_500;
