import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { LeaderboardTable } from '../components/progress/LeaderboardTable';
import { learningService } from '../services/learning.service';
import type { LeaderboardEntry } from '../types/learning.types';

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
      <div className="page-container page-section mx-auto max-w-4xl space-y-6">
        <header className="space-y-2">
          <nav className="text-sm text-muted-foreground">
            <Link to="/candidate/progress" className="hover:text-foreground hover:underline">
              {t('practice.progress.title')}
            </Link>
            <span className="mx-2">{'>'}</span>
            <span>{t('practice.leaderboard.title')}</span>
          </nav>
          <h1 className="heading-primary text-3xl text-foreground">{t('practice.leaderboard.title')}</h1>
          <p className="body-text text-sm text-muted-foreground">{t('practice.leaderboard.subtitle')}</p>
        </header>
        <LeaderboardTable entries={entries} />
      </div>
    </div>
  );
};
