import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface JdMenuAction {
  key: string;
  label: string;
  danger?: boolean;
  onSelect: () => void;
}

export interface JdRequirementMenuProps {
  label: string;
  actions: JdMenuAction[];
}

/**
 * Standard menu button: Esc closes and restores focus, arrows move between
 * items, click outside dismisses. Also the *only* affordance on mobile, so the
 * trigger keeps a 44x44 touch target there.
 */
export function JdRequirementMenu({ label, actions }: JdRequirementMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    itemRefs.current[0]?.focus();
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const moveFocus = (from: number, delta: number) => {
    const count = actions.length;
    if (count === 0) return;
    const next = (from + delta + count) % count;
    itemRefs.current[next]?.focus();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveFocus(index, 1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(index, -1);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      itemRefs.current[0]?.focus();
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      itemRefs.current[actions.length - 1]?.focus();
    }
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 sm:size-8"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <MoreHorizontal aria-hidden />
      </Button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className="frame-satin absolute right-0 z-30 mt-1 min-w-56 rounded-xl bg-popover p-1 shadow-[var(--shadow-lg)]"
        >
          {actions.map((action, index) => (
            <button
              key={action.key}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="menuitem"
              onKeyDown={(event) => onMenuKeyDown(event, index)}
              onClick={() => {
                close(false);
                action.onSelect();
              }}
              className={cn(
                'block min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--border-focus)] sm:min-h-9',
                action.danger
                  ? 'text-destructive hover:bg-destructive/10'
                  : 'text-foreground hover:bg-white/[0.06]',
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
