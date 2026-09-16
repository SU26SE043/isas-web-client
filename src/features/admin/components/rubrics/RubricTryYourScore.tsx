import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/languages';
import { SpeechMetricsPanel } from '@/features/practice/components/result/SpeechMetricsPanel';
import type { PracticeSpeakingMetrics } from '@/features/practice/types/b2cPracticeSession.types';
import type { AdminDeliveryMetrics, AdminRubricPreviewRun, AdminRubricPreviewSample } from '../../types/adminApi.types';

interface RubricTryYourScoreProps {
  run: AdminRubricPreviewRun;
  sample: AdminRubricPreviewSample;
}

/**
 * Số đo BE (`DeliveryMetricsDto`) → shape panel kết quả phòng luyện đang dùng — tái dùng nguyên UI.
 * `silenceRatio` BE là TỈ LỆ 0–1 còn panel in thẳng kèm "%" ⇒ phải ×100 ở đây (đo trên dev: 0,115 hiện
 * "0.1%"). Màn kết quả luyện B2C đang mang đúng lỗi này — việc riêng, không sửa lây ở đây.
 */
export function toSpeakingMetrics(m: AdminDeliveryMetrics): PracticeSpeakingMetrics {
  return {
    speechRate: m.speechRateWpm, longestPauseSec: m.longestPauseSec, hesitationCount: m.pauseCount,
    silenceRatio: m.silenceRatio === null ? null : Math.round(m.silenceRatio * 1000) / 10,
    fillerWordCount: m.fillerCount, audioDurationSec: m.audioSec,
    speechSec: m.speechSec, wordCount: m.wordCount, fillerPer100Words: m.fillerPer100Words,
    fillerBreakdown: m.fillerBreakdown,
  };
}

const pct = (value: number) => Math.round(value);
const level = (score: number, max: number) => (max > 0 ? (score / max) * 5 : 0);

/**
 * Kết quả cho BÀI CỦA CHÍNH NGƯỜI DÙNG — trả lời "tôi được bao nhiêu, vì sao" trong 3 giây:
 * một con số to, rồi từng tiêu chí với MỘT câu lý do trích từ bài (thứ thuyết phục nhất).
 * Không có cột "Kỳ vọng": kỳ vọng chỉ có nghĩa với bài AI viết theo mức định trước.
 * Tiêu chí ĐO từ bản ghi được gắn nhãn (cờ `measured` do BE đặt); dán tay thì hàng đó vắng và
 * chip nói thẳng "không chấm — điểm tổng tính trên các tiêu chí còn lại" để không ai tưởng mình 0.
 */
export function RubricTryYourScore({ run, sample }: RubricTryYourScoreProps) {
  const { t } = useLanguage();
  const measuredRows = sample.scores.filter((s) => s.measured);
  const aiRows = sample.scores.filter((s) => !s.measured);
  const avgLevel = sample.scores.length ? sample.scores.reduce((sum, s) => sum + level(s.actualScore, s.maxScore), 0) / sample.scores.length : 0;
  const scoredCount = sample.scores.length;
  const rubricCount = run.rubric.length + (measuredRows.length ? 0 : 1);   // rubric snapshot không chứa tiêu chí đo

  return (
    <section className="space-y-4" aria-label={t('admin.rubrics.try.result.yours')}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <div className="rounded-xl border border-satin bg-surface-overlay/60 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{t('admin.rubrics.try.result.yours')}</p>
          <p className="mt-1 text-4xl font-semibold tabular-nums text-foreground">{pct(sample.actualPct)}<span className="text-base font-normal text-muted-foreground"> / 100</span></p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('admin.rubrics.try.result.avgLevel').replace('{level}', avgLevel.toFixed(1)).replace('{count}', String(scoredCount))}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{t('admin.rubrics.try.result.meta').replace('{words}', String(sample.wordCount)).replace('{version}', String(run.rubricVersion))}</p>
        </div>
        <div className="rounded-xl border border-satin bg-surface-overlay/60 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{t('admin.rubrics.try.result.speech.title')}</p>
          {sample.deliveryMetrics ? (
            <>
              <SpeechMetricsPanel metrics={toSpeakingMetrics(sample.deliveryMetrics)} />
              {measuredRows.length
                ? measuredRows.map((row) => (
                  <p key={row.criterionId} className="mt-2 text-sm text-foreground">
                    <Badge variant="info">{t('admin.rubrics.try.result.measuredBadge')}</Badge>{' '}
                    {t('admin.rubrics.try.result.fluencyMeasured').replace('{name}', row.criterionName).replace('{score}', String(row.actualScore)).replace('{max}', String(row.maxScore))}
                  </p>
                ))
                : <p className="mt-2 text-sm text-warning">{t('admin.rubrics.try.result.fluencyTooShort')}</p>}
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{t('admin.rubrics.try.result.fluencySkipped').replace('{count}', String(rubricCount - 1))}</p>
          )}
        </div>
      </div>

      <ul className="divide-y divide-satin rounded-xl border border-satin" aria-label={t('admin.rubrics.try.result.perCriterion')}>
        {[...aiRows, ...measuredRows].map((row) => (
          <li key={row.criterionId} className="space-y-1 p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-foreground">
                {row.criterionName}
                {row.measured ? <span className="ml-2 text-xs font-normal text-info">{t('admin.rubrics.try.result.measuredBadge')}</span> : null}
              </span>
              <span className="text-sm tabular-nums text-foreground">{row.actualScore}<span className="text-muted-foreground">/{row.maxScore}</span></span>
            </div>
            {row.reasoning ? (
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="line-clamp-2 italic">{row.reasoning}</span>
                  <span className="text-xs text-info">{t('admin.rubrics.try.result.showReason')}</span>
                </summary>
                <p className="mt-1 whitespace-pre-wrap not-italic">{row.reasoning}</p>
              </details>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
