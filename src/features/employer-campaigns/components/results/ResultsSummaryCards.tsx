import { StatCard, StatGrid, StatGridSkeleton } from '@/components/patterns/StatCard';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultsResponse } from '../../types/campaign.api.types';
import { getResultFlagCount } from '../../utils/campaignResultsActions';

interface ResultsSummaryCardsProps {
  data: CampaignResultsResponse;
  fallbackPassScorePct?: number | null;
}

export function ResultsSummaryCards({ data, fallbackPassScorePct }: ResultsSummaryCardsProps) {
  const { t } = useLanguage();
  const passCount = data.results.filter((item) => item.result === 'Pass').length;
  const failCount = data.results.filter((item) => item.result === 'Fail').length;
  const needsReviewCount = data.results.filter((item) => getResultFlagCount(item.flags) > 0).length;
  const passScore = data.passScorePct ?? fallbackPassScorePct ?? null;

  const cards = [
    {
      label: t('employer.campaigns.results.summary.scored'),
      // The main results table contains scored sessions only. Flagged but
      // unscored sessions are intentionally shown in their own section.
      value: String(data.results.length),
    },
    { label: t('employer.campaigns.results.summary.pass'), value: String(passCount) },
    { label: t('employer.campaigns.results.summary.fail'), value: String(failCount) },
    {
      label: t('employer.campaigns.results.summary.passScore'),
      value: passScore != null ? `${passScore}%` : t('employer.campaigns.results.summary.passScoreUnset'),
    },
    {
      label: t('employer.campaigns.results.summary.flagged'),
      value: String(needsReviewCount),
      title: t('employer.campaigns.results.summary.flaggedHint'),
    },
  ];

  return (
    <StatGrid columns={5}>
      {cards.map((card) => (
        <StatCard key={card.label} size="sm" label={card.label} value={card.value} title={card.title} />
      ))}
    </StatGrid>
  );
}

export function ResultsSummarySkeleton() {
  return <StatGridSkeleton columns={5} size="sm" />;
}
