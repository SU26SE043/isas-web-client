import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { RubricPreviewComparability, RubricPreviewRun } from '../../../types/rubricPreview.types';
import { compareRuns, customSampleOf } from '../../../utils/rubricPreviewVerdict';
import { formatRunTime } from './formatRunTime';
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
  /** Trong card một câu: gập sẵn (tóm tắt kèm số lượt) và không in lại đề — mọi lượt đều cùng câu đó. */
  compact?: boolean;
}

export function RubricPreviewHistory({ runs, latest, viewingId, isLoading = false, onOpen, compact = false }: RubricPreviewHistoryProps) {
  const { t } = useLanguage();
  const others = runs.filter((run) => run.id !== viewingId);
  if (!others.length && !isLoading) return null;

  // Nhóm theo câu hỏi: hai lượt cùng câu mới đối chiếu được điểm với nhau; khác câu là khác đề bài.
  const groups = new Map<string, RubricPreviewRun[]>();
  for (const run of others) {
    const key = run.questionId ?? '';
    groups.set(key, [...(groups.get(key) ?? []), run]);
  }

  const body = (
    <>
      {isLoading ? <p className="text-xs text-muted-foreground" role="status">{t('employer.campaigns.rubricPreview.history.loading')}</p> : null}
      {[...groups.entries()].map(([questionId, group]) => (
        <div key={questionId || 'no-question'} className="space-y-2">
          {compact ? null : <p className="line-clamp-1 text-xs text-muted-foreground">{group[0].questionText}</p>}
          <ul className="space-y-1.5">
            {group.map((run) => <HistoryRow key={run.id} run={run} latest={latest} onOpen={onOpen} />)}
          </ul>
        </div>
      ))}
    </>
  );

  if (compact) {
    return (
      <details className="group border-t border-satin pt-3" aria-label={t('employer.campaigns.rubricPreview.history.title')}>
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
          <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden />
          {t('employer.campaigns.rubricPreview.history.titleCount').replace('{{n}}', String(others.length))}
        </summary>
        <div className="mt-3 space-y-3">{body}</div>
      </details>
    );
  }

  return (
    <section className="space-y-3 border-t border-satin pt-4" aria-label={t('employer.campaigns.rubricPreview.history.title')}>
      <h4 className="text-sm font-semibold text-foreground">{t('employer.campaigns.rubricPreview.history.title')}</h4>
      {body}
    </section>
  );
}

function HistoryRow({ run, latest, onOpen }: { run: RubricPreviewRun; latest: RubricPreviewRun; onOpen: (runId: string) => void }) {
  const { t, language } = useLanguage();
  const comparability = compareRuns(run, latest);
  const mine = run.status === 'Succeeded' ? customSampleOf(run) : null;
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {/* Giờ là nhãn của lượt — cùng định dạng header kết quả (hai kiểu ngày trên một card là lỗi N7 designer review). */}
        <time dateTime={run.createdAt} className="font-medium tabular-nums text-foreground">{formatRunTime(run.createdAt, language)}</time>
        <span className="text-xs text-muted-foreground">v{run.rubricVersion}</span>
        {run.status === 'Succeeded' ? (
          // Điểm bài của người dùng ở từng lượt: cùng thước đo mà 62→48→55 là NHIỄU bộ chấm — phải thấy được.
          <span className="text-xs tabular-nums text-foreground" data-testid="history-scores">
            {mine
              ? t('employer.campaigns.rubricPreview.history.score').replace('{{pct}}', formatPct(mine.actualWeightedPct))
              : t('employer.campaigns.rubricPreview.history.legacy')}
          </span>
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
}
