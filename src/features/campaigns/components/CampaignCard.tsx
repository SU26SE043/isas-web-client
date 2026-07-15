import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { Campaign } from '../types/campaign.types';
import { CampaignStatusBadge } from './CampaignStatusBadge';

function formatDate(date: string, language: 'vi' | 'en') {
  return new Date(date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { t, language } = useLanguage();
  const capacity = Math.min(100, Math.round((campaign.applicants / campaign.capacity) * 100));

  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{campaign.company}</p>
            <CardTitle className="text-lg text-foreground">{campaign.title}</CardTitle>
          </div>
          <CampaignStatusBadge status={campaign.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{campaign.summary}</p>
        <div className="grid gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <MapPin className="size-4" aria-hidden />
            {campaign.location} · {t(`campaigns.mode.${campaign.mode}`)}
          </span>
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" aria-hidden />
            {t('campaigns.card.deadline')} {formatDate(campaign.deadline, language)}
          </span>
          <span className="flex items-center gap-2">
            <Users className="size-4" aria-hidden />
            {campaign.applicants}/{campaign.capacity} · {capacity}%
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {campaign.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className="border-subtle bg-surface-overlay text-muted-foreground">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start justify-between gap-3 border-subtle bg-surface-overlay/60 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs text-muted-foreground">{t('campaigns.card.match')}</p>
          <p className="text-lg font-semibold text-foreground">{campaign.matchScore}%</p>
        </div>
        <Link
          to={`/candidate/campaigns/${campaign.id}`}
          className={cn(buttonVariants({ variant: 'secondary' }), 'w-full justify-center sm:w-auto')}
        >
          {t('campaigns.card.view')}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
