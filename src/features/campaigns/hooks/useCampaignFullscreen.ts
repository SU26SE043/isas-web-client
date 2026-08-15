import { useCallback, useEffect, useRef, useState } from 'react';
import { isPlaywrightRuntime } from '@/shared/mock';

interface UseCampaignFullscreenOptions {
  enabled: boolean;
  onExit?: () => void;
}

export function useCampaignFullscreen({ enabled, onExit }: UseCampaignFullscreenOptions) {
  const nativeSupported =
    typeof document !== 'undefined' && Boolean(document.documentElement.requestFullscreen);
  const testFallbackEnabled = isPlaywrightRuntime() && !nativeSupported;
  const initiallyFullscreen =
    typeof document !== 'undefined' && Boolean(document.fullscreenElement);
  const [nativeFullscreen, setNativeFullscreen] = useState(initiallyFullscreen);
  const [testFallbackFullscreen, setTestFallbackFullscreen] = useState(false);
  const [hasExited, setHasExited] = useState(false);
  const hasEntered = useRef(initiallyFullscreen);

  const enterFullscreen = useCallback(async () => {
    if (!document.documentElement.requestFullscreen) {
      if (testFallbackEnabled) {
        setTestFallbackFullscreen(true);
        hasEntered.current = true;
        return true;
      }
      return false;
    }
    try {
      await document.documentElement.requestFullscreen();
      return true;
    } catch {
      if (testFallbackEnabled) {
        setTestFallbackFullscreen(true);
        hasEntered.current = true;
        return true;
      }
      return false;
    }
  }, [testFallbackEnabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    const onFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setNativeFullscreen(active);
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
    isFullscreen: nativeFullscreen || testFallbackFullscreen,
    hasExited,
    enterFullscreen,
    fullscreenSupported: nativeSupported || testFallbackEnabled,
  };
}
