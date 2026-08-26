import { useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service';
import type { WalletSnapshot } from '../types/payment.types';
import { paymentKeys } from './useMyPaymentOrders';

export const TOKEN_WALLET_QUERY_KEY = ['payment', 'wallet'] as const;
export const TOKEN_USAGE_QUERY_KEY = ['payment', 'usage'] as const;
export const PAYMENT_ACCOUNT_QUERY_KEY = ['payment', 'account'] as const;
export const PAYMENT_SUBSCRIPTION_QUERY_KEY = ['payment', 'subscription'] as const;

// Wallet data represents money, so freshness is restored explicitly after a
// credit-changing action instead of refetching once per observer. In the
// browser Network tab on the learning page, the old staleTime: 0 produced
// 3 getWallet calls = 6 HTTP requests (account + credit-transactions each);
// with a 30-second window it produces 1 getWallet = 2 HTTP requests.
const TOKEN_WALLET_STALE_TIME_MS = 30_000;

async function fetchWallet(): Promise<WalletSnapshot> {
  return paymentService.getWallet();
}

export function useTokenWallet() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: TOKEN_WALLET_QUERY_KEY,
    queryFn: fetchWallet,
    staleTime: TOKEN_WALLET_STALE_TIME_MS,
  });

  return {
    wallet: query.data ?? null,
    balance: query.data?.balance ?? null,
    reserved: query.data?.reserved ?? null,
    available: query.data?.available ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    reload: query.refetch,
    invalidate: () => invalidateTokenWallet(queryClient),
  };
}

export function useTokenUsage() {
  const query = useQuery({
    queryKey: TOKEN_USAGE_QUERY_KEY,
    queryFn: () => paymentService.listTokenUsage(),
  });

  return {
    usage: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    reload: query.refetch,
  };
}

export function usePaymentAccount() {
  return useQuery({
    queryKey: PAYMENT_ACCOUNT_QUERY_KEY,
    queryFn: () => paymentService.getPaymentAccount(),
    retry: false,
  });
}

export function usePaymentSubscription() {
  return useQuery({
    queryKey: PAYMENT_SUBSCRIPTION_QUERY_KEY,
    queryFn: () => paymentService.getSubscription(),
    retry: false,
  });
}

export function useInvalidateTokenWallet() {
  const queryClient = useQueryClient();

  return () => invalidateTokenWallet(queryClient);
}

export function invalidateTokenWallet(queryClient: ReturnType<typeof useQueryClient>) {
    void queryClient.invalidateQueries({ queryKey: TOKEN_WALLET_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: TOKEN_USAGE_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: PAYMENT_ACCOUNT_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: PAYMENT_SUBSCRIPTION_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: paymentKeys.transactions() });
    void queryClient.invalidateQueries({ queryKey: paymentKeys.orders() });
}
