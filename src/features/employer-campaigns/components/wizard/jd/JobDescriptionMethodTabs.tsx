import { cn } from '@/lib/utils';

export type JobDescriptionMethod = 'file' | 'text';

interface JobDescriptionMethodTabsProps {
  active: JobDescriptionMethod;
  fileLabel: string;
  textLabel: string;
  listLabel: string;
  onChange: (method: JobDescriptionMethod) => void;
  disabled?: boolean;
}

/** Segmented control styled like Candidate `CvFlowFileSourceTabs`. */
export function JobDescriptionMethodTabs({
  active,
  fileLabel,
  textLabel,
  listLabel,
  onChange,
  disabled = false,
}: JobDescriptionMethodTabsProps) {
  const tabs: Array<{ id: JobDescriptionMethod; label: string }> = [
    { id: 'file', label: fileLabel },
    { id: 'text', label: textLabel },
  ];

  return (
    <div
      role="tablist"
      aria-label={listLabel}
      className="flex flex-wrap gap-2 rounded-xl border border-subtle bg-surface-overlay p-1"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
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
                ? 'bg-foreground text-background shadow-[var(--satin-inset)]'
                : 'text-muted-foreground hover:bg-surface-overlay hover:text-foreground',
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
