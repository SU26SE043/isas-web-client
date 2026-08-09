import { Maximize, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/shared/languages';
import { useInterviewFullscreen } from '../../hooks/useInterviewFullscreen';

export function FullscreenExitBanner() {
  const { t } = useLanguage();
  const fullscreen = useInterviewFullscreen();
  const [unsupportedDismissed, setUnsupportedDismissed] = useState(false);
  const showUnsupported = !fullscreen.supported && !unsupportedDismissed;
  const showExitWarning = fullscreen.hasExitedFullscreen && !fullscreen.isFullscreen;

  if ((!showUnsupported && !showExitWarning) || fullscreen.isFullscreen) return null;

  const handleReenter = async () => {
    await fullscreen.enterFullscreen();
  };

  return (
    <div role="alert" className="border-b border-warning/30 bg-warning/10 px-4 py-3 text-warning sm:px-6">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 text-sm">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {showUnsupported ? t('practice.fullscreen.unsupportedTitle') : t('practice.fullscreen.exitedTitle')}
          </p>
          <p className="mt-1 text-warning/85">
            {showUnsupported ? t('practice.fullscreen.unsupportedDescription') : t('practice.fullscreen.exitedDescription')}
          </p>
        </div>
        {!showUnsupported ? (
          <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => void handleReenter()}>
            <Maximize className="size-4" aria-hidden />
            {t('practice.fullscreen.reenter')}
          </button>
        ) : null}
        <button
          type="button"
          className="rounded-lg p-2 text-warning/80 transition-colors hover:bg-warning/10 hover:text-warning"
          aria-label={t('practice.fullscreen.continue')}
          onClick={() => {
            if (showUnsupported) setUnsupportedDismissed(true);
            else fullscreen.dismissFullscreenWarning();
          }}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
