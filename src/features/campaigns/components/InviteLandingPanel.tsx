import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, Mail, ShieldAlert } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { Campaign, CampaignInvite } from '../types/campaign.types';
import { CampaignStatusBadge } from './CampaignStatusBadge';

interface InviteLandingPanelProps {
  invite: CampaignInvite & { campaign: Campaign };
}

export function InviteLandingPanel({ invite }: InviteLandingPanelProps) {
  const { t, language } = useLanguage();
  const expiresAt = new Date(invite.expiresAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const expired = invite.status === 'expired';

  return (
    <Card className="mx-auto max-w-3xl border border-subtle bg-surface-raised">
      <CardContent className="space-y-6 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <CampaignStatusBadge status={expired ? 'filled' : invite.campaign.status} />
          <span className="rounded-full border border-subtle bg-surface-overlay px-3 py-1 text-xs text-muted-foreground">
            {invite.campaign.company}
          </span>
        </div>
        <div className="space-y-3">
          <h1 className="heading-primary text-3xl text-foreground">{invite.campaign.title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{invite.campaign.summary}</p>
        </div>
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <span className="flex items-center gap-2">
            <Mail className="size-4" aria-hidden />
            {invite.candidateEmail}
          </span>
          <span className="flex items-center gap-2">
            <CalendarClock className="size-4" aria-hidden />
            {expiresAt}
          </span>
        </div>
        {expired ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            <ShieldAlert className="mb-2 size-5" aria-hidden />
            {t('campaigns.invite.expired')}
          </div>
        ) : (
          <Link to={`/candidate/campaigns/${invite.campaign.id}/enroll`} className={cn(buttonVariants(), 'w-full sm:w-auto')}>
            {t('campaigns.invite.continue')}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
