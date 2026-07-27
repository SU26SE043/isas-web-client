import { useParams } from 'react-router-dom';
import { getApiStatusCode } from '@/shared/api/apiError';
import { usesMockData } from '@/shared/mock';
import { PracticeLiveResultReport } from '../components/result/PracticeLiveResultReport';
import { PracticeResultSkeleton } from '../components/result/PracticeResultSkeleton';
import { SessionResultErrorState } from '../components/result/SessionResultErrorState';
import { usePracticeSessionDetail } from '../hooks/usePracticeSessionDetail';
import { mapPracticeSessionResponseToViewModel } from '../utils/practiceSessionResultViewModel';
import { InterviewResultPage } from './InterviewResultPage';

function LivePracticeHistoryResult({ sessionId }: { sessionId: string }) {
  const query = usePracticeSessionDetail(sessionId);

  if (query.isLoading) {
    return <PracticeResultSkeleton />;
  }

  const status = getApiStatusCode(query.error);

  if (query.isError) {
    if (status === 403) return <SessionResultErrorState kind="forbidden" />;
    if (status === 404) return <SessionResultErrorState kind="notFound" />;
    return (
      <SessionResultErrorState kind="system" onRetry={() => void query.refetch()} />
    );
  }

  if (!query.data) {
    return <SessionResultErrorState kind="system" onRetry={() => void query.refetch()} />;
  }

  const view = mapPracticeSessionResponseToViewModel(query.data);

  if (!view.hasResult) {
    return <SessionResultErrorState kind="notReady" />;
  }

  if (view.questions.length === 0) {
    return <SessionResultErrorState kind="noQuestions" />;
  }

  return <PracticeLiveResultReport session={query.data} />;
}

export function PracticeHistoryResultPage() {
  const { id = '' } = useParams<{ id: string }>();

  return usesMockData('practice') ? (
    <InterviewResultPage />
  ) : (
    <LivePracticeHistoryResult sessionId={id} />
  );
}
