import { useTokenWallet } from './useTokenWallet';

/** @deprecated Prefer useTokenWallet */
export function useWallet() {
  const { wallet, isLoading, reload } = useTokenWallet();
  return { wallet, isLoading, reload };
}

/** @deprecated Prefer useTokenWallet */
export function useCredits() {
  const { available, isLoading, reload } = useTokenWallet();
  return { balance: available, isLoading, reload };
}
