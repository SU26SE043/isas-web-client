import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { employerPaymentService } from '../services/employerPayment.service';
import type { OrderResponse, OrderStatusResponse } from '../types/employerPayment.types';
import { clearPendingPayment, isTerminalStatus } from '../utils/employerPayment';
import { invalidateEmployerPayment } from './useEmployerPaymentMutations';

const POLL_INTERVAL_MS = 3_000;
const MAX_POLL_DURATION_MS = 120_000;

export interface CallbackState {
  order: OrderResponse | null;
  status: OrderStatusResponse | null;
  isLoading: boolean;
  isTimedOut: boolean;
  error: unknown;
}

export function useEmployerPaymentCallback(
  orderId: string | null,
  options?: { pollPending?: boolean },
): CallbackState {
  const queryClient = useQueryClient();
  const [state, setState] = useState<CallbackState>({
    order: null,
    status: null,
    isLoading: Boolean(orderId),
    isTimedOut: false,
    error: null,
  });

  useEffect(() => {
    if (!orderId) {
      setState((current) => ({ ...current, isLoading: false }));
      return;
    }

    let cancelled = false;
    let timer: number | undefined;
    const startedAt = Date.now();

    const poll = async () => {
      try {
        const [status, order] = await Promise.all([
          employerPaymentService.getOrderStatus(orderId),
          employerPaymentService.getMyOrderById(orderId).catch(() => null),
        ]);
        if (cancelled) return;
        setState({ order, status, isLoading: false, isTimedOut: false, error: null });

        if (isTerminalStatus(status.status)) {
          clearPendingPayment();
          await invalidateEmployerPayment(queryClient, orderId);
          return;
        }

        if (options?.pollPending === false) return;

        if (Date.now() - startedAt >= MAX_POLL_DURATION_MS) {
          setState((current) => ({ ...current, isTimedOut: true }));
          return;
        }
        timer = window.setTimeout(poll, POLL_INTERVAL_MS);
      } catch (error) {
        if (cancelled) return;
        setState((current) => ({ ...current, isLoading: false, error }));
        if (Date.now() - startedAt < MAX_POLL_DURATION_MS) {
          timer = window.setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          setState((current) => ({ ...current, isTimedOut: true }));
        }
      }
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [orderId, options?.pollPending, queryClient]);

  return state;
}
