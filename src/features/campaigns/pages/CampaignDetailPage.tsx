import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { CampaignDetailHero } from '../components/CampaignDetailHero';
import { CampaignDetailSections } from '../components/CampaignDetailSections';
import { useCampaign } from '../hooks/useCampaign';

function DetailLoading() {
  return (
    <div className="space-y-4">
      <Card className="border border-subtle bg-surface-raised">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

export function CampaignDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { campaign, isLoading } = useCampaign(id);

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-5">
        {isLoading ? <DetailLoading /> : null}
        {!isLoading && campaign ? (
          <>
            <CampaignDetailHero campaign={campaign} />
            <CampaignDetailSections campaign={campaign} />
          </>
        ) : null}
        {!isLoading && !campaign ? (
          <Card className="border border-subtle bg-surface-raised">
            <CardContent className="space-y-4 p-8 text-center">
              <h1 className="text-xl font-semibold text-foreground">{t('campaigns.detail.notFound')}</h1>
              <p className="text-sm text-muted-foreground">{t('campaigns.detail.notFoundHint')}</p>
              <Link to="/candidate/campaigns" className={cn(buttonVariants({ variant: 'secondary' }), 'mx-auto w-fit')}>
                <ArrowLeft className="size-4" aria-hidden />
                {t('campaigns.detail.back')}
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
