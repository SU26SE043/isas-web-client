import { apiClient } from '@/shared/api/apiClient';
import { isPlaywrightRuntime } from '@/shared/mock';
import type {
  CreateOrderRequest,
  CreditTransaction,
  CreditTransactionPage,
  CursorPage,
  OrderResponse,
  OrderStatusResponse,
  PackageResponse,
  PaymentAccountResponse,
  SubscriptionResponse,
  InvoiceResponse,
} from '../types/employerPayment.types';
import {
  parseAccount,
  parseOrder,
  parseOrderStatus,
  parsePackage,
  parseSubscription,
  parseTransaction,
  parseInvoice,
  readNextCursor,
  unwrapList,
} from './employerPayment.parsers';

const prefix = '/api/v1/payment';

const endpoint = {
  packages: `${prefix}/package`,
  package: (id: string) => `${prefix}/package/${encodeURIComponent(id)}`,
  orders: `${prefix}/order/my-orders`,
  createOrder: `${prefix}/order`,
  order: (id: string) => `${prefix}/order/${encodeURIComponent(id)}`,
  status: (id: string) => `${prefix}/order/${encodeURIComponent(id)}/status`,
  account: `${prefix}/me/account`,
  subscription: `${prefix}/me/subscription`,
  transactions: `${prefix}/me/credit-transactions`,
  invoices: `${prefix}/me/invoices`,
  invoice: (id: string) => `${prefix}/me/invoices/${encodeURIComponent(id)}`,
  payInvoice: (id: string) => `${prefix}/invoices/${encodeURIComponent(id)}/pay`,
  cancelSubscription: `${prefix}/me/subscription/cancel`,
};

const E2E_INVOICES: InvoiceResponse[] = [
  {
    id: 'inv_2026_009',
    ownerType: 0,
    ownerId: 'e2e-org',
    accountId: 'e2e-account',
    periodStart: '2026-07-01T00:00:00.000Z',
    periodEnd: '2026-07-31T23:59:59.999Z',
    interviewCount: 720,
    unitPrice: 4.85,
    amount: 3490,
    status: 1,
    createdAt: '2026-08-01T09:00:00.000Z',
  },
];

function pageParams(cursor?: string | null, limit = 20) {
  return { ...(cursor ? { cursor } : {}), limit };
}

export const employerPaymentService = {
  async getPackages(): Promise<PackageResponse[]> {
    const response = await apiClient.get<unknown>(endpoint.packages);
    return unwrapList(response.data).map(parsePackage).filter((item) => item.isActive);
  },

  async getPackageById(id: string): Promise<PackageResponse> {
    const response = await apiClient.get<unknown>(endpoint.package(id));
    return parsePackage(response.data);
  },

  async createPaymentOrder(payload: CreateOrderRequest): Promise<OrderResponse> {
    const response = await apiClient.post<unknown>(endpoint.createOrder, payload);
    return parseOrder(response.data);
  },

  async getMyOrders(params?: {
    cursor?: string | null;
    limit?: number;
  }): Promise<CursorPage<OrderResponse>> {
    const response = await apiClient.get<unknown>(endpoint.orders, {
      params: pageParams(params?.cursor, params?.limit),
    });
    return {
      data: unwrapList(response.data).map(parseOrder),
      nextCursor: readNextCursor(response.headers),
    };
  },

  async getMyOrderById(id: string): Promise<OrderResponse> {
    const response = await apiClient.get<unknown>(endpoint.order(id));
    return parseOrder(response.data);
  },

  async getOrderStatus(id: string): Promise<OrderStatusResponse> {
    const response = await apiClient.get<unknown>(endpoint.status(id));
    return parseOrderStatus(response.data);
  },

  async cancelOrder(id: string): Promise<void> {
    await apiClient.delete(endpoint.order(id));
  },

  async getPaymentAccount(): Promise<PaymentAccountResponse> {
    const response = await apiClient.get<unknown>(endpoint.account);
    return parseAccount(response.data);
  },

  async getCreditTransactions(params?: {
    cursor?: string | null;
    limit?: number;
  }): Promise<CreditTransactionPage> {
    const response = await apiClient.get<CreditTransaction[]>(endpoint.transactions, {
      params: pageParams(params?.cursor, params?.limit),
    });
    return {
      items: Array.isArray(response.data) ? response.data.map(parseTransaction) : [],
      nextCursor: readNextCursor(response.headers),
    };
  },

  async getMySubscription(): Promise<SubscriptionResponse> {
    const response = await apiClient.get<unknown>(endpoint.subscription);
    return parseSubscription(response.data);
  },

  async cancelSubscription(): Promise<{ subscriptionId: string | null; cancelled: boolean }> {
    const response = await apiClient.post<unknown>(endpoint.cancelSubscription, {});
    const raw = response.data && typeof response.data === 'object' ? response.data as Record<string, unknown> : {};
    return {
      subscriptionId: raw.subscriptionId == null ? null : String(raw.subscriptionId),
      cancelled: raw.cancelled === true,
    };
  },

  async getInvoices(): Promise<InvoiceResponse[]> {
    if (isPlaywrightRuntime()) return E2E_INVOICES;
    const response = await apiClient.get<unknown>(endpoint.invoices);
    return unwrapList(response.data).map(parseInvoice);
  },

  async getInvoiceById(id: string): Promise<InvoiceResponse> {
    const response = await apiClient.get<unknown>(endpoint.invoice(id));
    return parseInvoice(response.data);
  },

  async payInvoice(id: string): Promise<OrderResponse> {
    const response = await apiClient.post<unknown>(endpoint.payInvoice(id), {});
    return parseOrder(response.data);
  },
};
