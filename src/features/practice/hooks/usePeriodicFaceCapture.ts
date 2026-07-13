import { useEffect, useRef, type RefObject } from 'react';
import { practiceSessionService } from '../services/practiceSession.service';
import { useInterviewSessionStore } from '../stores/interviewSessionStore';

interface UsePeriodicFaceCaptureOptions {
  sessionId: string;
  enabled: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}

export function usePeriodicFaceCapture({ sessionId, enabled, videoRef }: UsePeriodicFaceCaptureOptions) {
  const registerViolation = useInterviewSessionStore((state) => state.registerViolation);
  const proctoringConfig = useInterviewSessionStore((state) => state.proctoringConfig);
  const captureCountRef = useRef(0);

  useEffect(() => {
    if (!enabled || !proctoringConfig.isCampaignSession || proctoringConfig.faceCaptureIntervalSec <= 0) {
      return undefined;
    }

    const intervalMs = proctoringConfig.faceCaptureIntervalSec * 1000;
    const timerId = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      captureCountRef.current += 1;
      void practiceSessionService.reportProctoringEvent(sessionId, {
        type: 'face_missing',
        occurredAt: new Date().toISOString(),
        metadata: { captureIndex: captureCountRef.current },
      });

      // Mock: every third capture simulates a face mismatch for demo/testing.
      if (captureCountRef.current % 3 === 0) {
        registerViolation('face_mismatch');
        void practiceSessionService.reportProctoringEvent(sessionId, {
          type: 'face_mismatch',
          occurredAt: new Date().toISOString(),
        });
      }
    }, intervalMs);

    return () => window.clearInterval(timerId);
  }, [
    enabled,
    proctoringConfig.faceCaptureIntervalSec,
    proctoringConfig.isCampaignSession,
    registerViolation,
    sessionId,
    videoRef,
  ]);
}
