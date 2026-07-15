import { useState } from 'react';
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

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
      >
        <span className="heading-secondary text-base text-foreground">{title}</span>
        <span className="flex items-center gap-3">
          <span className="rounded-full bg-surface-overlay px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {count}
          </span>
          <ChevronDown
            className={cn(
              'size-4 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        </span>
      </button>
      {open ? <div className="space-y-2 border-t border-subtle px-5 py-4">{children}</div> : null}
    </section>
  );
}
