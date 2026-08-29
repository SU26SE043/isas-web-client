import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { CandidateListQuery } from '../../types/campaign.api.types';

interface CandidateFilterBarProps {
  filters: CandidateListQuery;
  onChange: (filters: CandidateListQuery) => void;
  onClear: () => void;
}

const selectClassName =
  'h-9 w-full rounded-lg border border-input bg-surface-overlay px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';

export function CandidateFilterBar({ filters, onChange, onClear }: CandidateFilterBarProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-3 rounded-lg border border-satin bg-surface-overlay p-3 md:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-1">
        <Label htmlFor="candidate-status">{t('employer.campaigns.screening.filters.status')}</Label>
        <select
          id="candidate-status"
          className={selectClassName}
          value={filters.status ?? ''}
          onChange={(event) =>
            onChange({ ...filters, status: event.target.value || undefined })
          }
        >
          <option value="">{t('employer.campaigns.screening.filters.all')}</option>
          <option value="Filtered">{t('employer.campaigns.screening.filters.filtered')}</option>
          <option value="Rejected">{t('employer.campaigns.screening.filters.rejected')}</option>
          <option value="Pending">{t('employer.campaigns.screening.status.Pending')}</option>
          <option value="Analyzing">{t('employer.campaigns.screening.status.Analyzing')}</option>
          <option value="Analyzed">{t('employer.campaigns.screening.status.Analyzed')}</option>
          <option value="AnalysisFailed">{t('employer.campaigns.screening.status.AnalysisFailed')}</option>
          <option value="Invited">{t('employer.campaigns.screening.filters.invited')}</option>
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="candidate-min-score">{t('employer.campaigns.screening.filters.minScore')}</Label>
        <Input
          id="candidate-min-score"
          type="number"
          min={0}
          max={100}
          className="bg-surface-overlay"
          value={filters.minScore ?? ''}
          onChange={(event) => {
            const raw = event.target.value;
            onChange({
              ...filters,
              minScore: raw === '' ? undefined : Number(raw),
            });
          }}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="candidate-skill">{t('employer.campaigns.screening.filters.skill')}</Label>
        <Input
          id="candidate-skill"
          className="bg-surface-overlay"
          value={filters.skill ?? ''}
          onChange={(event) =>
            onChange({ ...filters, skill: event.target.value || undefined })
          }
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="candidate-sort">{t('employer.campaigns.screening.filters.sort')}</Label>
        <select
          id="candidate-sort"
          className={selectClassName}
          value={filters.sort ?? 'score'}
          onChange={(event) =>
            onChange({
              ...filters,
              sort: event.target.value as CandidateListQuery['sort'],
            })
          }
        >
          <option value="score">{t('employer.campaigns.screening.filters.sortScore')}</option>
          <option value="name">{t('employer.campaigns.screening.filters.sortName')}</option>
        </select>
      </div>

      <div className="flex items-end">
        <Button type="button" variant="outline" className="w-full" onClick={onClear}>
          {t('employer.campaigns.screening.filters.clear')}
        </Button>
      </div>
    </div>
  );
}
