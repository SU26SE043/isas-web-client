import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { CandidateCampaignInvite } from '../types/campaign.types';

interface InvitedCampaignCardProps {
  invite: CandidateCampaignInvite;
  highlighted?: boolean;
}

function statusLabelKey(status: CandidateCampaignInvite['status']) {
  if (status === 'invited') return 'campaigns.my.status.invited';
  if (status === 'in_progress') return 'campaigns.my.status.inProgress';
  if (status === 'completed') return 'campaigns.my.status.completed';
  return 'campaigns.my.status.expired';
}

function actionLabelKey(status: CandidateCampaignInvite['status']) {
  if (status === 'in_progress') return 'campaigns.my.continue';
  if (status === 'completed') return 'campaigns.my.viewBriefing';
  if (status === 'expired') return 'campaigns.my.expiredAction';
  return 'campaigns.my.start';
}

export function InvitedCampaignCard({ invite, highlighted = false }: InvitedCampaignCardProps) {
  const { t, language } = useLanguage();
  const deadline = new Date(invite.deadline).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const isActionable = invite.status !== 'expired';

  return (
    <Card
      className={cn(
        'border border-subtle bg-surface-raised',
        highlighted && 'ring-2 ring-white/20',
      )}
      data-invite-token={invite.inviteToken}
    >
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full border border-subtle bg-surface-overlay px-3 py-1 text-xs text-muted-foreground">
            {invite.company}
          </span>
          <span className="text-xs font-medium text-foreground">{t(statusLabelKey(invite.status))}</span>
        </div>
        <div className="space-y-2">
          <h2 className="heading-secondary text-xl text-foreground">{invite.title}</h2>
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="size-4" aria-hidden />
            {t('campaigns.my.deadline').replace('{date}', deadline)}
          </p>
        </div>
        {isActionable ? (
          <Link
            to={`/candidate/campaigns/${invite.inviteToken}/briefing`}
            className={cn(buttonVariants({ variant: invite.status === 'completed' ? 'secondary' : 'default' }), 'w-full sm:w-auto')}
          >
            {t(actionLabelKey(invite.status))}
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">{t('campaigns.my.expiredHint')}</p>
        )}
      </CardContent>
    </Card>
  );
}
