import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SectionPanelProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
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
          'frame-satin flex min-h-[280px] items-center justify-center rounded-2xl bg-white/[0.03] backdrop-blur-xl',
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
        'frame-satin overflow-hidden rounded-2xl bg-[rgb(28_28_32/0.62)] backdrop-blur-xl',
        className,
      )}
    >
      <div className="border-b border-satin px-5 py-5 sm:px-7 sm:py-6">
        <div className={icon ? 'flex items-start gap-3' : undefined}>
          {icon ? (
            <span className="frame-satin-soft mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-foreground">
              {icon}
            </span>
          ) : null}
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h2>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-7 sm:py-7">
        {children}
        {footer}
      </div>

      {footerHint ? (
        <p className="border-t border-satin px-5 py-4 text-center text-xs text-muted-foreground sm:px-7">
          {footerHint}
        </p>
      ) : null}
    </section>
  );
}
