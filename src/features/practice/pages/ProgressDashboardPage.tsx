import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { ProgressActivityChart } from '../components/progress/ProgressActivityChart';
import { learningService } from '../services/learning.service';
import type { ProgressDashboardData } from '../types/learning.types';

export const ProgressDashboardPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [data, setData] = useState<ProgressDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void learningService.getProgressDashboard().then((response) => {
      if (active) {
        setData(response);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="heading-primary text-3xl text-foreground">{t('practice.progress.title')}</h1>
          <p className="body-text text-sm text-muted-foreground">{t('practice.progress.subtitle')}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-subtle bg-surface-raised p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('practice.progress.modules')}</p>
            <p className="heading-primary mt-2 text-3xl text-foreground">
              {data.modulesCompleted}/{data.totalModules}
            </p>
          </div>
          <div className="rounded-xl border border-subtle bg-surface-raised p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('practice.progress.averageScore')}</p>
            <p className="heading-primary mt-2 text-3xl text-foreground">{data.averageScore}</p>
          </div>
          <div className="rounded-xl border border-subtle bg-surface-raised p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('practice.progress.practiceTime')}</p>
            <p className="heading-primary mt-2 text-3xl text-foreground">{data.practiceMinutes}</p>
          </div>
          <div className="rounded-xl border border-subtle bg-surface-raised p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('practice.progress.latestTrend')}</p>
            <p className="heading-primary mt-2 text-3xl text-success">
              +{data.skillTrends[0] ? data.skillTrends[0].current - data.skillTrends[0].previous : 0}
            </p>
          </div>
        </div>

        <ProgressActivityChart data={data} />

        <section className="rounded-xl border border-subtle bg-surface-raised p-6">
          <h2 className="heading-secondary text-lg text-foreground">{t('practice.progress.skillTrends')}</h2>
          <div className="mt-4 space-y-3">
            {data.skillTrends.map((trend) => (
              <div key={trend.skill} className="flex items-center justify-between rounded-lg bg-surface-base px-4 py-3 text-sm">
                <span className="font-medium text-foreground">
                  {language === 'vi' ? trend.skillVi : trend.skill}
                </span>
                <span className="text-muted-foreground">
                  {trend.previous}% {'->'} {trend.current}%
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link to="/candidate/leaderboard" className="btn-secondary">
            {t('practice.leaderboard.title')}
          </Link>
          <Link to="/candidate/achievements" className="btn-secondary">
            {t('practice.achievements.title')}
          </Link>
        </div>
      </div>
    </div>
  );
};
