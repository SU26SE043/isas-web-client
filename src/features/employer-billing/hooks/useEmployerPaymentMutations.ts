import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employerPaymentService } from '../services/employerPayment.service';
import type { PackageResponse } from '../types/employerPayment.types';
import {
  buildCreateOrderRequest,
  persistPendingPayment,
} from '../utils/employerPayment';
import { employerPaymentKeys } from './employerPayment.keys';

export function useCreateEmployerOrder() {
  return useMutation({
    mutationFn: async (pkg: PackageResponse) => {
      const order = await employerPaymentService.createPaymentOrder(
        buildCreateOrderRequest(pkg.id, window.location.origin),
      );
      if (!order.checkoutUrl) throw new Error('CHECKOUT_URL_MISSING');
      persistPendingPayment(order.id, pkg.id, pkg.type);
      return order;
    },
    onSuccess: (order) => {
      window.location.assign(order.checkoutUrl!);
    },
  });
}

export function useCancelEmployerOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employerPaymentService.cancelOrder,
    onSettled: async (_data, _error, orderId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: employerPaymentKeys.orders() }),
        queryClient.invalidateQueries({ queryKey: employerPaymentKeys.order(orderId) }),
        queryClient.invalidateQueries({ queryKey: employerPaymentKeys.orderStatus(orderId) }),
      ]);
    },
  });
}

export async function invalidateEmployerPayment(
  queryClient: ReturnType<typeof useQueryClient>,
  orderId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: employerPaymentKeys.order(orderId) }),
    queryClient.invalidateQueries({ queryKey: employerPaymentKeys.orders() }),
    queryClient.invalidateQueries({ queryKey: employerPaymentKeys.account() }),
    queryClient.invalidateQueries({ queryKey: employerPaymentKeys.subscription() }),
    queryClient.invalidateQueries({ queryKey: employerPaymentKeys.transactions() }),
  ]);
}
