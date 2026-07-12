import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { InviteLandingPanel } from '../components/InviteLandingPanel';
import { useCampaignInvite } from '../hooks/useCampaign';

export function MagicLinkLandingPage() {
  const { token } = useParams();
  const { t } = useLanguage();
  const { invite, isLoading } = useCampaignInvite(token);

  return (
    <div className="page-container page-section min-h-[70vh]">
      {isLoading ? (
        <div className="flex min-h-96 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        </div>
      ) : null}
      {!isLoading && invite ? <InviteLandingPanel invite={invite} /> : null}
      {!isLoading && !invite ? (
        <Card className="mx-auto max-w-2xl border border-subtle bg-surface-raised">
          <CardContent className="space-y-4 p-8 text-center">
            <h1 className="text-2xl font-semibold text-foreground">{t('campaigns.invite.notFound')}</h1>
            <p className="text-sm text-muted-foreground">{t('campaigns.invite.notFoundHint')}</p>
            <Link to="/" className={cn(buttonVariants({ variant: 'secondary' }), 'mx-auto w-fit')}>
              <ArrowLeft className="size-4" aria-hidden />
              {t('campaigns.invite.home')}
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
