import { useCallback, useEffect, useRef } from 'react';
import {
  captureVideoFrameAsJpegFile,
  isUsableCameraFrame,
  isVideoFrameReady,
} from '@/features/campaigns/utils/captureJpegFile';
import { checkPracticeFace } from '../services/b2cPracticeSession.service';
import type { FocusClientHintType, FocusFrameSignalType } from '../types/b2cPracticeSession.types';

export type FaceCheckSignal = FocusFrameSignalType | FocusClientHintType;

// B2C coaching — nhịp kiểm mặt riêng của luồng luyện tập, cố ý KHÔNG import từ
// `useCampaignFaceCheck` (B2B): hai luồng có chủ sở hữu/lịch tinh chỉnh khác nhau, ghép chung sẽ
// khiến một quyết định tune cho B2B (vd hạ nhịp) âm thầm đổi luôn B2C.
export const FACE_CHECK_INTERVAL_MS = 15_000;
const FACE_CHECK_JITTER_MS = 3_000;

function withJitter(intervalMs: number): number {
  return intervalMs + Math.round((Math.random() * 2 - 1) * FACE_CHECK_JITTER_MS);
}

interface UseB2cFaceCheckOptions {
  sessionId: string;
  enabled: boolean;
  videoEl: HTMLVideoElement | null;
  completed?: boolean;
  uploadInFlight?: boolean;
  /** `null` = tín hiệu đã hết (khung hình lại sạch) — coaching cần biết để KHÔNG giữ toast cũ. */
  onSignal: (signal: FaceCheckSignal | null) => void;
}

/**
 * B2C coaching (2026-09-17, BC-6 ngoại lệ) — kiểm mặt định kỳ, detect-only (đếm mặt, KHÔNG so khớp
 * danh tính, KHÔNG ảnh mốc). Rút gọn từ `useCampaignFaceCheck` (B2B): không `monitoring_gap`,
 * không leo thang nhịp báo động — coaching chỉ cần biết "đang OK hay không", không cần phân biệt
 * mức độ nghiêm trọng như anti-cheat.
 */
export function useB2cFaceCheck({
  sessionId,
  enabled,
  videoEl,
  completed = false,
  uploadInFlight = false,
  onSignal,
}: UseB2cFaceCheckOptions) {
  const inFlight = useRef(false);
  const aborted = useRef(false);
  const activeSignal = useRef<FaceCheckSignal | null>(null);
  const timer = useRef<number | null>(null);
  const deferred = useRef(false);
  const uploadRef = useRef(uploadInFlight);

  useEffect(() => {
    aborted.current = false;
    return () => {
      aborted.current = true;
    };
  }, []);

  const runCheck = useCallback(async () => {
    if (
      !enabled
      || aborted.current
      || inFlight.current
      || completed
      || uploadRef.current
      || document.visibilityState === 'hidden'
      || !videoEl
    ) return;
    inFlight.current = true;
    try {
      const emit = (signal: FaceCheckSignal | null) => {
        if (signal !== activeSignal.current) onSignal(signal);
        activeSignal.current = signal;
      };
      // Chưa có frame nào (camera đang khởi động) — không có gì để nói, cũng không gửi gì.
      if (!isVideoFrameReady(videoEl)) return;
      // Khung TỐI (che cam / phòng tối): nhắc bật đèn NGAY TẠI CHỖ. Trước đây helper trả null ở đây
      // ⇒ im lặng suốt buổi (2026-09-18 prod: che cam cả buổi, 0 request, 0 toast). Không gửi ảnh
      // đen cho AI: nhận về `no_face` là gộp "tối" với "rời chỗ" — hai lời khuyên khác nhau.
      if (!isUsableCameraFrame(videoEl)) {
        emit('low_light');
        return;
      }
      const file = await captureVideoFrameAsJpegFile(videoEl, `face-check-${sessionId}-${Date.now()}.jpg`);
      if (!file || aborted.current) return;
      const result = await checkPracticeFace(sessionId, file);
      emit(result && result.signals.length > 0 ? result.signals[0] : null);
    } catch {
      // Coaching telemetry — không để một lượt hỏng làm gián đoạn buổi luyện.
    } finally {
      inFlight.current = false;
    }
  }, [completed, enabled, onSignal, sessionId, videoEl]);

  const runCheckRef = useRef(runCheck);
  runCheckRef.current = runCheck;

  const scheduleNextRef = useRef<() => void>(() => undefined);

  const runScheduledCheck = useCallback(async () => {
    if (uploadRef.current || document.visibilityState === 'hidden') {
      deferred.current = true;
      return;
    }
    await runCheckRef.current();
    if (!aborted.current) scheduleNextRef.current();
  }, []);
  const runScheduledCheckRef = useRef(runScheduledCheck);
  runScheduledCheckRef.current = runScheduledCheck;

  const flushDeferredCheck = useCallback(async () => {
    if (uploadRef.current || document.visibilityState === 'hidden' || !deferred.current) return;
    deferred.current = false;
    await runCheckRef.current();
    if (!aborted.current) scheduleNextRef.current();
  }, []);
  const flushDeferredCheckRef = useRef(flushDeferredCheck);
  flushDeferredCheckRef.current = flushDeferredCheck;

  useEffect(() => {
    if (!enabled || completed || !sessionId) return undefined;
    const scheduleNext = () => {
      if (timer.current != null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        timer.current = null;
        void runScheduledCheckRef.current();
      }, withJitter(FACE_CHECK_INTERVAL_MS));
    };
    scheduleNextRef.current = scheduleNext;
    scheduleNext();
    return () => {
      activeSignal.current = null;
      if (timer.current != null) window.clearTimeout(timer.current);
      timer.current = null;
      scheduleNextRef.current = () => undefined;
    };
  }, [completed, enabled, sessionId]);

  useEffect(() => {
    uploadRef.current = uploadInFlight;
    if (!uploadInFlight) void flushDeferredCheckRef.current();
  }, [uploadInFlight]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void flushDeferredCheckRef.current();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
}
