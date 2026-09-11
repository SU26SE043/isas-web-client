import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { LeaderboardTable } from '../components/progress/LeaderboardTable';
import { learningService } from '../services/learning.service';
import type { LeaderboardEntry } from '../types/learning.types';
import { PageHeader } from '@/components/patterns/PageHeader';

export const LeaderboardPage: React.FC = () => {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void learningService.getLeaderboard().then((data) => {
      if (active) {
        setEntries(data);
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
          title={t('practice.leaderboard.title')}
          description={t('practice.leaderboard.subtitle')}
        />
        <LeaderboardTable entries={entries} />
      </div>
    </div>
  );
};
