import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import type { FocusSignalType } from '../types/b2cPracticeSession.types';

/** Hành vi (rời tab/dán/mất focus) đổi nhanh — throttle ngắn để không im lặng mãi. */
const BEHAVIOR_THROTTLE_MS = 10_000;
/** Kiểm mặt tự nó đã cách nhau `FACE_CHECK_INTERVAL_MS` (15s±3s) — throttle dài hơn để không đè
 * lên chính nhịp kiểm mặt kế tiếp. */
const FRAME_THROTTLE_MS = 30_000;

const KEY: Record<FocusSignalType, string> = {
  tab_switch: 'practice.room.focusTracking.tabSwitch',
  paste: 'practice.room.focusTracking.paste',
  focus_lost: 'practice.room.focusTracking.focusLost',
  no_face: 'practice.room.focusTracking.noFace',
  multiple_faces: 'practice.room.focusTracking.multipleFaces',
};

function throttleMsFor(kind: FocusSignalType): number {
  return kind === 'no_face' || kind === 'multiple_faces' ? FRAME_THROTTLE_MS : BEHAVIOR_THROTTLE_MS;
}

/**
 * B2C coaching (2026-09-17, BC-6 ngoại lệ) — toast TRUNG TÍNH (không `toast.error`) cho từng loại
 * tín hiệu mất tập trung. `id` theo LOẠI ⇒ react-hot-toast CẬP NHẬT toast đang hiện thay vì xếp
 * chồng nhiều thông báo cùng nghĩa. Không hiện khi tab đang ẩn — không ai thấy được nó lúc đó.
 */
export function useB2cCoachingNotices() {
  const { t } = useLanguage();
  const lastShownAtRef = useRef<Partial<Record<FocusSignalType, number>>>({});

  const notify = useCallback(
    (kind: FocusSignalType) => {
      if (document.hidden) return;
      const now = Date.now();
      const lastShownAt = lastShownAtRef.current[kind] ?? 0;
      if (now - lastShownAt < throttleMsFor(kind)) return;
      lastShownAtRef.current[kind] = now;
      toast(t(KEY[kind]), { id: `practice-coach-${kind}`, duration: 4000 });
    },
    [t],
  );

  return { notify };
}
