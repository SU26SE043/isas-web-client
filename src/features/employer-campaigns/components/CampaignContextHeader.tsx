import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../types/campaignManagement.types';
import { CampaignManagementStatusBadge } from './CampaignManagementStatusBadge';
import { CampaignSubNavigation } from './CampaignSubNavigation';

interface CampaignContextHeaderProps {
  campaign: EmployerCampaign;
  mode: 'overview' | 'invitations';
  title?: string;
  description?: string;
}

export function CampaignContextHeader({
  campaign,
  mode,
  title,
  description,
}: CampaignContextHeaderProps) {
  const { t, language } = useLanguage();
  const deadline = new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'medium',
  }).format(new Date(campaign.deadline));
  const remainingDays = Math.max(
    0,
    Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86_400_000),
  );
  const remainingLabel =
    remainingDays === 0
      ? t('employer.campaigns.workspace.deadlineReached')
      : t('employer.campaigns.workspace.remainingDays').replace(
          '{count}',
          String(remainingDays),
        );

  return (
    <div className="space-y-3">
      <Link
        to="/employer/campaigns"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t('employer.campaigns.detail.back')}
      </Link>
      <header className="frame-satin rounded-xl bg-surface-raised px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="heading-primary [overflow-wrap:anywhere] text-2xl text-foreground sm:text-3xl">
              {campaign.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {campaign.domain || campaign.summary}
            </p>
          </div>
          <CampaignManagementStatusBadge status={campaign.status} />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{campaign.domain}</span>
          {campaign.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden />
              {campaign.location}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden />
            {remainingLabel} · {deadline}
          </span>
        </div>
      </header>
      <CampaignSubNavigation campaign={campaign} mode={mode} />
      {title ? (
        <div className="pt-2">
          <h2 className="heading-secondary text-2xl text-foreground">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
