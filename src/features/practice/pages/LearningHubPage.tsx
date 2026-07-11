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

  useEffect(() => {
    let active = true;
    void learningService.listModules().then((data) => {
      if (active) {
        setModules(data);
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

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="heading-primary text-3xl text-foreground">{t('practice.learning.title')}</h1>
          <p className="body-text text-sm text-muted-foreground">{t('practice.learning.subtitle')}</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <LearningModuleCard key={module.id} module={module} />
          ))}
        </div>
      </div>
    </div>
  );
};
