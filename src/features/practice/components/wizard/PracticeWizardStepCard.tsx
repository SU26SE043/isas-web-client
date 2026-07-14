import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PracticeWizardStepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  footerHint?: string;
  isLoading?: boolean;
  className?: string;
}

export const PracticeWizardStepCard: React.FC<PracticeWizardStepCardProps> = ({
  icon,
  title,
  description,
  children,
  footer,
  footerHint,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex min-h-[280px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl',
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
        'overflow-hidden rounded-2xl border border-white/10 bg-[rgb(18_18_20/0.55)] shadow-[var(--shadow-md)] backdrop-blur-xl',
        className,
      )}
    >
      <div className="border-b border-white/8 px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] text-foreground">
            {icon}
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-7 sm:py-7">
        {children}
        {footer}
      </div>

      {footerHint ? (
        <p className="border-t border-white/8 px-5 py-4 text-center text-xs text-muted-foreground sm:px-7">
          {footerHint}
        </p>
      ) : null}
    </section>
  );
};
