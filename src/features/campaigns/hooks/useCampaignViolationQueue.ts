import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CampaignViolation,
  CampaignViolationKind,
} from '../types/campaignViolation.types';

const DUPLICATE_WINDOW_MS = 4_000;

export function useCampaignViolationQueue(enabled: boolean) {
  const [queue, setQueue] = useState<CampaignViolation[]>([]);
  const lastQueuedAt = useRef<Partial<Record<CampaignViolationKind, number>>>({});

  const enqueue = useCallback((kind: CampaignViolationKind) => {
    if (!enabled) return;
    const now = Date.now();
    const last = lastQueuedAt.current[kind] ?? 0;
    if (now - last < DUPLICATE_WINDOW_MS) return;
    lastQueuedAt.current[kind] = now;
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
      lastQueuedAt.current = {};
    }
  }, [enabled]);

  return {
    currentViolation: queue[0] ?? null,
    pendingCount: Math.max(0, queue.length - 1),
    enqueue,
    resolveCurrent,
  };
}
