import { useEffect } from 'react';
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, CalendarClock, CheckCircle2, Code2, FileText, Info, MessageCircle, Sparkles, Video } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/shared/languages';
import { MY_CAMPAIGNS_QUERY_KEY } from '../hooks/useMyCampaigns';
import { myCampaignDetailQueryKey, useMyCampaignDetail } from '../hooks/useMyCampaignDetail';
import { clearCampaignInterviewSession, readCampaignInterviewSession } from '../utils/campaignInterviewSession';

export function CampaignInterviewCompletedPage() {
  const { campaignId = '', sessionId = '' } = useParams();
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const stored = readCampaignInterviewSession(sessionId);
  const resolvedCampaignId = campaignId || stored?.campaignId || '';
  const { data: campaign, isLoading } = useMyCampaignDetail(resolvedCampaignId);

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: MY_CAMPAIGNS_QUERY_KEY });
    if (resolvedCampaignId) {
      void queryClient.invalidateQueries({ queryKey: myCampaignDetailQueryKey(resolvedCampaignId) });
    }
    if (sessionId) clearCampaignInterviewSession(sessionId);
  }, [queryClient, resolvedCampaignId, sessionId]);

  const deadlineLabel = campaign?.deadline
    ? new Date(campaign.deadline).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-5xl space-y-5 py-6">
        <Link to="/candidate/campaigns" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          {t('campaigns.my.backToList')}
        </Link>

        <header className="relative overflow-hidden rounded-2xl border border-info/60 bg-[radial-gradient(circle_at_80%_40%,rgba(37,99,235,0.2),transparent_38%),radial-gradient(circle_at_65%_100%,rgba(124,58,237,0.14),transparent_34%)] bg-surface-raised p-6 shadow-[0_20px_60px_-32px_rgba(59,130,246,0.7)] sm:p-8">
          <div className="absolute -right-8 -top-12 size-48 rounded-full border border-info/20 opacity-70" aria-hidden />
          <div className="relative space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-200">
                <BriefcaseBusiness className="size-4" aria-hidden />
                {t('campaigns.detail.badge')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-success/35 bg-success/10 px-3 py-1.5 text-xs font-medium text-success-light">
                <BadgeCheck className="size-4" aria-hidden />
                {t('campaigns.my.interview.completed')}
              </span>
            </div>
            <div>
              <h1 className="heading-primary break-words text-3xl text-foreground sm:text-4xl">{campaign?.title ?? t('campaigns.flow.completedTitle')}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                {campaign?.jobTitle ? <span className="inline-flex items-center gap-2"><Code2 className="size-4 text-info" aria-hidden />{campaign.jobTitle}</span> : null}
                {deadlineLabel ? <span className="inline-flex items-center gap-2 text-warning-light"><CalendarClock className="size-4" aria-hidden />{t('campaigns.invite.deadline')}: {deadlineLabel}</span> : null}
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.35fr)]">
          <div className="space-y-5">
            <section className="frame-satin rounded-2xl bg-surface-raised p-5 sm:p-6">
              <SectionHeading icon={FileText} title={t('campaigns.invite.description')} />
              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{campaign?.description || t('campaigns.flow.completedBody')}</p>
            </section>

            <section className="frame-satin rounded-2xl bg-surface-raised p-5 sm:p-6">
              <SectionHeading icon={Info} title={t('campaigns.detail.examInfo')} iconClassName="text-info" />
              <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />{t('campaigns.detail.startedYes')}</li>
                <li className="flex gap-3"><Video className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />{t('campaigns.detail.deviceHint')}</li>
              </ul>
              <Link to={`/candidate/campaigns/${encodeURIComponent(resolvedCampaignId)}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-info/70 bg-info/10 px-4 py-3 text-sm font-semibold text-foreground shadow-[0_0_24px_-10px_var(--color-info)] transition-colors hover:bg-info/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]">
                <Sparkles className="size-4 text-info" aria-hidden />
                {t('campaigns.my.cta.viewResult')}
              </Link>
            </section>
          </div>

          <section className="frame-satin rounded-2xl bg-surface-raised p-5 sm:p-6">
            <SectionHeading icon={Sparkles} title={t('campaigns.invite.criteria')} iconClassName="text-violet-300" />
            {isLoading ? <div className="mt-5 h-36 animate-pulse rounded-xl bg-surface-overlay" aria-label={t('campaigns.detail.loading')} /> : campaign?.criteria.length ? (
              <div className="mt-5 space-y-3">
                {campaign.criteria.map((criterion, index) => <article key={criterion.id ?? `${criterion.name}-${index}`} className="flex gap-4 rounded-xl border border-violet-400/35 bg-surface-overlay/70 p-4 shadow-[inset_3px_0_0_rgba(124,58,237,0.9)]">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-info/40 bg-info/10 text-info"><CriterionIcon index={index} /></span>
                  <div className="min-w-0"><h2 className="font-semibold text-foreground">{index + 1}. {criterion.name}</h2>{criterion.description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{criterion.description}</p> : null}</div>
                </article>)}
              </div>
            ) : <p className="mt-5 rounded-xl border border-dashed border-satin p-5 text-sm text-muted-foreground">{t('campaigns.invite.noCriteria')}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, title, iconClassName = 'text-violet-300' }: { icon: typeof FileText; title: string; iconClassName?: string }) {
  return <div className="flex items-center gap-3 border-b border-satin pb-4"><span className={`grid size-9 place-items-center rounded-full border border-violet-400/30 bg-violet-500/10 ${iconClassName}`}><Icon className="size-5" aria-hidden /></span><h2 className="text-lg font-semibold text-foreground">{title}</h2></div>;
}

function CriterionIcon({ index }: { index: number }) {
  const Icon = index % 2 === 0 ? Code2 : MessageCircle;
  return <Icon className="size-5" aria-hidden />;
}
