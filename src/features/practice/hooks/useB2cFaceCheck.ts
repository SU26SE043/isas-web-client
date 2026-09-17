import { useCallback, useEffect, useRef } from 'react';
import { captureVideoFrameAsJpegFile } from '@/features/campaigns/utils/captureJpegFile';
import { checkPracticeFace } from '../services/b2cPracticeSession.service';
import type { FocusFrameSignalType } from '../types/b2cPracticeSession.types';

/** Nhịp kiểm mặt bình thường. Coaching, không phải giám sát thi thật — không cần bám sát B2B. */
export const FACE_CHECK_INTERVAL_MS = 15_000;
const FACE_CHECK_JITTER_MS = 3_000;
/** Canvas co về chiều rộng này trước khi encode — nhẹ payload, đủ cho InsightFace detect. */
const FACE_CHECK_MAX_WIDTH = 640;

function withJitter(baseMs: number): number {
  const jitter = (Math.random() * 2 - 1) * FACE_CHECK_JITTER_MS;
  return Math.max(1_000, Math.round(baseMs + jitter));
}

interface UseB2cFaceCheckOptions {
  sessionId: string;
  enabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  uploadInFlight?: boolean;
  completed?: boolean;
  onSignal: (signal: FocusFrameSignalType | null) => void;
}

/**
 * B2C coaching (2026-09-17, BC-6 ngoại lệ mở rộng) — ĐẾM MẶT detect-only, mirror
 * `useCampaignFaceCheck` rút gọn: KHÔNG `monitoring_gap`, KHÔNG nhịp báo động 10s (một buổi luyện
 * không cần leo thang tần suất khi có tín hiệu — chỉ là coaching). `onSignal(null)` khi hết tín
 * hiệu (khớp mặt lại bình thường) để caller dọn trạng thái "đang có cảnh báo".
 */
export function useB2cFaceCheck({
  sessionId,
  enabled,
  videoRef,
  uploadInFlight = false,
  completed = false,
  onSignal,
}: UseB2cFaceCheckOptions) {
  const inFlight = useRef(false);
  const aborted = useRef(false);
  const activeSignal = useRef<FocusFrameSignalType | null>(null);
  const timer = useRef<number | null>(null);
  const deferred = useRef(false);
  const uploadRef = useRef(uploadInFlight);
  const onSignalRef = useRef(onSignal);
  onSignalRef.current = onSignal;

  useEffect(() => {
    aborted.current = false;
    return () => {
      aborted.current = true;
    };
  }, []);

  const runCheck = useCallback(async () => {
    const video = videoRef.current;
    if (
      !enabled
      || aborted.current
      || inFlight.current
      || completed
      || uploadRef.current
      || document.visibilityState === 'hidden'
      || !video
    ) return;
    inFlight.current = true;
    try {
      const file = await captureVideoFrameAsJpegFile(
        video,
        `face-check-${sessionId}-${Date.now()}.jpg`,
        0.85,
        { allowDarkFrame: true, maxWidth: FACE_CHECK_MAX_WIDTH },
      );
      if (!file || aborted.current) return;
      const result = await checkPracticeFace(sessionId, file);
      if (aborted.current) return;
      const signal: FocusFrameSignalType | null =
        result == null
          ? null
          : (result.signals.find(
              (s): s is FocusFrameSignalType => s === 'no_face' || s === 'multiple_faces',
            ) ?? null);
      if (signal !== activeSignal.current) {
        activeSignal.current = signal;
        onSignalRef.current(signal);
      }
    } catch {
      // best-effort — mất một lượt kiểm mặt không đáng chặn buổi luyện.
    } finally {
      inFlight.current = false;
    }
  }, [completed, enabled, sessionId, videoRef]);

  const scheduleNextRef = useRef<() => void>(() => undefined);
  const runScheduledCheckRef = useRef<() => Promise<void>>(async () => undefined);
  runScheduledCheckRef.current = async () => {
    if (uploadRef.current || document.visibilityState === 'hidden') {
      deferred.current = true;
      return;
    }
    await runCheck();
    if (!aborted.current) scheduleNextRef.current();
  };

  const flushDeferredRef = useRef<() => Promise<void>>(async () => undefined);
  flushDeferredRef.current = async () => {
    if (uploadRef.current || document.visibilityState === 'hidden' || !deferred.current) return;
    deferred.current = false;
    await runCheck();
    if (!aborted.current) scheduleNextRef.current();
  };

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
    if (!uploadInFlight) void flushDeferredRef.current();
  }, [uploadInFlight]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void flushDeferredRef.current();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
}
