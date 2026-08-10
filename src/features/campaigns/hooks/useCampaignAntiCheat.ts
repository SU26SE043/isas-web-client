import { useCallback, useEffect, useRef } from 'react';
import { campaignCandidateService } from '../services/campaignCandidate.service';
import type { AllowedFrontendSignalType } from '../types/campaignCandidate.types';
import type { CampaignViolationKind } from '../types/campaignViolation.types';

const FOCUS_DEDUP_MS = 1_500;

interface UseCampaignAntiCheatOptions {
  campaignId: string;
  sessionId: string;
  enabled: boolean;
  videoEl?: HTMLVideoElement | null;
  onViolation: (kind: CampaignViolationKind) => void;
}

export function useCampaignAntiCheat({
  campaignId,
  sessionId,
  enabled,
  videoEl,
  onViolation,
}: UseCampaignAntiCheatOptions) {
  const aborted = useRef(false);
  const hiddenTransition = useRef(false);
  const blurPending = useRef(false);
  const cameraBlocked = useRef(false);
  const lastPrimaryEventAt = useRef(0);
  const inFlight = useRef(new Set<string>());
  const fullscreenTimer = useRef<number | null>(null);

  const report = useCallback((
    kind: CampaignViolationKind,
    signalType: AllowedFrontendSignalType,
    note: string,
  ) => {
    if (!enabled || aborted.current || !campaignId || !sessionId) return;
    const key = `${kind}:${note}`;
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);
    onViolation(kind);
    void campaignCandidateService
      .createCampaignFlag(campaignId, sessionId, { signalType, note })
      .catch(() => undefined)
      .finally(() => inFlight.current.delete(key));
  }, [campaignId, enabled, onViolation, sessionId]);

  const reportFullscreenExit = useCallback(() => {
    if (!enabled) return;
    if (fullscreenTimer.current != null) return;
    fullscreenTimer.current = window.setTimeout(() => {
      fullscreenTimer.current = null;
      if (document.visibilityState === 'hidden' || hiddenTransition.current) return;
      lastPrimaryEventAt.current = Date.now();
      report(
        'fullscreen_exit',
        'tab_switch',
        'Candidate exited fullscreen mode.',
      );
    }, 250);
  }, [enabled, report]);

  useEffect(() => {
    aborted.current = false;
    if (!enabled) return undefined;

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenTransition.current = true;
        blurPending.current = false;
        return;
      }
      if (!hiddenTransition.current) return;
      hiddenTransition.current = false;
      lastPrimaryEventAt.current = Date.now();
      report('tab_switch', 'tab_switch', 'Candidate switched away from the interview tab.');
    };
    const onBlur = () => {
      blurPending.current = true;
    };
    const onFocus = () => {
      if (!blurPending.current) return;
      blurPending.current = false;
      if (document.visibilityState === 'hidden') return;
      if (Date.now() - lastPrimaryEventAt.current < FOCUS_DEDUP_MS) return;
      report('focus_lost', 'focus_lost', 'Interview window lost focus.');
    };
    const onPaste = () => {
      report('paste', 'paste', 'Candidate attempted to paste content during the interview.');
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('paste', onPaste);
    return () => {
      aborted.current = true;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('paste', onPaste);
      if (fullscreenTimer.current != null) {
        window.clearTimeout(fullscreenTimer.current);
        fullscreenTimer.current = null;
      }
    };
  }, [enabled, report]);

  useEffect(() => {
    cameraBlocked.current = false;
    if (!enabled || !videoEl?.srcObject) return undefined;
    const stream = videoEl.srcObject;
    if (!(stream instanceof MediaStream)) return undefined;
    const onTrackEnded = () => {
      if (cameraBlocked.current) return;
      cameraBlocked.current = true;
      report(
        'camera_blocked',
        'camera_blocked',
        'Candidate camera became unavailable during the interview.',
      );
    };
    const tracks = stream.getVideoTracks();
    tracks.forEach((track) => track.addEventListener('ended', onTrackEnded));
    return () => tracks.forEach((track) => track.removeEventListener('ended', onTrackEnded));
  }, [enabled, report, videoEl]);

  return { reportFullscreenExit };
}
