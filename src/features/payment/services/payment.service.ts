import { apiClient } from '@/shared/api/apiClient';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { paymentEndpoints } from './payment.endpoints';
import type {
  CreateOrderResult,
  PackageResponse,
  PaymentOrder,
  PaymentOrderDetail,
  PaymentOrderStatusResult,
  TokenUsageRecord,
  WalletTransaction,
  WalletSnapshot,
  PaymentAccountResponse,
  SubscriptionResponse,
  CreditTransactionResponse,
  CursorPage,
} from '../types/payment.types';
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
    type: typeof data.type === 'string' || typeof data.type === 'number' ? data.type : (() => { throw new Error('INVALID_PAYMENT_RESPONSE:type'); })(),
    priceVnd: requiredInt(data.priceVnd, 'priceVnd'),
    interviewCredits: toNullableInt(data.interviewCredits),
    durationDays: toNullableInt(data.durationDays),
    planId: data.planId == null ? null : String(data.planId),
    audience: data.audience == null ? null : requiredInt(data.audience, 'audience') as 0 | 1,
    isActive: typeof data.isActive === 'boolean' ? data.isActive : (() => { throw new Error('INVALID_PAYMENT_RESPONSE:isActive'); })(),
    createdAt: String(data.createdAt ?? ''),
  };
}

function unwrapList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const nested = (payload as { data: unknown }).data;
    if (Array.isArray(nested)) return nested;
    if (nested && typeof nested === 'object' && 'items' in nested) {
      const items = (nested as { items: unknown }).items;
      if (Array.isArray(items)) return items;
    }
  }
  if (payload && typeof payload === 'object' && 'items' in payload) {
    const items = (payload as { items: unknown }).items;
    if (Array.isArray(items)) return items;
  }
  return [];
}

function requiredInt(value: unknown, field: string): number {
  const parsed = toInt(value, Number.NaN);
  if (!Number.isFinite(parsed)) throw new Error(`INVALID_PAYMENT_RESPONSE:${field}`);
  return parsed;
}

interface LivePaymentAccount {
  remainingCredits: number;
  reservedCredits: number;
}

function parsePaymentAccount(payload: unknown): PaymentAccountResponse {
  const raw = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const data = raw.data && typeof raw.data === 'object' ? (raw.data as Record<string, unknown>) : raw;
  return {
    ownerType: requiredInt(data.ownerType, 'ownerType') as 0 | 1,
    ownerId: String(data.ownerId ?? ''),
    paymentMode: requiredInt(data.paymentMode, 'paymentMode') as 0 | 1,
    status: requiredInt(data.status, 'status') as 0 | 1,
    remainingCredits: requiredInt(data.remainingCredits, 'remainingCredits'),
    reservedCredits: requiredInt(data.reservedCredits, 'reservedCredits'),
    freeCreditsGranted: toInt(data.freeCreditsGranted),
    creditLimit: toNullableInt(data.creditLimit),
    periodUsage: toNullableInt(data.periodUsage),
    updatedAt: String(data.updatedAt ?? ''),
  };
}

function parseSubscription(payload: unknown): SubscriptionResponse {
  const raw = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const data = raw.data && typeof raw.data === 'object' ? (raw.data as Record<string, unknown>) : raw;
  const cycle = data.billingCycle === 'Monthly' || data.billingCycle === 'Annual' ? data.billingCycle : null;
  return {
    ownerType: requiredInt(data.ownerType, 'ownerType') as 0 | 1,
    ownerId: String(data.ownerId ?? ''),
    active: typeof data.active === 'boolean' ? data.active : (() => { throw new Error('INVALID_PAYMENT_RESPONSE:active'); })(),
    billingCycle: cycle,
    startedAt: data.startedAt == null ? null : String(data.startedAt),
    expiresAt: data.expiresAt == null ? null : String(data.expiresAt),
  };
}

interface LiveCreditTransaction {
  id: string;
  delta: number;
  reason: number;
  sessionId: string | null;
  orderId: string | null;
  reversesTransactionId: string | null;
  createdAt: string;
}

function parseLiveAccount(payload: unknown): LivePaymentAccount {
  const raw = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const data = raw.data && typeof raw.data === 'object' ? (raw.data as Record<string, unknown>) : raw;
  return {
    remainingCredits: requiredInt(data.remainingCredits, 'remainingCredits'),
    reservedCredits: requiredInt(data.reservedCredits, 'reservedCredits'),
  };
}

function parseLiveTransaction(payload: unknown): LiveCreditTransaction | null {
  if (!payload || typeof payload !== 'object') return null;
  const raw = payload as Record<string, unknown>;
  const data = raw.data && typeof raw.data === 'object' ? (raw.data as Record<string, unknown>) : raw;
  const id = String(data.id ?? '').trim();
  const createdAt = String(data.createdAt ?? '').trim();
  if (!id || !createdAt) return null;
  const delta = requiredInt(data.delta, 'delta');
  if (delta === 0) return null;
  return {
    id,
    delta,
    reason: requiredInt(data.reason, 'reason'),
    sessionId: data.sessionId == null ? null : String(data.sessionId),
    orderId: data.orderId == null ? null : String(data.orderId),
    reversesTransactionId: data.reversesTransactionId == null ? null : String(data.reversesTransactionId),
    createdAt,
  };
}

