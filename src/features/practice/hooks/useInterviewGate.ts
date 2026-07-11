import { useProfile } from '@/features/profile/hooks/useProfile';
import { useDashboardSummary } from '@/features/profile/hooks/useDashboardSummary';

export function useInterviewGate() {
  const { completeness, isLoading: profileLoading } = useProfile();
  const { summary, isLoading: summaryLoading } = useDashboardSummary();

  const creditsRemaining = summary?.creditsRemaining ?? 0;
  const meetsProfileGate = completeness?.meetsGate ?? false;
  const hasCredits = creditsRemaining > 0;

  return {
    isLoading: profileLoading || summaryLoading,
    canStart: meetsProfileGate && hasCredits,
    meetsProfileGate,
    hasCredits,
    creditsRemaining,
    completenessPercent: completeness?.percent ?? summary?.profileCompleteness ?? 0,
  };
}
