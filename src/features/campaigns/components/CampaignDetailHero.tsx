import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Globe2, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { Campaign } from '../types/campaign.types';
import { CampaignStatusBadge } from './CampaignStatusBadge';

export function CampaignDetailHero({ campaign }: { campaign: Campaign }) {
  const { t, language } = useLanguage();
  const deadline = new Date(campaign.deadline).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const canEnroll = campaign.status !== 'filled' && !campaign.hasEnrolled;

  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardContent className="space-y-6 p-6">
        <Link to="/candidate/campaigns" className={cn(buttonVariants({ variant: 'ghost' }), 'w-fit')}>
          <ArrowLeft className="size-4" aria-hidden />
          {t('campaigns.detail.back')}
        </Link>
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <CampaignStatusBadge status={campaign.status} />
              <Badge variant="outline" className="border-subtle bg-surface-overlay text-muted-foreground">
                {t(`campaigns.seniority.${campaign.seniority}`)}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{campaign.company}</p>
              <h1 className="heading-primary text-3xl text-foreground">{campaign.title}</h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{campaign.summary}</p>
            </div>
          </div>
          <div className="rounded-xl border border-subtle bg-surface-overlay p-4">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" aria-hidden />
                <span>{campaign.location} · {t(`campaigns.mode.${campaign.mode}`)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4" aria-hidden />
                <span>{deadline}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="size-4" aria-hidden />
                <span>{campaign.applicants}/{campaign.capacity}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe2 className="size-4" aria-hidden />
                <span>{t(`campaigns.language.${campaign.language}`)}</span>
              </div>
            </dl>
            {canEnroll ? (
              <Link
                to={`/candidate/campaigns/${campaign.id}/enroll`}
                className={cn(buttonVariants(), 'mt-5 w-full')}
              >
                {campaign.hasEnrolled ? t('campaigns.detail.enrolled') : t('campaigns.detail.enroll')}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            ) : (
              <span className={cn(buttonVariants({ variant: 'secondary' }), 'mt-5 w-full opacity-60')}>
                {campaign.hasEnrolled ? t('campaigns.detail.enrolled') : t('campaigns.detail.unavailable')}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
