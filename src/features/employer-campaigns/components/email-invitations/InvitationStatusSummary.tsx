import { useLanguage } from '@/shared/languages';
import type { CampaignInvitationStatus } from '../../types/campaign.api.types';
import { countInvitationsByStatus } from '../../utils/campaignInvitationsApi';
import type { CampaignInvitation } from '../../types/campaign.api.types';

interface InvitationStatusSummaryProps {
  items: CampaignInvitation[];
  hasMore: boolean;
}

const ORDER: CampaignInvitationStatus[] = [
  'Queued',
  'Sent',
  'Joined',
  'Expired',
  'Revoked',
];

const LABEL_KEY: Record<CampaignInvitationStatus, string> = {
  Queued: 'employer.campaigns.campaignInvitations.status.queued',
  Sent: 'employer.campaigns.campaignInvitations.status.sent',
  Joined: 'employer.campaigns.campaignInvitations.status.joined',
  Expired: 'employer.campaigns.campaignInvitations.status.expired',
  Revoked: 'employer.campaigns.campaignInvitations.status.revoked',
};

export function InvitationStatusSummary({ items, hasMore }: InvitationStatusSummaryProps) {
  const { t } = useLanguage();
  const counts = countInvitationsByStatus(items);

  return (
    <section className="space-y-2">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {ORDER.map((status) => (
          <div
            key={status}
            className="rounded-lg border border-satin bg-surface-overlay px-3 py-3"
          >
            <p className="text-xs text-muted-foreground">{t(LABEL_KEY[status])}</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{counts[status]}</p>
          </div>
        ))}
      </div>
      {hasMore ? (
        <p className="text-xs text-muted-foreground">
          {t('employer.campaigns.campaignInvitations.history.partialStatistics')}
        </p>
      ) : null}
    </section>
  );
}
