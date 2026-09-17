import { useEffect, useRef } from 'react';
import { recordFocusEvent } from '../services/b2cPracticeSession.service';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import type { InterviewPhase } from './useB2cPracticeRoom';
import type { FocusBehaviorSignalType } from '../types/b2cPracticeSession.types';

/** Window still blurred after this long (and tab not hidden) = a real focus-loss, not a tab switch. */
const BLUR_CONFIRM_MS = 250;
/** Dedup window for `focus_lost` — a shaky window manager can fire blur/focus repeatedly. */
const FOCUS_LOST_DEDUP_MS = 1_500;

/**
 * B2C coaching (BC-6 ngoại lệ) — 3 tín hiệu HÀNH VI: `tab_switch` / `paste` / `focus_lost`.
 * Ghi về server NGAY lúc xảy ra; `onEvent` (nếu có) chỉ gọi lúc người dùng CÓ THỂ thấy toast —
 * với `tab_switch` là lúc tab quay lại visible (toast không hiện được khi tab đang ẩn), còn
 * `paste`/`focus_lost` gọi ngay vì chúng xảy ra trong lúc tab vẫn nhìn thấy được.
 */
export function useB2cFocusTracking(
  sessionId: string,
  enabled: boolean,
  phase: InterviewPhase,
  onEvent?: (signal: FocusBehaviorSignalType) => void,
): void {
  const stage = useB2cPracticeInterviewStore((state) => state.stage);
  const active = enabled && stage === 'interviewing' && ['reading', 'answering'].includes(phase);
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!active) return undefined;

    let blurTimer: number | null = null;
    let lastFocusLostAt = 0;
    let hiddenCycle = false;

    const clearBlurTimer = () => {
      if (blurTimer != null) {
        window.clearTimeout(blurTimer);
        blurTimer = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (hiddenCycle) return;
        hiddenCycle = true;
        void recordFocusEvent(sessionIdRef.current, 'tab_switch');
        return;
      }
      if (hiddenCycle) {
        hiddenCycle = false;
        onEventRef.current?.('tab_switch');
      }
    };

    const onBlur = () => {
      if (document.visibilityState === 'hidden') return; // `onVisibility` đã lo — tránh báo trùng.
      clearBlurTimer();
      blurTimer = window.setTimeout(() => {
        blurTimer = null;
        if (document.visibilityState === 'hidden' || document.hasFocus()) return;
        const now = Date.now();
        if (now - lastFocusLostAt < FOCUS_LOST_DEDUP_MS) return;
        lastFocusLostAt = now;
        void recordFocusEvent(sessionIdRef.current, 'focus_lost');
        onEventRef.current?.('focus_lost');
      }, BLUR_CONFIRM_MS);
    };

    const onFocus = () => clearBlurTimer();

    const onPaste = () => {
      void recordFocusEvent(sessionIdRef.current, 'paste');
      onEventRef.current?.('paste');
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('paste', onPaste);
    return () => {
      clearBlurTimer();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('paste', onPaste);
    };
  }, [active]);
}
