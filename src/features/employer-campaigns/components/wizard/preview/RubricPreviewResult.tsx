import { Pencil } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { RubricPreviewRun } from '../../../types/rubricPreview.types';
import { customSampleOf, passesThreshold } from '../../../utils/rubricPreviewVerdict';
import { formatPct } from './formatPct';

export { formatPct };

export interface RubricPreviewResultProps {
  run: RubricPreviewRun;
  /** Số thứ tự theo thời gian (1 = lượt đầu tiên của câu). */
  runNumber: number;
  passScorePct: number | null;
  onEditLevels?: () => void;
  onBackToLatest?: () => void;
  /** Đang chạy lượt mới ⇒ mờ kết quả cũ để người dùng không đọc nhầm là lượt vừa bấm. */
  dimmed?: boolean;
}

/**
 * Kết quả chấm thử — 2026-10-03 CHỈ còn câu trả lời người dùng tự nhập (band `Custom`): một con số, Đạt/Chưa đạt
 * theo ngưỡng, rồi từng tiêu chí kèm mức + lý do trích từ bài. Không còn 3 bài AI Yếu/Khá/Xuất sắc và kết luận
 * "thứ tự / biên độ" dựng trên chúng. Lượt CŨ chỉ có bài AI ⇒ nói rõ là lượt cũ, không vẽ lại bảng 3 bài.
 */
export function RubricPreviewResult({ run, runNumber, passScorePct, onEditLevels, onBackToLatest, dimmed = false }: RubricPreviewResultProps) {
  const { t, language } = useLanguage();
  const created = new Date(run.createdAt);
  const dateLabel = Number.isNaN(created.getTime())
    ? run.createdAt
    : created.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const header = t('employer.campaigns.rubricPreview.result.header')
    .replace('{{n}}', String(runNumber)).replace('{{version}}', String(run.rubricVersion)).replace('{{date}}', dateLabel);
  const failed = run.status === 'Failed';
  const mine = run.status === 'Succeeded' ? customSampleOf(run) : null;
  const passed = mine ? passesThreshold(mine.actualWeightedPct, passScorePct) : null;

  return (
    <section className={cn('space-y-4', dimmed && 'pointer-events-none opacity-60')} aria-busy={dimmed || undefined} aria-label={header}>
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-foreground">{header}</p>
        <p className="text-xs text-muted-foreground">
          {t('employer.campaigns.rubricPreview.result.question')}: <span className="text-foreground">{run.questionText}</span>
        </p>
        {onBackToLatest ? (
          <p className="text-xs text-muted-foreground">
            {t('employer.campaigns.rubricPreview.result.viewingOld')}{' '}
            <button type="button" className="underline underline-offset-4 text-foreground" onClick={onBackToLatest}>
              {t('employer.campaigns.rubricPreview.result.backToLatest')}
            </button>
          </p>
        ) : null}
      </div>

      {failed ? (
        <Alert variant="error">
          <AlertDescription>
            {run.errorReason
              ? t('employer.campaigns.rubricPreview.result.failed').replace('{{reason}}', run.errorReason)
              : t('employer.campaigns.rubricPreview.result.failedUnknown')}
          </AlertDescription>
        </Alert>
      ) : null}

      {run.status === 'Succeeded' && !mine ? (
        <p className="text-sm text-muted-foreground" data-testid="preview-legacy">{t('employer.campaigns.rubricPreview.result.legacyAiOnly')}</p>
      ) : null}

      {mine ? (
        <>
          <div className="grid gap-3 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
            <div className="rounded-xl border border-satin bg-surface-overlay/60 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{t('employer.campaigns.rubricPreview.result.yourScore')}</p>
              <p className="mt-1 text-4xl font-semibold tabular-nums text-foreground" data-testid="preview-score">
                {formatPct(mine.actualWeightedPct)}<span className="text-base font-normal text-muted-foreground"> / 100</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {passed != null ? (
                  <Badge variant={passed ? 'success' : 'warning'} data-testid="preview-pass">
                    {t(passed ? 'employer.campaigns.rubricPreview.result.pass' : 'employer.campaigns.rubricPreview.result.fail')
                      .replace('{{pct}}', formatPct(passScorePct ?? 0))}
                  </Badge>
                ) : null}
                {run.billed ? <Badge variant="info">{t('employer.campaigns.rubricPreview.warn.billed')}</Badge> : null}
              </div>
            </div>
            <div className="min-w-0 rounded-xl border border-satin bg-surface-overlay/60 p-4">
              <details>
                <summary className="cursor-pointer text-sm font-medium text-foreground">
                  {t('employer.campaigns.rubricPreview.result.answer').replace('{{n}}', String(mine.wordCount))}
                </summary>
                <p className="mt-2 max-h-60 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground">{mine.answerText}</p>
              </details>
              {!run.deliveryMetricsAvailable ? (
                <p className="mt-2 text-xs leading-snug text-muted-foreground">{t('employer.campaigns.rubricPreview.warn.textOnly')}</p>
              ) : null}
            </div>
          </div>

          <ul className="divide-y divide-satin rounded-xl border border-satin" aria-label={t('employer.campaigns.rubricPreview.result.perCriterion')}>
            {mine.scores.map((row) => (
              <li key={row.criterionId} className="space-y-1 p-3" data-criterion={row.criterionId}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{row.criterionName}</span>
                  <span className="flex items-baseline gap-2 text-sm tabular-nums text-foreground">
                    {row.levelMatched != null ? (
                      <span className="text-xs text-muted-foreground">
                        {t('employer.campaigns.rubricPreview.result.level').replace('{{level}}', String(row.levelMatched))}
                      </span>
                    ) : null}
                    <span data-role="score">{row.actualScore}<span className="text-muted-foreground">/{row.maxScore}</span></span>
                  </span>
                </div>
                {row.reasoning?.trim() ? (
                  <details className="text-sm text-muted-foreground">
                    <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <span className="line-clamp-2 italic">{row.reasoning}</span>
                      <span className="text-xs text-info">{t('employer.campaigns.rubricPreview.result.showReason')}</span>
                    </summary>
                    <p className="mt-1 whitespace-pre-wrap not-italic">{row.reasoning}</p>
                  </details>
                ) : null}
              </li>
            ))}
          </ul>

          {onEditLevels ? (
            <Button type="button" size="sm" variant="outline" onClick={onEditLevels}>
              <Pencil className="size-3.5" aria-hidden />
              {t('employer.campaigns.rubricPreview.editLevels')}
            </Button>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
