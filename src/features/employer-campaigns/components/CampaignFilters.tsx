import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import type { CampaignFilters as CampaignFiltersValue } from '../types/campaignManagement.types';

interface CampaignFiltersProps {
  value: CampaignFiltersValue;
  onChange: (value: CampaignFiltersValue) => void;
}

export function CampaignFilters({ value, onChange }: CampaignFiltersProps) {
  const { t } = useLanguage();
  return (
    <section className="grid gap-3 rounded-xl border border-subtle bg-surface-raised p-4 md:grid-cols-[1fr_220px]">
      <label className="relative block">
        <span className="sr-only">{t('employer.campaigns.list.search')}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={value.query}
          onChange={(event) => onChange({ ...value, query: event.target.value })}
          placeholder={t('employer.campaigns.list.searchPlaceholder')}
          className="h-10 bg-surface-overlay pl-9"
        />
      </label>
      <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t('employer.campaigns.list.status')}
        <select
          value={value.status}
          onChange={(event) => onChange({ ...value, status: event.target.value as CampaignFiltersValue['status'] })}
          className="h-10 rounded-lg border border-input bg-surface-overlay px-3 text-sm normal-case tracking-normal text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">{t('employer.campaigns.list.allStatuses')}</option>
          <option value="draft">{t('employer.campaigns.status.draft')}</option>
          <option value="active">{t('employer.campaigns.status.active')}</option>
          <option value="paused">{t('employer.campaigns.status.paused')}</option>
          <option value="closed">{t('employer.campaigns.status.closed')}</option>
        </select>
      </label>
    </section>
  );
}
