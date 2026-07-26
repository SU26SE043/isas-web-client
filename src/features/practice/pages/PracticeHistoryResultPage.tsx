import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getApiStatusCode } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import { usesMockData } from '@/shared/mock';
import { PracticeLiveResultReport } from '../components/result/PracticeLiveResultReport';
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
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-9 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.result.loading')}</span>
      </div>
    );
  }

  const status = getApiStatusCode(query.error);
  if (query.isError || !query.data?.result) {
    const message =
      status === 403
        ? t('practice.errors.forbidden')
        : status === 404
          ? t('practice.errors.sessionNotFound')
          : query.data
            ? t('practice.result.notAvailable')
            : t('practice.result.error');

    return (
      <div className="page-container page-section flex min-h-[50vh] items-center justify-center">
        <div className="max-w-lg text-center">
          <AlertCircle className="mx-auto size-10 text-error" aria-hidden />
          <h1 className="mt-4 text-2xl font-semibold text-foreground">
            {t('practice.result.errorTitle')}
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
