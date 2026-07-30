import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import {
  LIVE_REPORT_TABS,
  type LiveReportTab,
  liveReportTabLabelKey,
} from './liveReportTabs';

interface LiveReportTabBarProps {
  activeTab: LiveReportTab;
  onChange: (tab: LiveReportTab) => void;
}

export function LiveReportTabBar({ activeTab, onChange }: LiveReportTabBarProps) {
  const { t } = useLanguage();

  return (
    <div
      role="tablist"
      aria-label={t('practice.result.quickNavLabel')}
      className="flex gap-2 overflow-x-auto pb-1"
    >
      {LIVE_REPORT_TABS.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className={cn(
              'shrink-0 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
              isActive
                ? 'border-satin bg-surface-elevated text-foreground shadow-[0_0_12px_color-mix(in_srgb,var(--isas-silver-200)_18%,transparent)]'
                : 'border-satin bg-transparent text-foreground/80 hover:bg-surface-overlay hover:text-foreground',
            )}
          >
            {t(liveReportTabLabelKey(tab))}
          </button>
        );
      })}
    </div>
  );
}
