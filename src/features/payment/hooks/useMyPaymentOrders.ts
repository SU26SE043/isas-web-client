import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service';
import type { PaymentOrderDetail, PaymentOrderStatusResult } from '../types/payment.types';

export const MY_PAYMENT_ORDERS_QUERY_KEY = ['payment', 'my-orders'] as const;
export const PAYMENT_ORDER_STATUS_QUERY_KEY = ['payment', 'order-status'] as const;

export function useMyPaymentOrders() {
  return useQuery<PaymentOrderDetail[], Error>({
    queryKey: MY_PAYMENT_ORDERS_QUERY_KEY,
    queryFn: () => paymentService.listMyOrders(),
    retry: false,
    staleTime: 15_000,
  });
}

export function usePaymentOrderStatus(orderId: string | null) {
  return useQuery<PaymentOrderStatusResult, Error>({
    queryKey: [...PAYMENT_ORDER_STATUS_QUERY_KEY, orderId],
    queryFn: () => paymentService.fetchOrderStatus(orderId!),
    enabled: Boolean(orderId),
    refetchInterval: (query) => {
      const status = query.state.data?.status.toLowerCase();
      return status === 'pending' ? 5_000 : false;
    },
    retry: false,
  });
}

export function useCancelPaymentOrder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (orderId) => paymentService.cancelOrder(orderId),
    onSuccess: async (_data, orderId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MY_PAYMENT_ORDERS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: [...PAYMENT_ORDER_STATUS_QUERY_KEY, orderId] }),
      ]);
    },
  });
}
