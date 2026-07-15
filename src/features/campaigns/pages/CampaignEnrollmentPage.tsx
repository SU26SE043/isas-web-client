import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { CampaignGateNotice } from '../components/CampaignGateNotice';
import { CampaignStatusBadge } from '../components/CampaignStatusBadge';
import { EnrollmentForm } from '../components/EnrollmentForm';
import { useCampaign } from '../hooks/useCampaign';

export function CampaignEnrollmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { campaign, isLoading } = useCampaign(id);
  const { completeness, isLoading: isProfileLoading } = useProfile();
  const loading = isLoading || isProfileLoading;
  const percent = completeness?.percent ?? 0;
  const meetsGate = Boolean(completeness?.meetsGate);

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-5xl space-y-5">
        <Link to={id ? `/candidate/campaigns/${id}` : '/candidate/campaigns'} className={cn(buttonVariants({ variant: 'ghost' }), 'w-fit')}>
          <ArrowLeft className="size-4" aria-hidden />
          {t('campaigns.enroll.back')}
        </Link>
        {loading ? <Skeleton className="h-96 w-full" /> : null}
        {!loading && campaign ? (
          <>
            <Card className="border border-subtle bg-surface-raised">
              <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <CampaignStatusBadge status={campaign.status} />
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">{campaign.company}</span>
                  </div>
                  <h1 className="heading-primary text-2xl text-foreground">{campaign.title}</h1>
                  <p className="mt-2 text-sm text-muted-foreground">{t('campaigns.enroll.subtitle')}</p>
                </div>
                <div className="rounded-xl border border-subtle bg-surface-overlay px-4 py-3 text-sm">
                  <p className="text-muted-foreground">{t('campaigns.card.match')}</p>
                  <p className="text-2xl font-semibold text-foreground">{campaign.matchScore}%</p>
                </div>
              </CardContent>
            </Card>
            <CampaignGateNotice percent={percent} meetsGate={meetsGate} />
            {meetsGate ? (
              <EnrollmentForm
                campaign={campaign}
                onSuccess={(result) => navigate(`/interview/${result.sessionId}/prepare`)}
              />
            ) : null}
          </>
        ) : null}
        {!loading && !campaign ? (
          <Card className="border border-subtle bg-surface-raised">
            <CardContent className="space-y-3 p-8 text-center">
              <h1 className="text-xl font-semibold text-foreground">{t('campaigns.detail.notFound')}</h1>
              <p className="text-sm text-muted-foreground">{t('campaigns.detail.notFoundHint')}</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
