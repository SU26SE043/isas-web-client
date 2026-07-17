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

interface UnsavedChangesDialogProps {
  open: boolean;
  onStay: () => void;
  onDiscard: () => void;
}

export function UnsavedChangesDialog({ open, onStay, onDiscard }: UnsavedChangesDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onStay()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('rubrics.unsaved.title')}</DialogTitle>
          <DialogDescription>{t('rubrics.unsaved.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="secondary" onClick={onStay}>
            {t('rubrics.unsaved.stay')}
          </Button>
          <Button type="button" variant="destructive" onClick={onDiscard}>
            {t('rubrics.unsaved.discard')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
