import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { PracticeScoreLineChart } from '../components/progress/PracticeScoreLineChart';
import { RoadmapCompletionDonut } from '../components/progress/RoadmapCompletionDonut';
import { SkillCompletionStackedBar } from '../components/progress/SkillCompletionStackedBar';
import { progressService } from '../services/progress.service';
import type { ProgressMinimalDashboard } from '../types/progress.types';

export const ProgressDashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<ProgressMinimalDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setHasError(false);
    void progressService.getDashboard()
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setHasError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requestVersion]);

  if (isLoading && !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.progress.loading')}</span>
      </div>
    );
  }

  if (hasError || !data) {
    return (
      <div className="h-full overflow-y-auto bg-surface-base">
        <div className="page-container mx-auto max-w-4xl space-y-8 px-6 py-12 sm:py-16">
          <h1 className="heading-primary text-3xl text-foreground sm:text-4xl">{t('practice.progress.title')}</h1>
          <Alert variant="error" className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-error" aria-hidden />
            <div className="space-y-3">
              <div>
                <AlertTitle>{t('practice.progress.errorTitle')}</AlertTitle>
                <AlertDescription>{t('practice.progress.errorDescription')}</AlertDescription>
              </div>
              <Button variant="outline" onClick={() => setRequestVersion((version) => version + 1)}>
                {t('practice.progress.retry')}
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container mx-auto max-w-4xl space-y-16 px-6 py-12 sm:py-16">
        <h1 className="heading-primary text-3xl text-foreground sm:text-4xl">{t('practice.progress.title')}</h1>

        <RoadmapCompletionDonut data={data.roadmapCompletion} />
        <SkillCompletionStackedBar skills={data.skillBreakdown} />
        <PracticeScoreLineChart points={data.practiceScores} />
      </div>
    </div>
  );
};
