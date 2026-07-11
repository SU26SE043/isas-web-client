import type { CreditPackage, SubscriptionPlan, WalletTransaction } from '../types/payment.types';

export const MOCK_CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'pkg-starter',
    name: 'Starter',
    nameVi: 'Khởi đầu',
    credits: 5,
    priceUsd: 9,
    description: 'Try a few practice interviews.',
    descriptionVi: 'Thử vài phiên luyện phỏng vấn.',
  },
  {
    id: 'pkg-standard',
    name: 'Standard',
    nameVi: 'Tiêu chuẩn',
    credits: 15,
    priceUsd: 19,
    description: 'Best value for weekly practice.',
    descriptionVi: 'Phù hợp luyện tập hàng tuần.',
    popular: true,
  },
  {
    id: 'pkg-pro',
    name: 'Pro',
    nameVi: 'Chuyên nghiệp',
    credits: 40,
    priceUsd: 39,
    description: 'Intensive interview preparation.',
    descriptionVi: 'Chuẩn bị phỏng vấn chuyên sâu.',
  },
];

export const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'sub-basic',
    name: 'Monthly Basic',
    nameVi: 'Cơ bản hàng tháng',
    creditsPerMonth: 10,
    priceUsdMonthly: 12,
    description: '10 credits renewed every month.',
    descriptionVi: '10 credit được cấp lại mỗi tháng.',
  },
  {
    id: 'sub-pro',
    name: 'Monthly Pro',
    nameVi: 'Pro hàng tháng',
    creditsPerMonth: 30,
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
    creditsDelta: 15,
    description: 'Standard credit package',
    descriptionVi: 'Gói credit Tiêu chuẩn',
    createdAt: '2026-06-01T08:00:00.000Z',
    status: 'completed',
  },
  {
    id: 'tx-2',
    type: 'consumption',
    amount: 0,
    creditsDelta: -1,
    description: 'Practice interview session',
    descriptionVi: 'Phiên luyện phỏng vấn',
    createdAt: '2026-06-12T10:15:00.000Z',
    status: 'completed',
  },
];

export const INITIAL_WALLET_BALANCE = 5;
