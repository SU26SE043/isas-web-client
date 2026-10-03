import type { FocusEventSummary } from '../types/b2cPracticeSession.types';
import type { PracticeSessionResultViewModel } from './practiceSessionResultViewModel';

type Translate = (key: string) => string;

/**
 * Đếm theo NHÓM người luyện hiểu được — một nguồn cho ô Tổng quan, mục chi tiết, nút đầu trang,
 * để ba chỗ không bao giờ lệch nhau.
 * - `window`: rời tab/cửa sổ (tab_switch + focus_lost) · `paste`: dán nội dung
 * - `face`: không thấy mặt / có hơn 1 người (no_face + multiple_faces — server đếm mặt)
 * - `camera`: camera bị che hoặc khung quá tối (camera_blocked — trình duyệt đo độ sáng)
 */
export interface FocusGroupCounts {
  window: number;
  paste: number;
  face: number;
  camera: number;
  total: number;
}

export function countFocusGroups(events: FocusEventSummary[] | null | undefined): FocusGroupCounts {
  const counts = { window: 0, paste: 0, face: 0, camera: 0, total: 0 };
  for (const event of events ?? []) {
    if (event.signalType === 'tab_switch' || event.signalType === 'focus_lost') counts.window += event.count;
    else if (event.signalType === 'paste') counts.paste += event.count;
    else if (event.signalType === 'no_face' || event.signalType === 'multiple_faces') counts.face += event.count;
    else if (event.signalType === 'camera_blocked') counts.camera += event.count;
    else continue;
    counts.total += event.count;
  }
  return counts;
}

const FRAME_DETAIL_TYPES = ['no_face', 'multiple_faces', 'camera_blocked'] as const;

/** "1 lần không thấy mặt, 1 lần có hơn 1 người" — chỉ các loại có xảy ra, theo thứ tự cố định. */
function frameDetail(events: FocusEventSummary[], t: Translate): string {
  return FRAME_DETAIL_TYPES
    .map((type) => {
      const count = events.filter((event) => event.signalType === type).reduce((sum, event) => sum + event.count, 0);
      return count > 0 ? t(`practice.result.focusTracking.detail.${type}`).replace('{{n}}', String(count)) : null;
    })
    .filter((part): part is string => part !== null)
    .join(', ');
}

/**
 * Câu tóm tắt "mất tập trung": có rời buổi → câu rời buổi (kèm vị trí) · có vấn đề khung hình → thêm câu
 * khung hình liệt kê TỪNG loại (không thấy mặt / nhiều người / che camera). Trước 2026-10-03 hễ có một lần
 * rời buổi là câu khung hình bị bỏ hẳn ⇒ người luyện không biết mình bị ghi nhận "có 2 người".
 */
export function buildFocusSummaryMessage(view: PracticeSessionResultViewModel, t: Translate): string {
  const events = view.focusEvents ?? [];
  const leave = view.focusLeaveCount ?? 0;
  const frame = view.focusFrameCount ?? 0;
  const parts: string[] = [];
  if (leave > 0) {
    const placement = view.focusLeavePlacement ? t(`practice.result.focusTracking.${view.focusLeavePlacement}`) : '';
    parts.push(t('practice.result.focusTracking.message')
      .replace('{{n}}', String(leave))
      .replace('{{placement}}', placement ? `, ${placement}` : ''));
  }
  if (frame > 0) {
    const key = leave > 0 ? 'practice.result.focusTracking.frameMessage' : 'practice.result.focusTracking.frameOnly';
    parts.push(t(key).replace('{{n}}', String(frame)).replace('{{detail}}', frameDetail(events, t)));
  }
  return parts.length > 0 ? parts.join(' ') : t('practice.result.focusTracking.empty');
}

/** "Rời buổi 1 · Khuôn mặt 2 · Che camera 1" — chỉ nhóm có xảy ra; dùng cho nút đầu trang và ô Tổng quan. */
export function buildFocusBreakdownLabel(view: PracticeSessionResultViewModel, t: Translate): string {
  const counts = countFocusGroups(view.focusEvents);
  const leave = counts.window + counts.paste;
  return ([
    ['practice.result.focusTracking.short.leave', leave],
    ['practice.result.focusTracking.short.face', counts.face],
    ['practice.result.focusTracking.short.camera', counts.camera],
  ] as const)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => t(key).replace('{{n}}', String(count)))
    .join(' · ');
}
