import { useEffect, useId, useRef, useState } from 'react';
import { FileText, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useInterviewFiles } from '@/features/cv-analysis/hooks/useInterviewFiles';
import {
  formatProfileFileDate,
  formatProfileFileSize,
} from '@/features/profile/components/profile-view/profileFileUtils';
import { useLanguage } from '@/shared/languages';

export interface JdSavedFilesPopoverProps {
  selectedFileId: string | null;
  disabled?: boolean;
  onSelect: (file: { id: string; name: string }) => void;
}

/**
 * "JD đã lưu" picker for the JD step.
 *
 * Deliberately *not* `CvFlowUploadedFilesPanel`: that panel is still the CV
 * step's file grid, and a saved JD here is not a selectable object competing
 * with the textarea — it only loads text into it.
 */
export function JdSavedFilesPopover({
  selectedFileId,
  disabled = false,
  onSelect,
}: JdSavedFilesPopoverProps) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const { files, isLoading, error, reload, hasMore, isLoadingMore, loadMore } = useInterviewFiles({
    fileType: 'jd',
    limit: 8,
  });

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="min-h-11"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <FolderOpen aria-hidden />
        {t('cv.jd.source.saved')}
      </Button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={t('cv.jd.saved.title')}
          className={cn(
            'frame-satin rounded-xl bg-popover p-3 shadow-[var(--shadow-lg)]',
            // Anchoring to the trigger would push the panel off the left edge
            // of a 375px screen, so mobile gets a sheet instead.
            'fixed inset-x-4 bottom-4 z-40 max-h-[75vh] overflow-y-auto',
            'sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:z-30 sm:mt-2 sm:max-h-none sm:w-[22rem] sm:overflow-visible',
          )}
        >
          <p className="text-sm font-semibold text-foreground">{t('cv.jd.saved.title')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('cv.jd.saved.description')}</p>

          <div className="mt-3 max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2" aria-hidden>
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            ) : null}

            {!isLoading && error ? (
              <div className="rounded-lg border border-dashed border-subtle px-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">{t('cv.uploadedFilesLoadError')}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => void reload()}
                >
                  {t('cv.uploadedFilesRetry')}
                </Button>
              </div>
            ) : null}

            {!isLoading && !error && files.length === 0 ? (
              <div className="rounded-lg border border-dashed border-subtle px-3 py-6 text-center">
                <p className="text-sm font-medium text-foreground">{t('cv.uploadedJdEmpty')}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t('cv.jd.saved.emptyHint')}</p>
              </div>
            ) : null}

            {!isLoading && !error && files.length > 0 ? (
              <ul className="space-y-1">
                {files.map((file) => {
                  const isSelected = file.id === selectedFileId;
                  return (
                    <li key={file.id}>
                      <button
                        type="button"
                        aria-current={isSelected || undefined}
                        onClick={() => {
                          setOpen(false);
                          onSelect({ id: file.id, name: file.originalName });
                        }}
                        className={cn(
                          'flex min-h-11 w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
                          isSelected ? 'bg-white/[0.08]' : null,
                        )}
                      >
                        <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {file.originalName}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {formatProfileFileSize(file.fileSize)} ·{' '}
                            {formatProfileFileDate(file.createdAt, language)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-satin pt-3">
            {hasMore ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                loading={isLoadingMore}
                onClick={() => void loadMore()}
              >
                {t('cv.jd.saved.loadMore')}
              </Button>
            ) : (
              <span />
            )}
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              {t('cv.jd.saved.close')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
