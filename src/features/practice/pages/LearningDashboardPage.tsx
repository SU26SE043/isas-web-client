import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { LearningDashboardToolbar } from '../components/learning-path/LearningDashboardToolbar';
import { LearningRoadmapCardView } from '../components/learning-path/LearningRoadmapCardView';
import { learningPathService } from '../services/learningPath.service';
import type { LearningDashboardQuery, LearningRoadmapCard } from '../types/learningPath.types';
import { continueLearningPath } from '../utils/learningPathNavigation';

export function LearningDashboardPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState<LearningDashboardQuery>({
    search: '',
    domainId: 'all',
    status: 'all',
    sort: 'updated',
  });
  const [items, setItems] = useState<LearningRoadmapCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void learningPathService
      .listRoadmaps(query)
      .then((next) => {
        if (active) {
          setItems(next);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  const continueTarget = items.find((item) => item.status === 'in_progress') ?? items[0];

  return (
    <div className="page-container page-section min-h-screen">
      <header className="mb-6 space-y-2">
        <h1 className="heading-primary text-3xl text-foreground">{t('practice.learningPath.title')}</h1>
        <p className="body-text text-sm text-muted-foreground">{t('practice.learningPath.subtitle')}</p>
        <p className="text-caption text-muted-foreground">{t('practice.learningPath.noCreateHint')}</p>
      </header>

      {continueTarget && continueTarget.status !== 'completed' ? (
        <div className="mb-6 rounded-xl border border-subtle bg-surface-elevated/70 p-5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">{t('practice.learningPath.resumeLabel')}</p>
          <p className="mt-1 text-lg font-medium text-foreground">
            {continueTarget.name}
          </p>
          <Link
            to={continueLearningPath(continueTarget)}
            className="btn-primary mt-4 inline-flex"
          >
            {t('practice.learningPath.continueLearning')}
          </Link>
        </div>
      ) : null}

      <LearningDashboardToolbar query={query} onChange={setQuery} />

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        </div>
      ) : error ? (
        <p className="mt-6 text-sm text-error">{t('practice.learningPath.error')}</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-default bg-surface-raised/40 p-8 text-center">
          <p className="text-sm text-muted-foreground">{t('practice.learningPath.empty')}</p>
          <Link to="/candidate/roadmap" className="btn-primary mt-4 inline-flex">
            {t('practice.learningPath.goCreate')}
          </Link>
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
