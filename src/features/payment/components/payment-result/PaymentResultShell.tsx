import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentResultShellProps {
  icon: LucideIcon;
  variant: 'success' | 'failed';
  title: string;
  description: string;
  children?: ReactNode;
}

const iconWellClass: Record<PaymentResultShellProps['variant'], string> = {
  success: 'border-success/25 bg-success-bg text-success',
  failed: 'border-error/25 bg-error-bg text-error',
};

export function PaymentResultShell({
  icon: Icon,
  variant,
  title,
  description,
  children,
}: PaymentResultShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-base px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04),transparent_55%)]"
      />
      <div
        className={cn(
          'relative w-full max-w-lg space-y-8 rounded-2xl bg-surface-raised p-6 sm:p-8',
          'frame-satin shadow-[var(--satin-inset),var(--shadow-lg)]',
          'animate-in fade-in-0 zoom-in-95 duration-300',
        )}
      >
        <header className="flex flex-col items-center gap-5 text-center">
          <div
            className={cn(
              'flex size-20 items-center justify-center rounded-full frame-satin-soft',
              iconWellClass[variant],
            )}
          >
            <Icon className="size-10" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="space-y-2">
            <h1 className="heading-primary text-2xl text-text-primary sm:text-3xl">{title}</h1>
            <p className="body-text mx-auto max-w-md whitespace-pre-line text-sm text-text-secondary">
              {description}
            </p>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
