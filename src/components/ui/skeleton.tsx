import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-xl bg-surface-overlay/80 ring-1 ring-white/5', className)}
      {...props}
    />
  );
}

export { Skeleton };
