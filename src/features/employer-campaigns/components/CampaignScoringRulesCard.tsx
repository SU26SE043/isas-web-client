import { Scale } from 'lucide-react';
import { CollapsibleDetailCard } from './CollapsibleDetailCard';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../types/campaignManagement.types';

export function CampaignScoringRulesCard({ campaign }: { campaign: EmployerCampaign }) {
  const { t } = useLanguage();
  return (
    <CollapsibleDetailCard
      title={t('employer.campaigns.detail.scoringRules')}
      icon={Scale}
      className="frame-satin bg-info/[0.035]"
    >
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>{campaign.skipPenalty === false
          ? t('employer.campaigns.detail.legacyBlankRule')
          : t('employer.campaigns.detail.blankRule')}</p>
        <p>{campaign.passScorePct != null
          ? t('employer.campaigns.detail.thresholdRule').replace('{{score}}', `${campaign.passScorePct}%`)
          : t('employer.campaigns.detail.hrRule')}</p>
        <p>{t('employer.campaigns.detail.cutoffRule').replace('{{count}}', String(campaign.rubric.filter((item) => item.minPct != null).length))}</p>
      </div>
    </CollapsibleDetailCard>
  );
}
