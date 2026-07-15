import { useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service';
import type { WalletSnapshot } from '../types/payment.types';

export const TOKEN_WALLET_QUERY_KEY = ['payment', 'wallet'] as const;
export const TOKEN_USAGE_QUERY_KEY = ['payment', 'usage'] as const;

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
    balance: query.data?.balance ?? 0,
    reserved: query.data?.reserved ?? 0,
    available: query.data?.available ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
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
    reload: query.refetch,
  };
}

export function useInvalidateTokenWallet() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: TOKEN_WALLET_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: TOKEN_USAGE_QUERY_KEY });
  };
}
