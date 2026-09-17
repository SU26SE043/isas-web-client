import { useEffect, useState } from 'react';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import { useB2cCoachingNotices } from './useB2cCoachingNotices';
import { useB2cFaceCheck } from './useB2cFaceCheck';
import { useB2cFocusTracking } from './useB2cFocusTracking';
import type { InterviewPhase } from './useB2cPracticeRoom';

/** Phases where a webcam frame captured for coaching is meaningful (not `loading`/`submitting`). */
const FACE_ARMING_PHASES = new Set<InterviewPhase>(['countdown', 'reading', 'answering']);

interface UseB2cRoomCoachingOptions {
  sessionId: string;
  phase: InterviewPhase;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  uploadInFlight: boolean;
  completed: boolean;
}

/**
 * B2C coaching (2026-09-17, BC-6 ngoại lệ) — ghép 3 tín hiệu HÀNH VI (`useB2cFocusTracking`) +
 * tín hiệu MẶT (`useB2cFaceCheck`) thành toast qua `useB2cCoachingNotices`. Toàn bộ tắt hẳn khi
 * người luyện KHÔNG bật `focusTrackingEnabled` cho buổi này (mặc định tắt — opt-in mỗi buổi).
 *
 * `armed` dùng LATCH (`useState`, mẫu `useCampaignProctoringLifecycle`): một khi buổi đã vào một
 * trong các pha kiểm-mặt-có-nghĩa (`countdown`/`reading`/`answering`) thì kiểm mặt GIỮ BẬT kể cả
 * khi resume quay lại `countdown` — tắt-bật lại theo từng lần chuyển câu sẽ bỏ lỡ khoảng trống
 * đúng lúc dễ mất tập trung nhất (chuyển giữa hai câu hỏi).
 */
export function useB2cRoomCoaching({
  sessionId,
  phase,
  videoRef,
  uploadInFlight,
  completed,
}: UseB2cRoomCoachingOptions) {
  const focusTrackingEnabled = useB2cPracticeInterviewStore((state) => state.focusTrackingEnabled);
  const stage = useB2cPracticeInterviewStore((state) => state.stage);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (focusTrackingEnabled && FACE_ARMING_PHASES.has(phase)) setArmed(true);
  }, [focusTrackingEnabled, phase]);

  const { notify } = useB2cCoachingNotices();

  // Chỉ MỘT lý do gọi `useB2cFocusTracking` với `enabled` đã gate sẵn thay vì để nó tự đọc `stage`
  // qua store: composition hook đứng RIÊNG khỏi implementation của leaf hook — test ở đây khoá
  // đúng THỜI ĐIỂM tracking bật/tắt mà không cần biết leaf hook gate lại bằng cách nào bên trong.
  const behaviorEnabled =
    focusTrackingEnabled && stage === 'interviewing' && (phase === 'reading' || phase === 'answering');
  useB2cFocusTracking(sessionId, behaviorEnabled, phase, notify);

  const faceEnabled = focusTrackingEnabled && armed && !completed;
  useB2cFaceCheck({
    sessionId,
    enabled: faceEnabled,
    videoEl: videoRef.current,
    completed,
    uploadInFlight,
    onSignal: notify,
  });

  return { cameraAlwaysOn: focusTrackingEnabled };
}
