import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AppPagination } from '@/components/ui/app-pagination';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { useCampaignResults } from '../../hooks/useCampaignResults';
import type { CampaignResultItem } from '../../types/campaign.api.types';
import {
  filterAndSortResults,
  getResultsLoadErrorKey,
  type ResultsOutcomeFilter,
  type ResultsReviewFilter,
  type ResultsSort,
} from '../../utils/campaignResultsActions';
import { ClearOverrideDialog } from './ClearOverrideDialog';
import { OverrideResultModal } from './OverrideResultModal';
import { ResultsExportMenu } from './ResultsExportMenu';
import { ResultsRankingTable } from './ResultsRankingTable';
import { ResultsSummaryCards, ResultsSummarySkeleton } from './ResultsSummaryCards';
import { ResultsToolbar } from './ResultsToolbar';
import { ResultTranscriptDrawer } from './ResultTranscriptDrawer';

interface CampaignResultsPanelProps {
  campaignId: string;
  enabled?: boolean;
  passScorePct?: number | null;
  showPageHeader?: boolean;
}

export function CampaignResultsPanel({
  campaignId,
  enabled = true,
  passScorePct,
  showPageHeader = true,
}: CampaignResultsPanelProps) {
  const { t } = useLanguage();
  const resultsQuery = useCampaignResults(campaignId, { enabled });
  const [search, setSearch] = useState('');
  const [outcome, setOutcome] = useState<ResultsOutcomeFilter>('all');
  const [review, setReview] = useState<ResultsReviewFilter>('all');
  const [sort, setSort] = useState<ResultsSort>('rankAsc');
  const [selected, setSelected] = useState<CampaignResultItem | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!selected || !resultsQuery.data) return;
    const next = resultsQuery.data.results.find((item) => item.sessionId === selected.sessionId);
    if (next) setSelected(next);
  }, [resultsQuery.data, selected?.sessionId]);

  const filtered = useMemo(
    () =>
      filterAndSortResults(resultsQuery.data?.results ?? [], {
        search,
        outcome,
        review,
        sort,
      }),
    [outcome, resultsQuery.data?.results, review, search, sort],
  );
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [outcome, review, search, sort]);

  const openTranscript = (item: CampaignResultItem) => {
    setSelected(item);
    setTranscriptOpen(true);
  };
  const openOverride = (item: CampaignResultItem) => {
    setSelected(item);
    setOverrideOpen(true);
  };
  const openClear = (item: CampaignResultItem) => {
    setSelected(item);
    setClearOpen(true);
  };

  return (
    <div className="space-y-5">
      {showPageHeader ? (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {t('employer.campaigns.results.title')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('employer.campaigns.results.description')}
            </p>
          </div>
          <ResultsExportMenu campaignId={campaignId} />
        </header>
      ) : (
        <div className="flex justify-end">
          <ResultsExportMenu campaignId={campaignId} />
        </div>
      )}

      {resultsQuery.isLoading ? (
        <>
          <p className="text-sm text-muted-foreground">{t('employer.campaigns.results.loading')}</p>
          <ResultsSummarySkeleton />
          <div className="h-64 animate-pulse rounded-xl border border-satin bg-surface-overlay" />
        </>
      ) : null}

      {resultsQuery.isError ? (
        <div className="space-y-3">
          <Alert variant="error">
            <AlertDescription>{t(getResultsLoadErrorKey(resultsQuery.error))}</AlertDescription>
          </Alert>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => void resultsQuery.refetch()}>
              {t('employer.campaigns.results.errors.retry')}
            </Button>
            <Button type="button" variant="outline" render={<Link to="/employer/campaigns" />}>
              {t('employer.campaigns.results.errors.backToList')}
            </Button>
          </div>
        </div>
      ) : null}

      {resultsQuery.data && resultsQuery.data.results.length === 0 ? (
        <EmptyState
          variant="no-data"
          title={t('employer.campaigns.results.empty.title')}
          description={t('employer.campaigns.results.empty.description')}
          action={
            <Button
              type="button"
              variant="outline"
              render={
                <Link
                  to={`/employer/campaigns/${campaignId}/invitations?tab=cv-screening`}
                />
              }
            >
              {t('employer.campaigns.results.empty.viewCandidates')}
            </Button>
          }
        />
      ) : null}

      {resultsQuery.data && resultsQuery.data.results.length > 0 ? (
        <>
          <ResultsSummaryCards data={resultsQuery.data} fallbackPassScorePct={passScorePct} />
          <ResultsToolbar
            search={search}
            outcome={outcome}
            review={review}
            sort={sort}
            onSearchChange={setSearch}
            onOutcomeChange={setOutcome}
            onReviewChange={setReview}
            onSortChange={setSort}
          />
          {filtered.length === 0 ? (
            <EmptyState
              variant="no-results"
              title={t('employer.campaigns.results.empty.filteredTitle')}
              description={t('employer.campaigns.results.empty.filteredDescription')}
            />
          ) : (
            <ResultsRankingTable
              items={paginated}
              onViewDetails={openTranscript}
              onOverride={openOverride}
              onClearOverride={openClear}
            />
          )}
          <AppPagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={filtered.length}
            itemLabel={t('employer.campaigns.results.pagination.itemLabel')}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      ) : null}

      <ResultTranscriptDrawer
        open={transcriptOpen}
        campaignId={campaignId}
        item={selected}
        onClose={() => setTranscriptOpen(false)}
        onOverride={() => {
          setTranscriptOpen(false);
          setOverrideOpen(true);
        }}
      />
      <OverrideResultModal
        open={overrideOpen}
        campaignId={campaignId}
        item={selected}
        onClose={() => setOverrideOpen(false)}
      />
      <ClearOverrideDialog
        open={clearOpen}
        campaignId={campaignId}
        item={selected}
        onClose={() => setClearOpen(false)}
      />
    </div>
  );
}
