import { useCallback, useEffect, useRef, useState } from 'react';

export interface FullscreenRequestResult {
  supported: boolean;
  entered: boolean;
}

export async function requestInterviewFullscreen(): Promise<FullscreenRequestResult> {
  if (typeof document === 'undefined') return { supported: false, entered: false };
  if (document.fullscreenElement) return { supported: true, entered: true };

  const requestFullscreen = document.documentElement.requestFullscreen;
  if (!requestFullscreen) return { supported: false, entered: false };

  try {
    await requestFullscreen.call(document.documentElement);
    return { supported: true, entered: Boolean(document.fullscreenElement) };
  } catch {
    return { supported: true, entered: false };
  }
}

export async function exitInterviewFullscreen(): Promise<void> {
  if (typeof document === 'undefined' || !document.fullscreenElement || !document.exitFullscreen) return;
  try {
    await document.exitFullscreen();
  } catch {
    // The browser can reject exit while the document is already unloading.
  }
}

export function useInterviewFullscreen({ cleanup = true } = {}) {
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== 'undefined' && Boolean(document.fullscreenElement),
  );
  const [hasExitedFullscreen, setHasExitedFullscreen] = useState(false);
  const wasFullscreenRef = useRef(isFullscreen);
  const supported = typeof document !== 'undefined' && Boolean(document.documentElement.requestFullscreen);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      const wasFullscreen = wasFullscreenRef.current;
      wasFullscreenRef.current = active;
      if (active) setHasExitedFullscreen(false);
      else if (wasFullscreen) setHasExitedFullscreen(true);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (cleanup) void exitInterviewFullscreen();
    };
  }, [cleanup]);

  const enterFullscreen = useCallback(async () => {
    const result = await requestInterviewFullscreen();
    if (result.entered) setHasExitedFullscreen(false);
    return result;
  }, []);

  const dismissFullscreenWarning = useCallback(() => setHasExitedFullscreen(false), []);

  return {
    isFullscreen,
    supported,
    hasExitedFullscreen,
    enterFullscreen,
    dismissFullscreenWarning,
  };
}
