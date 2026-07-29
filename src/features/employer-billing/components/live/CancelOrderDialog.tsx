import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';

export function CancelOrderDialog({
  open,
  isLoading,
  error,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  isLoading: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const { t } = useLanguage();
  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogIcon className="bg-error-bg text-error"><Trash2 /></DialogIcon>
          <DialogTitle>{t('employerBilling.orders.cancelTitle')}</DialogTitle>
          <DialogDescription>{t('employerBilling.orders.cancelDescription')}</DialogDescription>
        </DialogHeader>
        {error ? <p className="rounded-lg border border-error/30 bg-error-bg p-3 text-sm text-error">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline" disabled={isLoading} onClick={() => onOpenChange(false)}>
            {t('employerBilling.orders.goBack')}
          </Button>
          <Button variant="destructive" loading={isLoading} onClick={onConfirm}>
            <Trash2 />
            {t('employerBilling.orders.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

