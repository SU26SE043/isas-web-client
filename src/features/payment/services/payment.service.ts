import { apiClient } from '@/shared/api/apiClient';
import { getApiErrorMessage } from '@/shared/api/apiError';
import axios from 'axios';
import { mockDelay, usesMockData } from '@/shared/mock';
import { MOCK_SETTLE_ACTUAL_TOKENS, PRACTICE_RESERVE_ESTIMATE } from '../constants';
import { paymentEndpoints } from './payment.endpoints';
import type {
  CompleteOrderResult,
  CreateOrderResult,
  ReserveTokensResult,
  SettleTokensResult,
  PackageResponse,
  PaymentOrder,
  PaymentOrderDetail,
  PaymentOrderStatusResult,
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
import {
  getOrderPaymentStatus,
  isPaymentTerminalStatus,
} from '../utils/paymentOrderOutcome';
import {
  mapPaymentOrderError,
  mapPaymentOrderFetchError,
  mapPaymentOrderCancelError,
  parseOrderResponse,
  parseOrderStatus,
  parseOrderStatusResult,
  toPaymentOrder,
  toPaymentOrderDetail,
  normalizeOrderStatus,
  unwrapOrderList,
} from './paymentOrder.parsers';

function toInt(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toNullableInt(value: unknown): number | null {
  if (value == null || value === '') return null;
  const parsed = toInt(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePackageResponse(raw: unknown): PackageResponse | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  const id = String(data.id ?? '');
  const name = String(data.name ?? '').trim();
  if (!id || !name) return null;

  return {
    id,
    name,
    type: typeof data.type === 'string' || typeof data.type === 'number' ? data.type : 1,
    priceVnd: toInt(data.priceVnd),
    interviewCredits: toNullableInt(data.interviewCredits),
    durationDays: toNullableInt(data.durationDays),
    isActive: data.isActive !== false,
    createdAt: String(data.createdAt ?? ''),
  };
}

function unwrapList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const nested = (payload as { data: unknown }).data;
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

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

function shouldUseMockOrderFallback(error: unknown): boolean {
  if (!usesMockData('payment')) return false;
  if (!axios.isAxiosError(error)) return true;
  return !error.response;
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

  /**
   * Public catalog — always hits PaymentService (no mock).
   * `GET /api/v1/payment/package` → active PackageResponse[].
   */
  async listCatalogPackages(): Promise<PackageResponse[]> {
    try {
      const response = await apiClient.get<unknown>(paymentEndpoints.listPackages);
      return unwrapList(response.data)
        .map(parsePackageResponse)
        .filter((item): item is PackageResponse => item != null && item.isActive);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load packages.'));
    }
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
    try {
      const response = await apiClient.post<unknown>(paymentEndpoints.createOrder, { packageId });
      const dto = parseOrderResponse(response.data);
      if (!dto) {
        throw new Error('INVALID_ORDER_RESPONSE');
      }
      if (!dto.checkoutUrl) {
        throw new Error('CHECKOUT_URL_MISSING');
      }
      return { order: toPaymentOrder(dto) };
    } catch (error) {
      throw mapPaymentOrderError(error, 'Failed to create order.');
    }
  },

  async getOrder(orderId: string): Promise<PaymentOrder | null> {
    try {
      const detail = await paymentService.fetchOrderDetail(orderId);
      return {
        orderId: detail.orderId,
        packageId: detail.packageId,
        packageName: detail.packageName ?? detail.packageId,
        packageNameVi: detail.packageName ?? detail.packageId,
        tokens: detail.interviewCredits ?? 0,
        amountUsd: 0,
        priceVnd: detail.priceVnd,
        status: normalizeOrderStatus(detail.status),
        checkoutUrl: null,
        createdAt: detail.createdAt ?? new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'PAYMENT_ORDER_NOT_FOUND') {
        return null;
      }
      throw mapPaymentOrderFetchError(error, 'Failed to load order.');
    }
  },

  async listMyOrders(): Promise<PaymentOrderDetail[]> {
    try {
      const response = await apiClient.get<unknown>(paymentEndpoints.listMyOrders);
      return unwrapOrderList(response.data)
        .map(parseOrderResponse)
        .filter((item): item is NonNullable<typeof item> => item != null)
        .map(toPaymentOrderDetail);
    } catch (error) {
      throw mapPaymentOrderFetchError(error, 'Failed to load orders.');
    }
  },

  async fetchOrderDetail(orderId: string): Promise<PaymentOrderDetail> {
    try {
      const response = await apiClient.get<unknown>(paymentEndpoints.getOrder(orderId));
      const dto = parseOrderResponse(response.data);
      if (!dto) {
        throw new Error('INVALID_ORDER_RESPONSE');
      }
      return toPaymentOrderDetail(dto);
    } catch (error) {
      throw mapPaymentOrderFetchError(error, 'Failed to load order.');
    }
  },

  /**
   * Poll `GET /order/{id}` until payment reaches a terminal status or attempts are exhausted.
   * Never infers success from URL params — only OrderResponse fields.
   */
  async pollOrderDetail(
    orderId: string,
    options?: { intervalMs?: number; maxAttempts?: number },
  ): Promise<PaymentOrderDetail> {
    const intervalMs = options?.intervalMs ?? 2000;
    const maxAttempts = options?.maxAttempts ?? 15;
    let latest: PaymentOrderDetail | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      latest = await paymentService.fetchOrderDetail(orderId);
      const status = getOrderPaymentStatus(latest);

      if (isPaymentTerminalStatus(status)) {
        return latest;
      }

      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
      }
    }

    if (!latest) {
      throw new Error('PAYMENT_ORDER_NOT_FOUND');
    }

    return latest;
  },

  async getOrderStatus(orderId: string): Promise<string> {
    try {
      const response = await apiClient.get<unknown>(paymentEndpoints.getOrderStatus(orderId));
      return parseOrderStatus(response.data);
    } catch (error) {
      if (!shouldUseMockOrderFallback(error)) {
        throw mapPaymentOrderError(error, 'Failed to load order status.');
      }
      await mockDelay(200);
      const order = pendingOrders.get(orderId);
      if (!order) return 'NotFound';
      if (order.status === 'paid') return 'Paid';
      if (order.status === 'cancelled') return 'Cancelled';
      if (order.status === 'failed') return 'Failed';
      return 'Pending';
    }
  },

  async fetchOrderStatus(orderId: string): Promise<PaymentOrderStatusResult> {
    try {
      const response = await apiClient.get<unknown>(paymentEndpoints.getOrderStatus(orderId));
      return parseOrderStatusResult(response.data);
    } catch (error) {
      throw mapPaymentOrderFetchError(error, 'Failed to load order status.');
    }
  },

  async cancelOrder(orderId: string): Promise<void> {
    try {
      await apiClient.delete(paymentEndpoints.cancelOrder(orderId));
    } catch (error) {
      throw mapPaymentOrderCancelError(error, 'Failed to cancel order.');
    }
  },

  async pollOrderStatus(
    orderId: string,
    options?: { intervalMs?: number; maxAttempts?: number },
  ): Promise<string> {
    const intervalMs = options?.intervalMs ?? 2000;
    const maxAttempts = options?.maxAttempts ?? 45;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const status = await paymentService.getOrderStatus(orderId);
      if (status === 'Paid' || status === 'Failed' || status === 'Cancelled' || status === 'Canceled') {
        return status;
      }
      await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
    }

    throw new Error('ORDER_STATUS_TIMEOUT');
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
