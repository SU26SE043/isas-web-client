import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { CompareResultsView } from '../components/compare/CompareResultsView';
import { resultService } from '../services/result.service';
import type { CompareResultsResponse } from '../types/result.types';
import { PageHeader } from '@/components/patterns/PageHeader';

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
      <div className="app-page space-y-6">
        <PageHeader
          backLink={{ to: '/candidate/practice/history', label: t('practice.history.title') }}
          title={t('practice.compare.title')}
          description={t('practice.compare.subtitle')}
        />

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
