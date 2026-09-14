import { Button } from '@/components/ui/button';
import { AppPagination, DEFAULT_PAGE_SIZE } from '@/components/ui/app-pagination';
import { Fragment, useEffect, useState } from 'react';
import { EmptyState } from '@/components/patterns/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { candidateScreeningStatusLabelKey } from '../../utils/candidateScreeningStatus';
import { canSelectCandidate, getCandidateRanks, verificationRiskTranslationKey } from './screeningUtils';

interface CandidateRankingTableProps {
  candidates: CampaignCandidateListItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onViewDetail: (id: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onChooseFiles: () => void;
  onUpdateEmail?: (candidateId: string, email: string) => Promise<void>;
  updatingCandidateId?: string | null;
  allowIneligibleSelection?: boolean;
  onRescreen?: (candidateId: string) => void;
  rescreeningCandidateId?: string | null;
}

export function CandidateRankingTable({
  candidates,
  selectedIds,
  onToggle,
  onToggleAll,
  onViewDetail,
  hasActiveFilters,
  onClearFilters,
  onChooseFiles,
  onUpdateEmail,
  updatingCandidateId = null,
  allowIneligibleSelection = false,
  onRescreen,
  rescreeningCandidateId = null,
}: CandidateRankingTableProps) {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [emailDrafts, setEmailDrafts] = useState<Record<string, string>>({});

  const selectableIds = candidates
    .filter((item) => allowIneligibleSelection ? canSelectCandidate({ ...item, eligible: true }) : canSelectCandidate(item))
    .map((item) => item.id);
  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));
  const candidateRanks = getCandidateRanks(candidates);
  const hasMustHave = candidates.some((item) => (item.mustHaveTotal ?? 0) > 0);
  const groupedCandidates = hasMustHave
    ? [
        { key: 'eligible', title: t('employer.campaigns.screening.ranking.group.eligible'), items: candidates.filter((item) => item.eligible !== false && !isUnreadable(item)) },
        { key: 'ineligible', title: t('employer.campaigns.screening.ranking.group.ineligible'), items: candidates.filter((item) => item.eligible === false) },
        { key: 'unreadable', title: t('employer.campaigns.screening.ranking.group.unreadable'), items: candidates.filter((item) => item.eligible !== false && isUnreadable(item)) },
      ].filter((group) => group.items.length > 0)
    : [{ key: 'all', title: '', items: candidates }];

  useEffect(() => {
    setPage(1);
  }, [candidates]);

  if (candidates.length === 0) {
    return (
      <EmptyState
        variant={hasActiveFilters ? 'no-results' : 'no-data'}
        title={t('employer.campaigns.screening.ranking.title')}
        description={
          hasActiveFilters
            ? t('employer.campaigns.screening.ranking.emptyFilter')
            : t('employer.campaigns.screening.ranking.empty')
        }
        action={
          hasActiveFilters ? (
            <Button type="button" variant="outline" onClick={onClearFilters}>
              {t('employer.campaigns.screening.ranking.clearFilters')}
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={onChooseFiles}>
              {t('employer.campaigns.screening.upload.selectFiles')}
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={selectableIds.length === 0}
            onClick={() => onToggleAll(allSelected ? [] : selectableIds)}
          >
            {allSelected
              ? t('employer.campaigns.screening.ranking.clearSelection')
              : t('employer.campaigns.screening.ranking.selectAll')}
          </Button>
      </div>

      <Table className="min-w-[820px]">
        <TableHeader>
          <TableRow>
            <TableHead>{t('employer.campaigns.screening.ranking.selectAll')}</TableHead>
            <TableHead>{t('employer.campaigns.screening.ranking.rank')}</TableHead>
            <TableHead>{t('employer.campaigns.screening.ranking.candidate')}</TableHead>
            <TableHead>{t('employer.campaigns.screening.ranking.matchScore')}</TableHead>
            <TableHead>{t('employer.campaigns.screening.ranking.skills')}</TableHead>
            <TableHead>{t('employer.campaigns.screening.ranking.status')}</TableHead>
            <TableHead>{t('employer.campaigns.screening.ranking.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedCandidates.flatMap((group) => group.items).slice((page - 1) * pageSize, page * pageSize).map((item, index) => {
            const selectable = allowIneligibleSelection
              ? canSelectCandidate({ ...item, eligible: true })
              : canSelectCandidate(item);
            const emailDraft = emailDrafts[item.id] ?? item.email ?? '';
            const emailDirty = emailDraft.trim().toLowerCase() !== (item.email ?? '').trim().toLowerCase();
            return (
              <Fragment key={item.id}>
                {groupedCandidates.length > 1 && index === groupedCandidates.slice(0, groupedCandidates.findIndex((entry) => entry.items.some((candidate) => candidate.id === item.id))).reduce((sum, entry) => sum + entry.items.length, 0) ? <TableRow><TableCell colSpan={7} className="bg-surface-elevated font-semibold text-foreground">{groupedCandidates.find((entry) => entry.items.some((candidate) => candidate.id === item.id))?.title}</TableCell></TableRow> : null}
              <TableRow>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    disabled={!selectable}
                    onChange={() => onToggle(item.id)}
                    className="size-4 rounded border-satin"
                    aria-label={item.fullName ?? item.email ?? item.id}
                  />
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {candidateRanks.get(item.id) ?? '—'}
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{item.fullName ?? '—'}</p>
                  {onUpdateEmail ? (
                    <div className="mt-2 flex max-w-sm items-center gap-2">
                      <Input
                        type="email"
                        value={emailDraft}
                        placeholder="candidate@example.com"
                        aria-label={t('employer.campaigns.screening.ranking.email')}
                        onChange={(event) => setEmailDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
                        disabled={updatingCandidateId === item.id}
                        className="h-8 text-xs"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!emailDirty || updatingCandidateId === item.id}
                        loading={updatingCandidateId === item.id}
                        onClick={() => void onUpdateEmail(item.id, emailDraft)}
                      >
                        {t('employer.campaigns.screening.ranking.saveEmail')}
                      </Button>
                    </div>
                  ) : <p className="text-xs text-muted-foreground">{item.email ?? '—'}</p>}
                  {item.eligible === false ? <Badge variant="warning">{t('employer.campaigns.screening.ranking.ineligible')}</Badge> : null}
                  {item.mustHaveTotal ? <p className="text-xs text-muted-foreground">{t('employer.campaigns.screening.ranking.mustHaveCount').replace('{{met}}', String(item.mustHaveMet ?? 0)).replace('{{total}}', String(item.mustHaveTotal))}</p> : null}
                  {item.missingMustHave?.length ? <p className="text-xs text-warning">{t('employer.campaigns.screening.ranking.missingMustHave')}: {item.missingMustHave.join(', ')}</p> : null}
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{item.overallMatchScore != null ? `${item.overallMatchScore}%` : '—'}</span>
                    {item.verificationRisk ? (
                      <Badge variant={item.verificationRisk === 'High' ? 'destructive' : item.verificationRisk === 'Medium' ? 'warning' : 'success'}>
                        {t(verificationRiskTranslationKey(item.verificationRisk))}
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  {item.skills?.length ? item.skills.slice(0, 3).join(', ') : '—'}
                </TableCell>
                <TableCell className="text-foreground">
                  <div>{t(candidateScreeningStatusLabelKey(item.status))}</div>
                  {item.status.toLowerCase() === 'analysisfailed' ? (
                    <>
                      {item.rejectReason ? <p className="mt-1 text-xs text-error">{item.rejectReason}</p> : null}
                      {onRescreen ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          loading={rescreeningCandidateId === item.id}
                          disabled={rescreeningCandidateId === item.id}
                          onClick={() => onRescreen(item.id)}
                        >
                          {t('employer.campaigns.screening.actions.rescreen')}
                        </Button>
                      ) : null}
                    </>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetail(item.id)}
                  >
                    {t('employer.campaigns.screening.ranking.viewDetail')}
                  </Button>
                </TableCell>
              </TableRow>
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
      <AppPagination
        currentPage={page}
        pageSize={pageSize}
        totalItems={candidates.length}
        itemLabel={t('employer.campaigns.screening.ranking.itemLabel')}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

export function isUnreadable(item: CampaignCandidateListItem): boolean {
  const status = item.status.toLowerCase();
  return status === 'analyzing' || status === 'analysisfailed' || status === 'filtered' || item.overallMatchScore == null;
}
