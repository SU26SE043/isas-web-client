import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { PipelineFilters as PipelineFiltersValue, PipelineSortKey, PipelineStatus, ScoreBand } from '../types/employerAnalytics.types';

interface PipelineFiltersProps {
  value: PipelineFiltersValue;
  onChange: (value: PipelineFiltersValue) => void;
}

const statuses: Array<PipelineStatus | 'all'> = [
  'all',
  'invited',
  'invite_pending',
  'in_progress',
  'paused_violation',
  'auto_submitted',
  'completed',
];
const scoreBands: ScoreBand[] = ['all', 'top', 'mid', 'risk'];
const sortKeys: PipelineSortKey[] = ['rank', 'score', 'completedAt', 'status'];

export function PipelineFilters({ value, onChange }: PipelineFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-3 rounded-xl border border-subtle bg-surface-raised p-4 lg:grid-cols-[1fr_180px_180px_180px]">
      <div className="space-y-2">
        <Label htmlFor="pipeline-search">{t('employerAnalytics.pipeline.search')}</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            id="pipeline-search"
            value={value.search}
            onChange={(event) => onChange({ ...value, search: event.target.value })}
            placeholder={t('employerAnalytics.pipeline.searchPlaceholder')}
            className="pl-9"
          />
        </div>
      </div>
      <SelectField label={t('employerAnalytics.pipeline.status')} value={value.status} onChange={(status) => onChange({ ...value, status: status as PipelineFiltersValue['status'] })}>
        {statuses.map((status) => <option key={status} value={status}>{t(`employerAnalytics.status.${status}`)}</option>)}
      </SelectField>
      <SelectField label={t('employerAnalytics.pipeline.scoreBand')} value={value.scoreBand} onChange={(scoreBand) => onChange({ ...value, scoreBand: scoreBand as ScoreBand })}>
        {scoreBands.map((band) => <option key={band} value={band}>{t(`employerAnalytics.scoreBand.${band}`)}</option>)}
      </SelectField>
      <SelectField label={t('employerAnalytics.pipeline.sortBy')} value={value.sortBy} onChange={(sortBy) => onChange({ ...value, sortBy: sortBy as PipelineSortKey })}>
        {sortKeys.map((key) => <option key={key} value={key}>{t(`employerAnalytics.sort.${key}`)}</option>)}
      </SelectField>
    </div>
  );
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      {label}
      <select className="h-10 rounded-lg border border-input bg-surface-overlay px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}
