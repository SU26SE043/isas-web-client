import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GlassTableContainerProps extends React.ComponentProps<'div'> {
  /** Disable horizontal scroll wrapper (rare — prefer default). */
  disableScroll?: boolean;
}

/**
 * Specular dark-glass wrapper for data tables.
 * CSS class `.glass-table-container` paints edge streaks + diagonal shine
 * (see `src/index.css`). Pass a `<table>` or shadcn `Table` children without
 * nesting another framed container when possible.
 */
export function GlassTableContainer({
  className,
  children,
  disableScroll = false,
  ...props
}: GlassTableContainerProps) {
  return (
    <div
      data-slot="glass-table-container"
      className={cn('glass-table-container w-full', className)}
      {...props}
    >
      {disableScroll ? (
        children
      ) : (
        <div className="glass-table-container__scroll">{children}</div>
      )}
    </div>
  );
}
