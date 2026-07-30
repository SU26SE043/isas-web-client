import { Link } from 'react-router-dom';
import { Briefcase, Building2, CalendarClock } from 'lucide-react';
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
  if (status === 'Completed') return 'campaigns.my.cta.viewResult';
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
        'space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 transition-colors hover:bg-zinc-900',
        highlighted && 'ring-2 ring-violet-400/30',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        {campaign.company ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/50 px-3 py-1 text-xs text-zinc-400">
            <Building2 className="size-3.5" aria-hidden />
            {campaign.company}
          </span>
        ) : (
          <span />
        )}
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 text-xs font-medium',
            campaign.interviewStatus === 'Completed' &&
              'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
            campaign.interviewStatus === 'InProgress' &&
              'border-amber-500/30 bg-amber-500/10 text-amber-400',
            campaign.interviewStatus === 'NotStarted' &&
              'border-zinc-700 bg-zinc-950/60 text-zinc-400',
          )}
        >
          {t(interviewStatusLabelKey(campaign.interviewStatus))}
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="heading-secondary text-lg text-zinc-100">{campaign.title}</h2>
        {campaign.jobTitle ? (
          <p className="inline-flex items-center gap-2 text-sm text-zinc-400">
            <Briefcase className="size-4 shrink-0" aria-hidden />
            {campaign.jobTitle}
          </p>
        ) : null}
        {deadlineLabel ? (
          <p
            className={cn(
              'inline-flex items-center gap-2 text-sm',
              expired ? 'text-rose-400' : 'text-zinc-400',
            )}
          >
            <CalendarClock className="size-4 shrink-0" aria-hidden />
            {t('campaigns.my.deadline').replace('{date}', deadlineLabel)}
            {expired ? ` · ${t('campaigns.my.deadlineExpired')}` : ` · ${t('campaigns.my.deadlineOpen')}`}
          </p>
        ) : null}
        {campaign.membershipStatus ? (
          <p className="text-xs text-zinc-500">
            {t('campaigns.my.membership')}: {campaign.membershipStatus}
          </p>
        ) : null}
      </div>

      <Link
        to={`/candidate/campaigns/${encodeURIComponent(campaign.campaignId)}`}
        className="btn-primary inline-flex text-sm"
      >
        {t(ctaLabelKey(campaign.interviewStatus))}
      </Link>
    </article>
  );
}
