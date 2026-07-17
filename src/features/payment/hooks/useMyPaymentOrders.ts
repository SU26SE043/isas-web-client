import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service';
import type { PackageResponse, PaymentOrderDetail, PaymentOrderStatusResult } from '../types/payment.types';
import { isLivePendingStatus } from '../utils/livePaymentStatus';

export const MY_PAYMENT_ORDERS_QUERY_KEY = ['payment', 'my-orders'] as const;
export const PAYMENT_ORDER_STATUS_QUERY_KEY = ['payment', 'order-status'] as const;

export interface MyPaymentOrdersBundle {
  orders: PaymentOrderDetail[];
  statuses: Record<string, PaymentOrderStatusResult>;
}

function enrichOrdersWithPackages(
  orders: PaymentOrderDetail[],
  packages: PackageResponse[],
): PaymentOrderDetail[] {
  const byId = new Map(packages.map((pkg) => [pkg.id, pkg]));

  return orders.map((order) => {
    const pkg = byId.get(order.packageId);
    if (!pkg) return order;

    return {
      ...order,
      packageName: order.packageName ?? pkg.name,
      priceVnd: order.priceVnd && order.priceVnd > 0 ? order.priceVnd : pkg.priceVnd,
      interviewCredits: order.interviewCredits ?? pkg.interviewCredits,
    };
  });
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

export function useMyPaymentOrders() {
  return useQuery<MyPaymentOrdersBundle, Error>({
    queryKey: MY_PAYMENT_ORDERS_QUERY_KEY,
    queryFn: async () => {
      const [orders, packages] = await Promise.all([
        paymentService.listMyOrders(),
        paymentService.listCatalogPackages().catch(() => [] as PackageResponse[]),
      ]);
      const enriched = enrichOrdersWithPackages(orders, packages);
      const statuses = await fetchStatusesForOrders(enriched.map((order) => order.orderId));
      return { orders: enriched, statuses };
    },
    retry: false,
    staleTime: 15_000,
    refetchInterval: (query) => {
      const statuses = query.state.data?.statuses;
      if (!statuses) return false;
      const hasPending = Object.values(statuses).some((item) => isLivePendingStatus(item.status));
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
