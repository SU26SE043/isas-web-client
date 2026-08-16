import { Link } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  CalendarDays,
  Code2,
  UserRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type {
  CampaignInterviewStatus,
  CandidateCampaignListItem,
} from '../types/campaignCandidate.types';

interface MyCampaignCardProps {
  campaign: CandidateCampaignListItem;
  highlighted?: boolean;
}

function interviewStatusLabelKey(status: CampaignInterviewStatus) {
  if (status === 'InProgress') return 'campaigns.my.interview.inProgress';
  if (status === 'Completed') return 'campaigns.my.interview.completed';
  return 'campaigns.my.interview.notStarted';
}

function ctaLabelKey(status: CampaignInterviewStatus) {
  if (status === 'InProgress') return 'campaigns.my.cta.continue';
  return 'campaigns.my.cta.viewDetail';
}

function isDeadlinePassed(deadline: string | null | undefined) {
  if (!deadline) return false;
  const time = new Date(deadline).getTime();
  return Number.isFinite(time) && time < Date.now();
}

export function MyCampaignCard({ campaign, highlighted = false }: MyCampaignCardProps) {
  const { language, t } = useLanguage();
  const expired = isDeadlinePassed(campaign.deadline);
  const deadlineLabel = campaign.deadline
    ? new Date(campaign.deadline).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <article
      data-campaign-id={campaign.campaignId}
      className={cn(
        'group relative flex min-h-[300px] flex-col overflow-hidden rounded-2xl border border-satin bg-surface-raised p-5 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.9)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-info/45 hover:shadow-[0_24px_55px_-28px_rgba(59,130,246,0.28)] sm:p-7',
        highlighted && 'border-info/60 ring-2 ring-info/20',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {campaign.company ? (
            <p className="mb-1 flex min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground">
              <Building2 className="size-3.5 shrink-0 text-info" aria-hidden />
              {campaign.company}
            </p>
          ) : null}
          <h2 className="heading-secondary break-words text-xl text-foreground sm:text-2xl">
            {campaign.title}
          </h2>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
            campaign.interviewStatus === 'Completed' &&
              'border-success/35 bg-success/10 text-success-light',
            campaign.interviewStatus === 'InProgress' &&
              'border-warning/35 bg-warning/10 text-warning-light',
            campaign.interviewStatus === 'NotStarted' &&
              'border-subtle bg-surface-overlay text-muted-foreground',
          )}
        >
          <span className="size-1.5 rounded-full bg-current" aria-hidden />
          {t(interviewStatusLabelKey(campaign.interviewStatus))}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {campaign.jobTitle ? (
          <p className="flex items-center gap-3 text-base text-muted-foreground">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-satin bg-surface-overlay text-info">
              <Code2 className="size-5" aria-hidden />
            </span>
            {campaign.jobTitle}
          </p>
        ) : null}
        {deadlineLabel ? (
          <p
            className={cn(
              'flex items-center gap-3 text-base',
              expired ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-satin bg-surface-overlay text-info">
              <CalendarDays className="size-5" aria-hidden />
            </span>
            <span>
              {t('campaigns.my.deadline').replace('{date}', deadlineLabel)}
              <span className="hidden sm:inline"> · {expired ? t('campaigns.my.deadlineExpired') : t('campaigns.my.deadlineOpen')}</span>
            </span>
          </p>
        ) : null}
        {campaign.membershipStatus ? (
          <p className="flex items-center gap-3 text-base text-muted-foreground">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-satin bg-surface-overlay text-info">
              <UserRound className="size-5" aria-hidden />
            </span>
            <span>
              {t('campaigns.my.membership')}:{' '}
              <span className="text-foreground">{campaign.membershipStatus}</span>
            </span>
          </p>
        ) : null}
      </div>

      <Link
        to={`/candidate/campaigns/${encodeURIComponent(campaign.campaignId)}`}
        className="mt-auto self-end inline-flex w-fit translate-y-1 items-center gap-2 rounded-xl border border-info/70 bg-info/10 px-5 py-3 text-sm font-semibold text-foreground shadow-[0_0_24px_-10px_var(--color-info)] transition-colors hover:bg-info/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
      >
        <BarChart3 className="size-5 text-info" aria-hidden />
        {t(ctaLabelKey(campaign.interviewStatus))}
      </Link>
    </article>
  );
}
