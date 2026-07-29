import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { employerPaymentService } from '../services/employerPayment.service';
import { PaymentOrderKind, PaymentOrderStatus, PaymentOwnerType } from '../types/employerPayment.types';
import { PENDING_ORDER_ID_KEY } from '../utils/employerPayment';
import { useEmployerPaymentCallback } from './useEmployerPaymentCallback';
import { invalidateEmployerPayment } from './useEmployerPaymentMutations';

vi.mock('../services/employerPayment.service', () => ({
  employerPaymentService: {
    getOrderStatus: vi.fn(),
    getMyOrderById: vi.fn(),
  },
}));

vi.mock('./useEmployerPaymentMutations', () => ({
  invalidateEmployerPayment: vi.fn(() => Promise.resolve()),
}));

const order = {
  id: 'order-1',
  ownerType: PaymentOwnerType.Organization,
  ownerId: 'org-1',
  kind: PaymentOrderKind.CreditPack,
  packageId: 'pkg-1',
  invoiceId: null,
  status: PaymentOrderStatus.Pending,
  amountVnd: 100000,
  payosOrderCode: 10,
  expiredAt: '2026-07-28T12:00:00Z',
  paidAt: null,
  createdAt: '2026-07-28T11:00:00Z',
  checkoutUrl: null,
};

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}

describe('useEmployerPaymentCallback', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(employerPaymentService.getMyOrderById).mockResolvedValue(order);
  });

  afterEach(() => vi.restoreAllMocks());

  it('stops on Paid, invalidates payment state, and clears pending storage', async () => {
    sessionStorage.setItem(PENDING_ORDER_ID_KEY, order.id);
    vi.mocked(employerPaymentService.getOrderStatus).mockResolvedValue({
      orderCode: 10,
      status: 'Paid',
      paidAt: '2026-07-28T11:01:00Z',
    });

    const { result } = renderHook(() => useEmployerPaymentCallback(order.id), { wrapper });
    await waitFor(() => expect(result.current.status?.status).toBe('Paid'));
    expect(invalidateEmployerPayment).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem(PENDING_ORDER_ID_KEY)).toBeNull();
  });

  it('schedules Pending polling and clears the timer on unmount', async () => {
    vi.mocked(employerPaymentService.getOrderStatus).mockResolvedValue({
      orderCode: 10,
      status: 'Pending',
      paidAt: null,
    });
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    const { result, unmount } = renderHook(() => useEmployerPaymentCallback(order.id), { wrapper });
    await waitFor(() => expect(result.current.status?.status).toBe('Pending'));
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 3000);
    act(() => unmount());
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('does not poll Pending status on the cancel-return route', async () => {
    vi.mocked(employerPaymentService.getOrderStatus).mockResolvedValue({
      orderCode: 10,
      status: 'Pending',
      paidAt: null,
    });
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');

    const { result } = renderHook(
      () => useEmployerPaymentCallback(order.id, { pollPending: false }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.status?.status).toBe('Pending'));
    expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), 3000);
  });
});
