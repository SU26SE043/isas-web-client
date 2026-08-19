import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/shared/languages';

export interface JdAiSuggestBarProps {
  hasJd: boolean;
  hasRequirements: boolean;
  isLoading: boolean;
  isJdTooShort: boolean;
  atLimit: boolean;
  maxRequirements: number;
  isComposerOpen: boolean;
  minChars: number;
  onRequestAi: () => void;
  onCancelAi: () => void;
  onOpenComposer: () => void;
}

/**
 * The two ways to fill the list, with the emphasis swapping by state (D4):
 *
 *   JD, no requirements  →  AI is primary (its output doubles as the example
 *                           of what a requirement even looks like)
 *   at least one row     →  "+ Thêm yêu cầu" is primary, AI steps back
 *   no JD                →  the AI button is *absent*, not disabled — the API
 *                           rejects a call with neither jdText nor jdId
 *
 * AI never runs on its own; it always takes a press.
 */
export function JdAiSuggestBar({
  hasJd,
  hasRequirements,
  isLoading,
  isJdTooShort,
  atLimit,
  maxRequirements,
  isComposerOpen,
  minChars,
  onRequestAi,
  onCancelAi,
  onOpenComposer,
}: JdAiSuggestBarProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="frame-satin-soft flex flex-col gap-3 rounded-xl bg-white/[0.04] px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <Spinner className="size-4" label={t('cv.jd.ai.loading')} />
          {t('cv.jd.ai.loading')}
        </p>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="min-h-11 w-full sm:w-auto"
          onClick={onCancelAi}
        >
          {t('cv.jd.ai.cancel')}
        </Button>
      </div>
    );
  }

  const aiIsPrimary = hasJd && !hasRequirements;
  const showComposerButton = !isComposerOpen;
  const composerLabel = hasRequirements
    ? t('cv.jd.composer.add')
    : t('cv.jd.composer.addFirst');

  const aiButton = hasJd ? (
    <Button
      type="button"
      variant={aiIsPrimary ? 'default' : 'outline'}
      size="lg"
      className="min-h-11 w-full sm:w-auto"
      disabled={isJdTooShort || atLimit}
      onClick={onRequestAi}
    >
      <Sparkles aria-hidden />
      {aiIsPrimary ? t('cv.jd.ai.extractFirst') : t('cv.jd.ai.extractMore')}
    </Button>
  ) : null;

  // Never disabled, even at the cap: a dead button with no explanation is worse
  // than a composer that opens and says why it cannot take another row.
  const composerButton = showComposerButton ? (
    <Button
      type="button"
      variant={aiIsPrimary ? 'outline' : 'default'}
      size="lg"
      className="min-h-11 w-full sm:w-auto"
      onClick={onOpenComposer}
    >
      <Plus aria-hidden />
      {composerLabel}
    </Button>
  ) : null;

  const hint = atLimit
    ? t('cv.jd.requirements.limitReached').replace('{max}', String(maxRequirements))
    : isJdTooShort
      ? t('cv.jd.ai.tooShortHint').replace('{min}', String(minChars))
      : hasJd
        ? aiIsPrimary
          ? t('cv.jd.ai.freeHint')
          : t('cv.jd.ai.safeHint')
        : null;

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {aiIsPrimary ? (
          <>
            {aiButton}
            {composerButton}
          </>
        ) : (
          <>
            {composerButton}
            {aiButton}
          </>
        )}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
