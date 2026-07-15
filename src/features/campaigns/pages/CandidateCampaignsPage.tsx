import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BriefcaseBusiness } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useLanguage } from '@/shared/languages';
import { InvitedCampaignCard } from '../components/InvitedCampaignCard';
import { useMyInvitedCampaigns } from '../hooks/useMyInvitedCampaigns';

export function CandidateCampaignsPage() {
  const { t } = useLanguage();
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const highlightToken = searchParams.get('highlight') ?? searchParams.get('invite') ?? '';
  const { invites, isLoading } = useMyInvitedCampaigns(user?.email);

  const sortedInvites = useMemo(() => {
    if (!highlightToken) return invites;
    return [...invites].sort((left, right) => {
      if (left.inviteToken === highlightToken) return -1;
      if (right.inviteToken === highlightToken) return 1;
      return 0;
    });
  }, [highlightToken, invites]);

  useEffect(() => {
    if (!highlightToken) return;
    const element = document.querySelector(`[data-invite-token="${highlightToken}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightToken, sortedInvites]);

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <p className="text-label text-muted-foreground">{t('campaigns.my.eyebrow')}</p>
          <h1 className="heading-primary text-3xl text-foreground">{t('campaigns.my.title')}</h1>
          <p className="body-text max-w-3xl text-sm text-muted-foreground">{t('campaigns.my.subtitle')}</p>
        </header>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-44 w-full" />
            ))}
          </div>
        ) : null}

        {!isLoading && sortedInvites.length === 0 ? (
          <Card className="border border-subtle bg-surface-raised">
            <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <BriefcaseBusiness className="size-10 text-muted-foreground" aria-hidden />
              <h2 className="heading-secondary text-lg text-foreground">{t('campaigns.my.emptyTitle')}</h2>
              <p className="max-w-md text-sm text-muted-foreground">{t('campaigns.my.emptyDescription')}</p>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && sortedInvites.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedInvites.map((invite) => (
              <InvitedCampaignCard
                key={invite.inviteToken}
                invite={invite}
                highlighted={invite.inviteToken === highlightToken}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
