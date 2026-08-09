import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { LearningDashboardToolbar } from '../components/learning-path/LearningDashboardToolbar';
import { LearningRoadmapCardView } from '../components/learning-path/LearningRoadmapCardView';
import { useLearningRoadmaps } from '../hooks/useLearningRoadmaps';
import type { LearningDashboardQuery } from '../types/learningPath.types';

export function LearningDashboardPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState<LearningDashboardQuery>({
    search: '',
    domainId: 'all',
    status: 'all',
    sort: 'updated',
  });

  const { data: items = [], isLoading, isError, refetch, isFetching } = useLearningRoadmaps(query);

  return (
    <div className="page-container page-section min-h-screen">
      <header className="mb-6 space-y-2">
        <h1 className="heading-primary text-3xl text-foreground">{t('practice.learningPath.title')}</h1>
        <p className="body-text text-sm text-muted-foreground">{t('practice.learningPath.subtitle')}</p>
        <p className="text-caption text-muted-foreground">{t('practice.learningPath.noCreateHint')}</p>
      </header>

      <LearningDashboardToolbar query={query} onChange={setQuery} />

      {isLoading ? (
        <div className="mt-10 flex justify-center" role="status">
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
          <span className="sr-only">{t('practice.learningPath.loadingList')}</span>
        </div>
      ) : isError ? (
        <div className="mt-8">
          <EmptyState
            className="frame-satin"
            variant="no-data"
            title={t('practice.learningPath.errorTitle')}
            description={t('practice.learningPath.error')}
            action={
              <Button type="button" onClick={() => void refetch()} disabled={isFetching}>
                <AlertCircle className="size-4" aria-hidden />
                {t('practice.learningPath.retry')}
              </Button>
            }
          />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            className="frame-satin"
            variant="no-data"
            title={t('practice.learningPath.emptyTitle')}
            description={t('practice.learningPath.empty')}
            action={
              <Link to="/candidate/roadmap" className="btn-primary inline-flex">
                {t('practice.learningPath.goCreate')}
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <LearningRoadmapCardView key={item.id} roadmap={item} />
          ))}
        </div>
      )}
    </div>
  );
}
