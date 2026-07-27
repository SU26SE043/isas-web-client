import { useEffect, useRef, useState } from 'react';
import { campaignCandidateService } from '../services/campaignCandidate.service';
import { captureVideoFrameAsJpegFile } from '../utils/captureJpegFile';

const FACE_CHECK_INTERVAL_MS = 30_000;

interface UseCampaignFaceCheckOptions {
  campaignId: string;
  sessionId: string;
  enabled: boolean;
  videoEl: HTMLVideoElement | null;
  completed?: boolean;
}

export function useCampaignFaceCheck({
  campaignId,
  sessionId,
  enabled,
  videoEl,
  completed = false,
}: UseCampaignFaceCheckOptions) {
  const inFlight = useRef(false);
  const aborted = useRef(false);
  const [softWarning, setSoftWarning] = useState<string | null>(null);

  useEffect(() => {
    aborted.current = false;
    if (!enabled || completed || !campaignId || !sessionId) return;

    const runCheck = async () => {
      if (aborted.current || inFlight.current || document.visibilityState === 'hidden') return;
      if (!videoEl) return;
      inFlight.current = true;
      try {
        const file = await captureVideoFrameAsJpegFile(
          videoEl,
          `face-check-${sessionId}-${Date.now()}.jpg`,
        );
        if (!file || aborted.current) return;
        const result = await campaignCandidateService.checkCampaignFace(
          campaignId,
          sessionId,
          file,
        );
        if (!result) {
          setSoftWarning(null);
          return;
        }
        if (result.faceCount === 0) {
          setSoftWarning('no_face');
        } else if (result.faceCount > 1) {
          setSoftWarning('multiple_faces');
        } else if (!result.match) {
          setSoftWarning('adjust');
        } else {
          setSoftWarning(null);
        }
      } catch {
        /* face-check failures stay non-blocking */
      } finally {
        inFlight.current = false;
      }
    };

    const timer = window.setInterval(() => {
      void runCheck();
    }, FACE_CHECK_INTERVAL_MS);

    return () => {
      aborted.current = true;
      window.clearInterval(timer);
    };
  }, [campaignId, completed, enabled, sessionId, videoEl]);

  return { softWarning };
}
