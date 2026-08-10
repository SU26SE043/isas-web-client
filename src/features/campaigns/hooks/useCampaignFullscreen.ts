import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCampaignFullscreenOptions {
  enabled: boolean;
  onExit?: () => void;
}

export function useCampaignFullscreen({ enabled, onExit }: UseCampaignFullscreenOptions) {
  const initiallyFullscreen =
    typeof document !== 'undefined' && Boolean(document.fullscreenElement);
  const [isFullscreen, setIsFullscreen] = useState(initiallyFullscreen);
  const [hasExited, setHasExited] = useState(false);
  const hasEntered = useRef(initiallyFullscreen);

  const enterFullscreen = useCallback(async () => {
    if (!document.documentElement.requestFullscreen) return false;
    try {
      await document.documentElement.requestFullscreen();
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const onFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (active) {
        hasEntered.current = true;
        return;
      }
      if (!hasEntered.current) return;
      setHasExited(true);
      onExit?.();
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [enabled, onExit]);

  return {
    isFullscreen,
    hasExited,
    enterFullscreen,
    fullscreenSupported:
      typeof document !== 'undefined' && Boolean(document.documentElement.requestFullscreen),
  };
}
