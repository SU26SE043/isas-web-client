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
              'shrink-0 rounded-xl border px-4 py-2.5 text-sm font-bold tracking-wide transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
              isActive
                ? 'border-info/70 bg-gradient-to-r from-info/20 to-info-500/20 text-foreground shadow-[0_0_18px_-8px_var(--color-info)]'
                : 'border-satin bg-surface-overlay/30 text-foreground/90 hover:border-info/40 hover:bg-info/10 hover:text-foreground',
            )}
          >
            {t(liveReportTabLabelKey(tab))}
          </button>
        );
      })}
    </div>
  );
}

