export type ReportTabId = 'overview' | 'breakdown' | 'feedback' | 'roadmap';

interface ReportTab {
  id: ReportTabId;
  label: string;
}

interface ReportTabsProps {
  tabs: ReportTab[];
  activeTab: ReportTabId;
  onChange: (tab: ReportTabId) => void;
}

export function ReportTabs({ tabs, activeTab, onChange }: ReportTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Report sections"
      className="flex flex-wrap gap-2 border-b border-subtle pb-4"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={[
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
              isActive
                ? 'bg-surface-elevated text-foreground'
                : 'text-muted-foreground hover:bg-surface-overlay hover:text-foreground',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
