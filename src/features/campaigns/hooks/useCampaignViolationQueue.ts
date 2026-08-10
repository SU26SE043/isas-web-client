import { useCallback, useEffect, useState } from 'react';
import type {
  CampaignViolation,
  CampaignViolationKind,
} from '../types/campaignViolation.types';

export function useCampaignViolationQueue(enabled: boolean) {
  const [queue, setQueue] = useState<CampaignViolation[]>([]);

  const enqueue = useCallback((kind: CampaignViolationKind) => {
    if (!enabled) return;
    const now = Date.now();
    setQueue((current) => {
      if (current.some((item) => item.kind === kind)) return current;
      return [...current, { id: `${kind}-${now}`, kind }];
    });
  }, [enabled]);

  const resolveCurrent = useCallback(() => {
    setQueue((current) => current.slice(1));
  }, []);

  useEffect(() => {
    if (!enabled) {
      setQueue([]);
    }
  }, [enabled]);

  return {
    currentViolation: queue[0] ?? null,
    pendingCount: Math.max(0, queue.length - 1),
    enqueue,
    resolveCurrent,
  };
}
