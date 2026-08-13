import { useLanguage } from '@/shared/languages';
import type { CampaignResultsResponse } from '../../types/campaign.api.types';

interface ResultsSummaryCardsProps {
  data: CampaignResultsResponse;
  fallbackPassScorePct?: number | null;
}

export function ResultsSummaryCards({ data, fallbackPassScorePct }: ResultsSummaryCardsProps) {
  const { t } = useLanguage();
  const passCount = data.results.filter((item) => item.result === 'Pass').length;
  const failCount = data.results.filter((item) => item.result === 'Fail').length;
  const needsReviewCount = data.results.filter((item) => item.flags.length > 0).length;
  const passScore = data.passScorePct ?? fallbackPassScorePct ?? null;

  const cards = [
    {
      label: t('employer.campaigns.results.summary.scored'),
      // The main results table contains scored sessions only. Flagged but
      // unscored sessions are intentionally shown in their own section.
      value: String(data.results.length),
    },
    {
      label: t('employer.campaigns.results.summary.pass'),
      value: String(passCount),
    },
    {
      label: t('employer.campaigns.results.summary.fail'),
      value: String(failCount),
    },
    {
      label: t('employer.campaigns.results.summary.passScore'),
      value:
        passScore != null
          ? `${passScore}%`
          : t('employer.campaigns.results.summary.passScoreUnset'),
    },
    {
      label: t('employer.campaigns.results.summary.needsReview'),
      value: String(needsReviewCount),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-satin bg-surface-overlay px-3 py-3"
        >
          <p className="text-xs text-muted-foreground">{card.label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export function ResultsSummarySkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-[72px] animate-pulse rounded-xl border border-satin bg-surface-overlay"
        />
      ))}
    </div>
  );
}
