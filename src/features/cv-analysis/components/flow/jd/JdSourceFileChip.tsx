import { AlertTriangle, CheckCircle2, FileText, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { JdFileLoadStatus, JdSource } from '@/features/cv-analysis/hooks/useJdWorkspace';
import { useLanguage } from '@/shared/languages';

export interface JdSourceFileChipProps {
  source: Extract<JdSource, { kind: 'file' }>;
  status: JdFileLoadStatus;
  error: string | null;
  onReload: () => void;
  onClear: () => void;
}

/**
 * The "where this text came from" chip.
 *
 * O3 — once the text is edited away from the file (`detached`), the request
 * carries `jdText` instead of `jdId` and the report loses the link back to the
 * original PDF. The user accepted that trade, but they must read it *here*,
 * before spending a credit — not discover it in the finished report.
 */
export function JdSourceFileChip({
  source,
  status,
  error,
  onReload,
  onClear,
}: JdSourceFileChipProps) {
  const { t } = useLanguage();
  const canReload = status === 'pending' || status === 'failed';

  return (
    <div className="frame-satin-soft rounded-xl bg-white/[0.04] px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-caption shrink-0">{t('cv.jd.source.fromFile')}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground" title={source.fileName}>
          {source.fileName}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11 sm:min-h-8 sm:min-w-8"
          aria-label={t('cv.jd.source.clearFile')}
          onClick={onClear}
        >
          <X aria-hidden />
        </Button>
      </div>

      <p className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        {status === 'loading' ? (
          <>
            <Spinner className="size-3" label={t('cv.jd.source.reading')} />
            {t('cv.jd.source.reading')}
          </>
        ) : null}
        {status === 'ready' ? (
          <>
            <CheckCircle2 className="size-3.5 text-success" aria-hidden />
            {t('cv.jd.source.ready')}
          </>
        ) : null}
        {status === 'pending' ? (
          <>
            <AlertTriangle className="size-3.5 text-warning" aria-hidden />
            {t('cv.jd.parsePending')}
          </>
        ) : null}
        {status === 'failed' ? (
          <>
            <AlertTriangle className="size-3.5 text-error" aria-hidden />
            {error ?? t('cv.jd.parseFailed')}
          </>
        ) : null}
      </p>

      {canReload ? (
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={onReload}>
          <RotateCcw aria-hidden />
          {t('cv.jd.source.reload')}
        </Button>
      ) : null}

      {source.detached ? (
        <p className="mt-2 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-bg px-2.5 py-2 text-xs text-foreground">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
          <span>{t('cv.jd.source.detachedNotice')}</span>
        </p>
      ) : null}
    </div>
  );
}
