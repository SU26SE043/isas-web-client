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
 * Canonical glass data-table frame for the whole app
 * (same shell as Employer Pipeline / candidate ranking tables).
 * Prefer these primitives over ad-hoc `<table>` + Card borders.
 * @see docs/UI_GUIDE.md — Data table template
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
        'border-b border-border bg-surface-overlay [&_tr]:border-b [&_tr]:border-border',
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
        'border-t border-border bg-transparent font-medium [&>tr]:last:border-b-0',
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
        'border-b border-subtle transition-colors hover:bg-surface-highlight has-aria-expanded:bg-surface-highlight data-[state=selected]:bg-surface-highlight',
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
        'h-12 px-4 text-left align-middle text-xs font-semibold tracking-wide whitespace-nowrap text-foreground uppercase [&:has([role=checkbox])]:pr-0',
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
        'px-4 py-4 align-middle text-muted-foreground [&:has([role=checkbox])]:pr-0',
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
