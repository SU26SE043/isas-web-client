import { CampaignManagementStatusBadge } from '../CampaignManagementStatusBadge';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../../types/campaignManagement.types';

function formatDateTime(value: string | undefined, locale: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

interface EmailInviteCampaignSummaryProps {
  campaign: EmployerCampaign;
}

export function EmailInviteCampaignSummary({ campaign }: EmailInviteCampaignSummaryProps) {
  const { t, language } = useLanguage();

  const leftRows = [
    {
      label: t('employer.campaigns.emailInvitations.summary.name'),
      value: campaign.title,
    },
    {
      label: t('employer.campaigns.emailInvitations.summary.status'),
      value: campaign.status,
    },
    {
      label: t('employer.campaigns.emailInvitations.summary.expiresAt'),
      value: formatDateTime(campaign.deadline, language),
    },
  ];

  const rightRows = [
    {
      label: t('employer.campaigns.emailInvitations.summary.domain'),
      value: campaign.domain?.trim() || '—',
    },
    {
      label: t('employer.campaigns.emailInvitations.summary.startsAt'),
      value: formatDateTime(campaign.startsAt, language),
    },
    {
      label: t('employer.campaigns.emailInvitations.summary.maxCandidates'),
      value: String(campaign.capacity),
    },
  ];

  return (
    <section className="frame-satin relative overflow-hidden rounded-2xl bg-surface-raised p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-6 -top-8 size-40 rounded-full bg-info-500/10 blur-3xl" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="heading-secondary text-base text-foreground">
          {t('employer.campaigns.emailInvitations.summary.title')}
        </h2>
        <CampaignManagementStatusBadge status={campaign.status} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <dl className="space-y-3">
          {leftRows.map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{row.label}</dt>
              <dd className="mt-0.5 break-words text-sm font-medium text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
        <dl className="space-y-3">
          {rightRows.map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{row.label}</dt>
              <dd className="mt-0.5 break-words text-sm font-medium text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

