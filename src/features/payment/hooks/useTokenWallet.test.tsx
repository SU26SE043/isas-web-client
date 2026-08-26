import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { paymentService } from '../services/payment.service';
import { useTokenWallet } from './useTokenWallet';

describe('useTokenWallet', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shares one wallet fetch between observers mounted in the same tree', async () => {
    const getWallet = vi.spyOn(paymentService, 'getWallet').mockResolvedValue({
      balance: 3,
      reserved: 0,
      available: 3,
      transactions: [],
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const first = renderHook(() => useTokenWallet(), { wrapper });
    await waitFor(() => expect(first.result.current.available).toBe(3));

    const second = renderHook(() => useTokenWallet(), { wrapper });
    expect(second.result.current.available).toBe(3);
    expect(getWallet).toHaveBeenCalledTimes(1);

    first.unmount();
    second.unmount();
    client.clear();
  });
});
