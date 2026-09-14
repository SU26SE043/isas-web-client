/* @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCvScreeningPanelState } from './useCvScreeningPanelState';

vi.mock('../../hooks/useCampaignCandidates', () => ({
  useAnalyzeCandidateCvs: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useCampaignCandidateDetail: () => ({ data: null }),
  useCampaignCandidates: () => ({ data: [], refetch: vi.fn() }),
  useRescreenCampaignCandidate: () => ({ mutateAsync: vi.fn() }),
  useUpdateCampaignCandidate: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}

describe('useCvScreeningPanelState canAnalyze', () => {
  it('allows an active campaign to analyze a valid PDF without job needs', () => {
    const { result } = renderHook(() => useCvScreeningPanelState('campaign-1', true), { wrapper });

    act(() => {
      result.current.setPendingFiles([
        { file: new File(['%PDF-1.7'], 'candidate.pdf', { type: 'application/pdf' }) },
      ]);
    });

    expect(result.current.canAnalyze).toBe(true);
  });
});
