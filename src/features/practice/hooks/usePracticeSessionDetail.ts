import { useQuery } from '@tanstack/react-query';
import { getPracticeSessionDetail } from '../services/b2cPracticeSession.service';

export const practiceSessionDetailKeys = {
  all: ['practice-session-detail'] as const,
  detail: (sessionId: string) => [...practiceSessionDetailKeys.all, sessionId] as const,
};

export function usePracticeSessionDetail(sessionId: string) {
  return useQuery({
    queryKey: practiceSessionDetailKeys.detail(sessionId),
    queryFn: () => getPracticeSessionDetail(sessionId),
    enabled: Boolean(sessionId),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}
