import { Link } from 'react-router-dom';
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

interface CvAnalysisCreditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function CvAnalysisCreditDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: CvAnalysisCreditDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('cv.creditConfirm.title')}</DialogTitle>
          <DialogDescription>{t('cv.creditConfirm.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t('cv.creditConfirm.cancel')}
          </Button>
          <button
            type="button"
            className="btn-primary inline-flex"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting ? t('cv.analyzing') : t('cv.creditConfirm.confirm')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CvAnalysisInsufficientCreditDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('cv.insufficientCredit.title')}</DialogTitle>
          <DialogDescription>{t('cv.insufficientCredit.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('cv.insufficientCredit.close')}
          </Button>
          <Link to="/candidate/credits" className="btn-primary inline-flex">
            {t('cv.insufficientCredit.buy')}
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
