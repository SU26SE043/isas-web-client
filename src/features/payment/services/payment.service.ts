import { mockDelay, usesMockData } from '@/shared/mock';
import { MOCK_SETTLE_ACTUAL_TOKENS, PRACTICE_RESERVE_ESTIMATE } from '../constants';
import type {
  CompleteOrderResult,
  CreateOrderResult,
  ReserveTokensResult,
  SettleTokensResult,
  PaymentOrder,
  SubscriptionPlan,
  TokenPackage,
  TokenUsageRecord,
  WalletSnapshot,
} from '../types/payment.types';
import {
  INITIAL_WALLET_BALANCE,
  MOCK_TOKEN_PACKAGES,
  MOCK_SUBSCRIPTION_PLANS,
  MOCK_TOKEN_USAGE,
  MOCK_WALLET_TRANSACTIONS,
} from '../mocks/payment.fixtures';

const STORAGE_KEY = 'isas-mock-payment-wallet';

interface PersistedPaymentState {
  walletBalance: number;
  transactions: typeof MOCK_WALLET_TRANSACTIONS;
  tokenUsageRecords: TokenUsageRecord[];
  sessionReserves: Record<string, number>;
  settledSessions: string[];
  pendingOrders: PaymentOrder[];
}

let walletBalance = INITIAL_WALLET_BALANCE;
const transactions = [...MOCK_WALLET_TRANSACTIONS];
const tokenUsageRecords = [...MOCK_TOKEN_USAGE];
const pendingOrders = new Map<string, PaymentOrder>();
const sessionReserves = new Map<string, number>();
const settledSessions = new Set<string>();

function persistState(): void {
  if (typeof sessionStorage === 'undefined') return;
  const payload: PersistedPaymentState = {
    walletBalance,
    transactions,
    tokenUsageRecords,
    sessionReserves: Object.fromEntries(sessionReserves),
    settledSessions: [...settledSessions],
    pendingOrders: [...pendingOrders.values()],
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function hydrateState(): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as PersistedPaymentState;
    walletBalance = data.walletBalance;
    transactions.splice(0, transactions.length, ...data.transactions);
    tokenUsageRecords.splice(0, tokenUsageRecords.length, ...data.tokenUsageRecords);
    sessionReserves.clear();
    for (const [sessionId, amount] of Object.entries(data.sessionReserves)) {
      sessionReserves.set(sessionId, amount);
    }
    settledSessions.clear();
    for (const sessionId of data.settledSessions) {
      settledSessions.add(sessionId);
    }
    pendingOrders.clear();
    for (const order of data.pendingOrders) {
      pendingOrders.set(order.orderId, order);
    }
  } catch {
    // Ignore corrupt mock wallet snapshots.
  }
}

hydrateState();

function sumReserved(): number {
  let total = 0;
  for (const amount of sessionReserves.values()) {
    total += amount;
  }
  return total;
}

