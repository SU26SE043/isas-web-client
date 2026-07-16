import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentResultShellProps {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function PaymentResultShell({
  icon: Icon,
  iconClassName,
  title,
  description,
  children,
}: PaymentResultShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base px-4 py-10">
      <div
        className={cn(
          'w-full max-w-lg space-y-6 rounded-xl border border-subtle bg-surface-raised p-8',
          'animate-in fade-in-0 zoom-in-95 duration-300',
        )}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className={cn(
              'flex size-14 items-center justify-center rounded-full border border-subtle bg-surface-overlay',
              iconClassName,
            )}
          >
            <Icon className="size-7" aria-hidden />
          </div>
          <div className="space-y-2">
            <h1 className="heading-primary text-2xl text-foreground">{title}</h1>
            <p className="body-text text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
