import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { CampaignInvitation } from '../../types/campaign.api.types';
import {
  InvitationStatusBadge,
  invitationStatusDescriptionKey,
} from './InvitationStatusBadge';

function formatDateTime(value: string | null | undefined, locale: string, empty: string) {
  if (!value) return empty;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

interface InvitationDetailDrawerProps {
  invitation: CampaignInvitation | null;
  open: boolean;
  isActiveCampaign: boolean;
  isReissuing: boolean;
  onClose: () => void;
  onReissue: (invitation: CampaignInvitation) => void;
}

export function InvitationDetailDrawer({
  invitation,
  open,
  isActiveCampaign,
  isReissuing,
  onClose,
  onReissue,
}: InvitationDetailDrawerProps) {
  const { t, language } = useLanguage();
  if (!invitation) return null;

  const canReissue = isActiveCampaign && invitation.status !== 'Joined';
  const empty = t('employer.campaigns.campaignInvitations.table.noValue');

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.campaignInvitations.actions.viewDetail')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <p className="break-words font-medium text-foreground" style={{ overflowWrap: 'anywhere' }}>
            {invitation.email}
          </p>
          <InvitationStatusBadge status={invitation.status} />
          <p className="text-muted-foreground">{t(invitationStatusDescriptionKey(invitation.status))}</p>
          <dl className="grid gap-2">
            <Row
              label={t('employer.campaigns.campaignInvitations.table.createdAt')}
              value={formatDateTime(invitation.createdAt, language, empty)}
            />
            <Row
              label={t('employer.campaigns.campaignInvitations.table.emailSentAt')}
              value={
                invitation.emailSentAt
                  ? formatDateTime(invitation.emailSentAt, language, empty)
                  : t('employer.campaigns.campaignInvitations.table.notSent')
              }
            />
            <Row
              label={t('employer.campaigns.campaignInvitations.table.expiresAt')}
              value={formatDateTime(invitation.expiresAt, language, empty)}
            />
            <Row
              label={t('employer.campaigns.campaignInvitations.table.joinedAt')}
              value={formatDateTime(invitation.joinedAt, language, empty)}
            />
          </dl>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('employer.campaigns.campaignInvitations.actions.close')}
          </Button>
          {canReissue ? (
            <Button
              type="button"
              disabled={isReissuing}
              loading={isReissuing}
              aria-label={t('employer.campaigns.campaignInvitations.actions.reissueFor').replace(
                '{{email}}',
                invitation.email,
              )}
              onClick={() => onReissue(invitation)}
            >
              {t('employer.campaigns.campaignInvitations.actions.reissue')}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
