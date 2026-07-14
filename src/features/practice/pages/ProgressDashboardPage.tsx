import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void progressService.getDashboard().then((response) => {
      if (!cancelled) {
        setData(response);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading && !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.progress.loading')}</span>
      </div>
    );
  }

  if (!data) return null;

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
