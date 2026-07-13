import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { LearningModuleCard } from '../components/learning/LearningModuleCard';
import { learningService } from '../services/learning.service';
import type { LearningModule } from '../types/learning.types';

export const LearningHubPage: React.FC = () => {
  const { t } = useLanguage();
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void learningService
      .listModules()
      .then((data) => {
        if (!active) return;
        setModules(data);
      })
      .catch(() => {
        if (active) setError('load_failed');
      })
      .finally(() => {
        if (active) setIsLoading(false);
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

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="heading-primary text-3xl text-foreground">{t('practice.learning.title')}</h1>
          <p className="body-text text-sm text-muted-foreground">{t('practice.learning.subtitle')}</p>
        </header>

        {error ? (
          <p className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">
            {t('practice.learning.error')}
          </p>
        ) : null}

        {modules.length === 0 ? (
          <div className="rounded-xl border border-subtle bg-surface-raised p-8 text-center">
            <h2 className="heading-secondary text-lg text-foreground">{t('practice.learning.emptyTitle')}</h2>
            <p className="body-text mt-2 text-sm text-muted-foreground">{t('practice.learning.emptyDescription')}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => (
              <LearningModuleCard key={module.id} module={module} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
