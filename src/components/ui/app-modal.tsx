import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type AppModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'auth';

export interface AppModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: AppModalSize;
  showCloseButton?: boolean;
  /** When false, clicking the backdrop does not close the modal. Default true. */
  closeOnBackdrop?: boolean;
  /** When false, Escape does not close the modal. Default true. */
  closeOnEscape?: boolean;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  closeButtonClassName?: string;
  closeLabel?: string;
  ariaLabel?: string;
}

const SIZE_CLASS: Record<AppModalSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  auth: 'h-[min(550px,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] max-w-[800px] gap-0 overflow-hidden p-0 sm:max-w-[800px]',
};

/**
 * Shared modal chrome over Base UI Dialog (portal, overlay, focus trap, scroll lock).
 * Prefer this for open/onClose call sites; keep Dialog/ConfirmDialog for structured confirms.
 */
export function AppModal({
  open,
  onClose,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
  contentClassName,
  overlayClassName,
  closeButtonClassName,
  closeLabel = 'Close',
  ariaLabel,
}: AppModalProps) {
  const isAuth = size === 'auth';

  return (
    <Dialog
      open={open}
      disablePointerDismissal={!closeOnBackdrop}
      onOpenChange={(nextOpen, eventDetails) => {
        if (nextOpen) return;
        if (!closeOnEscape && eventDetails.reason === 'escape-key') {
          eventDetails.cancel();
          return;
        }
        onClose();
      }}
    >
      <DialogContent
        showCloseButton={showCloseButton}
        closeLabel={closeLabel}
        overlayClassName={cn(isAuth && 'z-[100]', overlayClassName)}
        closeButtonClassName={closeButtonClassName}
        aria-label={ariaLabel}
        className={cn(
          SIZE_CLASS[size],
          isAuth && 'z-[100]',
          contentClassName,
          className,
        )}
      >
        {ariaLabel ? <DialogTitle className="sr-only">{ariaLabel}</DialogTitle> : null}
        {children}
      </DialogContent>
    </Dialog>
  );
}
