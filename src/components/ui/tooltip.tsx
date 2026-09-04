import * as React from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  className?: string;
}

/** Small, non-interactive tooltip for hover and keyboard focus. */
export function Tooltip({ content, children, className }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = React.useId();

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };
  const show = () => {
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(true), 300);
  };
  const hide = () => {
    clearTimer();
    setOpen(false);
  };

  React.useEffect(() => () => clearTimer(), []);

  const childProps = children.props as React.HTMLAttributes<Element>;
  const trigger = React.cloneElement(
    children as React.ReactElement<React.HTMLAttributes<Element>>,
    {
    'aria-describedby': open ? tooltipId : childProps['aria-describedby'],
    onMouseEnter: (event: React.MouseEvent) => {
      childProps.onMouseEnter?.(event);
      show();
    },
    onMouseLeave: (event: React.MouseEvent) => {
      childProps.onMouseLeave?.(event);
      hide();
    },
    onFocus: (event: React.FocusEvent) => {
      childProps.onFocus?.(event);
      show();
    },
    onBlur: (event: React.FocusEvent) => {
      childProps.onBlur?.(event);
      hide();
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      childProps.onKeyDown?.(event);
      if (event.key === 'Escape') hide();
    },
    },
  );

  return (
    <span className="relative inline-flex" onScroll={hide}>
      {trigger}
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-60 -translate-x-1/2 rounded-md border border-satin bg-surface-elevated px-2.5 py-1.5 text-xs leading-snug text-foreground shadow-lg',
            className,
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
