import { Maximize, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/shared/languages';
import { useInterviewFullscreen } from '../../hooks/useInterviewFullscreen';

interface FullscreenExitBannerProps {
  onBlockingChange?: (isBlocking: boolean) => void;
}

export function FullscreenExitBanner({ onBlockingChange }: FullscreenExitBannerProps) {
  const { t } = useLanguage();
  const fullscreen = useInterviewFullscreen();
  const [unsupportedDismissed, setUnsupportedDismissed] = useState(false);
  const [reenterFailed, setReenterFailed] = useState(false);
  const showUnsupported = !fullscreen.supported && !unsupportedDismissed;
  const showExitWarning = fullscreen.hasExitedFullscreen && !fullscreen.isFullscreen;
  const isBlocking = showExitWarning && !showUnsupported;

  useEffect(() => {
    onBlockingChange?.(isBlocking);
    return () => onBlockingChange?.(false);
  }, [isBlocking, onBlockingChange]);

  if ((!showUnsupported && !showExitWarning) || fullscreen.isFullscreen) return null;

  const handleReenter = async () => {
    const result = await fullscreen.enterFullscreen();
    setReenterFailed(!result.entered);
  };

  if (showExitWarning) {
    return (
      <div role="dialog" aria-modal="true" aria-labelledby="fullscreen-exited-title" className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4">
        <div className="w-full max-w-md rounded-2xl border border-warning/30 bg-surface-raised p-6 text-foreground shadow-xl">
          <h2 id="fullscreen-exited-title" className="text-lg font-semibold">{t('practice.fullscreen.exitedTitle')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('practice.fullscreen.exitedDescription')}</p>
          <p className="mt-3 text-sm font-medium text-warning">{t('practice.fullscreen.paused')}</p>
          {reenterFailed ? <p role="alert" className="mt-3 text-sm text-error">{t('practice.fullscreen.reenterFailed')}</p> : null}
          <button type="button" className="btn-primary mt-5 inline-flex items-center gap-2" onClick={() => void handleReenter()}>
            <Maximize className="size-4" aria-hidden />
            {t('practice.fullscreen.reenter')}
          </button>
        </div>
      </div>
    );
  }

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
        <button
          type="button"
          className="rounded-lg p-2 text-warning/80 transition-colors hover:bg-warning/10 hover:text-warning"
          aria-label={t('practice.fullscreen.continue')}
          onClick={() => {
            setUnsupportedDismissed(true);
          }}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
