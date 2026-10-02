import type { PracticeSessionBeginResponse } from '../types/b2cPracticeSession.types';

/**
 * ATT1-F4 — đồng hồ CẢ BUỔI của phòng thi B2B, đếm theo GIỜ SERVER.
 *
 * offset = Date.parse(serverNow) − Date.now() lấy NGAY lúc nhận response (begin hoặc GET session — cái
 * mới nhất có `serverNow`); còn lại = deadline − (Date.now() + offset). Máy ứng viên chạy nhanh/chậm 10 phút
 * thì offset bù đúng 10 phút ⇒ số hiển thị vẫn khớp server. Đồng hồ này KHÔNG BAO GIỜ dừng (overlay vi
 * phạm, tab ẩn) — server không dừng thì client cũng không được dừng.
 */

/** ≤ 5 phút: màu cảnh báo + dòng nhắc tự nộp. */
export const EXAM_CLOCK_WARNING_SECONDS = 5 * 60;
/** ≤ 1 phút: màu lỗi. */
export const EXAM_CLOCK_CRITICAL_SECONDS = 60;

export type ExamClockSeverity = 'normal' | 'warning' | 'critical';
export type ExamClockMilestone = 'fiveMinutes' | 'oneMinute' | 'timeUp';

/** Neo đồng hồ: hạn chót (ms, giờ server) + độ lệch server − máy. `timed` ⇒ hiện đồng hồ cả buổi ở header. */
export interface ExamClockAnchor {
  deadlineMs: number | null;
  offsetMs: number;
  timed: boolean;
}

/**
 * Kết quả vào phòng mà đồng hồ cần:
 * - `pending`: đang gọi begin — CHƯA có đồng hồ (không lấy tạm deadlineAt của start).
 * - `legacy`: không gọi begin (B2C) hoặc begin 404 (Backend cũ) ⇒ đường cũ: deadlineAt của start + giờ máy.
 * - `begun`: begin có kết quả ⇒ CHỈ dùng `begin.deadline`; deadlineAt của start là hạn cứng chiến dịch,
 *   không phải giờ thi.
 */
export type ExamClockEntry =
  | { kind: 'pending' }
  | { kind: 'legacy' }
  | {
      kind: 'begun';
      begin: PracticeSessionBeginResponse;
      /** offset tính lúc nhận begin. */
      beginOffsetMs: number | null;
      /** offset tính lúc nhận GET session (mới hơn begin ⇒ được ưu tiên). */
      sessionOffsetMs: number | null;
    };

function parseIsoMs(value: string | null | undefined): number | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

/** Gọi NGAY sau khi response về: `receivedAtMs` = Date.now() tại lúc nhận. */
export function computeServerOffsetMs(
  serverNow: string | null | undefined,
  receivedAtMs: number,
): number | null {
  const serverMs = parseIsoMs(serverNow);
  return serverMs == null ? null : serverMs - receivedAtMs;
}

export function computeExamRemainingSeconds(deadlineMs: number, offsetMs: number, nowMs: number): number {
  const serverNowMs = nowMs + offsetMs;
  return Math.max(0, Math.ceil((deadlineMs - serverNowMs) / 1000));
}

export function resolveExamClockAnchor(
  entry: ExamClockEntry,
  fallbackDeadlineAt: string | null | undefined,
): ExamClockAnchor | null {
  if (entry.kind === 'pending') return null;
  if (entry.kind === 'legacy') {
    // Đường cũ y như trước ATT1: deadlineAt của start, giờ máy (Backend cũ không gửi serverNow).
    return { deadlineMs: parseIsoMs(fallbackDeadlineAt), offsetMs: 0, timed: false };
  }
  const deadlineMs = parseIsoMs(entry.begin.deadline);
  return {
    deadlineMs,
    offsetMs: entry.sessionOffsetMs ?? entry.beginOffsetMs ?? 0,
    timed: entry.begin.durationMinutes != null && deadlineMs != null,
  };
}

export function getExamClockSeverity(remainingSeconds: number): ExamClockSeverity {
  if (remainingSeconds <= EXAM_CLOCK_CRITICAL_SECONDS) return 'critical';
  if (remainingSeconds <= EXAM_CLOCK_WARNING_SECONDS) return 'warning';
  return 'normal';
}

/** Mốc để báo cho trình đọc màn hình — chỉ đổi giá trị ở 5 phút / 1 phút / 0. */
export function getExamClockMilestone(remainingSeconds: number): ExamClockMilestone | null {
  if (remainingSeconds <= 0) return 'timeUp';
  if (remainingSeconds <= EXAM_CLOCK_CRITICAL_SECONDS) return 'oneMinute';
  if (remainingSeconds <= EXAM_CLOCK_WARNING_SECONDS) return 'fiveMinutes';
  return null;
}
