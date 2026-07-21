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

interface GenerateOverwriteModalProps {
  open: boolean;
  campaignTitle: string;
  currentCount: number;
  requestedCount: number | null;
  isConfirming: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function GenerateOverwriteModal({
  open,
  campaignTitle,
  currentCount,
  requestedCount,
  isConfirming,
  onCancel,
  onConfirm,
}: GenerateOverwriteModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isConfirming && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.campaignQuestions.overwrite.title')}</DialogTitle>
          <DialogDescription>
            {t('employer.campaigns.campaignQuestions.overwrite.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm text-foreground">
          <p>
            <span className="text-muted-foreground">
              {t('employer.campaigns.campaignQuestions.overwrite.campaign')}:{' '}
            </span>
            {campaignTitle || '—'}
          </p>
          <p>
            <span className="text-muted-foreground">
              {t('employer.campaigns.campaignQuestions.overwrite.currentCount')}:{' '}
            </span>
            {currentCount}
          </p>
          <p>
            <span className="text-muted-foreground">
              {t('employer.campaigns.campaignQuestions.overwrite.requestedCount')}:{' '}
            </span>
            {requestedCount == null
              ? t('employer.campaigns.campaignQuestions.generator.useDefaultCount')
              : requestedCount}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('employer.campaigns.campaignQuestions.overwrite.unsavedWarning')}
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isConfirming} onClick={onCancel}>
            {t('employer.campaigns.campaignQuestions.overwrite.cancel')}
          </Button>
          <Button type="button" disabled={isConfirming} loading={isConfirming} onClick={onConfirm}>
            {t('employer.campaigns.campaignQuestions.overwrite.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
