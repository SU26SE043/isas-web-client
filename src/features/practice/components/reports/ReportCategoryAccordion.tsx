import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportCategoryAccordionProps {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function ReportCategoryAccordion({
  title,
  count,
  defaultOpen = false,
  children,
}: ReportCategoryAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const headerId = useId();

  return (
    <section className="overflow-hidden rounded-xl border border-satin bg-surface-raised transition-colors hover:bg-surface-overlay">
      <h2 className="m-0">
        <button
          type="button"
          id={headerId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
        >
          <span className="heading-secondary text-base text-foreground">{title}</span>
          <span className="flex items-center gap-3">
            <span className="rounded-full border border-satin bg-surface-overlay px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {count}
            </span>
            <ChevronDown
              className={cn(
                'size-4 text-muted-foreground transition-transform motion-reduce:transition-none',
                open && 'rotate-180',
              )}
              aria-hidden
            />
          </span>
        </button>
      </h2>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className="space-y-2 border-t border-satin px-5 py-4 motion-safe:animate-in motion-safe:fade-in motion-reduce:animate-none"
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
