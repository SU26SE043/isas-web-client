import { Clock3, Gauge, MessageSquare, Trophy } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultItem, TranscriptQuestion } from '../../../types/campaign.api.types';
import { hasResultOverride, formatResultScore } from '../../../utils/campaignResultsActions';
import { formatDuration, totalAnswerDuration } from '../../../utils/resultDetailViewModel';

/** 4 số liệu đầu trang. 2 cột từ mobile (giá trị ngắn, xếp 1 cột là 4 ô cao vô ích), 4 cột từ lg. */
export function ResultDetailMetrics({ item, questions }: { item: CampaignResultItem; questions: TranscriptQuestion[] }) {
  const { t, language } = useLanguage();
  const duration = formatDuration(totalAnswerDuration(questions), language);
  const seed = item.seedAnswered != null && item.seedTotal != null ? `${item.seedAnswered}/${item.seedTotal}` : '—';
  const values = [
    [Trophy, t('employer.campaigns.results.detail.officialScore'), formatResultScore(item.totalScore), hasResultOverride(item) ? t('employer.campaigns.results.detail.hrAdjusted') : null],
    [Gauge, t('employer.campaigns.results.detail.aiScore'), formatResultScore(item.aiScore), null],
    [MessageSquare, t('employer.campaigns.results.detail.seedAnswered'), seed, null],
    [Clock3, t('employer.campaigns.results.detail.totalDuration'), duration ?? '—', null],
  ] as const;
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {values.map(([Icon, label, value, note]) => (
        <div key={label} className="frame-satin rounded-xl bg-surface-raised p-4">
          <Icon className="size-4 text-muted-foreground" aria-hidden />
          <p className="mt-3 text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</p>
          {note ? <small className="mt-1 block text-xs font-medium text-info">{note}</small> : null}
        </div>
      ))}
    </section>
  );
}
