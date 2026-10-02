import { useCallback, useRef, useState } from 'react';
import { isSessionAlreadySubmittedError } from '../utils/b2cPracticeSessionErrors';

/**
 * ATT1-F5 — hết giờ cả buổi (phòng thi B2B tính giờ).
 *
 * Khi đồng hồ cả buổi về 0 ([I3] [I5]):
 *  (a) dừng ghi âm — phòng yêu cầu thẻ ghi âm dừng và nộp đoạn đang ghi (`requestFinalRecording`);
 *  (b) có đoạn đang ghi / upload đang bay ⇒ chờ nó xong, TỐI ĐA `EXAM_TIME_UP_UPLOAD_CAP_MS` — server chỉ ân
 *      hạn 30 giây cho file đang tải, chờ lâu hơn là nộp bài trễ mà câu cuối vẫn bị từ chối;
 *  (c) gọi submit (endpoint nộp bài hiện có) ĐÚNG 1 lần — dù đồng hồ còn tick, re-render hay StrictMode;
 *  (d) màn "Đã hết giờ" không đóng được: `saving` → `submitting` → `submitted` | `submitFailed`.
 * `submitFailed` KHÔNG phải "nộp thất bại": server tự chốt buổi sau hạn + 30 giây ⇒ màn nói "hệ thống sẽ tự nộp".
 *
 * Lý do vào luồng: `clock` = đồng hồ về 0; `server` = upload bị 409 SESSION_TIME_UP — server đã ngừng nhận
 * câu trả lời nên bỏ câu đó, KHÔNG nộp lại đoạn ghi âm, sang (c) ngay.
 */

export type ExamTimeUpStatus = 'saving' | 'submitting' | 'submitted' | 'submitFailed';
export type ExamTimeUpReason = 'clock' | 'server';

/** Trần chờ upload câu cuối — dưới 30 giây ân hạn của server ([I3]). */
export const EXAM_TIME_UP_UPLOAD_CAP_MS = 25_000;

export interface UseExamTimeUpOptions {
  /** Chỉ phòng B2B (begin khi vào phòng). B2C luyện tập không bao giờ vào luồng này. */
  enabled: boolean;
  /** Dừng đọc câu hỏi, huỷ hẹn giờ của đồng hồ câu — gọi ngay khi vào luồng. */
  onEnter: () => void;
  /** Yêu cầu thẻ ghi âm dừng + nộp đoạn đang ghi. `false` ⇒ không có gì để nộp. */
  requestFinalRecording: () => boolean;
  /** Upload đang bay (người dùng vừa bấm nộp) ⇒ lời hứa xong; không có ⇒ `null`. */
  waitForInFlightUpload: () => Promise<unknown> | null;
  /** Hết pha chờ upload (tắt camera/mic). */
  onUploadPhaseDone: () => void;
  submitSession: () => Promise<void>;
  /** Báo trang (ẩn overlay vi phạm/toàn màn hình, thôi giám sát). Gọi đúng 1 lần. */
  onTimeUp?: () => void;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function useExamTimeUp(options: UseExamTimeUpOptions) {
  const [status, setStatus] = useState<ExamTimeUpStatus | null>(null);
  const activeRef = useRef(false);
  const settleFinalUploadRef = useRef<(() => void) | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const isActive = useCallback(() => activeRef.current, []);

  /** Đoạn ghi âm cuối đã nộp xong (hoặc hoá ra không có gì để nộp) ⇒ thôi chờ. */
  const settleFinalUpload = useCallback(() => {
    const settle = settleFinalUploadRef.current;
    settleFinalUploadRef.current = null;
    settle?.();
  }, []);

  const trigger = useCallback((reason: ExamTimeUpReason) => {
    const current = optionsRef.current;
    if (!current.enabled || activeRef.current) return;
    activeRef.current = true;
    setStatus('saving');
    current.onEnter();
    current.onTimeUp?.();

    void (async () => {
      const waits: Promise<unknown>[] = [];
      const inFlight = current.waitForInFlightUpload();
      if (inFlight) waits.push(inFlight);
      if (reason === 'clock') {
        const finalUpload = new Promise<void>((resolve) => {
          settleFinalUploadRef.current = resolve;
        });
        if (current.requestFinalRecording()) waits.push(finalUpload);
        else settleFinalUploadRef.current = null;
      }
      if (waits.length > 0) {
        await Promise.race([Promise.allSettled(waits), delay(EXAM_TIME_UP_UPLOAD_CAP_MS)]);
      }
      settleFinalUploadRef.current = null;
      optionsRef.current.onUploadPhaseDone();
      setStatus('submitting');
      try {
        await optionsRef.current.submitSession();
        setStatus('submitted');
      } catch (error) {
        setStatus(isSessionAlreadySubmittedError(error) ? 'submitted' : 'submitFailed');
      }
    })();
  }, []);

  return { status, isActive, trigger, settleFinalUpload };
}
