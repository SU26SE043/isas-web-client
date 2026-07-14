import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectionOptionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * Project-wide selectable glass tile.
 * Use for wizard/step grids, pick-lists, and single-choice settings.
 */
export function SelectionOption({
  title,
  description,
  icon,
  selected = false,
  onClick,
  showChevron = true,
  className,
  disabled = false,
}: SelectionOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-[background-color,border-color,box-shadow,opacity] duration-200 ease-out',
        selected
          ? 'border-white/25 bg-white/[0.08] shadow-[var(--shadow-xs)]'
          : 'border-white/10 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.05]',
        disabled ? 'cursor-not-allowed opacity-50' : null,
        className,
      )}
      aria-pressed={selected}
    >
      {icon ? (
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors',
            selected
              ? 'border-white/30 bg-white text-black'
              : 'border-white/12 bg-white/[0.06] text-foreground',
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-foreground">{title}</span>
        {description ? (
          <span className="mt-1 block text-sm leading-snug text-muted-foreground">{description}</span>
        ) : null}
      </span>
      {showChevron ? (
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
          aria-hidden
        />
      ) : null}
    </button>
  );
}
