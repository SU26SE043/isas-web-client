import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../types/campaignManagement.types';
import { CampaignManagementStatusBadge } from './CampaignManagementStatusBadge';
import { CampaignSubNavigation } from './CampaignSubNavigation';

interface CampaignContextHeaderProps {
  campaign: EmployerCampaign;
  title?: string;
  description?: string;
}

export function CampaignContextHeader({
  campaign,
  title,
  description,
}: CampaignContextHeaderProps) {
  const { t, language } = useLanguage();
  const deadline = new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'medium',
  }).format(new Date(campaign.deadline));

  return (
    <div className="space-y-4">
      <Link
        to="/employer/campaigns"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t('employer.campaigns.detail.back')}
      </Link>
      <header className="space-y-3">
        <CampaignManagementStatusBadge status={campaign.status} />
        <div>
          <h1 className="heading-primary text-3xl text-foreground sm:text-4xl">{campaign.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {campaign.summary || campaign.jobDescription}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{campaign.domain}</span>
          {campaign.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden />
              {campaign.location}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden />
            {deadline}
          </span>
        </div>
      </header>
      <CampaignSubNavigation campaign={campaign} />
      {title ? (
        <div className="pt-2">
          <h2 className="heading-secondary text-2xl text-foreground">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
