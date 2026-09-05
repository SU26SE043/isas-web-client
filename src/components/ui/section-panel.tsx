import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SectionPanelProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  headerAside?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  footerHint?: string;
  isLoading?: boolean;
  className?: string;
}

/**
 * Project-wide glass section shell (header + body + optional footer).
 * Use for multi-step wizards, setup flows, and self-contained form sections.
 */
export function SectionPanel({
  title,
  description,
  icon,
  headerAside,
  children,
  footer,
  footerHint,
  isLoading = false,
  className,
}: SectionPanelProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'frame-satin flex min-h-[280px] flex-1 items-center justify-center rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl',
          className,
        )}
      >
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <section
      className={cn(
        'relative frame-satin flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border-info/35 bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.12),transparent_28%),var(--glass-bg)] backdrop-blur-xl shadow-[0_24px_70px_-42px_rgba(59,130,246,0.9)]',
        className,
      )}
    >
      <div className="shrink-0 border-b border-satin px-6 py-6 sm:px-8 sm:py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className={icon ? 'flex items-start gap-4' : undefined}>
            {icon ? (
              <span className="frame-satin-soft mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-overlay text-foreground">
                {icon}
              </span>
            ) : null}
            <div className="min-w-0">
              <h2 className="relative pl-4 text-xl font-bold tracking-tight text-foreground before:absolute before:left-0 before:top-1 before:h-6 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-info before:to-violet-400 sm:text-2xl">{title}</h2>
              {description ? (
                <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {headerAside ? <div className="shrink-0 sm:self-start">{headerAside}</div> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 py-6 sm:px-8 sm:py-8">
        <div className="min-h-0 flex-1">{children}</div>
        {footer}
      </div>

      {footerHint ? (
        <p className="shrink-0 border-t border-satin px-6 py-4 text-center text-xs text-muted-foreground sm:px-8">
          {footerHint}
        </p>
      ) : null}
    </section>
  );
}
