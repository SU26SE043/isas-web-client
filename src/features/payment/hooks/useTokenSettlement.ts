import { useEffect, useRef } from 'react';
import { paymentService } from '@/features/payment/services/payment.service';
import { useInvalidateTokenWallet } from '@/features/payment/hooks/useTokenWallet';

interface UseTokenSettlementOptions {
  sessionId: string | null;
  enabled: boolean;
}

export function useTokenSettlement({ sessionId, enabled }: UseTokenSettlementOptions) {
  const invalidateWallet = useInvalidateTokenWallet();
  const settledRef = useRef(false);

  useEffect(() => {
    if (!enabled || !sessionId || settledRef.current) return;

    let active = true;
    void paymentService
      .settleTokens(sessionId)
      .then(() => {
        if (!active) return;
        settledRef.current = true;
        invalidateWallet();
      })
      .catch(() => {
        // Settlement may already exist or reservation missing — ignore for mock flow retries.
      });

    return () => {
      active = false;
    };
  }, [enabled, invalidateWallet, sessionId]);
}
