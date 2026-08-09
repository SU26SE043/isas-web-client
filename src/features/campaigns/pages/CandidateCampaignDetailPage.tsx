import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, BadgeCheck, BriefcaseBusiness, CalendarClock, CheckCircle2, Code2, FileText, Info, Loader2, MessageCircle, Play, Sparkles, Star, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { UserRole } from '@/features/auth/types/auth.types';
import { useLanguage } from '@/shared/languages';
import { StartCampaignConfirmDialog } from '../components/StartCampaignConfirmDialog';
import { MY_CAMPAIGNS_QUERY_KEY } from '../hooks/useMyCampaigns';
import { myCampaignDetailQueryKey, useMyCampaignDetail } from '../hooks/useMyCampaignDetail';
import {
  CampaignCandidateError,
  campaignCandidateService,
} from '../services/campaignCandidate.service';
import type { CampaignInterviewStatus } from '../types/campaignCandidate.types';
import { saveCampaignInterviewSession } from '../utils/campaignInterviewSession';

function interviewStatusLabelKey(status: CampaignInterviewStatus) {
  if (status === 'InProgress') return 'campaigns.my.interview.inProgress';
  if (status === 'Completed') return 'campaigns.my.interview.completed';
  return 'campaigns.my.interview.notStarted';
}

function startErrorMessage(error: unknown, t: (key: string) => string): string {
  if (!(error instanceof CampaignCandidateError)) return t('campaigns.detail.startUnknown');
  if (error.code === 'unauthorized') return t('campaigns.detail.startUnauthorized');
  if (error.code === 'paymentRequired') return t('campaigns.detail.startPaymentRequired');
  if (error.code === 'forbidden') return t('campaigns.detail.startForbidden');
  if (error.code === 'outsideSlotWindow') return t('campaigns.detail.startOutsideSlotWindow');
  if (error.code === 'concurrentLimit') return t('campaigns.detail.startConcurrentLimit');
  if (error.code === 'conflict') return error.message || t('campaigns.detail.startConflict');
  if (error.code === 'identityError' || error.code === 'serverError') {
    return t('campaigns.detail.startServerError');
  }
  return error.message || t('campaigns.detail.startUnknown');
}

