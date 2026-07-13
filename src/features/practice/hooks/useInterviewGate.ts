import { PRACTICE_RESERVE_ESTIMATE } from '@/features/payment/constants';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useDashboardSummary } from '@/features/profile/hooks/useDashboardSummary';

export function useInterviewGate() {
  const { completeness, isLoading: profileLoading } = useProfile();
  const { summary, isLoading: summaryLoading } = useDashboardSummary();

  const tokenAvailable = summary?.tokenAvailable ?? summary?.creditsRemaining ?? 0;
  const tokenReserved = summary?.tokenReserved ?? 0;
  const meetsProfileGate = completeness?.meetsGate ?? false;
  const hasSufficientTokens = tokenAvailable >= PRACTICE_RESERVE_ESTIMATE;

  return {
    isLoading: profileLoading || summaryLoading,
    canStart: meetsProfileGate && hasSufficientTokens,
    meetsProfileGate,
    hasCredits: hasSufficientTokens,
    hasSufficientTokens,
    tokenAvailable,
    tokenReserved,
    creditsRemaining: tokenAvailable,
    reserveEstimate: PRACTICE_RESERVE_ESTIMATE,
    completenessPercent: completeness?.percent ?? summary?.profileCompleteness ?? 0,
  };
}
