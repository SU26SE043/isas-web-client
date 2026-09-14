import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { EmployerAnalyticsGranularity, EmployerAnalyticsPreset } from '../types/employerAnalytics.types';

export const ANALYTICS_PRESETS: readonly EmployerAnalyticsPreset[] = ['30d', '90d', 'ytd'];

interface EmployerAnalyticsFiltersProps {
  preset: EmployerAnalyticsPreset;
  groupBy: EmployerAnalyticsGranularity;
  isFetching: boolean;
  onPresetChange: (preset: EmployerAnalyticsPreset) => void;
  onGroupByChange: (groupBy: EmployerAnalyticsGranularity) => void;
  onRefresh: () => void;
}

const SELECT_CLASS = 'h-8 rounded-lg border border-satin bg-surface-overlay px-3 text-sm';

export function EmployerAnalyticsFilters({
  preset,
  groupBy,
  isFetching,
  onPresetChange,
  onGroupByChange,
  onRefresh,
}: EmployerAnalyticsFiltersProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="employer-analytics-period">
        {t('employerAnalytics.filters.period')}
      </label>
      <select
        id="employer-analytics-period"
        value={preset}
        className={SELECT_CLASS}
        onChange={(event) => onPresetChange(event.target.value as EmployerAnalyticsPreset)}
      >
        {ANALYTICS_PRESETS.map((option) => (
          <option key={option} value={option}>
            {t(`employerAnalytics.filters.period.${option}`)}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="employer-analytics-granularity">
        {t('employerAnalytics.filters.groupBy')}
      </label>
      <select
        id="employer-analytics-granularity"
        value={groupBy}
        className={SELECT_CLASS}
        onChange={(event) => onGroupByChange(event.target.value as EmployerAnalyticsGranularity)}
      >
        <option value="day">{t('employerAnalytics.filters.day')}</option>
        <option value="month">{t('employerAnalytics.filters.month')}</option>
      </select>
      <Button variant="outline" loading={isFetching} onClick={onRefresh}>
        <RefreshCw aria-hidden />
        {t('employerAnalytics.filters.refresh')}
      </Button>
    </div>
  );
}
