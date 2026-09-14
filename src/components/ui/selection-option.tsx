import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectionOptionProps {
  title: string;
  description?: string;
  meta?: React.ReactNode;
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
  meta,
  icon,
  selected = false,
  onClick,
  showChevron = true,
  className,
  disabled = false,
}: SelectionOptionProps) {
  const descriptionId = React.useId();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        'group flex min-h-[112px] items-center gap-5 rounded-2xl px-6 py-5 text-left transition-[background-color,border-color,box-shadow,opacity,transform] duration-200 ease-out hover:-translate-y-0.5',
        selected
          ? 'border-foreground/50 bg-foreground/[0.04] shadow-[var(--satin-inset)]'
          : 'frame-satin-interactive bg-surface-overlay hover:border-foreground/35 hover:bg-foreground/[0.03]',
        disabled ? 'cursor-not-allowed opacity-50' : null,
        className,
      )}
      aria-pressed={selected}
    >
      {icon ? (
        <span
          className={cn(
            'flex size-14 shrink-0 items-center justify-center rounded-2xl border transition-colors',
            selected
              ? 'border-foreground/50 bg-foreground/[0.04] text-foreground'
              : 'border-satin bg-surface-overlay text-foreground',
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-lg leading-snug',
            selected ? 'font-semibold text-foreground' : 'font-medium text-foreground',
          )}
          aria-hidden={Boolean(description)}
        >
          {title}
        </span>
        {description ? (
          <span
            id={descriptionId}
            className="mt-1.5 block text-sm leading-relaxed text-muted-foreground"
          >
            {description}
          </span>
        ) : null}
        {meta ? <span className="mt-2 block text-xs text-muted-foreground">{meta}</span> : null}
      </span>
      {showChevron ? (
        <ChevronRight
          className="size-5 shrink-0 text-foreground transition-colors group-hover:text-foreground"
          aria-hidden
        />
      ) : null}
    </button>
  );
}
