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
  const descriptionId = React.useId();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        'group flex items-center gap-4 rounded-2xl px-5 py-5 text-left transition-[background-color,border-color,box-shadow,opacity] duration-200 ease-out',
        selected
          ? 'frame-satin bg-white/[0.12] shadow-[var(--satin-inset)]'
          : 'frame-satin-interactive bg-black/20 hover:bg-white/[0.04]',
        disabled ? 'cursor-not-allowed opacity-50' : null,
        className,
      )}
      aria-pressed={selected}
    >
      {icon ? (
        <span
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-full border transition-colors',
            selected
              ? 'border-satin bg-white text-black'
              : 'border-satin bg-white/[0.06] text-foreground',
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-base leading-snug',
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
