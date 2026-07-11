import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { CompareResultsView } from '../components/compare/CompareResultsView';
import { resultService } from '../services/result.service';
import type { CompareResultsResponse } from '../types/result.types';

export const CompareResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const leftId = searchParams.get('left') ?? '';
  const rightId = searchParams.get('right') ?? '';
  const [data, setData] = useState<CompareResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leftId || !rightId) {
      setError(t('practice.compare.missingSelection'));
      setIsLoading(false);
      return;
    }

    let active = true;
    void resultService
      .compareResults(leftId, rightId)
      .then((response) => {
        if (active) setData(response);
      })
      .catch(() => {
        if (active) setError(t('practice.compare.error'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [leftId, rightId, t]);

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <nav className="text-sm text-muted-foreground">
            <Link to="/candidate/practice/history" className="hover:text-foreground hover:underline">
              {t('practice.history.title')}
            </Link>
            <span className="mx-2">{'>'}</span>
            <span>{t('practice.compare.title')}</span>
          </nav>
          <h1 className="heading-primary text-3xl text-foreground">{t('practice.compare.title')}</h1>
          <p className="body-text text-sm text-muted-foreground">{t('practice.compare.subtitle')}</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
          </div>
        ) : null}

        {error ? (
          <div className="flex items-center gap-3 rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}

        {data ? <CompareResultsView data={data} /> : null}
      </div>
    </div>
  );
};
