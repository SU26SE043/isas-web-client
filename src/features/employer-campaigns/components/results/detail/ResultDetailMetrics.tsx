import { Clock3, Gauge, MessageSquare, Trophy } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultItem, TranscriptQuestion } from '../../../types/campaign.api.types';
import { hasResultOverride, formatResultScore } from '../../../utils/campaignResultsActions';
import { formatDuration, totalAnswerDuration } from '../../../utils/resultDetailViewModel';

export function ResultDetailMetrics({ item, questions }: { item: CampaignResultItem; questions: TranscriptQuestion[] }) {
  const { t, language } = useLanguage();
  const duration = formatDuration(totalAnswerDuration(questions), language);
  const values = [
    [Trophy, t('employer.campaigns.results.detail.officialScore'), <>{formatResultScore(item.totalScore)}{hasResultOverride(item) ? <small className="mt-1 block font-normal text-info">{t('employer.campaigns.results.detail.hrAdjusted')}</small> : null}</>],
    [Gauge, t('employer.campaigns.results.detail.aiScore'), formatResultScore(item.aiScore)],
    [MessageSquare, t('employer.campaigns.results.detail.seedAnswered'), item.seedAnswered != null && item.seedTotal != null ? `${item.seedAnswered}/${item.seedTotal}` : '—'],
    [Clock3, t('employer.campaigns.results.detail.totalDuration'), duration ?? '—'],
  ] as const;
  return <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{values.map(([Icon, label, value]) => <div key={label} className="frame-satin rounded-xl bg-surface-raised p-4"><Icon className="size-4 text-muted-foreground" aria-hidden /><p className="mt-3 text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</p></div>)}</section>;
}
