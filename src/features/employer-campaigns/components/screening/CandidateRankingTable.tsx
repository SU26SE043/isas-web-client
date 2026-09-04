import { Button } from '@/components/ui/button';
import { AppPagination, DEFAULT_PAGE_SIZE } from '@/components/ui/app-pagination';
import { useEffect, useState } from 'react';
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
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { candidateScreeningStatusLabelKey } from '../../utils/candidateScreeningStatus';
import { canSelectCandidate } from './screeningUtils';

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
  const pageItems = candidates.slice((page - 1) * pageSize, page * pageSize);

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
            <TableHead aria-label={t('employer.campaigns.screening.ranking.selectAll')} />
            <TableHead>{t('employer.campaigns.screening.ranking.candidate')}</TableHead>
            <TableHead>{t('employer.campaigns.screening.ranking.matchScore')}</TableHead>
            <TableHead>{t('employer.campaigns.screening.ranking.skills')}</TableHead>
            <TableHead>{t('employer.campaigns.screening.ranking.status')}</TableHead>
            <TableHead>{t('employer.campaigns.screening.ranking.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((item) => {
            const selectable = canSelectCandidate(item);
            return (
              <TableRow key={item.id}>
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
                <TableCell>
                  <p className="font-medium text-foreground">{item.fullName ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{item.email ?? '—'}</p>
                  {item.eligible === false && item.mustHaveTotal ? (
                    <p className="mt-1 text-xs text-warning">
                      {t('employer.campaigns.screening.ranking.missingEvidence')
                        .replace('{{missing}}', String(item.mustHaveTotal - (item.mustHaveMet ?? 0)))
                        .replace('{{total}}', String(item.mustHaveTotal))
                        .replace('{{names}}', item.missingMustHave?.join(', ') || t('employer.campaigns.screening.ranking.unknownMissing'))}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-surface-highlight" aria-label={`${item.mustHaveMet ?? 0}/${item.mustHaveTotal ?? 0}`}>
                    <div className="h-full rounded-full bg-foreground" style={{ width: `${item.mustHaveTotal ? Math.min(100, ((item.mustHaveMet ?? 0) / item.mustHaveTotal) * 100) : 0}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('employer.campaigns.screening.ranking.evidenceCount').replace('{{met}}', String(item.mustHaveMet ?? 0)).replace('{{total}}', String(item.mustHaveTotal ?? 0))}
                  </p>
                </TableCell>
                <TableCell>
                  {item.skills?.length ? item.skills.slice(0, 3).join(', ') : '—'}
                </TableCell>
                <TableCell className="text-foreground">
                  <div>{t(candidateScreeningStatusLabelKey(item.status))}</div>
                  {item.verificationRisk ? (
                    <div className="text-xs text-warning-foreground">
                      {t('employer.campaigns.screening.ranking.verificationRisk')}: {t(`employer.campaigns.screening.risk.${item.verificationRisk.toLowerCase()}`)}
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
