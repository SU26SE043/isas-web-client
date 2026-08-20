import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CV_JD_TEXT_MAX_CHARS } from '@/features/cv-analysis/utils/buildCreateCvAnalysisRequest';
import type { JdWorkspace } from '@/features/cv-analysis/hooks/useJdWorkspace';
import { useLanguage } from '@/shared/languages';
import type { JdQuoteRange } from './jdQuoteLocator';
import { JdSavedFilesPopover } from './JdSavedFilesPopover';
import { JdSourceFileChip } from './JdSourceFileChip';
import { JdUploadButton } from './JdUploadButton';

export interface JdSourceEditorProps {
  workspace: JdWorkspace;
  highlight: JdQuoteRange | null;
  onClearHighlight: () => void;
}

const TEXT_BOX = 'block h-44 w-full rounded-xl border border-satin sm:h-64';

/**
 * Every metric the textarea and its highlight layer must agree on, set inline
 * rather than through utility classes: a `<textarea>` and a `<div>` resolve the
 * same Tailwind classes differently (font stack and line-height both drifted
 * here), and a few pixels of drift per line puts the highlight on the wrong
 * words further down a long JD.
 */
const TEXT_METRICS: CSSProperties = {
  fontFamily: 'inherit',
  fontSize: '0.875rem',
  lineHeight: '1.5rem',
  letterSpacing: 'normal',
  padding: '0.75rem 1rem',
  borderWidth: '1px',
  borderStyle: 'solid',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  wordBreak: 'normal',
  tabSize: 4,
  scrollbarGutter: 'stable',
};

/**
 * The JD textarea is the primary interaction of step (2) (J15).
 * Uploading a file or picking a saved JD only *loads text into it* — there is
 * exactly one JD, and it is whatever this box currently holds.
 */
export function JdSourceEditor({ workspace, highlight, onClearHighlight }: JdSourceEditorProps) {
  const { t } = useLanguage();
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { jdText, source, fileLoadStatus, fileLoadError } = workspace;
  const length = jdText.length;
  const tooLong = length > CV_JD_TEXT_MAX_CHARS;

  useEffect(() => {
    const textarea = textareaRef.current;
    const mark = markRef.current;
    if (!highlight || !textarea || !mark) return;
    const target = Math.max(0, mark.offsetTop - textarea.clientHeight / 2);
    textarea.scrollTop = target;
    if (overlayRef.current) overlayRef.current.scrollTop = target;
  }, [highlight]);

  const syncScroll = () => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;
    if (!textarea || !overlay) return;
    overlay.scrollTop = textarea.scrollTop;
    overlay.scrollLeft = textarea.scrollLeft;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor={textareaId} className="text-sm font-semibold text-foreground">
          {t('cv.jd.source.label')}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <JdUploadButton
            onUploaded={(file) => void workspace.loadJdFile(file)}
            onError={setUploadError}
          />
          <JdSavedFilesPopover
            selectedFileId={source.kind === 'file' ? source.fileId : null}
            onSelect={(file) => void workspace.loadJdFile(file)}
          />
        </div>
      </div>

      {uploadError ? (
        <p role="alert" className="rounded-lg border border-error/30 bg-error-bg px-3 py-2 text-xs text-foreground">
          {uploadError}
        </p>
      ) : null}

      {source.kind === 'file' ? (
        <JdSourceFileChip
          source={source}
          status={fileLoadStatus}
          error={fileLoadError}
          onReload={() => void workspace.reloadJdFile()}
          onClear={workspace.clearJd}
        />
      ) : null}

      <div className="relative">
        <div
          ref={overlayRef}
          aria-hidden
          style={TEXT_METRICS}
          className={cn(
            TEXT_BOX,
            'pointer-events-none absolute inset-0 overflow-hidden border-transparent text-transparent',
          )}
        >
          {highlight ? (
            <>
              {jdText.slice(0, highlight.start)}
              <mark ref={markRef} className="rounded-sm bg-info/35 text-transparent">
                {jdText.slice(highlight.start, highlight.end)}
              </mark>
              {jdText.slice(highlight.end)}
            </>
          ) : null}
        </div>
        <textarea
          id={textareaId}
          ref={textareaRef}
          // The JD box is the primary interaction of the step, so arriving on
          // an empty one lands the caret in it — which also keeps keyboard
          // focus inside the wizard after "Tiếp theo" unmounts step (1).
          // Only when empty: returning from step (3) to a JD already written
          // must not yank the page (or a phone keyboard) back up here.
          autoFocus={jdText.length === 0}
          value={jdText}
          onChange={(event) => workspace.setJdText(event.target.value)}
          onScroll={syncScroll}
          placeholder={t('cv.jd.source.placeholder')}
          style={TEXT_METRICS}
          className={cn(
            TEXT_BOX,
            'relative resize-none overflow-y-auto bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:border-[var(--border-focus)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[color-mix(in_srgb,var(--isas-silver-100)_22%,transparent)]',
          )}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{t('cv.jd.source.hint')}</p>
        <p className={tooLong ? 'text-xs font-medium text-error' : 'text-xs text-muted-foreground'}>
          {t('cv.jd.source.charCount')
            .replace('{count}', length.toLocaleString())
            .replace('{max}', CV_JD_TEXT_MAX_CHARS.toLocaleString())}
        </p>
      </div>

      {tooLong ? (
        <p role="alert" className="text-xs text-error">
          {t('cv.jd.source.tooLong').replace('{max}', CV_JD_TEXT_MAX_CHARS.toLocaleString())}
        </p>
      ) : null}

      {highlight ? (
        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          <span className="text-caption">{t('cv.jd.source.highlightLabel')}</span>
          <Button type="button" variant="ghost" size="sm" onClick={onClearHighlight}>
            {t('cv.jd.source.clearHighlight')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
