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
import { CandidateActionsMenu } from './CandidateActionsMenu';

interface CandidateRankingTableProps {
  candidates: CampaignCandidateListItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onViewDetail: (id: string) => void;
  onViewCv: (candidate: CampaignCandidateListItem) => void;
  onEdit: (candidate: CampaignCandidateListItem) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function CandidateRankingTable({
  candidates,
  selectedIds,
  onToggle,
  onToggleAll,
  onViewDetail,
  onViewCv,
  onEdit,
  hasActiveFilters,
  onClearFilters,
}: CandidateRankingTableProps) {
  const { t } = useLanguage();

  const selectableIds = candidates.filter(canSelectCandidate).map((item) => item.id);
  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));

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
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">
          {t('employer.campaigns.screening.ranking.title')}
        </h3>
        <div className="flex flex-wrap gap-2">
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
          {candidates.map((item, index) => {
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
                <TableCell className="font-semibold text-foreground">{index + 1}</TableCell>
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
                  <CandidateActionsMenu
                    candidate={item}
                    onViewCv={() => onViewCv(item)}
                    onEdit={() => onEdit(item)}
                    onViewDetail={() => onViewDetail(item.id)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
