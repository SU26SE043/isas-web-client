import { useEffect, useRef, useState } from 'react';
import { computeExamRemainingSeconds, type ExamClockAnchor } from '../utils/examSessionClock';

const TICK_MS = 1000;

function remainingOf(anchor: ExamClockAnchor | null): number | null {
  if (!anchor || anchor.deadlineMs == null) return null;
  return computeExamRemainingSeconds(anchor.deadlineMs, anchor.offsetMs, Date.now());
}

/**
 * Số giây còn lại của đồng hồ cả buổi (giờ server). `null` ⇒ không có hạn.
 *
 * KHÔNG có nhánh dừng nào: overlay vi phạm hay tab ẩn không làm đồng hồ đứng (ATT1 — server không dừng).
 * Tab quay lại hiện hình ⇒ tính lại ngay (trình duyệt bóp setInterval của tab nền).
 *
 * `onTimeUp` (điểm nối cho ATT1-F5): gọi ĐÚNG 1 lần mỗi hạn chót khi còn lại về 0.
 */
export function useExamCountdown(
  anchor: ExamClockAnchor | null,
  onTimeUp?: () => void,
): number | null {
  const deadlineMs = anchor?.deadlineMs ?? null;
  const offsetMs = anchor?.offsetMs ?? 0;
  const [remaining, setRemaining] = useState<number | null>(() => remainingOf(anchor));
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;
  const firedForDeadlineRef = useRef<number | null>(null);

  useEffect(() => {
    if (deadlineMs == null) {
      setRemaining(null);
      return undefined;
    }
    const update = () => {
      const next = computeExamRemainingSeconds(deadlineMs, offsetMs, Date.now());
      setRemaining(next);
      if (next === 0 && firedForDeadlineRef.current !== deadlineMs) {
        firedForDeadlineRef.current = deadlineMs;
        onTimeUpRef.current?.();
      }
    };
    update();
    const timer = window.setInterval(update, TICK_MS);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, [deadlineMs, offsetMs]);

  return deadlineMs == null ? null : remaining;
}
