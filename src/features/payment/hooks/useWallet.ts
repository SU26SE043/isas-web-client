import { useCallback, useEffect, useState } from 'react';
import { paymentService } from '../services/payment.service';
import type { WalletSnapshot } from '../types/payment.types';

export function useWallet() {
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await paymentService.getWallet();
      setWallet(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { wallet, isLoading, reload };
}

export function useCredits() {
  const { wallet, isLoading, reload } = useWallet();
  return {
    balance: wallet?.balance ?? 0,
    isLoading,
    reload,
  };
}
