import { Building2, CalendarClock, Briefcase } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { CampaignInvitationResponse } from '../types/campaignCandidate.types';

interface InvitationDetailPanelProps {
  invitation: CampaignInvitationResponse;
  onJoin: () => void;
  isJoining?: boolean;
  joinDisabled?: boolean;
  joinError?: string | null;
}

function formatDeadline(iso: string, language: 'vi' | 'en') {
  return new Date(iso).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function InvitationDetailPanel({
  invitation,
  onJoin,
  isJoining = false,
  joinDisabled = false,
  joinError = null,
}: InvitationDetailPanelProps) {
  const { language, t } = useLanguage();
  const totalWeight = invitation.criteria.reduce((sum, item) => sum + (item.weight ?? 0), 0);
  const hasWeight = invitation.criteria.some((item) => item.weight != null);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-4 rounded-2xl border border-satin bg-surface-raised p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            {t('campaigns.invite.badge')}
          </span>
          {invitation.orgName ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-satin bg-surface-overlay px-3 py-1 text-xs text-muted-foreground">
              <Building2 className="size-3.5" aria-hidden />
              {invitation.orgName}
            </span>
          ) : null}
        </div>

        <div className="space-y-2">
          <h1 className="heading-primary text-3xl text-foreground">{invitation.title}</h1>
          {invitation.jobTitle ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="size-4 shrink-0" aria-hidden />
              {invitation.jobTitle}
            </p>
          ) : null}
        </div>

        {invitation.deadline ? (
          <p className="inline-flex items-center gap-2 text-sm text-warning">
            <CalendarClock className="size-4 shrink-0" aria-hidden />
            {t('campaigns.invite.deadline')}: {formatDeadline(invitation.deadline, language)}
          </p>
        ) : null}
      </header>

      {invitation.description ? (
        <section className="rounded-2xl border border-satin bg-surface-raised p-6">
          <h2 className="text-sm font-semibold text-foreground">{t('campaigns.invite.description')}</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
            {invitation.description}
          </p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-satin bg-surface-raised p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">{t('campaigns.invite.criteria')}</h2>
          {hasWeight ? (
            <p className="text-xs text-muted-foreground">
              {t('campaigns.invite.totalWeight')}: {totalWeight}
            </p>
          ) : null}
        </div>

        {invitation.criteria.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t('campaigns.invite.noCriteria')}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {invitation.criteria.map((criterion, index) => (
              <li
                key={criterion.id ?? `${criterion.name}-${index}`}
                className="rounded-xl border border-satin bg-surface-overlay px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{criterion.name}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {criterion.weight != null ? (
                      <span className="rounded-md border border-satin px-2 py-0.5">
                        {t('campaigns.invite.weight')}: {criterion.weight}
                      </span>
                    ) : null}
                    {criterion.maxScore != null ? (
                      <span className="rounded-md border border-satin px-2 py-0.5">
                        {t('campaigns.invite.maxScore')}: {criterion.maxScore}
                      </span>
                    ) : null}
                  </div>
                </div>
                {criterion.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                    {criterion.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-satin bg-surface-raised px-5 py-4 text-sm text-muted-foreground">
        {t('campaigns.invite.processNote')}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          className="btn-primary inline-flex justify-center"
          onClick={onJoin}
          disabled={joinDisabled || isJoining}
        >
          {isJoining ? t('campaigns.invite.joining') : t('campaigns.invite.join')}
        </button>
      </div>

      {joinError ? (
          <p className="text-sm text-error" role="alert">
          {joinError}
        </p>
      ) : null}
    </div>
  );
}
