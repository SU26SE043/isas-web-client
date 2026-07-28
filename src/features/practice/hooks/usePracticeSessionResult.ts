import { useQuery } from '@tanstack/react-query';
import { getApiStatusCode } from '@/shared/api/apiError';
import { getPracticeSession } from '../services/b2cPracticeSession.service';
import { shouldPollPracticeReport } from '../utils/practiceReportStatus';
import { isValidPracticeSessionId } from '../utils/practiceSessionId';

export const practiceSessionResultKeys = {
  detail: (sessionId: string) => ['practice-session-result', sessionId] as const,
};

export function usePracticeSessionResult(sessionId: string | null) {
  const isValidSessionId = isValidPracticeSessionId(sessionId);

  return useQuery({
    queryKey: practiceSessionResultKeys.detail(sessionId ?? ''),
    queryFn: () => getPracticeSession(sessionId!),
    enabled: isValidSessionId,
    refetchInterval: (query) => {
      const session = query.state.data;
      return session && shouldPollPracticeReport(session) ? 3000 : false;
    },
    retry: (failureCount, error) => {
      const status = getApiStatusCode(error);
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });
}
