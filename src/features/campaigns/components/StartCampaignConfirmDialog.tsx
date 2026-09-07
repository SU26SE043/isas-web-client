import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';

interface StartCampaignConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export function StartCampaignConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  errorMessage = null,
}: StartCampaignConfirmDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('campaigns.detail.startConfirmTitle')}</DialogTitle>
          <DialogDescription>{t('campaigns.detail.startConfirmBody')}</DialogDescription>
        </DialogHeader>
        {errorMessage ? (
          <p className="text-sm text-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('campaigns.detail.startCancel')}
          </Button>
          <button
            type="button"
            className="btn-primary inline-flex"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting ? t('campaigns.detail.starting') : t('campaigns.detail.startConfirm')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
