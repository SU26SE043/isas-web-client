import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { CampaignInvitationStatus } from '../../types/campaign.api.types';

const STATUS_CLASS: Record<CampaignInvitationStatus, string> = {
  Queued: 'border-info/30 bg-info-bg text-info',
  Sent: 'border-success/30 bg-success-bg text-success',
  Joined: 'border-satin bg-white/[0.06] text-foreground',
  Expired: 'border-warning/30 bg-warning-bg text-warning',
  Revoked: 'border-error/30 bg-error-bg text-error',
};

const STATUS_KEY: Record<CampaignInvitationStatus, string> = {
  Queued: 'employer.campaigns.campaignInvitations.status.queued',
  Sent: 'employer.campaigns.campaignInvitations.status.sent',
  Joined: 'employer.campaigns.campaignInvitations.status.joined',
  Expired: 'employer.campaigns.campaignInvitations.status.expired',
  Revoked: 'employer.campaigns.campaignInvitations.status.revoked',
};

interface InvitationStatusBadgeProps {
  status: CampaignInvitationStatus;
  className?: string;
}

export function InvitationStatusBadge({ status, className }: InvitationStatusBadgeProps) {
  const { t } = useLanguage();
  return (
    <Badge variant="outline" className={cn('shrink-0', STATUS_CLASS[status], className)}>
      {t(STATUS_KEY[status])}
    </Badge>
  );
}

export function invitationStatusDescriptionKey(status: CampaignInvitationStatus): string {
  switch (status) {
    case 'Queued':
      return 'employer.campaigns.campaignInvitations.statusDescription.queued';
    case 'Sent':
      return 'employer.campaigns.campaignInvitations.statusDescription.sent';
    case 'Joined':
      return 'employer.campaigns.campaignInvitations.statusDescription.joined';
    case 'Expired':
      return 'employer.campaigns.campaignInvitations.statusDescription.expired';
    case 'Revoked':
      return 'employer.campaigns.campaignInvitations.statusDescription.revoked';
  }
}
