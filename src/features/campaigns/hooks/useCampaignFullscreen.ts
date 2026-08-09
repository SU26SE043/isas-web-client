import { useCallback, useEffect, useState } from 'react';
import { campaignCandidateService } from '../services/campaignCandidate.service';

interface UseCampaignFullscreenOptions {
  campaignId: string;
  sessionId: string;
  enabled: boolean;
}

export function useCampaignFullscreen({ campaignId, sessionId, enabled }: UseCampaignFullscreenOptions) {
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== 'undefined' && Boolean(document.fullscreenElement),
  );
  const [hasExited, setHasExited] = useState(false);

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
      if (active) return;
      setHasExited(true);
      void campaignCandidateService
        .createCampaignFlag(campaignId, sessionId, {
          signalType: 'focus_lost',
          note: 'fullscreen_exit',
        })
        .catch(() => undefined);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [campaignId, enabled, sessionId]);

  return {
    isFullscreen,
    hasExited,
    enterFullscreen,
    fullscreenSupported:
      typeof document !== 'undefined' && Boolean(document.documentElement.requestFullscreen),
  };
}
