import { useCallback, useEffect, useRef } from 'react';
import { campaignCandidateService } from '../services/campaignCandidate.service';
import type { AllowedFrontendSignalType } from '../types/campaignCandidate.types';
import type { CampaignViolationKind } from '../types/campaignViolation.types';

const LEAVE_CORRELATION_MS = 250;
const LEAVE_DEDUP_MS = 1_500;
const CAMERA_POLL_MS = 2_000;

interface PendingLeaveViolation {
  kind: Extract<CampaignViolationKind, 'tab_switch' | 'fullscreen_exit'>;
  note: string;
  source: 'tab_switch' | 'window_blur' | 'fullscreen_exit';
  reported: boolean;
}

interface UseCampaignAntiCheatOptions {
  campaignId: string;
  sessionId: string;
  enabled: boolean;
  /** Live camera stream from the interview room. Watched for camera loss. */
  stream?: MediaStream | null;
  onPause?: () => void;
  onViolation: (kind: CampaignViolationKind) => void;
  onBehaviorSignal?: (kind: Extract<CampaignViolationKind, 'tab_switch' | 'paste' | 'focus_lost'>) => void;
}

/**
 * A camera counts as unavailable when every video track has stopped, been
 * disabled, or gone silent — covering revoked permission, an unplugged device,
 * and a stream that ended without firing `ended`.
 */
function isCameraUnavailable(stream: MediaStream) {
  const tracks = stream.getVideoTracks();
  if (tracks.length === 0) return true;
  return tracks.every(
    (track) => track.readyState === 'ended' || !track.enabled || track.muted,
  );
}

