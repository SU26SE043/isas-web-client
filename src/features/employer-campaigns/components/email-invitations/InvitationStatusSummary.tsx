import type { LucideIcon } from 'lucide-react';
import { Ban, Clock3, Hourglass, Send, UserPlus } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { CampaignInvitation, CampaignInvitationStatus } from '../../types/campaign.api.types';
import { countInvitationsByStatus } from '../../utils/campaignInvitationsApi';

interface InvitationStatusSummaryProps {
  items: CampaignInvitation[];
  hasMore: boolean;
}

const ORDER: CampaignInvitationStatus[] = ['Queued', 'Sent', 'Joined', 'Expired', 'Revoked'];

const LABEL_KEY: Record<CampaignInvitationStatus, string> = {
  Queued: 'employer.campaigns.campaignInvitations.status.queued',
  Sent: 'employer.campaigns.campaignInvitations.status.sent',
  Joined: 'employer.campaigns.campaignInvitations.status.joined',
  Expired: 'employer.campaigns.campaignInvitations.status.expired',
  Revoked: 'employer.campaigns.campaignInvitations.status.revoked',
};

const CARD_STYLE: Record<
  CampaignInvitationStatus,
  { icon: LucideIcon; wrap: string; iconWrap: string }
> = {
  Queued: {
    icon: Hourglass,
    wrap: 'border-info/25 bg-info/5',
    iconWrap: 'bg-info/15 text-info',
  },
  Sent: {
    icon: Send,
    wrap: 'border-success/25 bg-success/5',
    iconWrap: 'bg-success/15 text-success',
  },
  Joined: {
    icon: UserPlus,
    wrap: 'border-info-400/25 bg-info-500/5',
    iconWrap: 'bg-info-500/15 text-info-300',
  },
  Expired: {
    icon: Clock3,
    wrap: 'border-warning/25 bg-warning/5',
    iconWrap: 'bg-warning/15 text-warning',
  },
  Revoked: {
    icon: Ban,
    wrap: 'border-error/25 bg-error/5',
    iconWrap: 'bg-error/15 text-error',
  },
};

export function InvitationStatusSummary({ items, hasMore }: InvitationStatusSummaryProps) {
  const { t } = useLanguage();
  const counts = countInvitationsByStatus(items);

  return (
    <section className="space-y-2">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {ORDER.map((status) => {
          const style = CARD_STYLE[status];
          const Icon = style.icon;
          return (
            <div
              key={status}
              className={cn(
                'rounded-xl border px-4 py-4 transition-colors',
                style.wrap,
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">{t(LABEL_KEY[status])}</p>
                <span
                  className={cn(
                    'inline-flex size-8 items-center justify-center rounded-lg',
                    style.iconWrap,
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                {counts[status]}
              </p>
            </div>
          );
        })}
      </div>
      {hasMore ? (
        <p className="text-xs text-muted-foreground">
          {t('employer.campaigns.campaignInvitations.history.partialStatistics')}
        </p>
      ) : null}
    </section>
  );
}

