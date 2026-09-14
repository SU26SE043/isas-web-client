import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { RubricPreviewComparability, RubricPreviewRun } from '../../../types/rubricPreview.types';
import { compareRuns, computeVerdict } from '../../../utils/rubricPreviewVerdict';
import { formatPct } from './RubricPreviewResult';

const COMPARABILITY_VARIANT: Record<RubricPreviewComparability, 'success' | 'warning' | 'info'> = {
  same: 'success',
  rubricChanged: 'warning',
  promptChanged: 'info',
  bothChanged: 'warning',
};

export interface RubricPreviewHistoryProps {
  /** MỌI lượt (mới nhất trước, như GET trả). Lượt đang xem bị loại khỏi danh sách. */
  runs: RubricPreviewRun[];
  /** Mốc so sánh cho badge — lượt mới nhất. */
  latest: RubricPreviewRun;
  viewingId: string;
  isLoading?: boolean;
  onOpen: (runId: string) => void;
}

/** Số thứ tự theo THỜI GIAN (lượt cũ nhất = 1) — GET trả mới-nhất-trước nên phải đảo. */
export function runNumberOf(runs: RubricPreviewRun[], runId: string): number {
  const index = runs.findIndex((run) => run.id === runId);
  return index < 0 ? 0 : runs.length - index;
}

export function RubricPreviewHistory({ runs, latest, viewingId, isLoading = false, onOpen }: RubricPreviewHistoryProps) {
  const { t, language } = useLanguage();
  const others = runs.filter((run) => run.id !== viewingId);
  if (!others.length && !isLoading) return null;

  // Nhóm theo câu hỏi: hai lượt cùng câu mới đối chiếu được điểm với nhau; khác câu là khác đề bài.
  const groups = new Map<string, RubricPreviewRun[]>();
  for (const run of others) {
    const key = run.questionId ?? '';
    groups.set(key, [...(groups.get(key) ?? []), run]);
  }
  const formatDate = (value: string) => {
    const date = new Date(value);
    // Cùng một định dạng với header lượt (Result) — hai kiểu ngày trên một card là lỗi N7 của designer review.
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <section className="space-y-3 border-t border-satin pt-4" aria-label={t('employer.campaigns.rubricPreview.history.title')}>
      <h4 className="text-sm font-semibold text-foreground">{t('employer.campaigns.rubricPreview.history.title')}</h4>
      {isLoading ? <p className="text-xs text-muted-foreground" role="status">{t('employer.campaigns.rubricPreview.history.loading')}</p> : null}
      {[...groups.entries()].map(([questionId, group]) => (
        <div key={questionId || 'no-question'} className="space-y-2">
          <p className="line-clamp-1 text-xs text-muted-foreground">{group[0].questionText}</p>
          <ul className="space-y-1.5">
            {group.map((run) => {
              const comparability = compareRuns(run, latest);
              const verdict = run.status === 'Succeeded' ? computeVerdict(run, null) : null;
              return (
                <li key={run.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{t('employer.campaigns.rubricPreview.history.run').replace('{{n}}', String(runNumberOf(runs, run.id)))}</span>
                    <span className="text-xs text-muted-foreground">v{run.rubricVersion} · {formatDate(run.createdAt)}</span>
                    {run.status === 'Succeeded' ? (
                      <>
                        {/* Ba con số trên từng dòng: cùng thước đo mà 44→56→52 là NHIỄU bộ chấm — HR phải thấy điều đó (CAMP-19). */}
                        <span className="text-xs tabular-nums text-foreground" data-testid="history-scores">
                          {run.samples.filter((sample) => sample.band !== 'Custom').map((sample) => `${t(`employer.campaigns.rubricPreview.band.${sample.band}`)} ${formatPct(sample.actualWeightedPct)}`).join(' · ')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t(`employer.campaigns.rubricPreview.verdict.${verdict?.verdict ?? 'inconclusive'}`).replace('{{range}}', formatPct(verdict?.range ?? 0))}
                        </span>
                      </>
                    ) : (
                      <Badge variant={run.status === 'Failed' ? 'destructive' : 'info'}>
                        {run.status === 'Failed' ? t('employer.campaigns.rubricPreview.history.failed') : t('employer.campaigns.rubricPreview.history.running')}
                      </Badge>
                    )}
                    <Badge variant={COMPARABILITY_VARIANT[comparability]} data-comparability={comparability}>
                      {t(`employer.campaigns.rubricPreview.history.${comparability}`)}
                    </Badge>
                  </div>
                  <Button type="button" size="sm" variant="ghost" onClick={() => onOpen(run.id)}>
                    {t('employer.campaigns.rubricPreview.history.open')}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
