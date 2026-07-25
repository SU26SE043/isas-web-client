import * as React from 'react';

import { cn } from '@/lib/utils';
import { GlassTableContainer } from '@/components/ui/glass-table-container';

type TableProps = React.ComponentProps<'table'> & {
  /**
   * When false, render a plain `<table>` without the glass frame
   * (use for nested detail tables inside an already-framed table).
   */
  framed?: boolean;
};

/**
 * Canonical data-table template for the whole app.
 * Prefer these primitives over ad-hoc `<table>` + border wrappers.
 * @see docs/UI_GUIDE.md — Table / GlassTableContainer
 */
function Table({ className, framed = true, ...props }: TableProps) {
  const table = (
    <table
      data-slot="table"
      className={cn('w-full caption-bottom text-left text-sm', className)}
      {...props}
    />
  );

  if (!framed) {
    return table;
  }

  return <GlassTableContainer>{table}</GlassTableContainer>;
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        'border-b border-satin bg-surface-overlay/80 text-xs tracking-wide text-muted-foreground uppercase [&_tr]:border-b [&_tr]:border-satin',
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'border-t border-satin bg-transparent font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-satin/50 transition-colors hover:bg-white/[0.03] has-aria-expanded:bg-white/[0.03] data-[state=selected]:bg-white/[0.05]',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-11 px-4 text-left align-middle text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-4 py-3.5 align-middle text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
