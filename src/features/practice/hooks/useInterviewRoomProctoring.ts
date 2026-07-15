import { type RefObject } from 'react';
import { useInterviewSessionStore } from '../stores/interviewSessionStore';
import { usePeriodicFaceCapture } from './usePeriodicFaceCapture';
import { useProctoring } from './useProctoring';

interface UseInterviewRoomProctoringOptions {
  sessionId: string;
  roomActive: boolean;
  violationPaused: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}

/**
 * B2B strict anti-cheat only: tab/focus listeners + periodic webcam snapshots.
 * B2C practice / learning can toggle camera; B2B exam keeps camera always on.
 */
export function useInterviewRoomProctoring({
  sessionId,
  roomActive,
  violationPaused,
  videoRef,
}: UseInterviewRoomProctoringOptions) {
  const antiCheatEnabled = useInterviewSessionStore((state) => state.proctoringConfig.antiCheatEnabled);
  const strictModeActive = roomActive && antiCheatEnabled;

  useProctoring(sessionId, strictModeActive);
  usePeriodicFaceCapture({
    sessionId,
    enabled: strictModeActive && !violationPaused,
    videoRef,
  });

  return { antiCheatEnabled };
}
