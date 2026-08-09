import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service';
import type { PaymentOrderDetail, PaymentOrderStatusResult } from '../types/payment.types';
import { isLivePendingStatus } from '../utils/livePaymentStatus';

export const paymentKeys = {
  all: ['payment'] as const,
  packages: () => [...paymentKeys.all, 'packages'] as const,
  account: () => [...paymentKeys.all, 'account'] as const,
  subscription: () => [...paymentKeys.all, 'subscription'] as const,
  transactions: () => [...paymentKeys.all, 'credit-transactions'] as const,
  orders: () => [...paymentKeys.all, 'orders'] as const,
  order: (orderId: string) => [...paymentKeys.all, 'order', orderId] as const,
  orderStatus: (orderId: string) => [...paymentKeys.all, 'order-status', orderId] as const,
};

export const MY_PAYMENT_ORDERS_QUERY_KEY = paymentKeys.orders();
export const PAYMENT_ORDER_STATUS_QUERY_KEY = [...paymentKeys.all, 'order-status'] as const;

export interface MyPaymentOrdersBundle {
  orders: PaymentOrderDetail[];
  statuses: Record<string, PaymentOrderStatusResult>;
  nextCursor: string | null;
}

async function fetchStatusesForOrders(
  orderIds: string[],
): Promise<Record<string, PaymentOrderStatusResult>> {
  const results = await Promise.allSettled(
    orderIds.map(async (orderId) => {
      const status = await paymentService.fetchOrderStatus(orderId);
      return [orderId, status] as const;
    }),
  );

  const statuses: Record<string, PaymentOrderStatusResult> = {};
  for (const result of results) {
    if (result.status === 'fulfilled') {
      const [orderId, status] = result.value;
      statuses[orderId] = status;
    }
  }
  return statuses;
}

export function useMyPaymentOrders(enabled = true) {
  return useInfiniteQuery<{ orders: PaymentOrderDetail[]; statuses: Record<string, PaymentOrderStatusResult>; nextCursor: string | null }, Error, MyPaymentOrdersBundle, typeof MY_PAYMENT_ORDERS_QUERY_KEY, string | null>({
    queryKey: MY_PAYMENT_ORDERS_QUERY_KEY,
    queryFn: async ({ pageParam }) => {
      const page = await paymentService.getMyOrdersPage({ cursor: pageParam, limit: 25 });
      const statuses = await fetchStatusesForOrders(page.items.map((order) => order.orderId));
      return { orders: page.items, statuses, nextCursor: page.nextCursor };
    },
    initialPageParam: null,
    enabled,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    select: (data) => ({
      orders: data.pages.flatMap((page) => page.orders),
      statuses: Object.assign({}, ...data.pages.map((page) => page.statuses)),
      nextCursor: data.pages.at(-1)?.nextCursor ?? null,
    }),
    retry: false,
    staleTime: 15_000,
    refetchInterval: (query) => {
      const statuses = query.state.data?.pages.flatMap((page) => Object.values(page.statuses));
      if (!statuses) return false;
      const hasPending = statuses.some((item) => isLivePendingStatus(item.status));
      return hasPending ? 10_000 : false;
    },
  });
}

export function usePaymentOrderStatus(orderId: string | null, enabled = true) {
  return useQuery<PaymentOrderStatusResult, Error>({
    queryKey: [...PAYMENT_ORDER_STATUS_QUERY_KEY, orderId],
    queryFn: () => paymentService.fetchOrderStatus(orderId!),
    enabled: enabled && Boolean(orderId),
    retry: false,
  });
}

export function useCancelPaymentOrder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (orderId) => paymentService.cancelOrder(orderId),
    onSuccess: async (_data, orderId) => {
      queryClient.setQueryData<MyPaymentOrdersBundle>(MY_PAYMENT_ORDERS_QUERY_KEY, (current) => {
        if (!current) return current;
        const previous = current.statuses[orderId];
        return {
          ...current,
          statuses: {
            ...current.statuses,
            [orderId]: {
              orderCode: previous?.orderCode ?? 0,
              status: 'Cancelled',
              paidAt: previous?.paidAt ?? null,
            },
          },
          nextCursor: current.nextCursor,
        };
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MY_PAYMENT_ORDERS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: [...PAYMENT_ORDER_STATUS_QUERY_KEY, orderId] }),
      ]);
    },
  });
}

export function resolveOrdersErrorMessage(error: unknown, t: (key: string) => string): string {
  if (error instanceof Error) {
    if (error.message === 'PAYMENT_FORBIDDEN') return t('payment.orders.forbidden');
    if (error.message === 'PAYMENT_ORDER_NOT_FOUND') return t('payment.orders.notFound');
  }
  return t('payment.orders.loadError');
}

export function resolveCancelOrderErrorMessage(error: unknown, t: (key: string) => string): string {
  if (error instanceof Error) {
    if (error.message === 'PAYMENT_FORBIDDEN') return t('payment.orders.forbidden');
    if (error.message === 'PAYMENT_ORDER_NOT_FOUND') return t('payment.orders.notFound');
    if (error.message === 'PAYMENT_ORDER_NOT_PENDING') return t('payment.orders.cancelNotPending');
  }
  return t('payment.orders.cancelError');
}
