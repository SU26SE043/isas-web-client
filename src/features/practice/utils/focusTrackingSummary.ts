import type { PracticeSessionResultViewModel } from './practiceSessionResultViewModel';

type Translate = (key: string) => string;

/**
 * Câu tóm tắt "mất tập trung" dùng CHUNG cho ô Tổng quan và popup chi tiết — một nguồn, hai chỗ hiện,
 * không lệch nhau. Ưu tiên: có lần rời khỏi buổi → câu rời buổi (kèm vị trí) · chỉ có khung hình →
 * câu khung hình (không khuyên "đóng tab", vì không ai rời tab) · không gì → câu rỗng.
 */
export function buildFocusSummaryMessage(view: PracticeSessionResultViewModel, t: Translate): string {
  const leave = view.focusLeaveCount ?? 0;
  const frame = view.focusFrameCount ?? 0;
  if (leave > 0) {
    const placement = view.focusLeavePlacement ? t(`practice.result.focusTracking.${view.focusLeavePlacement}`) : '';
    return t('practice.result.focusTracking.message')
      .replace('{{n}}', String(leave))
      .replace('{{placement}}', placement ? `, ${placement}` : '');
  }
  if (frame > 0) return t('practice.result.focusTracking.frameOnly').replace('{{n}}', String(frame));
  return t('practice.result.focusTracking.empty');
}

/** Nhãn nút ở header kết quả: rời buổi (nếu có) · chỉ khung hình → nhãn khung hình. */
export function buildFocusButtonLabel(view: PracticeSessionResultViewModel, t: Translate): string {
  const leave = view.focusLeaveCount ?? 0;
  const frame = view.focusFrameCount ?? 0;
  if (leave === 0 && frame > 0) return t('practice.result.focusTracking.buttonFrame').replace('{{n}}', String(frame));
  return t('practice.result.focusTracking.button').replace('{{n}}', String(leave));
}
