import * as React from 'react';
import { ChevronDown, Pencil, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { RubricPreviewRun } from '../../../types/rubricPreview.types';
import { computeVerdict } from '../../../utils/rubricPreviewVerdict';
import { formatPct } from './formatPct';
import { RubricPreviewResultTable } from './RubricPreviewResultTable';
import { RubricPreviewVerdictBlock } from './RubricPreviewVerdictBlock';

export { formatPct };

const WARN_CHIP = 'rounded-lg border border-warning/30 bg-warning/5 px-2.5 py-1 text-xs leading-snug text-warning';

export function formatDelta(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (rounded > 0) return `+${rounded}`;
  if (rounded < 0) return `−${Math.abs(rounded)}`;
  return '0';
}

export interface RubricPreviewResultProps {
  run: RubricPreviewRun;
  /** Số thứ tự theo thời gian (1 = lượt đầu tiên của chiến dịch). */
  runNumber: number;
  passScorePct: number | null;
  onRerun?: () => void;
  onEditLevels?: () => void;
  onBackToLatest?: () => void;
  /** Đang chạy lượt mới ⇒ mờ kết quả cũ để HR không đọc nhầm là lượt vừa bấm. */
  dimmed?: boolean;
}

export function RubricPreviewResult({ run, runNumber, passScorePct, onRerun, onEditLevels, onBackToLatest, dimmed = false }: RubricPreviewResultProps) {
  const { t, language } = useLanguage();
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const verdict = computeVerdict(run, passScorePct);
  const bandLabel = (band: RubricPreviewRun['samples'][number]['band']) => t(`employer.campaigns.rubricPreview.band.${band}`);
  const created = new Date(run.createdAt);
  const dateLabel = Number.isNaN(created.getTime())
    ? run.createdAt
    : created.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const failed = run.status === 'Failed';

  return (
    <section
      className={cn('space-y-4', dimmed && 'pointer-events-none opacity-60')}
      aria-busy={dimmed || undefined}
      aria-label={t('employer.campaigns.rubricPreview.result.header').replace('{{n}}', String(runNumber)).replace('{{version}}', String(run.rubricVersion)).replace('{{date}}', dateLabel)}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {t('employer.campaigns.rubricPreview.result.header').replace('{{n}}', String(runNumber)).replace('{{version}}', String(run.rubricVersion)).replace('{{date}}', dateLabel)}
        </p>
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

      {!failed && run.samples.length ? (
        <>
          {/* Thứ tự đọc: KẾT LUẬN trước (3 giây biết ổn hay không) → việc cần làm → số liệu → cảnh báo → bảng chi tiết. */}
          <RubricPreviewVerdictBlock run={run} verdict={verdict} />

          {onRerun || onEditLevels ? (
            <div className="flex flex-wrap gap-2">
              {onEditLevels ? (
                <Button type="button" size="sm" variant="outline" onClick={onEditLevels}>
                  <Pencil className="size-3.5" aria-hidden />
                  {t('employer.campaigns.rubricPreview.editLevels')}
                </Button>
              ) : null}
              {onRerun ? (
                <Button type="button" size="sm" variant="outline" onClick={onRerun}>
                  <RotateCcw className="size-3.5" aria-hidden />
                  {t('employer.campaigns.rubricPreview.rerun')}
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className={cn('grid gap-3 grid-cols-1', run.samples.length >= 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3')} data-testid="preview-bands">
            {run.samples.map((sample) => {
              const isCustom = sample.band === 'Custom';
              return (
                <div key={sample.band} className="frame-satin rounded-xl bg-surface-overlay p-3" data-band={sample.band}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground">{bandLabel(sample.band)}</p>
                  <dl>
                    <div className="mt-2 flex items-baseline justify-between gap-2">
                      <dt className="text-xs text-muted-foreground">{t('employer.campaigns.rubricPreview.result.expected')}</dt>
                      <dd className="tabular-nums text-sm text-muted-foreground" data-role="expected">
                        {isCustom ? '—' : `${formatPct(sample.expectedWeightedPct)}%`}
                      </dd>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <dt className="text-xs text-muted-foreground">{t('employer.campaigns.rubricPreview.result.actual')}</dt>
                      <dd className="tabular-nums text-base font-semibold text-foreground" data-role="actual">
                        {formatPct(sample.actualWeightedPct)}%
                        {!isCustom ? (
                          <span className="ml-1 text-xs font-normal text-muted-foreground" title={t('employer.campaigns.rubricPreview.result.delta')}>
                            ({formatDelta(sample.actualWeightedPct - sample.expectedWeightedPct)})
                          </span>
                        ) : null}
                      </dd>
                    </div>
                  </dl>
                </div>
              );
            })}
          </div>

          {/* Câu cảnh báo dài ⇒ KHÔNG dùng Badge (h-5 + nowrap + overflow-hidden cắt cụt ở 375px); chip tự xuống dòng. */}
          <div className="flex flex-wrap items-center gap-2" data-testid="preview-warnings">
            {!run.deliveryMetricsAvailable ? <p className={WARN_CHIP}>{t('employer.campaigns.rubricPreview.warn.textOnly')}</p> : null}
            {run.lengthParityWarning ? <p className={WARN_CHIP}>{t('employer.campaigns.rubricPreview.warn.lengthParity')}</p> : null}
            {run.billed ? <Badge variant="info">{t('employer.campaigns.rubricPreview.warn.billed')}</Badge> : null}
          </div>

          <div className="space-y-3">
            <Button type="button" size="sm" variant="ghost" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((open) => !open)}>
              <ChevronDown className={cn('size-3.5 transition-transform', detailsOpen && 'rotate-180')} aria-hidden />
              {detailsOpen ? t('employer.campaigns.rubricPreview.details.hide') : t('employer.campaigns.rubricPreview.details.show')}
            </Button>
            {detailsOpen ? <RubricPreviewResultTable run={run} /> : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
