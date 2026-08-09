import { useSearchParams } from 'react-router-dom';
import { getApiStatusCode } from '@/shared/api/apiError';
import { PracticeLiveResultReport } from '../components/result/PracticeLiveResultReport';
import { PracticeResultSkeleton } from '../components/result/PracticeResultSkeleton';
import { ResultScoringPanel } from '../components/result/ResultScoringPanel';
import { SessionResultErrorState } from '../components/result/SessionResultErrorState';
import { usePracticeSessionResult } from '../hooks/usePracticeSessionResult';
import {
  isPracticeReportFailed,
  isPracticeReportPending,
  isPracticeReportReady,
} from '../utils/practiceReportStatus';
import { isValidPracticeSessionId } from '../utils/practiceSessionId';

export function PracticeSessionResultPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const query = usePracticeSessionResult(sessionId);

  if (!isValidPracticeSessionId(sessionId)) {
    return <SessionResultErrorState kind="invalidSession" />;
  }

  if (query.isLoading) {
    return <PracticeResultSkeleton />;
  }

  if (query.isError) {
    const status = getApiStatusCode(query.error);
    if (status === 401) return <SessionResultErrorState kind="unauthorized" />;
    if (status === 403) return <SessionResultErrorState kind="forbidden" />;
    if (status === 404) return <SessionResultErrorState kind="notFound" />;
    if (status === 429) {
      return <SessionResultErrorState kind="capacity" onRetry={() => void query.refetch()} />;
    }
    return <SessionResultErrorState kind="system" onRetry={() => void query.refetch()} />;
  }

  const session = query.data;
  if (!session) {
    return <SessionResultErrorState kind="system" onRetry={() => void query.refetch()} />;
  }

  if (isPracticeReportFailed(session.status)) {
    return <SessionResultErrorState kind="generationFailed" />;
  }

  if (isPracticeReportPending(session)) {
    return <ResultScoringPanel />;
  }

  if (!isPracticeReportReady(session)) {
    return <SessionResultErrorState kind="system" onRetry={() => void query.refetch()} />;
  }

  return <PracticeLiveResultReport session={session} />;
}