export function CandidateCampaignDetailPage() {
  const { id = '' } = useParams();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError, error, refetch, isFetching } = useMyCampaignDetail(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const detailPath = useMemo(
    () => `/candidate/campaigns/${encodeURIComponent(id)}`,
    [id],
  );

  if (!user || user.role !== UserRole.CANDIDATE) {
    return <Navigate to="/login" replace state={{ from: { pathname: detailPath } }} />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 bg-surface-base">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="text-sm text-muted-foreground">{t('campaigns.detail.loading')}</span>
      </div>
    );
  }

  if (error instanceof CampaignCandidateError && error.code === 'unauthorized') {
    return <Navigate to="/login" replace state={{ from: { pathname: detailPath } }} />;
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

  const handleStartConfirm = async () => {
    setIsStarting(true);
    setStartError(null);
    try {
      const started = await campaignCandidateService.startCampaignInterview(data.campaignId);
      saveCampaignInterviewSession(started);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MY_CAMPAIGNS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: myCampaignDetailQueryKey(data.campaignId) }),
      ]);
      setConfirmOpen(false);

      const base = `/candidate/campaigns/${encodeURIComponent(started.campaignId)}`;
      if (started.faceEnrollRequired) {
        navigate(`${base}/face-enroll/${encodeURIComponent(started.sessionId)}`);
      } else {
        navigate(`${base}/interview/${encodeURIComponent(started.sessionId)}`);
      }
    } catch (startErr) {
      setStartError(startErrorMessage(startErr, t));
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[radial-gradient(circle_at_78%_8%,rgba(37,99,235,0.16),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(124,58,237,0.1),transparent_34%)] bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-5 py-6">
        <Link to="/candidate/campaigns" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-4" aria-hidden />{t('campaigns.my.backToList')}</Link>

        <header className="relative overflow-hidden rounded-2xl border border-info/60 bg-[radial-gradient(circle_at_80%_40%,rgba(37,99,235,0.2),transparent_38%),radial-gradient(circle_at_65%_100%,rgba(124,58,237,0.14),transparent_34%)] bg-surface-raised p-6 shadow-[0_20px_60px_-32px_rgba(59,130,246,0.7)] sm:p-8">
          <div className="absolute -right-8 -top-12 size-48 rounded-full border border-info/20" aria-hidden />
          <div className="relative space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-200"><BriefcaseBusiness className="size-4" aria-hidden />{t('campaigns.detail.badge')}</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-success/35 bg-success/10 px-3 py-1.5 text-xs font-medium text-success-light"><BadgeCheck className="size-4" aria-hidden />{t(interviewStatusLabelKey(data.interviewStatus))}</span>
            </div>
            <h1 className="heading-primary break-words text-3xl text-foreground sm:text-4xl">{data.title}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {data.jobTitle ? <span className="inline-flex items-center gap-2"><Code2 className="size-4 text-info" aria-hidden />{data.jobTitle}</span> : null}
              {deadlineLabel ? <span className="inline-flex items-center gap-2 text-warning-light"><CalendarClock className="size-4" aria-hidden />{t('campaigns.invite.deadline')}: {deadlineLabel}</span> : null}
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.25fr)]">
          <div className="space-y-5">
            <section className="frame-satin rounded-2xl bg-surface-raised p-5 sm:p-6">
              <SectionHeading icon={FileText} title={t('campaigns.invite.description')} />
              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{data.description || t('campaigns.invite.noCriteria')}</p>
            </section>
            <section className="frame-satin rounded-2xl bg-surface-raised p-5 sm:p-6">
              <SectionHeading icon={Info} title={t('campaigns.detail.examInfo')} iconClassName="text-info" />
              <ul className="mt-5 space-y-4 text-sm text-muted-foreground"><li className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />{data.started ? t('campaigns.detail.startedYes') : t('campaigns.detail.startedNo')}</li><li className="flex gap-3"><Video className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />{t('campaigns.detail.deviceHint')}</li></ul>
              <div className="mt-5">
                {isCompleted ? <Link to={`/candidate/campaigns/${encodeURIComponent(data.campaignId)}/completed/${encodeURIComponent(data.sessionId ?? 'done')}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-info/70 bg-info/10 px-4 py-3 text-sm font-semibold text-foreground shadow-[0_0_24px_-10px_var(--color-info)] transition-colors hover:bg-info/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"><Sparkles className="size-4 text-info" aria-hidden />{t('campaigns.my.cta.viewResult')}</Link> : null}
                {!isCompleted && canContinue ? <Link to={`/candidate/campaigns/${encodeURIComponent(data.campaignId)}/interview/${encodeURIComponent(data.sessionId!)}`} className="btn-primary inline-flex w-full justify-center gap-2"><Play className="size-4" aria-hidden />{t('campaigns.detail.continue')}</Link> : null}
                {!isCompleted && !canContinue ? <button type="button" className="btn-primary inline-flex w-full justify-center gap-2" onClick={() => { setStartError(null); setConfirmOpen(true); }}><Play className="size-4" aria-hidden />{t('campaigns.detail.start')}</button> : null}
              </div>
            </section>
          </div>
          <section className="frame-satin rounded-2xl bg-surface-raised p-5 sm:p-6">
            <SectionHeading icon={Star} title={t('campaigns.invite.criteria')} iconClassName="text-violet-300" />
            {data.criteria.length === 0 ? <p className="mt-5 rounded-xl border border-dashed border-satin p-5 text-sm text-muted-foreground">{t('campaigns.invite.noCriteria')}</p> : <div className="mt-5 space-y-3">{data.criteria.map((criterion, index) => <article key={criterion.id ?? `${criterion.name}-${index}`} className="flex gap-4 rounded-xl border border-violet-400/35 bg-surface-overlay/70 p-4 shadow-[inset_3px_0_0_rgba(124,58,237,0.9)]"><span className="grid size-11 shrink-0 place-items-center rounded-full border border-info/40 bg-info/10 text-info">{index % 2 === 0 ? <Code2 className="size-5" aria-hidden /> : <MessageCircle className="size-5" aria-hidden />}</span><div className="min-w-0"><h2 className="font-semibold text-foreground">{index + 1}. {criterion.name}</h2>{criterion.description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{criterion.description}</p> : null}</div></article>)}</div>}
          </section>
        </div>
      </div>

      <StartCampaignConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => void handleStartConfirm()}
        isSubmitting={isStarting}
        errorMessage={startError}
      />
    </div>
  );
}

function SectionHeading({ icon: Icon, title, iconClassName = 'text-violet-300' }: { icon: typeof FileText; title: string; iconClassName?: string }) {
  return <div className="flex items-center gap-3 border-b border-satin pb-4"><span className={`grid size-9 place-items-center rounded-full border border-violet-400/30 bg-violet-500/10 ${iconClassName}`}><Icon className="size-5" aria-hidden /></span><h2 className="text-lg font-semibold text-foreground">{title}</h2></div>;
}
