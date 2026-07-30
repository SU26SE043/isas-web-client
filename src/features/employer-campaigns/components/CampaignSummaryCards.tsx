import { Archive, BriefcaseBusiness, CheckCircle2, FilePenLine, Send, Users } from 'lucide-react';
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
    {
      key: 'total',
      value: total,
      label: t('employer.campaigns.list.stats.total'),
      icon: BriefcaseBusiness,
      cardTone: 'border-chart-cat-1/30 bg-chart-cat-1/[0.06]',
      iconTone: 'border-chart-cat-1/30 bg-chart-cat-1/15 text-chart-cat-1',
    },
    {
      key: 'active',
      value: active,
      label: t('employer.campaigns.list.stats.active'),
      icon: CheckCircle2,
      cardTone: 'border-success/30 bg-success/[0.06]',
      iconTone: 'border-success/30 bg-success/15 text-success-light',
    },
    {
      key: 'draft',
      value: draft,
      label: t('employer.campaigns.list.stats.draft'),
      icon: FilePenLine,
      cardTone: 'border-warning/30 bg-warning/[0.06]',
      iconTone: 'border-warning/30 bg-warning/15 text-warning-light',
    },
    {
      key: 'closed',
      value: closed,
      label: t('employer.campaigns.list.stats.closed'),
      icon: Archive,
      cardTone: 'border-chart-cat-6/30 bg-chart-cat-6/[0.06]',
      iconTone: 'border-chart-cat-6/30 bg-chart-cat-6/15 text-chart-cat-6',
    },
    {
      key: 'invited',
      value: invited,
      label: t('employer.campaigns.list.stats.invited'),
      icon: Send,
      cardTone: 'border-info/30 bg-info/[0.06]',
      iconTone: 'border-info/30 bg-info/15 text-info-light',
    },
    {
      key: 'completed',
      value: completed,
      label: t('employer.campaigns.list.stats.completed'),
      icon: Users,
      cardTone: 'border-chart-cat-2/30 bg-chart-cat-2/[0.06]',
      iconTone: 'border-chart-cat-2/30 bg-chart-cat-2/15 text-chart-cat-2',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.key}
            className={`group min-w-0 rounded-xl border p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] transition-[border-color,background-color,transform] hover:-translate-y-0.5 ${card.cardTone}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{card.value}</p>
              </div>
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${card.iconTone}`}
              >
                <Icon className="size-4" aria-hidden />
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
