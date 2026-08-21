import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/shared/languages';

interface LearningCreditWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onContinue: () => void;
}

export function LearningCreditWarningDialog({ open, onOpenChange, balance, onContinue }: LearningCreditWarningDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('practice.learningPath.insufficientCreditsTitle')}</DialogTitle>
          <DialogDescription>
            {t('practice.learningPath.creditWarningDescription')
              .replace('{cost}', '1')
              .replace('{balance}', balance.toLocaleString())}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('practice.learningPath.keepLearning')}
          </Button>
          <Link to="/candidate/credits" className="btn-primary inline-flex">
            {t('practice.learningPath.buyCredits')}
          </Link>
          <Button type="button" variant="secondary" onClick={onContinue}>
            {t('practice.learningPath.continueAnyway')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
