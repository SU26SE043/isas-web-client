import type { PackageResponse, TokenUsageRecord, WalletTransaction } from '../types/payment.types';

export const MOCK_PAYMENT_PACKAGES: PackageResponse[] = [
  { id: 'pkg-starter', name: 'Starter', type: 1, priceVnd: 225000, interviewCredits: 5000, durationDays: null, isActive: true, createdAt: '2026-06-01T00:00:00.000Z' },
  { id: 'pkg-standard', name: 'Standard', type: 1, priceVnd: 475000, interviewCredits: 15000, durationDays: null, isActive: true, createdAt: '2026-06-01T00:00:00.000Z' },
  { id: 'pkg-pro', name: 'Pro', type: 1, priceVnd: 975000, interviewCredits: 40000, durationDays: null, isActive: true, createdAt: '2026-06-01T00:00:00.000Z' },
  { id: 'sub-basic', name: 'Monthly Basic', type: 2, priceVnd: 300000, interviewCredits: 10000, durationDays: 30, isActive: true, createdAt: '2026-06-01T00:00:00.000Z' },
];

export const INITIAL_MOCK_WALLET_BALANCE = 2500;
export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [];
export const MOCK_TOKEN_USAGE: TokenUsageRecord[] = [];
