import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type EmptyStateVariant = 'no-data' | 'no-results' | 'no-permission';

interface EmptyStateProps {
  title: string;
  description: string;
  variant?: EmptyStateVariant;
  action?: ReactNode;
  className?: string;
}

const variantStyles: Record<EmptyStateVariant, string> = {
  'no-data': 'border-subtle',
  'no-results': 'border-default',
  'no-permission': 'border-warning/30',
};

export function EmptyState({
  title,
  description,
  variant = 'no-data',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border bg-surface-raised px-6 py-12 text-center',
        variantStyles[variant],
        className,
      )}
    >
      <h2 className="heading-secondary text-lg">{title}</h2>
      <p className="body-text mt-2 max-w-md">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