function transactionType(reason: number, delta: number): WalletTransaction['type'] {
  if (reason === 4) return 'refund';
  if (reason === 0 || reason === 5) return 'purchase';
  if (reason === 1 || reason === 2 || reason === 3) return 'consumption';
  return delta < 0 ? 'consumption' : 'purchase';
}

function toWalletTransaction(transaction: LiveCreditTransaction): WalletTransaction {
  const type = transactionType(transaction.reason, transaction.delta);
  return {
    id: transaction.id,
    type,
    amount: 0,
    tokensDelta: transaction.delta,
    description: type,
    descriptionVi: type,
    createdAt: transaction.createdAt,
    status: 'completed',
    sessionId: transaction.sessionId ?? undefined,
    orderId: transaction.orderId ?? undefined,
    reason: transaction.reason,
  };
}

async function fetchLiveCreditTransactions(params?: { cursor?: string | null; limit?: number }): Promise<LiveCreditTransaction[]> {
  const response = await apiClient.get<unknown>(paymentEndpoints.creditTransactions, {
    params: { ...(params?.cursor ? { cursor: params.cursor } : {}), ...(params?.limit ? { limit: params.limit } : {}) },
  });
  const payload = unwrapList(response.data);
  return payload
    .map(parseLiveTransaction)
    .filter((item): item is LiveCreditTransaction => item != null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const paymentService = {
  async getPaymentAccount(): Promise<PaymentAccountResponse> {
    const response = await apiClient.get<unknown>(paymentEndpoints.walletAccount);
    return parsePaymentAccount(response.data);
  },

  async getSubscription(): Promise<SubscriptionResponse> {
    const response = await apiClient.get<unknown>(paymentEndpoints.subscription);
    return parseSubscription(response.data);
  },

  async getCreditTransactions(params?: { cursor?: string | null; limit?: number }): Promise<CursorPage<CreditTransactionResponse>> {
    const response = await apiClient.get<unknown>(paymentEndpoints.creditTransactions, {
      params: { ...(params?.cursor ? { cursor: params.cursor } : {}), ...(params?.limit ? { limit: params.limit } : {}) },
    });
    const items = unwrapList(response.data)
      .map(parseLiveTransaction)
      .filter((item): item is LiveCreditTransaction => item != null);
    const nextCursor = response.headers['x-next-cursor'] ?? response.headers['X-Next-Cursor'] ?? null;
    return {
      items: items.map((item) => ({
        id: item.id,
        delta: item.delta,
        reason: item.reason,
        sessionId: item.sessionId,
        orderId: item.orderId,
        reversesTransactionId: item.reversesTransactionId,
        createdAt: item.createdAt,
      })),
      nextCursor: typeof nextCursor === 'string' && nextCursor ? nextCursor : null,
    };
  },

  async getWallet(): Promise<WalletSnapshot> {
    const [accountResponse, liveTransactions] = await Promise.all([
      apiClient.get<unknown>(paymentEndpoints.walletAccount),
      fetchLiveCreditTransactions(),
    ]);
    const account = parseLiveAccount(accountResponse.data);
    return {
      balance: account.remainingCredits + account.reservedCredits,
      reserved: account.reservedCredits,
      available: account.remainingCredits,
      transactions: liveTransactions.map(toWalletTransaction),
    };
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

  async listTokenUsage(): Promise<TokenUsageRecord[]> {
    const transactions = await fetchLiveCreditTransactions();
    return transactions
      .filter((transaction) => transaction.sessionId)
      .map((transaction) => {
        const actualTokens = Math.max(0, -transaction.delta);
        return {
          id: transaction.id,
          sessionId: transaction.sessionId as string,
          sessionTitle: transaction.sessionId as string,
          sessionTitleVi: transaction.sessionId as string,
          reservedTokens: actualTokens,
          actualTokens,
          settledAt: transaction.createdAt,
          status: 'settled' as const,
        };
      });
  },

  async createOrder(packageId: string): Promise<CreateOrderResult> {
    try {
      const response = await apiClient.post<unknown>(paymentEndpoints.createOrder, {
        packageId,
        returnUrl: `${window.location.origin}/payment/callback`,
        cancelUrl: `${window.location.origin}/payment/callback?status=CANCELLED`,
      });
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
      const mapped = mapPaymentOrderFetchError(error, 'Failed to load orders.');
      if (mapped.message === 'PAYMENT_ORDER_NOT_FOUND') {
        return [];
      }
      throw mapped;
    }
  },

  async getMyOrdersPage(params?: { cursor?: string | null; limit?: number }): Promise<CursorPage<PaymentOrderDetail>> {
    const response = await apiClient.get<unknown>(paymentEndpoints.listMyOrders, {
      params: { ...(params?.cursor ? { cursor: params.cursor } : {}), ...(params?.limit ? { limit: params.limit } : {}) },
    });
    const items = unwrapOrderList(response.data)
      .map(parseOrderResponse)
      .filter((item): item is NonNullable<typeof item> => item != null)
      .map(toPaymentOrderDetail);
    const nextCursor = response.headers['x-next-cursor'] ?? null;
    return { items, nextCursor: typeof nextCursor === 'string' && nextCursor ? nextCursor : null };
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
    const response = await apiClient.get<unknown>(paymentEndpoints.getOrderStatus(orderId));
    return parseOrderStatus(response.data);
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
      if (['Paid', 'Failed', 'Expired', 'Cancelled', 'Canceled', 'Refunded'].includes(status)) {
        return status;
      }
      await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
    }

    throw new Error('ORDER_STATUS_TIMEOUT');
  },

};
