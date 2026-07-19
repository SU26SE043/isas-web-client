import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';

interface InviteConfirmModalProps {
  open: boolean;
  count: number;
  isConfirming: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function InviteConfirmModal({
  open,
  count,
  isConfirming,
  onCancel,
  onConfirm,
}: InviteConfirmModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isConfirming && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.screening.invitation.confirmTitle')}</DialogTitle>
          <DialogDescription>
            {t('employer.campaigns.screening.invitation.confirmDesc').replace(
              '{count}',
              String(count),
            )}
          </DialogDescription>
        </DialogHeader>

        {count === 0 ? (
          <Alert variant="warning">
            <AlertDescription>{t('employer.campaigns.screening.invitation.noEmailWarn')}</AlertDescription>
          </Alert>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isConfirming} onClick={onCancel}>
            {t('employer.campaigns.screening.invitation.cancel')}
          </Button>
          <Button type="button" disabled={count === 0 || isConfirming} loading={isConfirming} onClick={onConfirm}>
            {isConfirming
              ? t('employer.campaigns.screening.invitation.confirming')
              : t('employer.campaigns.screening.invitation.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
