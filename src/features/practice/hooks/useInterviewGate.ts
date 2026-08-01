import { useProfile } from '@/features/profile/hooks/useProfile';
import { useDashboardSummary } from '@/features/profile/hooks/useDashboardSummary';
import { isLearningSessionId } from '../types/interviewFlow.types';

export function useInterviewGate(sessionId?: string) {
  const { completeness, isLoading: profileLoading } = useProfile();
  const { summary, isLoading: summaryLoading } = useDashboardSummary();
  const isLearning = Boolean(sessionId && isLearningSessionId(sessionId));

  const tokenAvailable = summary?.tokenAvailable ?? summary?.creditsRemaining ?? 0;
  const tokenReserved = summary?.tokenReserved ?? 0;
  const meetsProfileGate = isLearning ? true : (completeness?.meetsGate ?? false);
  const hasSufficientTokens = isLearning ? true : tokenAvailable > tokenReserved;

  return {
    isLoading: isLearning ? false : profileLoading || summaryLoading,
    canStart: meetsProfileGate && hasSufficientTokens,
    meetsProfileGate,
    hasCredits: hasSufficientTokens,
    hasSufficientTokens,
    tokenAvailable,
    tokenReserved,
    creditsRemaining: tokenAvailable,
    reserveEstimate: isLearning ? 0 : tokenReserved,
    completenessPercent: completeness?.percent ?? summary?.profileCompleteness ?? 0,
    isLearning,
  };
}
