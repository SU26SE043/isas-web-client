import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BriefcaseBusiness, CalendarClock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useLanguage } from '@/shared/languages';
import { campaignService } from '../services/campaign.service';
import type { CandidateCampaignInvite } from '../types/campaign.types';

export function LegacyCandidateCampaignsPage() {
  const { t } = useLanguage();
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const highlightToken = searchParams.get('highlight') ?? '';
  const [invites, setInvites] = useState<CandidateCampaignInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void campaignService.listMyInvitedCampaigns(user?.email ?? '').then((result) => {
      if (active) {
        setInvites(result);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [user?.email]);

  const sortedInvites = useMemo(() => {
    if (!highlightToken) return invites;
    return [...invites].sort((left, right) => {
      if (left.inviteToken === highlightToken) return -1;
      if (right.inviteToken === highlightToken) return 1;
      return 0;
    });
  }, [highlightToken, invites]);

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <p className="text-label text-muted-foreground">{t('campaigns.my.eyebrow')}</p>
          <h1 className="heading-primary text-3xl text-foreground">
            {t('campaigns.my.invitedTitle')}
          </h1>
          <p className="body-text max-w-3xl text-sm text-muted-foreground">{t('campaigns.my.subtitle')}</p>
        </header>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        ) : null}

        {!isLoading && sortedInvites.length === 0 ? (
          <div className="frame-satin flex flex-col items-center gap-3 rounded-xl px-6 py-12 text-center">
            <BriefcaseBusiness className="size-10 text-muted-foreground" aria-hidden />
            <h2 className="heading-secondary text-lg text-foreground">{t('campaigns.my.emptyTitle')}</h2>
          </div>
        ) : null}

        {!isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedInvites.map((invite) => (
              <article
                key={invite.inviteToken}
                className="frame-satin space-y-4 rounded-xl bg-surface-raised p-5"
              >
                <h2 className="heading-secondary text-lg text-foreground">{invite.title}</h2>
                <p className="text-sm text-muted-foreground">{invite.company}</p>
                <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="size-4" aria-hidden />
                  {invite.deadline}
                </p>
                {invite.status === 'expired' ? (
                  <span className="btn-secondary inline-flex text-sm text-muted-foreground">
                    {t('campaigns.my.expiredAction')}
                  </span>
                ) : (
                  <Link
                    to={`/candidate/campaigns/${encodeURIComponent(invite.inviteToken)}/briefing`}
                    className="btn-primary inline-flex text-sm"
                  >
                    {t('campaigns.my.start')}
                  </Link>
                )}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
