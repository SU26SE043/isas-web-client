import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { PHASE11_CAMPAIGN_ID } from '../mocks/employerAnalytics.fixtures';
import { employerAnalyticsService } from '../services/employerAnalytics.service';
import { PipelineFilters } from '../components/PipelineFilters';
import { PipelineTable } from '../components/PipelineTable';
import { useBlindHiringMode } from '../hooks/useBlindHiringMode';
import { usePipelineCandidates } from '../hooks/useEmployerAnalytics';
import type { PipelineFilters as PipelineFiltersValue } from '../types/employerAnalytics.types';

export function CandidatePipelinePage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState<PipelineFiltersValue>({
    search: '',
    status: 'all',
    scoreBand: 'all',
    sortBy: 'rank',
  });
  const { blindHiringEnabled, setBlindHiringEnabled } = useBlindHiringMode();
  const stableFilters = useMemo(() => filters, [filters]);
  const { candidates, isLoading } = usePipelineCandidates(id ?? PHASE11_CAMPAIGN_ID, stableFilters);

  const exportCsv = async () => {
    const result = await employerAnalyticsService.exportAnalytics(id ?? PHASE11_CAMPAIGN_ID, 'csv', candidates.length);
    setMessage(t(result.messageKey));
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-label text-muted-foreground">{t('employerAnalytics.pipeline.eyebrow')}</p>
            <h1 className="heading-primary text-3xl text-foreground">{t('employerAnalytics.pipeline.title')}</h1>
            <p className="body-text max-w-3xl text-sm text-muted-foreground">{t('employerAnalytics.pipeline.subtitle')}</p>
          </div>
          <Button onClick={exportCsv}>
            <Download className="size-4" aria-hidden /> {t('employerAnalytics.pipeline.export')}
          </Button>
        </header>

        <div className="flex flex-col gap-3 rounded-xl border border-subtle bg-surface-raised p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={blindHiringEnabled}
              onChange={(event) => setBlindHiringEnabled(event.target.checked)}
              className="size-4 rounded border border-input accent-foreground"
            />
            {t('employerAnalytics.pipeline.blindToggle')}
          </label>
          <p className="text-sm text-muted-foreground">
            {t(blindHiringEnabled ? 'employerAnalytics.pipeline.blindHint' : 'employerAnalytics.pipeline.blindOffHint')}
          </p>
        </div>
        {message ? <Alert variant="success"><AlertDescription>{message}</AlertDescription></Alert> : null}
        <PipelineFilters value={filters} onChange={setFilters} />

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : candidates.length > 0 ? (
          <PipelineTable candidates={candidates} blindHiringEnabled={blindHiringEnabled} />
        ) : (
          <EmptyState
            variant="no-results"
            title={t('employerAnalytics.pipeline.emptyTitle')}
            description={t('employerAnalytics.pipeline.emptyDescription')}
          />
        )}
      </div>
    </div>
  );
}
