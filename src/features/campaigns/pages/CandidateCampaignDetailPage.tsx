import { Link, Navigate, useParams } from 'react-router-dom';
import { AlertCircle, Briefcase, CalendarClock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { UserRole } from '@/features/auth/types/auth.types';
import { useLanguage } from '@/shared/languages';
import { useMyCampaignDetail } from '../hooks/useMyCampaignDetail';
import { CampaignCandidateError } from '../services/campaignCandidate.service';
import type { CampaignInterviewStatus } from '../types/campaignCandidate.types';

function interviewStatusLabelKey(status: CampaignInterviewStatus) {
  if (status === 'InProgress') return 'campaigns.my.interview.inProgress';
  if (status === 'Completed') return 'campaigns.my.interview.completed';
  return 'campaigns.my.interview.notStarted';
}

export function CandidateCampaignDetailPage() {
  const { id = '' } = useParams();
  const { language, t } = useLanguage();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError, error, refetch, isFetching } = useMyCampaignDetail(id);

  if (!user || user.role !== UserRole.CANDIDATE) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: `/candidate/campaigns/${encodeURIComponent(id)}` } }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 bg-surface-base">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="text-sm text-muted-foreground">{t('campaigns.detail.loading')}</span>
      </div>
    );
  }

  const isUnauthorized =
    error instanceof CampaignCandidateError && error.code === 'unauthorized';
  if (isUnauthorized) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: `/candidate/campaigns/${encodeURIComponent(id)}` } }}
      />
    );
  }

  const isNotFound = error instanceof CampaignCandidateError && error.code === 'notFound';
  if (isError || !data || isNotFound) {
    return (
      <div className="page-container page-section mx-auto max-w-3xl space-y-4 py-12 text-center">
        <h1 className="heading-primary text-2xl text-foreground">{t('campaigns.detail.notFound')}</h1>
        <p className="text-sm text-muted-foreground">{t('campaigns.detail.notFoundHint')}</p>
        {isError && !isNotFound ? (
          <Button type="button" variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <AlertCircle className="size-4" aria-hidden />
            {t('campaigns.detail.retry')}
          </Button>
        ) : null}
        <Link to="/candidate/campaigns" className="btn-secondary inline-flex">
          {t('campaigns.my.backToList')}
        </Link>
      </div>
    );
  }

  const deadlineLabel = data.deadline
    ? new Date(data.deadline).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const canContinue = data.started && Boolean(data.sessionId) && data.interviewStatus !== 'Completed';
  const isCompleted = data.interviewStatus === 'Completed';

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-4xl space-y-6 py-6">
        <Link to="/candidate/campaigns" className="text-sm text-zinc-400 hover:text-zinc-100">
          {t('campaigns.my.backToList')}
        </Link>

        <header className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
              {t('campaigns.detail.badge')}
            </span>
            <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
              {t(interviewStatusLabelKey(data.interviewStatus))}
            </span>
          </div>
          <h1 className="heading-primary text-3xl text-zinc-100">{data.title}</h1>
          {data.jobTitle ? (
            <p className="inline-flex items-center gap-2 text-sm text-zinc-400">
              <Briefcase className="size-4" aria-hidden />
              {data.jobTitle}
            </p>
          ) : null}
          {deadlineLabel ? (
            <p className="inline-flex items-center gap-2 text-sm text-amber-400">
              <CalendarClock className="size-4" aria-hidden />
              {t('campaigns.invite.deadline')}: {deadlineLabel}
            </p>
          ) : null}
          {data.membershipStatus ? (
            <p className="text-xs text-zinc-500">
              {t('campaigns.my.membership')}: {data.membershipStatus}
            </p>
          ) : null}
        </header>

        {data.description ? (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-sm font-semibold text-zinc-100">{t('campaigns.invite.description')}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400 [overflow-wrap:anywhere]">
              {data.description}
            </p>
          </section>
        ) : null}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-sm font-semibold text-zinc-100">{t('campaigns.invite.criteria')}</h2>
          {data.criteria.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">{t('campaigns.invite.noCriteria')}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.criteria.map((criterion, index) => (
                <li
                  key={criterion.id ?? `${criterion.name}-${index}`}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-100">{criterion.name}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                      {criterion.weight != null ? (
                        <span className="rounded-md border border-zinc-800 px-2 py-0.5">
                          {t('campaigns.invite.weight')}: {criterion.weight}
                        </span>
                      ) : null}
                      {criterion.maxScore != null ? (
                        <span className="rounded-md border border-zinc-800 px-2 py-0.5">
                          {t('campaigns.invite.maxScore')}: {criterion.maxScore}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {criterion.description ? (
                    <p className="mt-2 text-sm text-zinc-500 [overflow-wrap:anywhere]">
                      {criterion.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-100">{t('campaigns.detail.examInfo')}</h2>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>
              {data.started
                ? t('campaigns.detail.startedYes')
                : t('campaigns.detail.startedNo')}
            </li>
            {data.sessionId ? (
              <li>
                {t('campaigns.detail.sessionId')}: {data.sessionId}
              </li>
            ) : null}
            <li>{t('campaigns.detail.deviceHint')}</li>
          </ul>

          <div className="flex flex-wrap gap-3 pt-2">
            {isCompleted ? (
              <Link
                to={`/candidate/campaigns/${encodeURIComponent(data.campaignId)}/completed/${encodeURIComponent(data.sessionId ?? 'done')}`}
                className="btn-secondary inline-flex"
              >
                {t('campaigns.my.cta.viewResult')}
              </Link>
            ) : null}

            {!isCompleted && canContinue ? (
              <Link
                to={`/candidate/campaigns/${encodeURIComponent(data.campaignId)}/interview/${encodeURIComponent(data.sessionId!)}`}
                className="btn-primary inline-flex"
              >
                {t('campaigns.detail.continue')}
              </Link>
            ) : null}

            {!isCompleted && !canContinue ? (
              <button type="button" className="btn-primary inline-flex" data-start-campaign>
                {t('campaigns.detail.start')}
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