export function useCampaignAntiCheat({
  campaignId,
  sessionId,
  enabled,
  stream,
  onPause,
  onViolation,
  onBehaviorSignal,
}: UseCampaignAntiCheatOptions) {
  const aborted = useRef(false);
  const pendingLeave = useRef<PendingLeaveViolation | null>(null);
  const windowBlurred = useRef(false);
  const documentHidden = useRef(false);
  const cameraBlocked = useRef(false);
  const cameraWasLive = useRef(false);
  const lastLeaveAt = useRef(0);
  const leaveTimer = useRef<number | null>(null);

  const sendFlag = useCallback((
    signalType: AllowedFrontendSignalType,
    note: string,
  ) => {
    if (!enabled || aborted.current || !campaignId || !sessionId) return;
    void campaignCandidateService
      .createCampaignFlag(campaignId, sessionId, { signalType, note })
      .catch(() => undefined);
  }, [campaignId, enabled, sessionId]);

  const flushPendingLeave = useCallback(() => {
    const pending = pendingLeave.current;
    if (!pending || pending.reported) return;
    pending.reported = true;
    sendFlag('tab_switch', pending.note);
  }, [sendFlag]);

  const revealPendingLeave = useCallback(() => {
    const pending = pendingLeave.current;
    if (!pending) return;
    flushPendingLeave();
    pendingLeave.current = null;
    lastLeaveAt.current = Date.now();
    if (leaveTimer.current != null) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    if (pending.kind === 'tab_switch') onBehaviorSignal?.('tab_switch');
    else onViolation(pending.kind);
  }, [flushPendingLeave, onBehaviorSignal, onViolation]);

  const beginPendingLeave = useCallback((next: PendingLeaveViolation) => {
    if (!enabled || aborted.current) return;
    const current = pendingLeave.current;
    if (current) {
      if (current.source === 'fullscreen_exit' && !current.reported) {
        pendingLeave.current = next;
      }
      return;
    }
    if (Date.now() - lastLeaveAt.current < LEAVE_DEDUP_MS) return;

    pendingLeave.current = next;
    if (next.source === 'fullscreen_exit') onPause?.();
    if (next.source === 'tab_switch') {
      flushPendingLeave();
      return;
    }

    if (leaveTimer.current != null) window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => {
      leaveTimer.current = null;
      flushPendingLeave();
      if (!windowBlurred.current && !documentHidden.current) revealPendingLeave();
    }, LEAVE_CORRELATION_MS);
  }, [enabled, flushPendingLeave, onPause, revealPendingLeave]);

  const reportImmediate = useCallback((
    kind: CampaignViolationKind,
    signalType: AllowedFrontendSignalType,
    note: string,
  ) => {
    if (!enabled || aborted.current) return;
    onPause?.();
    onViolation(kind);
    sendFlag(signalType, note);
  }, [enabled, onPause, onViolation, sendFlag]);

  const reportBehavior = useCallback((
    kind: Extract<CampaignViolationKind, 'tab_switch' | 'paste' | 'focus_lost'>,
    signalType: Extract<AllowedFrontendSignalType, 'paste' | 'focus_lost' | 'tab_switch'>,
    note: string,
  ) => {
    if (!enabled || aborted.current) return;
    onBehaviorSignal?.(kind);
    sendFlag(signalType, note);
  }, [enabled, onBehaviorSignal, sendFlag]);

  const reportFullscreenExit = useCallback(() => {
    beginPendingLeave({
      kind: 'fullscreen_exit',
      source: 'fullscreen_exit',
      note: 'Candidate exited fullscreen mode.',
      reported: false,
    });
  }, [beginPendingLeave]);

  const beginPendingLeaveRef = useRef(beginPendingLeave);
  const reportImmediateRef = useRef(reportImmediate);
  const reportBehaviorRef = useRef(reportBehavior);
  const revealPendingLeaveRef = useRef(revealPendingLeave);
  beginPendingLeaveRef.current = beginPendingLeave;
  reportImmediateRef.current = reportImmediate;
  reportBehaviorRef.current = reportBehavior;
  revealPendingLeaveRef.current = revealPendingLeave;

  useEffect(() => {
    aborted.current = false;

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        documentHidden.current = true;
        beginPendingLeaveRef.current({
          kind: 'tab_switch',
          source: 'tab_switch',
          note: 'Candidate switched away from the interview tab.',
          reported: false,
        });
        return;
      }
      documentHidden.current = false;
      revealPendingLeaveRef.current();
    };
    const onBlur = () => {
      windowBlurred.current = true;
      beginPendingLeaveRef.current({
        kind: 'tab_switch',
        source: 'window_blur',
        note: 'Candidate left the interview window using Alt+Tab or window switching.',
        reported: false,
      });
    };
    const onFocus = () => {
      windowBlurred.current = false;
      if (document.visibilityState !== 'hidden') revealPendingLeaveRef.current();
    };
    const onPaste = () => {
      reportBehaviorRef.current('paste', 'paste', 'Candidate attempted to paste content during the interview.');
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
      pendingLeave.current = null;
      if (leaveTimer.current != null) {
        window.clearTimeout(leaveTimer.current);
        leaveTimer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    cameraBlocked.current = false;
    cameraWasLive.current = false;
    if (!enabled || !stream) return undefined;

    const evaluate = () => {
      const unavailable = isCameraUnavailable(stream);
      if (!cameraWasLive.current) {
        // Only an active -> unavailable transition is a violation, so wait until
        // the camera has been seen working before arming the check.
        if (!unavailable) cameraWasLive.current = true;
        return;
      }
      if (!unavailable || cameraBlocked.current) return;
      cameraBlocked.current = true;
      reportImmediateRef.current(
        'camera_blocked',
        'camera_blocked',
        'Candidate camera became unavailable during the interview.',
      );
    };

    const tracks = stream.getVideoTracks();
    tracks.forEach((track) => {
      track.addEventListener('ended', evaluate);
      track.addEventListener('mute', evaluate);
    });
    evaluate();
    const poll = window.setInterval(evaluate, CAMERA_POLL_MS);

    return () => {
      window.clearInterval(poll);
      tracks.forEach((track) => {
        track.removeEventListener('ended', evaluate);
        track.removeEventListener('mute', evaluate);
      });
    };
  }, [enabled, stream]);

  return { reportFullscreenExit };
}
