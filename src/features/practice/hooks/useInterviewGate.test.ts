import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useInterviewGate } from './useInterviewGate';

vi.mock('@/features/profile/hooks/useProfile', () => ({
  useProfile: () => ({ completeness: { meetsGate: true, percent: 100 }, isLoading: false }),
}));
vi.mock('@/features/profile/hooks/useDashboardSummary', () => ({
  useDashboardSummary: () => ({ summary: { tokenAvailable: 99, creditsRemaining: 99 }, isLoading: false }),
}));
vi.mock('@/features/payment/hooks/useTokenWallet', () => ({
  useTokenWallet: () => ({ available: 0, isLoading: false }),
}));

describe('useInterviewGate', () => {
  it('uses the real wallet balance for learning sessions', () => {
    const { result } = renderHook(() => useInterviewGate('learning-session-1'));

    expect(result.current.creditsRemaining).toBe(0);
    expect(result.current.hasSufficientTokens).toBe(false);
  });
});
