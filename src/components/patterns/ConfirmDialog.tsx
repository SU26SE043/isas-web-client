import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  icon?: ReactNode;
  destructive?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  icon,
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="frame-satin gap-0 overflow-hidden rounded-3xl border-satin bg-[var(--glass-bg)] p-0 shadow-[var(--satin-inset),var(--shadow-lg)] backdrop-blur-xl sm:max-w-md"
      >
        <div className="space-y-4 px-6 pt-6 pb-5">
          <DialogHeader className="gap-3 text-left">
            <div className="flex items-center gap-3">
              {icon ? (
                <span className="frame-satin-soft flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-foreground">
                  {icon}
                </span>
              ) : null}
              <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                {title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-[0.95rem] leading-relaxed text-foreground/90">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div
          className="mx-6 h-px bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--satin-border)_85%,transparent)] to-transparent"
          aria-hidden
        />

        <DialogFooter className="-mx-0 -mb-0 gap-3 rounded-none border-0 bg-transparent p-6 pt-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            className="h-10 rounded-full border-satin bg-transparent px-5 text-muted-foreground shadow-none hover:border-[var(--satin-border-hover)] hover:bg-white/[0.04] hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            loading={loading}
            variant="default"
            className={cn(
              'h-10 rounded-full px-5 font-semibold shadow-none',
              destructive
                ? 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:border-destructive/40 focus-visible:ring-destructive/30'
                : null,
            )}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
