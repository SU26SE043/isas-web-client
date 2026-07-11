import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import type { CampaignFilters as CampaignFiltersValue } from '../types/campaign.types';

interface CampaignFiltersProps {
  value: CampaignFiltersValue;
  onChange: (value: CampaignFiltersValue) => void;
}

export function CampaignFilters({ value, onChange }: CampaignFiltersProps) {
  const { t } = useLanguage();
  return (
    <section className="grid gap-3 rounded-xl border border-subtle bg-surface-raised p-4 md:grid-cols-[1fr_180px_180px]">
      <label className="relative block">
        <span className="sr-only">{t('campaigns.filters.search')}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={value.query}
          onChange={(event) => onChange({ ...value, query: event.target.value })}
          placeholder={t('campaigns.filters.searchPlaceholder')}
          className="h-10 bg-surface-overlay pl-9"
        />
      </label>
      <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t('campaigns.filters.mode')}
        <select
          value={value.mode}
          onChange={(event) => onChange({ ...value, mode: event.target.value as CampaignFiltersValue['mode'] })}
          className="h-10 rounded-lg border border-input bg-surface-overlay px-3 text-sm normal-case tracking-normal text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">{t('campaigns.filters.allModes')}</option>
          <option value="remote">{t('campaigns.mode.remote')}</option>
          <option value="hybrid">{t('campaigns.mode.hybrid')}</option>
          <option value="onsite">{t('campaigns.mode.onsite')}</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t('campaigns.filters.seniority')}
        <select
          value={value.seniority}
          onChange={(event) => onChange({ ...value, seniority: event.target.value as CampaignFiltersValue['seniority'] })}
          className="h-10 rounded-lg border border-input bg-surface-overlay px-3 text-sm normal-case tracking-normal text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">{t('campaigns.filters.allLevels')}</option>
          <option value="intern">{t('campaigns.seniority.intern')}</option>
          <option value="junior">{t('campaigns.seniority.junior')}</option>
          <option value="middle">{t('campaigns.seniority.middle')}</option>
          <option value="senior">{t('campaigns.seniority.senior')}</option>
        </select>
      </label>
    </section>
  );
}
