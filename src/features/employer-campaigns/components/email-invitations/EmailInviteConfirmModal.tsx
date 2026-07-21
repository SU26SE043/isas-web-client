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

const PREVIEW_LIMIT = 5;

interface EmailInviteConfirmModalProps {
  open: boolean;
  campaignTitle: string;
  emails: string[];
  isConfirming: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function EmailInviteConfirmModal({
  open,
  campaignTitle,
  emails,
  isConfirming,
  onCancel,
  onConfirm,
}: EmailInviteConfirmModalProps) {
  const { t } = useLanguage();
  const preview = emails.slice(0, PREVIEW_LIMIT);
  const remaining = Math.max(emails.length - PREVIEW_LIMIT, 0);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isConfirming && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.emailInvitations.confirmation.title')}</DialogTitle>
          <DialogDescription>
            {t('employer.campaigns.emailInvitations.confirmation.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <p className="text-foreground">
            <span className="text-muted-foreground">
              {t('employer.campaigns.emailInvitations.confirmation.campaign')}:{' '}
            </span>
            {campaignTitle}
          </p>
          <p className="text-foreground">
            <span className="text-muted-foreground">
              {t('employer.campaigns.emailInvitations.confirmation.count')}:{' '}
            </span>
            {emails.length}
          </p>
          <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-satin bg-surface-overlay px-3 py-2">
            {preview.map((email) => (
              <li key={email} className="break-words text-foreground">
                {email}
              </li>
            ))}
            {remaining > 0 ? (
              <li className="text-muted-foreground">
                {t('employer.campaigns.emailInvitations.confirmation.additionalEmails').replace(
                  '{{count}}',
                  String(remaining),
                )}
              </li>
            ) : null}
          </ul>
          <p className="text-xs text-muted-foreground">
            {t('employer.campaigns.emailInvitations.confirmation.warning')}
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isConfirming} onClick={onCancel}>
            {t('employer.campaigns.emailInvitations.actions.cancel')}
          </Button>
          <Button
            type="button"
            disabled={emails.length === 0 || isConfirming}
            loading={isConfirming}
            onClick={onConfirm}
          >
            {isConfirming
              ? t('employer.campaigns.emailInvitations.actions.sending')
              : t('employer.campaigns.emailInvitations.actions.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
