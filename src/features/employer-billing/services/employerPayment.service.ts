import { apiClient } from '@/shared/api/apiClient';
import type {
  CreateOrderRequest,
  CreditTransactionResponse,
  CursorPage,
  OrderResponse,
  OrderStatusResponse,
  PackageResponse,
  PaymentAccountResponse,
  SubscriptionResponse,
} from '../types/employerPayment.types';
import {
  parseAccount,
  parseOrder,
  parseOrderStatus,
  parsePackage,
  parseSubscription,
  parseTransaction,
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
};

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
  }): Promise<CursorPage<CreditTransactionResponse>> {
    const response = await apiClient.get<unknown>(endpoint.transactions, {
      params: pageParams(params?.cursor, params?.limit),
    });
    return {
      data: unwrapList(response.data).map(parseTransaction),
      nextCursor: readNextCursor(response.headers),
    };
  },

  async getMySubscription(): Promise<SubscriptionResponse> {
    const response = await apiClient.get<unknown>(endpoint.subscription);
    return parseSubscription(response.data);
  },
};

