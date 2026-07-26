import { Button } from '@/components/ui/button';
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
  const pageSize = 10;

  const selectableIds = candidates.filter(canSelectCandidate).map((item) => item.id);
  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));
  const pageCount = Math.max(1, Math.ceil(candidates.length / pageSize));
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
          {pageItems.map((item, index) => {
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
                <TableCell className="font-semibold text-foreground">
                  {(page - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{item.fullName ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{item.email ?? '—'}</p>
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {item.overallMatchScore != null ? `${item.overallMatchScore}%` : '—'}
                </TableCell>
                <TableCell>
                  {item.skills?.length ? item.skills.slice(0, 3).join(', ') : '—'}
                </TableCell>
                <TableCell className="text-foreground">{item.status}</TableCell>
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
      {pageCount > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {t('employer.campaigns.screening.ranking.page')
              .replace('{page}', String(page))
              .replace('{pages}', String(pageCount))}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              aria-label={t('employer.campaigns.screening.ranking.previous')}
            >
              <ChevronLeft aria-hidden />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page >= pageCount}
              onClick={() => setPage((current) => current + 1)}
              aria-label={t('employer.campaigns.screening.ranking.next')}
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
