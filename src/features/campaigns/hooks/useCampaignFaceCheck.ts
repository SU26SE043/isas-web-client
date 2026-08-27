import { useCallback, useEffect, useRef } from 'react';
import { campaignCandidateService } from '../services/campaignCandidate.service';
import type { FaceCheckResponse } from '../types/campaignCandidate.types';
import type { CampaignFaceSignal } from '../types/campaignViolation.types';
import { captureVideoFrameAsJpegFile } from '../utils/captureJpegFile';

export const FACE_CHECK_INTERVAL_MS = 30_000;

interface UseCampaignFaceCheckOptions {
  campaignId: string;
  sessionId: string;
  enabled: boolean;
  videoEl: HTMLVideoElement | null;
  completed?: boolean;
  onSignal: (signal: CampaignFaceSignal) => void;
}

function resolveSignals(result: FaceCheckResponse): CampaignFaceSignal[] {
  const supported = result.signals.filter((signal): signal is CampaignFaceSignal =>
    signal === 'no_face'
      || signal === 'multiple_faces'
      || signal === 'face_mismatch'
      || signal === 'identity_unverified',
  );
  if (supported.length > 0) return supported;
  if (result.faceCount === 0) return ['no_face'];
  if (result.faceCount > 1) return ['multiple_faces'];
  if (!result.match) return ['face_mismatch'];
  return [];
}

export function useCampaignFaceCheck({
  campaignId,
  sessionId,
  enabled,
  videoEl,
  completed = false,
  onSignal,
}: UseCampaignFaceCheckOptions) {
  const inFlight = useRef(false);
  const aborted = useRef(false);
  const activeSignals = useRef(new Set<CampaignFaceSignal>());

  useEffect(() => {
    aborted.current = false;
    return () => {
      aborted.current = true;
    };
  }, []);

  const checkNow = useCallback(async () => {
    if (
      !enabled
      || aborted.current
      || inFlight.current
      || completed
      || document.visibilityState === 'hidden'
      || !videoEl
    ) return null;
    inFlight.current = true;
    try {
      let file = await captureVideoFrameAsJpegFile(
        videoEl,
        `face-check-${sessionId}-${Date.now()}.jpg`,
      );
      if (!file) {
        const freshVideoEl = document.querySelector<HTMLVideoElement>(
          '[data-campaign-interview] video',
        );
        if (freshVideoEl && freshVideoEl !== videoEl) {
          file = await captureVideoFrameAsJpegFile(
            freshVideoEl,
            `face-check-${sessionId}-${Date.now()}.jpg`,
          );
        }
      }
      if (!file || aborted.current) return null;
      const result = await campaignCandidateService.checkCampaignFace(
        campaignId,
        sessionId,
        file,
      );
      if (!result) {
        activeSignals.current.clear();
        return { safe: true, signals: [] as CampaignFaceSignal[] };
      }
      const signals = resolveSignals(result);
      for (const signal of signals) {
        if (!activeSignals.current.has(signal)) onSignal(signal);
      }
      activeSignals.current = new Set(signals);
      return { safe: signals.length === 0, signals };
    } catch {
      return null;
    } finally {
      inFlight.current = false;
    }
  }, [campaignId, completed, enabled, onSignal, sessionId, videoEl]);

  useEffect(() => {
    if (!enabled || completed || !campaignId || !sessionId) return undefined;
    const timer = window.setInterval(() => void checkNow(), FACE_CHECK_INTERVAL_MS);
    return () => {
      activeSignals.current.clear();
      window.clearInterval(timer);
    };
  }, [campaignId, checkNow, completed, enabled, sessionId]);

  return { checkNow };
}
