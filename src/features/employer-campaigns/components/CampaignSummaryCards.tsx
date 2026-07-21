import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../types/campaignManagement.types';

interface CampaignSummaryCardsProps {
  campaigns: EmployerCampaign[];
}

export function CampaignSummaryCards({ campaigns }: CampaignSummaryCardsProps) {
  const { t } = useLanguage();
  const total = campaigns.length;
  const active = campaigns.filter((item) => item.status === 'active').length;
  const draft = campaigns.filter((item) => item.status === 'draft').length;
  const closed = campaigns.filter(
    (item) => item.status === 'closed' || item.status === 'paused' || item.status === 'archived',
  ).length;
  const invited = campaigns.reduce((sum, item) => sum + (item.invitedEmails?.length || item.applicants || 0), 0);
  const completed = campaigns.reduce(
    (sum, item) => sum + Math.min(item.applicants || 0, item.capacity || 0),
    0,
  );

  const cards = [
    { key: 'total', value: total, label: t('employer.campaigns.list.stats.total') },
    { key: 'active', value: active, label: t('employer.campaigns.list.stats.active') },
    { key: 'draft', value: draft, label: t('employer.campaigns.list.stats.draft') },
    { key: 'closed', value: closed, label: t('employer.campaigns.list.stats.closed') },
    { key: 'invited', value: invited, label: t('employer.campaigns.list.stats.invited') },
    { key: 'completed', value: completed, label: t('employer.campaigns.list.stats.completed') },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <article
          key={card.key}
          className="rounded-lg border border-satin bg-surface-raised px-4 py-3"
        >
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{card.value}</p>
        </article>
      ))}
    </div>
  );
}
