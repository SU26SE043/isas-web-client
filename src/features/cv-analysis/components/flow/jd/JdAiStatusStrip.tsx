import { useEffect, useState } from 'react';
import { AlertCircle, Info, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { JdMergeOutcome } from '@/features/cv-analysis/hooks/useJdWorkspace';
import type { ResolvedJdError } from '@/features/cv-analysis/utils/resolveJdError';
import { useLanguage } from '@/shared/languages';

export interface JdAiStatusStripProps {
  merge: JdMergeOutcome | null;
  error: ResolvedJdError | null;
  notice: string | null;
  onUndoMerge: () => void;
  onDismissMerge: () => void;
  onRetry: () => void;
  onDismissNotice: () => void;
}

/** Real countdown from `Retry-After` — not a guess, not a spinner (429 UX). */
function useCountdown(seconds: number | null): number {
  const [remaining, setRemaining] = useState(seconds ?? 0);

  useEffect(() => {
    setRemaining(seconds ?? 0);
    if (!seconds || seconds <= 0) return;
    const handle = setInterval(() => {
      setRemaining((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => clearInterval(handle);
  }, [seconds]);

  return remaining;
}

export function JdAiStatusStrip({
  merge,
  error,
  notice,
  onUndoMerge,
  onDismissMerge,
  onRetry,
  onDismissNotice,
}: JdAiStatusStripProps) {
  const { t } = useLanguage();
  const remaining = useCountdown(error?.retryAfterSeconds ?? null);
  const isRateLimited = error?.code === 'rateLimited';

  // The live region has to already exist when the text lands in it — a region
  // that appears together with its first message is not reliably announced.
  // So the element is always mounted and only collapses out of sight.
  const isEmpty = !merge && !error && !notice;

  return (
    <div className={isEmpty ? 'sr-only' : 'space-y-2'} aria-live="polite">
      {merge ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-info/30 bg-info/10 px-3 py-2.5">
          <Sparkles className="size-4 shrink-0 text-info" aria-hidden />
          {/* `basis-full` puts the sentence on its own line at 375px instead of
              letting the two buttons squeeze it into a four-word column. */}
          <p className="min-w-0 flex-1 basis-full text-sm text-foreground sm:basis-auto">
            {t('cv.jd.ai.mergeAdded').replace('{count}', String(merge.addedCount))}
            {merge.skippedDuplicateCount > 0
              ? ` · ${t('cv.jd.ai.mergeSkipped').replace('{count}', String(merge.skippedDuplicateCount))}`
              : ''}
            {merge.skippedOverLimitCount > 0
              ? ` · ${t('cv.jd.ai.mergeOverLimit').replace('{count}', String(merge.skippedOverLimitCount))}`
              : ''}
          </p>
          {/* Undo is the only way back from a merge, so it keeps a 44pt target
              on touch screens — same rule as the row menu. */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11 sm:min-h-8"
            onClick={onUndoMerge}
          >
            {t('cv.jd.row.undo')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-11 sm:size-8"
            aria-label={t('cv.jd.ai.mergeDismiss')}
            onClick={onDismissMerge}
          >
            <X aria-hidden />
          </Button>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-error/30 bg-error-bg px-3 py-2.5">
          <p className="flex items-start gap-2 text-sm text-foreground">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" aria-hidden />
            <span className="min-w-0">{error.message}</span>
          </p>
          {isRateLimited ? (
            <p className="mt-1 pl-6 text-xs text-muted-foreground">
              {t('cv.jd.ai.rateLimitedHint')}
            </p>
          ) : null}
          {error.retryable ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 ml-6 min-h-11 sm:min-h-8"
              disabled={remaining > 0}
              onClick={onRetry}
            >
              {remaining > 0
                ? t('cv.jd.ai.retryIn').replace('{seconds}', String(remaining))
                : t('cv.jd.ai.retry')}
            </Button>
          ) : null}
        </div>
      ) : null}

      {notice ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-satin bg-white/[0.04] px-3 py-2.5">
          <Info className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="min-w-0 flex-1 basis-full text-sm text-foreground sm:basis-auto">{notice}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-11 sm:size-8"
            aria-label={t('cv.jd.ai.mergeDismiss')}
            onClick={onDismissNotice}
          >
            <X aria-hidden />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
