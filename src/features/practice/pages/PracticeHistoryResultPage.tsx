import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getApiStatusCode } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import { usesMockData } from '@/shared/mock';
import { PracticeLiveResultReport } from '../components/result/PracticeLiveResultReport';
import { PracticeResultSkeleton } from '../components/result/PracticeResultSkeleton';
import { getPracticeSession } from '../services/b2cPracticeSession.service';
import { InterviewResultPage } from './InterviewResultPage';

function LivePracticeHistoryResult({ sessionId }: { sessionId: string }) {
  const { t } = useLanguage();
  const query = useQuery({
    queryKey: ['practice-history-result', sessionId],
    queryFn: () => getPracticeSession(sessionId),
    enabled: Boolean(sessionId),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  if (query.isLoading) {
    return <PracticeResultSkeleton />;
  }

  const status = getApiStatusCode(query.error);
  if (query.isError || !query.data?.result) {
    const message =
      status === 403
        ? t('practice.result.forbiddenDescription')
        : status === 404
          ? t('practice.result.notFoundDescription')
          : query.data
            ? t('practice.result.notAvailable')
            : t('practice.result.error');
    const title =
      status === 403
        ? t('practice.result.forbiddenTitle')
        : status === 404
          ? t('practice.result.notFoundTitle')
          : query.data
            ? t('practice.result.notReadyTitle')
            : t('practice.result.loadErrorTitle');

    return (
      <div className="page-container page-section flex min-h-[50vh] items-center justify-center">
        <div className="max-w-lg text-center">
          <AlertCircle className="mx-auto size-10 text-error" aria-hidden />
          <h1 className="mt-4 text-2xl font-semibold text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <div className="mt-6 flex justify-center gap-3">
            {status !== 403 && status !== 404 ? (
              <Button type="button" onClick={() => void query.refetch()}>
                {t('practice.scoring.retry')}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              render={<Link to="/candidate/practice/history" />}
            >
              {t('practice.history.title')}
            </Button>
          </div>
        </div>
      </div>
    );
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
