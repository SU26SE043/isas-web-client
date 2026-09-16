import { useQuery } from '@tanstack/react-query';
import { getApiStatusCode } from '@/shared/api/apiError';
import { adminPaymentService } from '../services/adminPayment.service';
import type { AdminOrderParams } from '../types/adminApi.types';

export const adminOrdersKey = (params: AdminOrderParams) => ['admin-orders', params] as const;

/** `GET payment/admin/orders` keyset (body mảng + `X-Next-Cursor`); filter đổi ⇒ caller reset cursor. */
export function useAdminOrders(params: AdminOrderParams) {
  return useQuery({
    queryKey: adminOrdersKey(params),
    queryFn: () => adminPaymentService.listOrders(params),
    placeholderData: (previous) => previous,
    retry: (count, error) => { const status = getApiStatusCode(error); return status === 401 || status === 403 ? false : count < 2; },
  });
}
