import { LayoutGrid, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { CampaignFilters as CampaignFiltersValue } from '../types/campaignManagement.types';

interface CampaignFiltersProps {
  value: CampaignFiltersValue;
  onChange: (value: CampaignFiltersValue) => void;
}

export function CampaignFilters({ value, onChange }: CampaignFiltersProps) {
  const { t } = useLanguage();
  const quickFilters: Array<{ value: CampaignFiltersValue['status']; label: string }> = [
    { value: 'all', label: t('employer.campaigns.list.allStatuses') },
    { value: 'active', label: t('employer.campaigns.status.active') },
    { value: 'draft', label: t('employer.campaigns.status.draft') },
    { value: 'paused', label: t('employer.campaigns.status.paused') },
    { value: 'closed', label: t('employer.campaigns.status.closed') },
    { value: 'archived', label: t('employer.campaigns.status.archived') },
  ];

  return (
    <section className="frame-satin grid gap-3 rounded-xl bg-surface-raised p-3.5 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-end">
      <label className="relative block">
        <span className="sr-only">{t('employer.campaigns.list.search')}</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={value.query}
          onChange={(event) => onChange({ ...value, query: event.target.value })}
          placeholder={t('employer.campaigns.list.searchPlaceholder')}
          className="h-11 bg-surface-overlay pl-10"
        />
      </label>
      <div className="flex min-w-0 flex-wrap gap-2" aria-label={t('employer.campaigns.list.status')}>
        {quickFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange({ ...value, status: filter.value })}
            aria-pressed={value.status === filter.value}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
              value.status === filter.value
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-surface-overlay text-muted-foreground hover:bg-surface-highlight hover:text-foreground',
            )}
          >
            {filter.value === 'all' ? <LayoutGrid className="size-3.5" aria-hidden /> : null}
            {filter.label}
          </button>
        ))}
      </div>
    </section>
  );
}
