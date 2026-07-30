import { Clock3, ListChecks, Target } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../types/campaignManagement.types';

export function CampaignSummaryBar({ campaign }: { campaign: EmployerCampaign }) {
  const { t } = useLanguage();
  const items = [
    { icon: Clock3, value: `${campaign.durationMinutes} ${t('employer.campaigns.workspace.minutes')}` },
    { icon: ListChecks, value: `${campaign.questions.length} ${t('employer.campaigns.workspace.questions')}` },
    { icon: Target, value: `${t('employer.campaigns.workspace.passScore')} ${campaign.passScorePct ?? '—'}%` },
  ];

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-xl border border-satin bg-surface-raised px-4 py-3">
      <span className="font-medium text-foreground">{campaign.domain}</span>
      {items.map(({ icon: Icon, value }) => (
        <span key={value} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Icon className="size-4" aria-hidden />
          {value}
        </span>
      ))}
    </div>
  );
}
