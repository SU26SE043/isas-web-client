import { useInfiniteQuery } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service';
import { paymentKeys } from './useMyPaymentOrders';
import type { CreditTransactionResponse, CursorPage } from '../types/payment.types';

export function useCreditTransactions(limit = 25, enabled = true) {
  return useInfiniteQuery<CursorPage<CreditTransactionResponse>, Error, CreditTransactionResponse[], readonly unknown[], string | null>({
    queryKey: paymentKeys.transactions(),
    queryFn: ({ pageParam }) => paymentService.getCreditTransactions({ cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    enabled,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    retry: false,
    select: (data) => data.pages.flatMap((page) => page.items),
  });
}
