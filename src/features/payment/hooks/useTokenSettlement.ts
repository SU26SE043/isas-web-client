import { useEffect } from 'react';

interface UseTokenSettlementOptions {
  sessionId: string | null;
  enabled: boolean;
}

export function useTokenSettlement({ sessionId, enabled }: UseTokenSettlementOptions) {
  useEffect(() => {
    void enabled;
    void sessionId;
  }, [enabled, sessionId]);
}
