import { cn } from '@/lib/utils';

export type CvFlowFileSourceTab = 'uploaded' | 'new';

interface CvFlowFileSourceTabsProps {
  activeTab: CvFlowFileSourceTab;
  uploadedLabel: string;
  newLabel: string;
  onChange: (tab: CvFlowFileSourceTab) => void;
  disabled?: boolean;
}

export function CvFlowFileSourceTabs({
  activeTab,
  uploadedLabel,
  newLabel,
  onChange,
  disabled = false,
}: CvFlowFileSourceTabsProps) {
  const tabs: Array<{ id: CvFlowFileSourceTab; label: string }> = [
    { id: 'uploaded', label: uploadedLabel },
    { id: 'new', label: newLabel },
  ];

  return (
    <div
      role="tablist"
      aria-label={uploadedLabel}
      className="flex flex-wrap gap-2 rounded-xl border border-subtle bg-surface-overlay p-1"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-[background-color,color,box-shadow] duration-200 ease-out',
              isActive
                ? 'bg-white/[0.08] text-foreground shadow-[var(--satin-inset)]'
                : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
