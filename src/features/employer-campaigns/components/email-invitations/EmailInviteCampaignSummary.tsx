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
  const invitedCount = campaign.invitedEmails.length;
  const remaining =
    campaign.capacity > 0 ? Math.max(campaign.capacity - invitedCount, 0) : null;

  const rows: Array<{ label: string; value: string }> = [
    { label: t('employer.campaigns.emailInvitations.summary.name'), value: campaign.title },
    {
      label: t('employer.campaigns.emailInvitations.summary.domain'),
      value: campaign.domain?.trim() || '—',
    },
    {
      label: t('employer.campaigns.emailInvitations.summary.status'),
      value: campaign.status,
    },
    {
      label: t('employer.campaigns.emailInvitations.summary.startsAt'),
      value: formatDateTime(campaign.startsAt, language),
    },
    {
      label: t('employer.campaigns.emailInvitations.summary.expiresAt'),
      value: formatDateTime(campaign.deadline, language),
    },
    {
      label: t('employer.campaigns.emailInvitations.summary.maxCandidates'),
      value: String(campaign.capacity),
    },
  ];

  if (invitedCount > 0 || campaign.candidates.length > 0) {
    rows.push({
      label: t('employer.campaigns.emailInvitations.summary.invitedCount'),
      value: String(invitedCount || campaign.candidates.length),
    });
  }
  if (remaining != null && campaign.capacity > 0) {
    rows.push({
      label: t('employer.campaigns.emailInvitations.summary.remaining'),
      value: String(remaining),
    });
  }

  return (
    <section className="rounded-lg border border-satin bg-surface-overlay p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">
          {t('employer.campaigns.emailInvitations.summary.title')}
        </h2>
        <CampaignManagementStatusBadge status={campaign.status} />
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{row.label}</dt>
            <dd className="break-words text-sm text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
