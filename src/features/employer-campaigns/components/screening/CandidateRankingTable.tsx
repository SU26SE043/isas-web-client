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
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { candidateScreeningStatusLabelKey } from '../../utils/candidateScreeningStatus';
import { canSelectCandidate, getCandidateRanks } from './screeningUtils';

interface CandidateRankingTableProps {
  candidates: CampaignCandidateListItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onViewDetail: (id: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onChooseFiles: () => void;
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
}: CandidateRankingTableProps) {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const selectableIds = candidates.filter(canSelectCandidate).map((item) => item.id);
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
            const selectable = canSelectCandidate(item);
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
                  <p className="text-xs text-muted-foreground">{item.email ?? '—'}</p>
                  {item.eligible === false ? <Badge variant="warning">{t('employer.campaigns.screening.ranking.ineligible')}</Badge> : null}
                  {item.mustHaveTotal ? <p className="text-xs text-muted-foreground">{t('employer.campaigns.screening.ranking.mustHaveCount').replace('{{met}}', String(item.mustHaveMet ?? 0)).replace('{{total}}', String(item.mustHaveTotal))}</p> : null}
                  {item.missingMustHave?.length ? <p className="text-xs text-warning">{t('employer.campaigns.screening.ranking.missingMustHave')}: {item.missingMustHave.join(', ')}</p> : null}
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {item.overallMatchScore != null ? `${item.overallMatchScore}%` : '—'}
                </TableCell>
                <TableCell>
                  {item.skills?.length ? item.skills.slice(0, 3).join(', ') : '—'}
                </TableCell>
                <TableCell className="text-foreground">
                  <div>{t(candidateScreeningStatusLabelKey(item.status))}</div>
                  {item.verificationRisk ? (
                    <div className="text-xs text-warning-foreground">
                      {t('employer.campaigns.screening.ranking.verificationRisk')}: {t(`employer.campaigns.screening.verificationRisk.${item.verificationRisk}`)}
                    </div>
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

function isUnreadable(item: CampaignCandidateListItem): boolean {
  const status = item.status.toLowerCase();
  return status.includes('analyz') || status.includes('fail') || status.includes('filter') || item.overallMatchScore == null;
}
