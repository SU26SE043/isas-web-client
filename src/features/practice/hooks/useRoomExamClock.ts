import { useMemo, useState } from 'react';
import { resolveExamClockAnchor, type ExamClockEntry } from '../utils/examSessionClock';
import { useExamCountdown } from './useExamCountdown';

export interface RoomExamClock {
  /** Giây còn lại theo giờ server — chỉ có khi buổi TÍNH GIỜ (begin trả durationMinutes). */
  remainingSeconds: number;
  /** Điểm nối ATT1-F5: `true` khi đồng hồ cả buổi về 0. */
  timeUp: boolean;
}

/**
 * Đồng hồ cả buổi của phòng thi. `beginOnEnter` (phòng B2B) ⇒ chờ kết quả begin (`applyEntry`) rồi mới có
 * đồng hồ; không begin (B2C) ⇒ đường cũ theo `fallbackDeadlineAt` (B2C không truyền ⇒ không có đồng hồ).
 */
export function useRoomExamClock(options: {
  beginOnEnter: boolean;
  fallbackDeadlineAt?: string | null;
  onTimeUp?: () => void;
}) {
  const [entry, applyEntry] = useState<ExamClockEntry>(() =>
    options.beginOnEnter ? { kind: 'pending' } : { kind: 'legacy' },
  );
  const anchor = useMemo(
    () => resolveExamClockAnchor(entry, options.fallbackDeadlineAt),
    [entry, options.fallbackDeadlineAt],
  );
  const timed = anchor?.timed === true;
  const serverRemainingSeconds = useExamCountdown(anchor, timed ? options.onTimeUp : undefined);
  const examClock: RoomExamClock | null =
    timed && serverRemainingSeconds != null
      ? { remainingSeconds: serverRemainingSeconds, timeUp: serverRemainingSeconds === 0 }
      : null;

  return { serverRemainingSeconds, examClock, applyEntry };
}
