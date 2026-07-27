import { useCallback, useEffect, useRef } from 'react';
import { campaignCandidateService } from '../services/campaignCandidate.service';
import type { AllowedFrontendSignalType } from '../types/campaignCandidate.types';

const COOLDOWN_MS: Record<AllowedFrontendSignalType, number> = {
  tab_switch: 0,
  paste: 0,
  focus_lost: 4000,
  camera_blocked: 10_000,
};

interface UseCampaignAntiCheatOptions {
  campaignId: string;
  sessionId: string;
  enabled: boolean;
  videoEl?: HTMLVideoElement | null;
}

export function useCampaignAntiCheat({
  campaignId,
  sessionId,
  enabled,
  videoEl,
}: UseCampaignAntiCheatOptions) {
  const lastSentAt = useRef<Partial<Record<AllowedFrontendSignalType, number>>>({});
  const tabHiddenSent = useRef(false);
  const cameraBlocked = useRef(false);
  const aborted = useRef(false);

  const sendFlag = useCallback(
    async (signalType: AllowedFrontendSignalType, note?: string) => {
      if (!enabled || aborted.current || !campaignId || !sessionId) return;
      const now = Date.now();
      const last = lastSentAt.current[signalType] ?? 0;
      if (now - last < COOLDOWN_MS[signalType]) return;
      lastSentAt.current[signalType] = now;
      try {
        await campaignCandidateService.createCampaignFlag(campaignId, sessionId, {
          signalType,
          note,
        });
      } catch {
        /* flags must not crash the interview room */
      }
    },
    [campaignId, enabled, sessionId],
  );

  useEffect(() => {
    aborted.current = false;
    if (!enabled) return;

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (!tabHiddenSent.current) {
          tabHiddenSent.current = true;
          void sendFlag('tab_switch');
        }
        return;
      }
      tabHiddenSent.current = false;
    };

    const onBlur = () => {
      void sendFlag('focus_lost');
    };

    const onPaste = () => {
      void sendFlag('paste');
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('paste', onPaste);

    return () => {
      aborted.current = true;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('paste', onPaste);
    };
  }, [enabled, sendFlag]);

  useEffect(() => {
    if (!enabled || !videoEl?.srcObject) return;
    const stream = videoEl.srcObject;
    if (!(stream instanceof MediaStream)) return;

    const onTrackEnded = () => {
      if (cameraBlocked.current) return;
      cameraBlocked.current = true;
      void sendFlag('camera_blocked', 'Camera track ended');
    };

    const tracks = stream.getVideoTracks();
    tracks.forEach((track) => track.addEventListener('ended', onTrackEnded));
    return () => {
      tracks.forEach((track) => track.removeEventListener('ended', onTrackEnded));
    };
  }, [enabled, sendFlag, videoEl]);
}
