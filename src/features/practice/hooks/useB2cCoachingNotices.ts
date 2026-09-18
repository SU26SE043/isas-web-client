import toast from 'react-hot-toast';
import { useCallback, useRef } from 'react';
import { useLanguage } from '@/shared/languages';
import type { FocusBehaviorSignalType, FocusClientHintType, FocusFrameSignalType } from '../types/b2cPracticeSession.types';

export type CoachingNoticeKind = FocusBehaviorSignalType | FocusFrameSignalType | FocusClientHintType;

const BEHAVIOR_THROTTLE_MS = 10_000;
const FRAME_THROTTLE_MS = 30_000;
const FRAME_KINDS = new Set<CoachingNoticeKind>(['no_face', 'multiple_faces', 'low_light']);

/**
 * B2C coaching (BC-6 ngoại lệ) — toast trung tính (KHÔNG `.success`/`.error`, không màu đỏ/cảnh
 * báo: coaching, không phải chống gian lận) cho từng tín hiệu mất tập trung, throttle theo LOẠI
 * để một chuỗi dán liên tục không dội hàng chục toast chồng lên nhau. Bỏ qua khi tab đang ẩn —
 * toast không hiện được và không ai đọc.
 */
export function useB2cCoachingNotices() {
  const { t } = useLanguage();
  const lastShownAt = useRef<Partial<Record<CoachingNoticeKind, number>>>({});

  const notify = useCallback((kind: CoachingNoticeKind | null) => {
    if (!kind) return;
    if (document.hidden) return;
    const throttleMs = FRAME_KINDS.has(kind) ? FRAME_THROTTLE_MS : BEHAVIOR_THROTTLE_MS;
    const now = Date.now();
    const last = lastShownAt.current[kind] ?? 0;
    if (now - last < throttleMs) return;
    lastShownAt.current[kind] = now;
    toast(t(`practice.room.focusTracking.${kind}`), { id: `practice-coach-${kind}` });
  }, [t]);

  return { notify };
}
