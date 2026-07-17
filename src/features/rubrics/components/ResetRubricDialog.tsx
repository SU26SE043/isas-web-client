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

interface ResetRubricDialogProps {
  open: boolean;
  isResetting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ResetRubricDialog({
  open,
  isResetting,
  onOpenChange,
  onConfirm,
}: ResetRubricDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isResetting} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('rubrics.reset.title')}</DialogTitle>
          <DialogDescription>{t('rubrics.reset.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isResetting}>
            {t('rubrics.reset.cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isResetting}>
            {isResetting ? t('rubrics.reset.confirmLoading') : t('rubrics.reset.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
