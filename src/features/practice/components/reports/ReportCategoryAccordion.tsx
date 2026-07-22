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
    <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70 transition-colors hover:bg-zinc-900">
      <h2 className="m-0">
        <button
          type="button"
          id={headerId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
        >
          <span className="heading-secondary text-base text-zinc-100">{title}</span>
          <span className="flex items-center gap-3">
            <span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-2.5 py-0.5 text-xs font-semibold text-zinc-400">
              {count}
            </span>
            <ChevronDown
              className={cn(
                'size-4 text-zinc-400 transition-transform motion-reduce:transition-none',
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
          className="space-y-2 border-t border-zinc-800 px-5 py-4 motion-safe:animate-in motion-safe:fade-in motion-reduce:animate-none"
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
