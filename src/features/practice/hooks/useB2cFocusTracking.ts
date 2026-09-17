import { useEffect, useRef } from 'react';
import { recordPracticeFocusEvent } from '../services/b2cPracticeSession.service';
import type { FocusBehaviorSignalType } from '../types/b2cPracticeSession.types';

/** Window still blurred after this long (and tab not hidden) = a real focus-loss, not a tab switch. */
const BLUR_CONFIRM_MS = 250;
/** Dedup window for `focus_lost` — a shaky window manager can fire blur/focus repeatedly. */
const FOCUS_LOST_DEDUP_MS = 1_500;

/**
 * B2C coaching (2026-09-17, BC-6 ngoại lệ) — 3 tín hiệu HÀNH VI (`tab_switch`/`focus_lost`/`paste`).
 * Mirror `useCampaignAntiCheat` (rút gọn, không debounce "pending leave" 5s — coaching không cần
 * gộp nhiều dấu hiệu thành 1 vi phạm, mỗi lần đáng ghi là ghi).
 *
 * `onEvent` gọi LÚC TAB QUAY LẠI VISIBLE cho `tab_switch` (toast không hiện được khi tab ẩn), còn
 * ghi nhận về server xảy ra NGAY lúc rời — hai thời điểm khác nhau có chủ đích.
 */
export function useB2cFocusTracking(
  sessionId: string,
  enabled: boolean,
  onEvent?: (signal: FocusBehaviorSignalType) => void,
): void {
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled) return undefined;

    let blurTimer: number | null = null;
    let lastFocusLostAt = 0;

    const clearBlurTimer = () => {
      if (blurTimer != null) {
        window.clearTimeout(blurTimer);
        blurTimer = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        void recordPracticeFocusEvent(sessionIdRef.current, 'tab_switch');
        return;
      }
      // Quay lại tab: toast chỉ có nghĩa khi người dùng nhìn thấy được nó.
      onEventRef.current?.('tab_switch');
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
        void recordPracticeFocusEvent(sessionIdRef.current, 'focus_lost');
        onEventRef.current?.('focus_lost');
      }, BLUR_CONFIRM_MS);
    };

    const onFocus = () => clearBlurTimer();

    const onPaste = () => {
      void recordPracticeFocusEvent(sessionIdRef.current, 'paste');
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
  }, [enabled]);
}
