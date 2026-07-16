import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service';
import type { PaymentOrderDetail } from '../types/payment.types';

export const PAYMENT_ORDER_QUERY_KEY = ['payment', 'order'] as const;

export function usePaymentOrder(orderId: string | null, enabled = true) {
  return useQuery<PaymentOrderDetail, Error>({
    queryKey: [...PAYMENT_ORDER_QUERY_KEY, orderId],
    queryFn: () => paymentService.fetchOrderDetail(orderId!),
    enabled: enabled && Boolean(orderId),
    retry: false,
    staleTime: 30_000,
  });
}
