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
import type { CampaignInvitation } from '../../types/campaign.api.types';
import { InvitationStatusBadge } from './InvitationStatusBadge';

function formatDateTime(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

interface ReissueConfirmModalProps {
  open: boolean;
  campaignTitle: string;
  invitation: CampaignInvitation | null;
  isConfirming: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ReissueConfirmModal({
  open,
  campaignTitle,
  invitation,
  isConfirming,
  onCancel,
  onConfirm,
}: ReissueConfirmModalProps) {
  const { t, language } = useLanguage();
  if (!invitation) return null;

  const stillActive =
    invitation.status === 'Queued' || invitation.status === 'Sent';

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isConfirming && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('employer.campaigns.campaignInvitations.reissue.confirmationTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('employer.campaigns.campaignInvitations.reissue.confirmationDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <p className="break-words text-foreground" style={{ overflowWrap: 'anywhere' }}>
            {invitation.email}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <InvitationStatusBadge status={invitation.status} />
            <span className="text-muted-foreground">{campaignTitle}</span>
          </div>
          <p className="text-muted-foreground">
            {t('employer.campaigns.campaignInvitations.table.expiresAt')}:{' '}
            {formatDateTime(invitation.expiresAt, language)}
          </p>
          {stillActive ? (
            <p className="text-xs text-warning">
              {t('employer.campaigns.campaignInvitations.reissue.activeInvitationWarning')}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isConfirming} onClick={onCancel}>
            {t('employer.campaigns.campaignInvitations.actions.cancel')}
          </Button>
          <Button type="button" disabled={isConfirming} loading={isConfirming} onClick={onConfirm}>
            {isConfirming
              ? t('employer.campaigns.campaignInvitations.actions.reissuing')
              : t('employer.campaigns.campaignInvitations.actions.confirmReissue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
