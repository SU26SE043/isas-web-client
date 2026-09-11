import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { AchievementGrid } from '../components/progress/AchievementGrid';
import { learningService } from '../services/learning.service';
import type { Achievement } from '../types/learning.types';
import { PageHeader } from '@/components/patterns/PageHeader';

export const AchievementsPage: React.FC = () => {
  const { t } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void learningService.getAchievements().then((data) => {
      if (active) {
        setAchievements(data);
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
      <div className="app-page space-y-6">
        <PageHeader
          backLink={{ to: '/candidate/progress', label: t('practice.progress.title') }}
          title={t('practice.achievements.title')}
          description={t('practice.achievements.subtitle')}
        />
        <AchievementGrid achievements={achievements} />
      </div>
    </div>
  );
};
