import { useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service';
import type { WalletSnapshot } from '../types/payment.types';
import { paymentKeys } from './useMyPaymentOrders';

export const TOKEN_WALLET_QUERY_KEY = ['payment', 'wallet'] as const;
export const TOKEN_USAGE_QUERY_KEY = ['payment', 'usage'] as const;
export const PAYMENT_ACCOUNT_QUERY_KEY = ['payment', 'account'] as const;
export const PAYMENT_SUBSCRIPTION_QUERY_KEY = ['payment', 'subscription'] as const;

async function fetchWallet(): Promise<WalletSnapshot> {
  return paymentService.getWallet();
}

export function useTokenWallet() {
  const query = useQuery({
    queryKey: TOKEN_WALLET_QUERY_KEY,
    queryFn: fetchWallet,
    staleTime: 0,
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

  return () => {
    void queryClient.invalidateQueries({ queryKey: TOKEN_WALLET_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: TOKEN_USAGE_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: PAYMENT_ACCOUNT_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: PAYMENT_SUBSCRIPTION_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: paymentKeys.transactions() });
    void queryClient.invalidateQueries({ queryKey: paymentKeys.orders() });
  };
}