function buildSnapshot(): WalletSnapshot {
  const reserved = sumReserved();
  return {
    balance: walletBalance,
    reserved,
    available: walletBalance - reserved,
    transactions: [...transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  };
}

function buildCheckoutUrl(orderId: string): string {
  return `/payment/callback?orderId=${encodeURIComponent(orderId)}&status=PAID`;
}

function findPackage(packageId: string): TokenPackage | SubscriptionPlan | undefined {
  return (
    MOCK_TOKEN_PACKAGES.find((item) => item.id === packageId) ??
    MOCK_SUBSCRIPTION_PLANS.find((item) => item.id === packageId)
  );
}

function resolveTokens(packageId: string): number {
  const tokenPackage = MOCK_TOKEN_PACKAGES.find((item) => item.id === packageId);
  if (tokenPackage) return tokenPackage.tokens;
  const subscription = MOCK_SUBSCRIPTION_PLANS.find((item) => item.id === packageId);
  if (subscription) return subscription.tokensPerMonth;
  return 0;
}

function resolvePrice(packageId: string): number {
  const tokenPackage = MOCK_TOKEN_PACKAGES.find((item) => item.id === packageId);
  if (tokenPackage) return tokenPackage.priceUsd;
  const subscription = MOCK_SUBSCRIPTION_PLANS.find((item) => item.id === packageId);
  if (subscription) return subscription.priceUsdMonthly;
  return 0;
}

function resolveNames(packageId: string): { name: string; nameVi: string } {
  const item = findPackage(packageId);
  if (!item) return { name: packageId, nameVi: packageId };
  return { name: item.name, nameVi: item.nameVi };
}

export const paymentService = {
  async getWallet(): Promise<WalletSnapshot> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    await mockDelay(300);
    return buildSnapshot();
  },

  getBalance(): number {
    return walletBalance;
  },

  getAvailableBalance(): number {
    return walletBalance - sumReserved();
  },

  getReservedBalance(): number {
    return sumReserved();
  },

  hasReservation(sessionId: string): boolean {
    return sessionReserves.has(sessionId);
  },

  getReservationAmount(sessionId: string): number {
    return sessionReserves.get(sessionId) ?? 0;
  },

  async listPackages(): Promise<TokenPackage[]> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    await mockDelay(250);
    return MOCK_TOKEN_PACKAGES;
  },

  async listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    await mockDelay(250);
    return MOCK_SUBSCRIPTION_PLANS;
  },

  async listTokenUsage(): Promise<TokenUsageRecord[]> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    await mockDelay(300);
    return [...tokenUsageRecords].sort(
      (a, b) => new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime(),
    );
  },

  async createOrder(packageId: string): Promise<CreateOrderResult> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    const tokens = resolveTokens(packageId);
    const amountUsd = resolvePrice(packageId);
    const names = resolveNames(packageId);

    if (tokens <= 0) {
      throw new Error('PACKAGE_NOT_FOUND');
    }

    await mockDelay(500);

    const orderId = `order-${crypto.randomUUID().slice(0, 8)}`;
    const order: PaymentOrder = {
      orderId,
      packageId,
      packageName: names.name,
      packageNameVi: names.nameVi,
      tokens,
      amountUsd,
      status: 'pending',
      checkoutUrl: buildCheckoutUrl(orderId),
      createdAt: new Date().toISOString(),
    };

    pendingOrders.set(orderId, order);
    return { order };
  },

  async getOrder(orderId: string): Promise<PaymentOrder | null> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    await mockDelay(200);
    return pendingOrders.get(orderId) ?? null;
  },

  async completeOrder(orderId: string, status: 'PAID' | 'FAILED' | 'CANCELLED'): Promise<CompleteOrderResult> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    await mockDelay(800);

    const order = pendingOrders.get(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    if (status !== 'PAID') {
      order.status = status === 'FAILED' ? 'failed' : 'cancelled';
      pendingOrders.set(orderId, order);
      persistState();
      return { order, wallet: buildSnapshot() };
    }

    order.status = 'paid';
    walletBalance += order.tokens;
    const isSubscription = order.packageId.startsWith('sub-');

    transactions.unshift({
      id: `tx-${crypto.randomUUID().slice(0, 8)}`,
      type: isSubscription ? 'subscription' : 'purchase',
      amount: order.amountUsd,
      tokensDelta: order.tokens,
      description: `${order.packageName} purchase`,
      descriptionVi: `Mua ${order.packageNameVi}`,
      createdAt: new Date().toISOString(),
      status: 'completed',
    });

    pendingOrders.delete(orderId);
    persistState();
    return { order, wallet: buildSnapshot() };
  },

  async reserveTokens(
    sessionId: string,
    amount: number = PRACTICE_RESERVE_ESTIMATE,
  ): Promise<ReserveTokensResult> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    await mockDelay(200);

    if (sessionReserves.has(sessionId)) {
      return { wallet: buildSnapshot(), reservedAmount: sessionReserves.get(sessionId) ?? amount };
    }

    if (buildSnapshot().available < amount) {
      throw new Error('INSUFFICIENT_BALANCE');
    }

    sessionReserves.set(sessionId, amount);

    transactions.unshift({
      id: `tx-${crypto.randomUUID().slice(0, 8)}`,
      type: 'reserve',
      amount: 0,
      tokensDelta: 0,
      description: `Reserved ${amount} tokens for practice session`,
      descriptionVi: `Giữ ${amount} token cho phiên luyện tập`,
      createdAt: new Date().toISOString(),
      status: 'completed',
      sessionId,
    });

    tokenUsageRecords.unshift({
      id: `usage-${crypto.randomUUID().slice(0, 8)}`,
      sessionId,
      sessionTitle: 'Practice interview',
      sessionTitleVi: 'Phien luyen phong van',
      reservedTokens: amount,
      actualTokens: 0,
      settledAt: new Date().toISOString(),
      status: 'reserved',
    });

    persistState();
    return { wallet: buildSnapshot(), reservedAmount: amount };
  },

  async settleTokens(
    sessionId: string,
    actualTokens: number = MOCK_SETTLE_ACTUAL_TOKENS,
  ): Promise<SettleTokensResult> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    await mockDelay(300);

    if (settledSessions.has(sessionId)) {
      const existing = tokenUsageRecords.find(
        (item) => item.sessionId === sessionId && item.status === 'settled',
      );
      if (existing) {
        return { wallet: buildSnapshot(), usage: existing };
      }
    }

    const reserved = sessionReserves.get(sessionId);
    if (!reserved) {
      throw new Error('NO_RESERVATION');
    }

    sessionReserves.delete(sessionId);
    walletBalance -= actualTokens;
    settledSessions.add(sessionId);

    const usage: TokenUsageRecord = {
      id: `usage-${crypto.randomUUID().slice(0, 8)}`,
      sessionId,
      sessionTitle: 'Practice interview',
      sessionTitleVi: 'Phien luyen phong van',
      reservedTokens: reserved,
      actualTokens,
      settledAt: new Date().toISOString(),
      status: 'settled',
    };

    const reservedIndex = tokenUsageRecords.findIndex(
      (item) => item.sessionId === sessionId && item.status === 'reserved',
    );
    if (reservedIndex >= 0) {
      tokenUsageRecords[reservedIndex] = usage;
    } else {
      tokenUsageRecords.unshift(usage);
    }

    transactions.unshift({
      id: `tx-${crypto.randomUUID().slice(0, 8)}`,
      type: 'settlement',
      amount: 0,
      tokensDelta: -actualTokens,
      description: `Settled ${actualTokens} tokens (reserved ${reserved})`,
      descriptionVi: `Quyet toan ${actualTokens} token (giu ${reserved})`,
      createdAt: new Date().toISOString(),
      status: 'completed',
      sessionId,
    });

    persistState();
    return { wallet: buildSnapshot(), usage };
  },
};
