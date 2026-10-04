import type { FocusEventSummary } from '../types/b2cPracticeSession.types';
import type { PracticeSessionResultViewModel } from './practiceSessionResultViewModel';

type Translate = (key: string) => string;

/**
 * Đếm theo NHÓM người luyện hiểu được — một nguồn cho ô Tổng quan, mục chi tiết, nút đầu trang,
 * để ba chỗ không bao giờ lệch nhau.
 * - `window`: rời tab/cửa sổ (tab_switch + focus_lost)
 * - `face`: không thấy mặt / có hơn 1 người (no_face + multiple_faces — server đếm mặt)
 * - `camera`: camera bị che hoặc khung quá tối (camera_blocked — trình duyệt đo độ sáng)
 * Không có nhóm "dán" (2026-10-04): phòng luyện trả lời BẰNG GIỌNG, không có ô nhập ⇒ đếm dán là vô nghĩa.
 * `paste` của buổi cũ đã bị mapper lọc; nếu lọt tới đây thì `focusGroupOf` trả `null` như loại lạ.
 */
export interface FocusGroupCounts {
  window: number;
  face: number;
  camera: number;
  total: number;
}

export type FocusGroup = Exclude<keyof FocusGroupCounts, 'total'>;

/** Thứ tự hiển thị chung: ô số, danh sách chi tiết, nhãn nút. */
export const FOCUS_GROUP_ORDER: readonly FocusGroup[] = ['window', 'face', 'camera'];

/** Nhóm của một tín hiệu; loại lạ ⇒ `null` (không đếm vào nhóm nào, không vào tổng). */
export function focusGroupOf(signalType: FocusEventSummary['signalType']): FocusGroup | null {
  if (signalType === 'tab_switch' || signalType === 'focus_lost') return 'window';
  if (signalType === 'no_face' || signalType === 'multiple_faces') return 'face';
  if (signalType === 'camera_blocked') return 'camera';
  return null;
}

export function countFocusGroups(events: FocusEventSummary[] | null | undefined): FocusGroupCounts {
  const counts = { window: 0, face: 0, camera: 0, total: 0 };
  for (const event of events ?? []) {
    const group = focusGroupOf(event.signalType);
    if (!group) continue;
    counts[group] += event.count;
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
 * Câu tóm tắt "mất tập trung": có rời buổi → câu rời buổi (kèm vị trí) · có vấn đề khung hình → câu khung hình
 * liệt kê TỪNG loại (không thấy mặt / nhiều người / che camera). Trước 2026-10-03 hễ có một lần rời buổi là câu
 * khung hình bị bỏ hẳn ⇒ người luyện không biết mình bị ghi nhận "có 2 người".
 * Số đếm lấy từ `countFocusGroups` — cùng nguồn với ô "Rời tab / cửa sổ" và nút đầu trang.
 */
export function buildFocusSummaryMessage(view: PracticeSessionResultViewModel, t: Translate): string {
  const events = view.focusEvents ?? [];
  const counts = countFocusGroups(events);
  const leave = counts.window;
  const frame = counts.face + counts.camera;
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

const SHORT_LABEL_KEY: Record<FocusGroup, string> = {
  window: 'practice.result.focusTracking.short.leave',
  face: 'practice.result.focusTracking.short.face',
  camera: 'practice.result.focusTracking.short.camera',
};

/** "Rời buổi 1 · Khuôn mặt 2 · Che camera 1" — chỉ nhóm có xảy ra; dùng cho nút đầu trang và ô Tổng quan. */
export function buildFocusBreakdownLabel(view: PracticeSessionResultViewModel, t: Translate): string {
  const counts = countFocusGroups(view.focusEvents);
  return FOCUS_GROUP_ORDER
    .filter((group) => counts[group] > 0)
    .map((group) => t(SHORT_LABEL_KEY[group]).replace('{{n}}', String(counts[group])))
    .join(' · ');
}
