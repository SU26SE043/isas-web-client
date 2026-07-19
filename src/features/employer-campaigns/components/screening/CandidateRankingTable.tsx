import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns/EmptyState';
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
}

export function CandidateRankingTable({
  candidates,
  selectedIds,
  onToggle,
  onToggleAll,
  onViewDetail,
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

      <div className="overflow-x-auto rounded-lg border border-satin">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-satin bg-surface-overlay text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{t('employer.campaigns.screening.ranking.selectAll')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.screening.ranking.rank')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.screening.ranking.candidate')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.screening.ranking.matchScore')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.screening.ranking.skills')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.screening.ranking.status')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.screening.ranking.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((item, index) => {
              const selectable = canSelectCandidate(item);
              return (
                <tr key={item.id} className="border-b border-satin last:border-0">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      disabled={!selectable}
                      onChange={() => onToggle(item.id)}
                      className="size-4 rounded border-satin"
                      aria-label={item.fullName ?? item.email ?? item.id}
                    />
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-foreground">{item.fullName ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{item.email ?? '—'}</p>
                  </td>
                  <td className="px-3 py-2 text-foreground">
                    {item.overallMatchScore != null ? `${item.overallMatchScore}%` : '—'}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {item.skills?.length ? item.skills.slice(0, 3).join(', ') : '—'}
                  </td>
                  <td className="px-3 py-2 text-foreground">{item.status}</td>
                  <td className="px-3 py-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => onViewDetail(item.id)}>
                      {t('employer.campaigns.screening.ranking.viewDetail')}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
