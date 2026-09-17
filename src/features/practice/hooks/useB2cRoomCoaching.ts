import { useEffect, useState } from 'react';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import { useB2cCoachingNotices } from './useB2cCoachingNotices';
import { useB2cFaceCheck } from './useB2cFaceCheck';
import { useB2cFocusTracking } from './useB2cFocusTracking';

/**
 * Các pha khiến kiểm mặt được coi là ĐÃ BẮT ĐẦU. Mirror `useCampaignProctoringLifecycle`:
 * `countdown` là đường vào thường; `reading`/`answering` là đường RESUME (tải lại trang giữa
 * buổi không đi qua countdown nữa) — thiếu vế đó thì mọi buổi resume mất kiểm mặt mà không lỗi
 * nào nổ.
 */
const FACE_ARMING_PHASES = new Set(['countdown', 'reading', 'answering']);

interface UseB2cRoomCoachingOptions {
  sessionId: string;
  phase: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  uploadInFlight: boolean;
  completed: boolean;
}

/**
 * B2C coaching (2026-09-17, BC-6 ngoại lệ) — ghép 3 tín hiệu hành vi + đếm mặt + toast trung tính
 * vào một cổng đọc từ `focusTrackingEnabled` của buổi. KHÔNG gọi gì nếu buổi không bật — tắt =
 * không listener, không upload, không gọi AI.
 */
export function useB2cRoomCoaching({
  sessionId,
  phase,
  videoRef,
  uploadInFlight,
  completed,
}: UseB2cRoomCoachingOptions) {
  const focusTrackingEnabled = useB2cPracticeInterviewStore(
    (s) => s.session?.focusTrackingEnabled ?? false,
  );
  const stage = useB2cPracticeInterviewStore((s) => s.stage);
  const { notify } = useB2cCoachingNotices();

  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (FACE_ARMING_PHASES.has(phase)) setArmed(true);
  }, [phase]);

  const behaviorEnabled =
    focusTrackingEnabled && stage === 'interviewing' && (phase === 'reading' || phase === 'answering');
  const faceEnabled = focusTrackingEnabled && armed && !completed;

  useB2cFocusTracking(sessionId, behaviorEnabled, notify);

  useB2cFaceCheck({
    sessionId,
    enabled: faceEnabled,
    videoRef,
    uploadInFlight,
    completed,
    onSignal: (signal) => {
      if (signal) notify(signal);
    },
  });

  return { cameraAlwaysOn: focusTrackingEnabled };
}
